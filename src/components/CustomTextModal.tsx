import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { SongPreset } from '../types/teleprompter';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomSong: (song: SongPreset) => void;
}

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomSong,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [language, setLanguage] = useState('es-ES');
  const [lyrics, setLyrics] = useState('');

  if (!isOpen) return null;

  const wordCount = lyrics.trim() ? lyrics.trim().split(/\s+/).length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyrics.trim()) return;

    const newSong: SongPreset = {
      id: `custom-${Date.now()}`,
      title: title.trim() || 'Mi Texto / Canción Personalizada',
      artistOrAuthor: artist.trim() || 'Personalizado',
      category: 'karaoke_es',
      language,
      lyrics: lyrics.trim(),
    };

    onSaveCustomSong(newSong);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#131318] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Pegar Letra o Discurso</h3>
              <p className="text-xs text-slate-400">
                Pega cualquier letra o guion para seguir con el micrófono
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Título de la canción / discurso
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Mi Canción Favorita"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Artista o Autor
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ej. Nombre del Artista"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Texto completo / Letra
              </label>
              <span className="text-xs text-slate-500 font-mono">
                {wordCount} palabras detectadas
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Pega aquí la letra de tu canción o texto..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Soporta cualquier longitud y saltos de párrafo
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!lyrics.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Usar en Teleprónter</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
