import React from 'react';
import { ArrowRight, Globe2, Sparkles } from 'lucide-react';
import { CORE_LANGUAGE_CODES, HERO_BANNER_IMAGE, MOOD_COLOR_THEMES } from '../constants/musicConfig';
import type { CuratedPlaylist, LanguageConfig, MoodCategory } from '../types/music';
import { PlaylistCover } from './PlaylistCover';

interface DiscoverViewProps {
  categories: MoodCategory[];
  languages: LanguageConfig[];
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
  onSelectMoodCategory: (categoryId: string) => void;
  onOpenMoodStudio: () => void;
  featuredPlaylists: CuratedPlaylist[];
  onOpenPlaylist: (playlistId: string) => void;
  getPlaylistTrackCount: (pl: CuratedPlaylist) => number;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  categories,
  languages,
  selectedLanguages,
  onToggleLanguage,
  onSelectMoodCategory,
  onOpenMoodStudio,
  featuredPlaylists,
  onOpenPlaylist,
  getPlaylistTrackCount,
}) => {
  const [showAllFeatured, setShowAllFeatured] = React.useState(false);
  const activeLangs = languages.filter((l) => l.active);
  const coreLangs = activeLangs.filter((l) => CORE_LANGUAGE_CODES.includes(l.code));
  const hasOtherLangs = activeLangs.some((l) => !CORE_LANGUAGE_CODES.includes(l.code));
  const isMixed = selectedLanguages.length === 0 || selectedLanguages.includes('mixed');

  const visiblePlaylists = showAllFeatured ? featuredPlaylists.slice(0, 8) : featuredPlaylists.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Warm Dusty Rose Studio Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[#E6CCD4] dark:border-[#4B3641] bg-[#2B1F26] text-white shadow-sm">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Moodify toz pembe stüdyo atmosferi"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D1E26]/95 via-[#3D2733]/80 to-[#5E3A49]/45" />

        <div className="relative z-10 p-5 sm:p-7 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-balance">
              Bugün nasıl hissediyorsun?
            </h1>
            <p className="text-sm sm:text-base text-[#F5E8EC] leading-relaxed">
              Ruh hâlini ve müzik dilini seç; her duyguya özel renkli atmosferiyle sana tam uyan çalma listeleri anında
              hazırlansın.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenMoodStudio}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-sm font-bold shadow-md transition-transform active:scale-95 self-start lg:self-auto whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Karma Ruh Hâli Oluştur</span>
          </button>
        </div>

        {/* Integrated Compact Language Selector */}
        <div className="relative z-10 px-5 sm:px-7 py-3.5 border-t border-white/15 bg-black/25 backdrop-blur-xs flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5E8EC] mr-1.5">
            <Globe2 className="w-3.5 h-3.5 text-[#E8B7C7]" />
            <span>Dil:</span>
          </span>

          <button
            type="button"
            onClick={() => onToggleLanguage('mixed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              isMixed
                ? 'bg-[#FAF6F5] text-[#30282D]'
                : 'bg-white/12 text-[#FAF4F6] hover:bg-white/22'
            }`}
          >
            Karışık
          </button>

          {coreLangs.map((lang) => {
            const active = !isMixed && selectedLanguages.includes(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onToggleLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                    : 'bg-white/12 text-[#FAF4F6] hover:bg-white/22'
                }`}
              >
                {lang.name}
              </button>
            );
          })}

          {hasOtherLangs && (
            <button
              type="button"
              onClick={() => onToggleLanguage('other')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                !isMixed && selectedLanguages.includes('other')
                  ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                  : 'bg-white/12 text-[#FAF4F6] hover:bg-white/22'
              }`}
            >
              Diğer Diller
            </button>
          )}
        </div>
      </section>

      {/* 5 Large Distinct Mood Category Cards */}
      <section aria-label="Ruh Hâli Kategorileri" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
            Ruh Hâlini Seç
          </h2>
          <span className="text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
            Her kategori kendi renk atmosferiyle açılır
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categories
            .filter((c) => c.active)
            .sort((a, b) => a.order - b.order)
            .map((cat) => {
              const theme = MOOD_COLOR_THEMES[cat.colorKey] || MOOD_COLOR_THEMES.blue;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectMoodCategory(cat.id)}
                  className={`group text-left rounded-2xl border ${theme.borderAccent} ${theme.bgSoft} overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B97891] flex flex-col cursor-pointer`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#241A20]">
                    <img
                      src={cat.coverUrl}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                      style={{
                        boxShadow: `inset 0 -3px 0 0 ${theme.hex}`,
                      }}
                    />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-white">
                      <span className="text-sm sm:text-base font-extrabold leading-tight drop-shadow-xs">
                        {cat.name}
                      </span>
                      <span
                        style={{ backgroundColor: theme.hex }}
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5 shadow"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#5B4D54] dark:text-[#DFD1D7] leading-snug line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </section>

      {/* Featured Curated Playlists (Compact 4-column showcase) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
            Senin İçin Öne Çıkan Çalma Listeleri
          </h2>
          {featuredPlaylists.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllFeatured((v) => !v)}
              className="text-xs font-bold text-[#9F5C76] dark:text-[#E5B8C7] hover:underline whitespace-nowrap cursor-pointer"
            >
              {showAllFeatured ? 'Daha Az Göster' : `Tümünü Gör (${Math.min(8, featuredPlaylists.length)})`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {visiblePlaylists.map((pl) => {
            const cat = categories.find((c) => c.id === pl.moodId);
            const colorKey = cat?.colorKey || 'rose';
            const trackCount = getPlaylistTrackCount(pl);

            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => onOpenPlaylist(pl.id)}
                className="group text-left bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-3 hover:border-[#D8A1B3] dark:hover:border-[#B97891] hover:shadow-sm transition-all cursor-pointer flex items-center sm:flex-col sm:items-stretch gap-3"
              >
                <PlaylistCover
                  title={pl.title}
                  subtitle={cat?.name}
                  coverUrl={pl.coverUrl}
                  colorKey={colorKey}
                  seed={pl.id}
                  className="w-20 h-20 sm:w-full sm:aspect-[16/10] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#7D6C74] dark:text-[#B9A7B0] truncate">
                    <span>{cat?.name || 'Müzik Seçkisi'}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">{trackCount} şarkı</span>
                  </div>
                  <h3 className="mt-0.5 text-sm sm:text-base font-bold text-[#30282D] dark:text-[#FAF4F6] group-hover:text-[#9F5C76] dark:group-hover:text-[#E5B8C7] transition-colors truncate">
                    {pl.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#5B4D54] dark:text-[#CFC0C7] line-clamp-1">
                    {pl.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
