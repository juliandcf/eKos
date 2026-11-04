/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SONG_PRESETS } from './data/presets';
import { SongPreset } from './types/teleprompter';
import { tokenizeText } from './utils/textNormalizer';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useWebAudio } from './hooks/useWebAudio';
import { Header } from './components/Header';
import { TeleprompterView } from './components/TeleprompterView';
import { ControlsBar } from './components/ControlsBar';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SongSelectorModal } from './components/SongSelectorModal';
import { CustomTextModal } from './components/CustomTextModal';
import { GuideModal } from './components/GuideModal';
import { DiagnosticModal } from './components/DiagnosticModal';
import { AlertCircle, Mic, Volume2 } from 'lucide-react';

export default function App() {
  // Current active song or speech
  const [currentSong, setCurrentSong] = useState<SongPreset>(SONG_PRESETS[0]);
  const [fontSize, setFontSize] = useState<number>(32);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(SONG_PRESETS[0].language);

  // Modals state
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isCustomTextModalOpen, setIsCustomTextModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);

  // Simulation / Rehearsal Mode (for testing without speaking)
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationTimerRef = useRef<number | null>(null);

  // Parse text into flat tokens
  const tokens = useMemo(() => {
    return tokenizeText(currentSong.lyrics);
  }, [currentSong.lyrics]);

  // Audio Analyzer hook
  const {
    isAudioActive,
    volumeLevel,
    analyserNode,
    audioError,
    startAudio,
    stopAudio,
  } = useWebAudio();

  // Speech Recognition hook
  const {
    status,
    cursorIndex,
    latestTranscript,
    errorMessage: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    toggleListening: toggleSpeechListening,
    jumpToWord,
    resetCursor,
  } = useSpeechRecognition({
    tokens,
    language: selectedLanguage,
    lookaheadWindow: 4,
  });

  // Master Mic Toggle (activates both Web Speech and Web Audio APIs)
  const handleToggleMic = useCallback(async () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }

    if (status === 'listening' || status === 'reconnecting') {
      stopListening();
      stopAudio();
    } else {
      await startAudio();
      startListening();
    }
  }, [status, isSimulating, startAudio, stopAudio, startListening, stopListening]);

  // Handle switching songs
  const handleSelectSong = useCallback((song: SongPreset) => {
    setCurrentSong(song);
    setSelectedLanguage(song.language);
    resetCursor();
    if (isSimulating) {
      setIsSimulating(false);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }
  }, [resetCursor, isSimulating]);

  // Manual word navigation
  const handleNextWord = useCallback(() => {
    if (cursorIndex < tokens.length - 1) {
      jumpToWord(cursorIndex + 1);
    }
  }, [cursorIndex, tokens.length, jumpToWord]);

  const handlePrevWord = useCallback(() => {
    if (cursorIndex > 0) {
      jumpToWord(cursorIndex - 1);
    }
  }, [cursorIndex, jumpToWord]);

  const handleReset = useCallback(() => {
    resetCursor();
    if (isSimulating) {
      setIsSimulating(false);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }
  }, [resetCursor, isSimulating]);

  // Font size handlers
  const handleIncreaseFontSize = () => setFontSize(prev => Math.min(48, prev + 2));
  const handleDecreaseFontSize = () => setFontSize(prev => Math.max(22, prev - 2));

  // Toggle Rehearsal / Simulation mode
  const handleToggleSimulation = useCallback(() => {
    if (isSimulating) {
      setIsSimulating(false);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    } else {
      // Pause mic if active
      if (status === 'listening') {
        stopListening();
        stopAudio();
      }
      setIsSimulating(true);
    }
  }, [isSimulating, status, stopListening, stopAudio]);

  // Simulation timer loop (smoothly walks through tokens at musical cadence)
  useEffect(() => {
    if (isSimulating) {
      const intervalMs = currentSong.bpm
        ? Math.round((60 / currentSong.bpm) * 1000 * 0.9)
        : 380; // default ~160 WPM

      simulationTimerRef.current = window.setInterval(() => {
        jumpToWord(cursorIndex + 1);
        if (cursorIndex >= tokens.length - 1) {
          setIsSimulating(false);
          if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
        }
      }, intervalMs);
    } else {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
    }

    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, [isSimulating, cursorIndex, tokens.length, currentSong.bpm, jumpToWord]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isSimulating) {
          handleToggleSimulation();
        } else {
          handleNextWord();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextWord();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevWord();
      } else if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleMic();
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSimulating, handleToggleSimulation, handleNextWord, handlePrevWord, handleToggleMic, handleReset]);

  const activeError = speechError || audioError;

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0d] text-slate-100 font-sans overflow-hidden select-none">
      {/* 1. Header (Strict Top Bar Contract) */}
      <Header
        onOpenSongs={() => setIsSongModalOpen(true)}
        onOpenCustomText={() => setIsCustomTextModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenDiagnostic={() => setIsDiagnosticModalOpen(true)}
        songTitle={currentSong.title}
      />

      {/* 2. Audio Visualizer and Active Status Ribbon */}
      <div className="w-full px-6 py-2 border-b border-slate-900/60 bg-[#0e0e13]/60 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <AudioVisualizer
            analyserNode={analyserNode}
            isAudioActive={isAudioActive}
            volumeLevel={volumeLevel}
          />

          {status === 'listening' && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Micrófono activo · Canta o habla continuo</span>
            </div>
          )}

          {isSimulating && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
              <span>Modo Ensayo activo ({currentSong.bpm || 110} BPM)</span>
            </div>
          )}
        </div>

        {/* Real-time recognized phrase feedback badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 max-w-sm truncate">
          <span className="text-[11px] text-slate-500 font-mono">Última voz:</span>
          <span className="text-slate-200 font-medium truncate">
            {latestTranscript || 'Sin audio reciente'}
          </span>
        </div>
      </div>

      {/* Error alert toast if mic permission is blocked */}
      {activeError && (
        <div className="mx-6 mt-3 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-200 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{activeError}</span>
          </div>
          <button
            onClick={() => handleToggleMic()}
            className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-md text-white font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 3. Central Teleprompter Stage */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <TeleprompterView
          tokens={tokens}
          cursorIndex={cursorIndex}
          fontSize={fontSize}
          onWordClick={jumpToWord}
          songTitle={currentSong.title}
          artist={currentSong.artistOrAuthor}
        />
      </main>

      {/* 4. Bottom Controls Bar */}
      <ControlsBar
        status={status}
        isAudioActive={isAudioActive}
        cursorIndex={cursorIndex}
        totalWords={tokens.length}
        fontSize={fontSize}
        language={selectedLanguage}
        isSimulating={isSimulating}
        onToggleMic={handleToggleMic}
        onPrevWord={handlePrevWord}
        onNextWord={handleNextWord}
        onReset={handleReset}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        onChangeLanguage={setSelectedLanguage}
        onToggleSimulation={handleToggleSimulation}
      />

      {/* Modals */}
      <SongSelectorModal
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        onSelectSong={handleSelectSong}
        currentSongId={currentSong.id}
      />

      <CustomTextModal
        isOpen={isCustomTextModalOpen}
        onClose={() => setIsCustomTextModalOpen(false)}
        onSaveCustomSong={handleSelectSong}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <DiagnosticModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        status={status}
        isAudioActive={isAudioActive}
        volumeLevel={volumeLevel}
        latestTranscript={latestTranscript}
        cursorIndex={cursorIndex}
        tokens={tokens}
        language={selectedLanguage}
      />
    </div>
  );
}
