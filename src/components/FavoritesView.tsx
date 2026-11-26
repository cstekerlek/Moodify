import React from 'react';
import { Heart, Search } from 'lucide-react';
import type { LanguageConfig, Track } from '../types/music';
import { TrackRowCard } from './TrackRowCard';

interface FavoritesViewProps {
  favoriteTracks: Track[];
  languages: LanguageConfig[];
  favoriteIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
  onGoDiscover: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteTracks,
  languages,
  favoriteIds,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
  onGoDiscover,
}) => {
  const [query, setQuery] = React.useState('');

  const filtered = favoriteTracks.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">Favoriler</h1>
          <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
            Beğendiğin şarkılara hızlıca ulaş ve dilediğin platformda dinle.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8E7D85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Favorilerde ara..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] text-[#30282D] dark:text-[#FAF4F6]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-8 text-center space-y-3">
          <Heart className="w-10 h-10 mx-auto text-[#B97891]" />
          <h2 className="text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">Henüz favori şarkı yok</h2>
          <p className="text-xs sm:text-sm text-[#5B4D54] dark:text-[#B9A7B0]">
            Keşfet veya Müzik Ruleti ekranından beğendiğin şarkıları kalp ikonuna dokunarak buraya ekleyebilirsin.
          </p>
          <button
            type="button"
            onClick={onGoDiscover}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs font-bold cursor-pointer"
          >
            Keşfet’e Git
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filtered.map((track, idx) => (
            <TrackRowCard
              key={track.id}
              track={track}
              index={idx}
              isFavorite={favoriteIds.has(track.id)}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onInspectTrack={onInspectTrack}
              languages={languages}
              accentColorKey="rose"
            />
          ))}
        </div>
      )}
    </div>
  );
};
