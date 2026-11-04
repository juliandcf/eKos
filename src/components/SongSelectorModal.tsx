import React, { useState } from 'react';
import { X, Search, Music, Mic2, BookOpen, Quote } from 'lucide-react';
import { SongPreset } from '../types/teleprompter';
import { SONG_PRESETS } from '../data/presets';

interface SongSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: SongPreset) => void;
  currentSongId: string;
}

export const SongSelectorModal: React.FC<SongSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectSong,
  currentSongId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredSongs = SONG_PRESETS.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artistOrAuthor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || song.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: SongPreset['category']) => {
    switch (category) {
      case 'karaoke_es':
      case 'karaoke_en':
        return <Music className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'discurso':
        return <Mic2 className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'literatura':
        return <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Quote className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#131318] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Biblioteca de Canciones y Textos</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecciona una canción o fragmento para el teleprónter
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-800/80 flex flex-col gap-3 bg-[#111115]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título o artista..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'karaoke_es', label: 'Karaoke Español' },
              { id: 'karaoke_en', label: 'Karaoke Inglés' },
              { id: 'discurso', label: 'Discursos' },
              { id: 'literatura', label: 'Literatura' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Song List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No se encontraron canciones con ese criterio de búsqueda.
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isSelected = song.id === currentSongId;
              const wordCount = song.lyrics.trim().split(/\s+/).length;

              return (
                <div
                  key={song.id}
                  onClick={() => {
                    onSelectSong(song);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-slate-700/80 transition-colors">
                      {getCategoryIcon(song.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                        {song.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {song.artistOrAuthor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <span className="text-xs text-slate-500 font-mono">
                      {wordCount} palabras
                    </span>
                    <button
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-semibold'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Activa' : 'Cargar'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
