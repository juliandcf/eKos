import React from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Languages,
} from 'lucide-react';
import { RecognitionStatus } from '../types/teleprompter';

interface ControlsBarProps {
  status: RecognitionStatus;
  isAudioActive: boolean;
  cursorIndex: number;
  totalWords: number;
  fontSize: number;
  language: string;
  isSimulating: boolean;
  onToggleMic: () => void;
  onPrevWord: () => void;
  onNextWord: () => void;
  onReset: () => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeLanguage: (lang: string) => void;
  onToggleSimulation: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  status,
  isAudioActive,
  cursorIndex,
  totalWords,
  fontSize,
  language,
  isSimulating,
  onToggleMic,
  onPrevWord,
  onNextWord,
  onReset,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeLanguage,
  onToggleSimulation,
}) => {
  const isListening = status === 'listening';
  const isReconnecting = status === 'reconnecting';
  const progressPercent = totalWords > 0 ? Math.round(((cursorIndex + 1) / totalWords) * 100) : 0;

  // Language options
  const languages = [
    { code: 'es-ES', label: 'Español (España)' },
    { code: 'es-MX', label: 'Español (México)' },
    { code: 'es-CO', label: 'Español (Colombia)' },
    { code: 'es-US', label: 'Español (EE.UU.)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
  ];

  return (
    <div className="w-full bg-[#111116]/95 border-t border-slate-800/80 backdrop-blur-md px-4 py-3 shrink-0">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3">
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
            {cursorIndex + 1} / {totalWords} ({progressPercent}%)
          </span>
        </div>

        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left group: Navigation & Reset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onReset}
              title="Reiniciar al principio"
              aria-label="Reiniciar al principio"
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onPrevWord}
              disabled={cursorIndex <= 0}
              title="Palabra anterior"
              aria-label="Palabra anterior"
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onNextWord}
              disabled={cursorIndex >= totalWords - 1}
              title="Siguiente palabra"
              aria-label="Siguiente palabra"
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Center group: High Impact Microphone Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMic}
              aria-pressed={isListening}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all shadow-lg active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold shadow-emerald-500/25 mic-live-pulse'
                  : isReconnecting
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>Escuchando... (Pausar)</span>
                </>
              ) : isReconnecting ? (
                <>
                  <Mic className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>Sincronizando audio...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Activar Micrófono</span>
                </>
              )}
            </button>

            {/* Simulation / Rehearsal Mode button */}
            <button
              onClick={onToggleSimulation}
              title={isSimulating ? 'Pausar ensayo automático' : 'Probar sin micrófono (Ensayo automático)'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                isSimulating
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Ensayo en curso</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Modo Ensayo</span>
                </>
              )}
            </button>
          </div>

          {/* Right group: Typography Size & Language */}
          <div className="flex items-center gap-2">
            {/* Language Select */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value)}
                className="bg-transparent text-xs text-slate-300 font-medium focus:outline-none cursor-pointer"
                title="Idioma de reconocimiento de voz"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Adjusters */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={onDecreaseFontSize}
                disabled={fontSize <= 22}
                title="Disminuir tamaño de texto"
                aria-label="Disminuir tamaño de texto"
                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-400 px-1 tabular-nums">
                {fontSize}px
              </span>
              <button
                onClick={onIncreaseFontSize}
                disabled={fontSize >= 48}
                title="Aumentar tamaño de texto"
                aria-label="Aumentar tamaño de texto"
                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
