import React, { useEffect, useRef } from 'react';
import { WordToken } from '../types/teleprompter';

interface TeleprompterViewProps {
  tokens: WordToken[];
  cursorIndex: number;
  fontSize: number; // in pixels (e.g. 28 - 44)
  onWordClick: (index: number) => void;
  songTitle: string;
  artist: string;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({
  tokens,
  cursorIndex,
  fontSize,
  onWordClick,
  songTitle,
  artist,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Auto-scroll logic: smoothly center the active word whenever cursorIndex changes
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [cursorIndex]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center min-h-0">
      {/* Top and Bottom Gradient Scrims for natural fade out of distant text */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#0a0a0d] via-[#0a0a0d]/80 to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/80 to-transparent z-10"
        aria-hidden="true"
      />

      {/* Subtle Lateral Reading Center Guide Lines */}
      <div className="pointer-events-none absolute left-2 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 z-20">
        <div className="w-2.5 h-[2px] bg-emerald-400 rounded-full" />
        <div className="w-1 h-[2px] bg-emerald-400/50 rounded-full" />
      </div>
      <div className="pointer-events-none absolute right-2 md:right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 z-20">
        <div className="w-1 h-[2px] bg-emerald-400/50 rounded-full" />
        <div className="w-2.5 h-[2px] bg-emerald-400 rounded-full" />
      </div>

      {/* Teleprompter Scrollable Container */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Contenedor de lectura teleprónter"
        className="w-full h-[62vh] md:h-[66vh] overflow-y-auto no-scrollbar scroll-smooth px-6 md:px-12 py-[30vh] text-center focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/30 rounded-2xl"
      >
        {/* Track Title and Artist subtle header */}
        <div className="mb-12 pb-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
            {songTitle}
          </h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            {artist}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            Haz clic en cualquier palabra para saltar a ella
          </p>
        </div>

        {/* Word by Word Render */}
        <div
          className="leading-[1.7] md:leading-[1.8] font-sans tracking-normal select-none"
          style={{ fontSize: `${fontSize}px` }}
        >
          {tokens.map((token) => {
            const isSpoken = token.id < cursorIndex;
            const isCurrent = token.id === cursorIndex;
            const isPending = token.id > cursorIndex;

            // Class and style resolution
            let stateClasses = 'text-slate-500 opacity-60 hover:opacity-90';
            if (isCurrent) {
              stateClasses = 'text-emerald-300 font-extrabold karaoke-word active';
            } else if (isSpoken) {
              stateClasses = 'text-slate-200 font-semibold opacity-95';
            }

            return (
              <React.Fragment key={token.id}>
                <span
                  ref={isCurrent ? activeWordRef : null}
                  id={`word-${token.id}`}
                  onClick={() => onWordClick(token.id)}
                  title={`Palabra #${token.id + 1} (${token.clean}) - Clic para saltar`}
                  className={`karaoke-word cursor-pointer px-1 py-0.5 rounded transition-all duration-150 ${stateClasses} ${
                    isCurrent ? 'bg-emerald-500/15 shadow-[0_0_24px_rgba(16,185,129,0.35)]' : ''
                  }`}
                >
                  {token.original}
                </span>

                {token.hasTrailingSpace && ' '}
                {token.isLineBreak && <br />}
                {token.isParagraphBreak && (
                  <span className="block h-10 w-full" aria-hidden="true" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
