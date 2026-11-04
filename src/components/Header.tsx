import React from 'react';
import { Sparkles, Music2 } from 'lucide-react';

interface HeaderProps {
  onOpenSongs: () => void;
  onOpenCustomText: () => void;
  onOpenGuide: () => void;
  onOpenDiagnostic: () => void;
  songTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSongs,
  onOpenCustomText,
  onOpenGuide,
  onOpenDiagnostic,
  songTitle,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-[#0d0d11]/90 backdrop-blur-md z-30 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <span className="text-lg font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          eKos
        </span>
      </div>

      {/* Zone 2: 4 single-line clean navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={onOpenSongs}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          Canciones Populares
        </button>
        <button
          onClick={onOpenCustomText}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          Pegar mi Letra
        </button>
        <button
          onClick={onOpenGuide}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          Cómo Funciona
        </button>
        <button
          onClick={onOpenDiagnostic}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          Micrófono & Motor
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSongs}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Music2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="max-w-[140px] truncate">{songTitle}</span>
        </button>
      </div>
    </header>
  );
};
