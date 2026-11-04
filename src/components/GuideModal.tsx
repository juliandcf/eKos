import React from 'react';
import { X, Cpu, Zap, CheckCircle2, ShieldCheck, Eye } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#131318] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Arquitectura de Reconocimiento y Teleprónter
              </h3>
              <p className="text-xs text-slate-400">
                Latencia cero, 100% en el cliente y sin consumo de APIs de pago
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/70 border border-slate-800/70 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tokens Normalizados NFD</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                El texto se descompone en tokens con su versión limpia en minúsculas,
                sin tildes ni signos de puntuación, garantizando comparaciones exactas.
              </p>
            </div>

            <div className="p-4 bg-slate-900/70 border border-slate-800/70 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Eye className="w-4 h-4 shrink-0" />
                <span>Ventana Lookahead (3-4 Palabras)</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Si cantas rápido o el micrófono omite un artículo o palabra breve, el motor
                salta hacia adelante sin trabarse jamás, marcando las intermedias como leídas.
              </p>
            </div>

            <div className="p-4 bg-slate-900/70 border border-slate-800/70 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Cpu className="w-4 h-4 shrink-0" />
                <span>Tolerancia Fonética & Fuzzy</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Normalización fonética española (b/v, z/c/s, ll/y) y cálculo Levenshtein para
                asimilar vibratos y variaciones al cantar con música de fondo.
              </p>
            </div>

            <div className="p-4 bg-slate-900/70 border border-slate-800/70 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Puntero Estrictamente Lineal</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                El cursor avanza de izquierda a derecha sin retrocesos involuntarios. Resuelve
                con elegancia repeticiones continuas como &quot;más, más, más&quot;.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
              Consejo de Uso para Cantar
            </h4>
            <p className="text-xs text-slate-300">
              Presiona <strong>&quot;Activar Micrófono&quot;</strong>, mantén un volumen constante
              cerca del micrófono y empieza a cantar. El auto-scroll mantendrá siempre la palabra
              activa iluminada y suavemente centrada en la pantalla. Si deseas practicar sin micrófono,
              usa el <strong>&quot;Modo Ensayo&quot;</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
