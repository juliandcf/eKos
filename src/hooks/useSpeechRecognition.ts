import { useState, useEffect, useRef, useCallback } from 'react';
import { WordToken, RecognitionStatus } from '../types/teleprompter';
import { isWordMatch, normalizeWord } from '../utils/textNormalizer';

// Types for Web Speech API
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseSpeechRecognitionOptions {
  tokens: WordToken[];
  language?: string;
  lookaheadWindow?: number;
  onWordMatch?: (tokenIndex: number, spokenWord: string) => void;
}

export function useSpeechRecognition({
  tokens,
  language = 'es-ES',
  lookaheadWindow = 4,
  onWordMatch,
}: UseSpeechRecognitionOptions) {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const [latestTranscript, setLatestTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // References to keep real-time callbacks in sync
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldBeListeningRef = useRef<boolean>(false);
  const cursorIndexRef = useRef<number>(0);
  const tokensRef = useRef<WordToken[]>(tokens);
  const lookaheadRef = useRef<number>(lookaheadWindow);
  const onWordMatchRef = useRef(onWordMatch);
  const restartTimerRef = useRef<number | null>(null);
  const processedSpokenIndicesRef = useRef<Set<string>>(new Set());

  tokensRef.current = tokens;
  lookaheadRef.current = lookaheadWindow;
  onWordMatchRef.current = onWordMatch;

  // Sync cursorIndex state to ref
  useEffect(() => {
    cursorIndexRef.current = cursorIndex;
  }, [cursorIndex]);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      setStatus('unsupported');
      setErrorMessage('Este navegador no soporta la Web Speech API (se recomienda Chrome, Edge o Safari).');
    }
  }, []);

  // Set cursor directly (e.g. click word or manual seek)
  const jumpToWord = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(tokensRef.current.length - 1, index));
    setCursorIndex(clamped);
    cursorIndexRef.current = clamped;
  }, []);

  const resetCursor = useCallback(() => {
    setCursorIndex(0);
    cursorIndexRef.current = 0;
    setLatestTranscript('');
    processedSpokenIndicesRef.current.clear();
  }, []);

  // Core word consumption logic using lookahead window
  const consumeSpokenPhrase = useCallback((spokenText: string) => {
    if (!spokenText || tokensRef.current.length === 0) return;

    // Extract individual words from the spoken interim/final phrase
    const words = spokenText
      .trim()
      .split(/\s+/)
      .map(w => normalizeWord(w))
      .filter(w => w.length > 0);

    if (words.length === 0) return;

    let currentCursor = cursorIndexRef.current;
    const tokensList = tokensRef.current;
    const windowSize = lookaheadRef.current;

    // Process each spoken word against our forward lookahead window
    for (const word of words) {
      if (currentCursor >= tokensList.length) break;

      // Lookahead range: [currentCursor, currentCursor + windowSize]
      const maxLookahead = Math.min(tokensList.length - 1, currentCursor + windowSize);

      let matchedIndex = -1;
      for (let i = currentCursor; i <= maxLookahead; i++) {
        if (isWordMatch(word, tokensList[i].clean)) {
          matchedIndex = i;
          break;
        }
      }

      // If matched, advance the cursor forward
      if (matchedIndex !== -1) {
        // Active word becomes matchedIndex
        currentCursor = matchedIndex + 1;
        cursorIndexRef.current = matchedIndex;
        setCursorIndex(matchedIndex);

        if (onWordMatchRef.current) {
          onWordMatchRef.current(matchedIndex, word);
        }
      }
    }
  }, []);

  // Setup and start recognition instance
  const initAndStartRecognition = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setStatus('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item[0]) {
            if (item.isFinal) {
              finalTranscript += item[0].transcript + ' ';
            } else {
              interimTranscript += item[0].transcript;
            }
          }
        }

        const activeText = (finalTranscript || interimTranscript).trim();
        if (activeText) {
          setLatestTranscript(activeText);
          consumeSpokenPhrase(activeText);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'no-speech') {
          // Normal silence, don't show user-facing error
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          shouldBeListeningRef.current = false;
          setStatus('error');
          setErrorMessage('Permiso de micrófono denegado. Permite el acceso al micrófono en el navegador.');
        } else if (event.error === 'network') {
          // Network issue with cloud speech, try to reconnect
          setStatus('reconnecting');
        }
      };

      recognition.onend = () => {
        // Automatic restart if user is still active!
        if (shouldBeListeningRef.current) {
          setStatus('reconnecting');
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = window.setTimeout(() => {
            if (shouldBeListeningRef.current) {
              try {
                recognition.start();
              } catch (e) {
                // If it fails immediately, schedule another retry
                restartTimerRef.current = window.setTimeout(() => {
                  if (shouldBeListeningRef.current) {
                    initAndStartRecognition();
                  }
                }, 200);
              }
            }
          }, 60);
        } else {
          setStatus('paused');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      console.warn('Failed to start speech recognition:', err);
      if (shouldBeListeningRef.current) {
        setStatus('reconnecting');
        restartTimerRef.current = window.setTimeout(() => {
          initAndStartRecognition();
        }, 300);
      }
    }
  }, [language, consumeSpokenPhrase]);

  const startListening = useCallback(() => {
    shouldBeListeningRef.current = true;
    setErrorMessage(null);
    initAndStartRecognition();
  }, [initAndStartRecognition]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setStatus('paused');
  }, []);

  const toggleListening = useCallback(() => {
    if (status === 'listening' || status === 'reconnecting') {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Update language dynamically if it changes while listening
  useEffect(() => {
    if (shouldBeListeningRef.current && recognitionRef.current) {
      recognitionRef.current.stop();
      // will auto restart via onend with new language
    }
  }, [language]);

  return {
    status,
    cursorIndex,
    latestTranscript,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    jumpToWord,
    resetCursor,
    consumeSpokenPhrase,
  };
}
