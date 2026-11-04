import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseWebAudioReturn {
  isAudioActive: boolean;
  volumeLevel: number; // 0.0 to 1.0
  analyserNode: AnalyserNode | null;
  audioError: string | null;
  startAudio: () => Promise<boolean>;
  stopAudio: () => void;
  getFrequencyData: (array: Uint8Array<ArrayBuffer>) => void;
}

export function useWebAudio(): UseWebAudioReturn {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsAudioActive(false);
    setVolumeLevel(0);
  }, []);

  const startAudio = useCallback(async (): Promise<boolean> => {
    try {
      setAudioError(null);

      // Web Audio Context setup
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setAudioError('Web Audio API no soportada en este navegador');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // 64 frequency bins, fast and responsive for visualizer
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsAudioActive(true);

      // Volume calculation loop
      const timeData = new Uint8Array(analyser.fftSize);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(timeData);

        // Compute RMS volume
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const val = (timeData[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / timeData.length);
        // Normalize and boost slightly for UI response
        const level = Math.min(1, rms * 3.5);
        setVolumeLevel(level);

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Audio input error:', error);
      let message = 'No se pudo acceder al micrófono.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        message = 'Permiso de micrófono denegado. Habilítalo en tu navegador.';
      } else if (error.name === 'NotFoundError') {
        message = 'No se encontró ningún micrófono conectado.';
      }
      setAudioError(message);
      setIsAudioActive(false);
      return false;
    }
  }, []);

  const getFrequencyData = useCallback((array: Uint8Array<ArrayBuffer>) => {
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(array);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isAudioActive,
    volumeLevel,
    analyserNode: analyserRef.current,
    audioError,
    startAudio,
    stopAudio,
    getFrequencyData,
  };
}
