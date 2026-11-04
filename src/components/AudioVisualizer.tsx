import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isAudioActive: boolean;
  volumeLevel: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyserNode,
  isAudioActive,
  volumeLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isAudioActive && analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);

        // Render stylish symmetric frequency bars
        const barCount = 28;
        const barWidth = 3;
        const gap = 3;
        const totalWidth = barCount * (barWidth + gap);
        const startX = (width - totalWidth) / 2;

        for (let i = 0; i < barCount; i++) {
          // Sample frequencies with emphasis on vocal spectrum (mid frequencies)
          const freqIndex = Math.floor((i / barCount) * (dataArray.length * 0.7));
          const val = dataArray[freqIndex] || 0;
          const percent = val / 255;
          const barHeight = Math.max(3, percent * height * 0.9);

          const x = startX + i * (barWidth + gap);
          const y = (height - barHeight) / 2;

          // Gradient color: vibrant emerald to cyan
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#00ff88');
          gradient.addColorStop(0.5, '#00e5ff');
          gradient.addColorStop(1, '#00b4d8');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        // Idle ambient subtle line
        const barCount = 24;
        const barWidth = 3;
        const gap = 3;
        const totalWidth = barCount * (barWidth + gap);
        const startX = (width - totalWidth) / 2;

        ctx.fillStyle = 'rgba(75, 85, 99, 0.4)';
        for (let i = 0; i < barCount; i++) {
          const x = startX + i * (barWidth + gap);
          const y = height / 2 - 1.5;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, 3, 1.5);
          ctx.fill();
        }
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [analyserNode, isAudioActive]);

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-1.5 backdrop-blur-sm">
      <div className="flex flex-col">
        <span className="text-[11px] font-medium text-slate-400 leading-tight">Voz / Micrófono</span>
        <span className="text-[10px] text-slate-500 tabular-nums">
          {isAudioActive ? `${Math.round(volumeLevel * 100)}% señal` : 'En espera'}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={180}
        height={32}
        className="h-8 w-44 rounded"
      />
    </div>
  );
};
