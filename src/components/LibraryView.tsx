import React from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { MUSIC_GENRES } from '../constants/musicConfig';
import { inferTrackMoodId, matchesLanguageSelection, meetsMoodThreshold } from '../lib/recommendation';
import type { LanguageConfig, MoodCategory, Track } from '../types/music';
import { TrackRowCard } from './TrackRowCard';

interface LibraryViewProps {
  tracks: Track[];
  categories: MoodCategory[];
  languages: LanguageConfig[];
  initialSearch?: string;
  favoriteIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
}

const PAGE_SIZE = 12;

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  categories,
  languages,
  initialSearch = '',
  favoriteIds,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
}) => {
  const [query, setQuery] = React.useState(initialSearch);
  const [selectedLangs, setSelectedLangs] = React.useState<string[]>(['mixed']);
  const [selectedGenre, setSelectedGenre] = React.useState<string>('all');
  const [selectedMoodId, setSelectedMoodId] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setQuery(initialSearch);
    setPage(1);
  }, [initialSearch]);

  const activeLangs = languages.filter((l) => l.active);

  const toggleLang = (code: string) => {
    setPage(1);
    if (code === 'mixed') {
      setSelectedLangs(['mixed']);
      return;
    }
    setSelectedLangs((prev) => {
      const cleaned = prev.filter((c) => c !== 'mixed');
      const next = cleaned.includes(code) ? cleaned.filter((c) => c !== code) : [...cleaned, code];
      return next.length === 0 ? ['mixed'] : next;
    });
  };

  const moodNameMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of categories) m[c.id] = c.name.toLowerCase();
    return m;
  }, [categories]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const targetCat = selectedMoodId !== 'all' ? categories.find((c) => c.id === selectedMoodId) : null;

    return tracks.filter((t) => {
      if (t.deleted) return false;
      if (!matchesLanguageSelection(t.language, selectedLangs)) return false;
      if (selectedGenre !== 'all' && t.genre !== selectedGenre) return false;

      if (targetCat && !meetsMoodThreshold(t, [targetCat])) return false;

      if (!q) return true;
      const inferredMood = t.inferredMoodId || inferTrackMoodId(t, categories);
      const langObj = activeLangs.find((l) => l.code === t.language);
      const moodLabel = moodNameMap[inferredMood] || '';
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q) ||
        (langObj && langObj.name.toLowerCase().includes(q)) ||
        moodLabel.includes(q)
      );
    });
  }, [tracks, query, selectedLangs, selectedGenre, selectedMoodId, categories, activeLangs, moodNameMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
            Şarkı Arama Sonuçları
          </h1>
          <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
            Şarkı, sanatçı, albüm, tür, dil ve ruh hâline göre arama ve filtreleme yap.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-[#7D6C74] dark:text-[#B9A7B0]">
          {filtered.length.toLocaleString('tr-TR')} sonuç gösteriliyor
        </div>
      </div>

      {/* Compact Filter Bar */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#8E7D85] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Şarkı, sanatçı, albüm, tür veya ruh hâli ara..."
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-[#30282D] dark:text-[#FAF4F6] focus:outline-none focus:ring-2 focus:ring-[#B97891]/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setPage(1);
                }}
                aria-label="Aramayı temizle"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8E7D85] hover:text-[#30282D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setPage(1);
              }}
              aria-label="Müzik türü filtresi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-[#30282D] dark:text-[#FAF4F6]"
            >
              <option value="all">Tüm Müzik Türleri</option>
              {MUSIC_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedMoodId}
              onChange={(e) => {
                setSelectedMoodId(e.target.value);
                setPage(1);
              }}
              aria-label="Ruh hâli filtresi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-[#30282D] dark:text-[#FAF4F6]"
            >
              <option value="all">Tüm Ruh Hâlleri</option>
              {categories.filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F2E9EC] dark:border-[#362A31]">
          <button
            type="button"
            onClick={() => toggleLang('mixed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedLangs.includes('mixed')
                ? 'bg-[#30282D] dark:bg-[#FAF4F6] text-white dark:text-[#30282D]'
                : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
            }`}
          >
            Karışık / Tüm Diller
          </button>
          {activeLangs.map((lang) => {
            const active = !selectedLangs.includes('mixed') && selectedLangs.includes(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => toggleLang(lang.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                    : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
                }`}
              >
                {lang.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Compact 12-item Grid */}
      {pageItems.length === 0 ? (
        <div className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-8 text-center">
          <p className="text-sm font-bold text-[#30282D] dark:text-[#FAF4F6]">
            Arama kriterlerinize uygun şarkı bulunamadı.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedGenre('all');
              setSelectedMoodId('all');
              setSelectedLangs(['mixed']);
              setPage(1);
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white text-xs font-semibold cursor-pointer"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {pageItems.map((track, idx) => (
            <TrackRowCard
              key={track.id}
              track={track}
              index={(safePage - 1) * PAGE_SIZE + idx}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Önceki</span>
          </button>
          <span className="text-xs font-mono tabular-nums text-[#7D6C74] dark:text-[#B9A7B0]">
            Sayfa {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            <span>Sonraki</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
