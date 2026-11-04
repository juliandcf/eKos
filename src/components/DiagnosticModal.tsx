import React, { useState } from 'react';
import { X, Activity, Mic, Volume2, Check, AlertCircle } from 'lucide-react';
import { RecognitionStatus, WordToken } from '../types/teleprompter';
import { isWordMatch, normalizeWord, phoneticNormalize, levenshteinDistance } from '../utils/textNormalizer';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: RecognitionStatus;
  isAudioActive: boolean;
  volumeLevel: number;
  latestTranscript: string;
  cursorIndex: number;
  tokens: WordToken[];
  language: string;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  status,
  isAudioActive,
  volumeLevel,
  latestTranscript,
  cursorIndex,
  tokens,
  language,
}) => {
  const [testSpoken, setTestSpoken] = useState('');
  const [testTarget, setTestTarget] = useState('corazón');

  if (!isOpen) return null;

  const hasSpeechRec = typeof window !== 'undefined' &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const testMatch = testSpoken.trim()
    ? isWordMatch(testSpoken, normalizeWord(testTarget))
    : false;

  const currentToken = tokens[cursorIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#131318] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Diagnóstico del Motor de Reconocimiento
              </h3>
              <p className="text-xs text-slate-400">
                Estado de Web Audio API, Web Speech API y calibración fonética
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Panel */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Hardware & API Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  Web Speech API
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  hasSpeechRec ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {hasSpeechRec ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <div className="space-y-1 text-slate-400">
                <p>Estado actual: <span className="text-slate-200 font-mono">{status}</span></p>
                <p>Idioma configurado: <span className="text-slate-200 font-mono">{language}</span></p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Web Audio API
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  isAudioActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isAudioActive ? 'Activo' : 'En reposo'}
                </span>
              </div>
              <div className="space-y-1 text-slate-400">
                <p>Nivel de señal RMS: <span className="text-slate-200 font-mono">{Math.round(volumeLevel * 100)}%</span></p>
                <p>Palabra activa esperada: <span className="text-emerald-300 font-semibold font-mono">#{cursorIndex + 1} &quot;{currentToken?.original || '-'}&quot;</span></p>
              </div>
            </div>
          </div>

          {/* Realtime transcript monitor */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-semibold text-slate-300">
              Transcripción en Tiempo Real (Interim / Final)
            </h4>
            <div className="p-3 bg-black/40 rounded-lg font-mono text-xs min-h-[44px] flex items-center text-slate-300 break-words">
              {latestTranscript ? (
                <span className="text-emerald-400 font-medium">{latestTranscript}</span>
              ) : (
                <span className="text-slate-600 italic">Habla o canta por el micrófono para ver la transcripción...</span>
              )}
            </div>
          </div>

          {/* Interactive Fuzzy Match Tester */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-semibold text-slate-300">
              Probador Interactivo de Tolerancia Fonética (Fuzzy Matcher)
            </h4>
            <p className="text-slate-400 text-[11px]">
              Verifica cómo el algoritmo empareja palabras cantadas con variaciones, seseo, b/v o acentos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Palabra Original en Canción</label>
                <input
                  type="text"
                  value={testTarget}
                  onChange={(e) => setTestTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Palabra Cantada / Reconocida</label>
                <input
                  type="text"
                  value={testSpoken}
                  onChange={(e) => setTestSpoken(e.target.value)}
                  placeholder="Ej. corazon, besame, bamva..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {testSpoken.trim() && (
              <div className={`p-2.5 rounded-lg flex items-center justify-between font-mono text-xs ${
                testMatch ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {testMatch ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{testMatch ? 'Coincidencia Válida (Match Aceptado)' : 'No Coincide'}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Distancia: {levenshteinDistance(normalizeWord(testSpoken), normalizeWord(testTarget))} | Fonética: {phoneticNormalize(normalizeWord(testSpoken))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
