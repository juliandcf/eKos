export interface WordToken {
  id: number;
  original: string; // The display word with original casing & punctuation
  clean: string;    // Stripped of punctuation, accents, lowercase
  hasTrailingSpace?: boolean;
  isParagraphBreak?: boolean;
  isLineBreak?: boolean;
}

export interface SongPreset {
  id: string;
  title: string;
  artistOrAuthor: string;
  category: 'karaoke_es' | 'karaoke_en' | 'discurso' | 'literatura';
  language: string;
  bpm?: number;
  lyrics: string;
}

export type RecognitionStatus = 'idle' | 'listening' | 'reconnecting' | 'paused' | 'error' | 'unsupported';

export interface PerformanceStats {
  matchedWordsCount: number;
  totalWords: number;
  accuracyRate: number;
  elapsedSeconds: number;
  wordsPerMinute: number;
}
