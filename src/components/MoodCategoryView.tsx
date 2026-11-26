import React from 'react';
import { ArrowLeft, BookmarkPlus, Globe2, Loader2, RefreshCw } from 'lucide-react';
import { CORE_LANGUAGE_CODES, MOOD_COLOR_THEMES } from '../constants/musicConfig';
import { formatSelectedLanguagesLabel, useRecommendationFeedback } from '../hooks/useRecommendationFeedback';
import type { CuratedPlaylist, LanguageConfig, MoodCategory, Track } from '../types/music';
import { PlaylistCover } from './PlaylistCover';
import { TrackRowCard } from './TrackRowCard';

interface MoodCategoryViewProps {
  category: MoodCategory;
  playlists: CuratedPlaylist[];
  recommendedTracks: Track[];
  languages: LanguageConfig[];
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
  onBack: () => void;
  onRefreshTracks: () => void;
  onSaveAsPlaylist: () => void;
  onOpenPlaylist: (playlistId: string) => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
  getPlaylistTrackCount: (pl: CuratedPlaylist) => number;
  onNotifyReady?: (msg: string) => void;
}

export const MoodCategoryView: React.FC<MoodCategoryViewProps> = ({
  category,
  playlists,
  recommendedTracks,
  languages,
  selectedLanguages,
  onToggleLanguage,
  onBack,
  onRefreshTracks,
  onSaveAsPlaylist,
  onOpenPlaylist,
  favoriteIds,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
  getPlaylistTrackCount,
  onNotifyReady,
}) => {
  const theme = MOOD_COLOR_THEMES[category.colorKey] || MOOD_COLOR_THEMES.blue;
  const activeLangs = languages.filter((l) => l.active);
  const coreLangs = activeLangs.filter((l) => CORE_LANGUAGE_CODES.includes(l.code));
  const isMixed = selectedLanguages.length === 0 || selectedLanguages.includes('mixed');
  const languageLabel = formatSelectedLanguagesLabel(selectedLanguages, languages);

  const { resultsRef, isUpdating, animGen, triggerUpdate, cancelPending } = useRecommendationFeedback({
    tracks: recommendedTracks,
    onNotifyReady,
  });

  React.useEffect(() => {
    cancelPending();
  }, [category.id, cancelPending]);

  const handleLanguageClick = (code: string) => {
    if (code === 'mixed' && isMixed) return;
    triggerUpdate(() => onToggleLanguage(code));
  };

  const handleRefreshClick = () => {
    if (isUpdating) return;
    triggerUpdate(onRefreshTracks);
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-6 space-y-5 border ${theme.borderAccent} ${theme.pageAtmosphere}`}>
      {/* Top Breadcrumb + Back */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border ${theme.borderAccent} bg-white/85 dark:bg-[#211A1E]/90 text-xs sm:text-sm font-semibold text-[#30282D] dark:text-[#FAF4F6] hover:opacity-90 transition-opacity cursor-pointer`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Keşfet’e Dön</span>
        </button>

        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${theme.badgeBg}`}>{category.name}</span>
      </div>

      {/* Category Colored Hero Banner */}
      <section
        className={`relative overflow-hidden rounded-3xl border ${theme.borderAccent} bg-gradient-to-br ${theme.bgGradient} p-4 sm:p-6 shadow-xs`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="w-full md:w-48 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-md">
            <img
              src={category.coverUrl}
              alt={category.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
              {category.name}
            </h1>
            <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7] max-w-2xl">
              {category.description}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleRefreshClick}
                data-testid="mood-refresh-button"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-75 ${theme.bgSolid}`}
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Yenileniyor...' : 'Önerileri Yenile'}</span>
              </button>
              <button
                type="button"
                onClick={onSaveAsPlaylist}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${theme.borderAccent} bg-white/90 dark:bg-[#211A1E] text-[#30282D] dark:text-[#FAF4F6] text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer`}
              >
                <BookmarkPlus className={`w-4 h-4 ${theme.textAccent}`} />
                <span>Çalma Listem Olarak Kaydet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inline Language Strip */}
        <div className="mt-4 pt-3.5 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B4D54] dark:text-[#DFD1D7] mr-1">
            <Globe2 className={`w-3.5 h-3.5 ${theme.textAccent}`} />
            <span>Dil:</span>
          </span>
          <button
            type="button"
            onClick={() => handleLanguageClick('mixed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isMixed
                ? `${theme.bgSolid} text-white`
                : 'bg-white/80 dark:bg-[#211A1E] text-[#5B4D54] dark:text-[#DFD1D7]'
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
                onClick={() => handleLanguageClick(lang.code)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? `${theme.bgSolid} text-white`
                    : 'bg-white/80 dark:bg-[#211A1E] text-[#5B4D54] dark:text-[#DFD1D7]'
                }`}
              >
                {lang.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleLanguageClick('other')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              !isMixed && selectedLanguages.includes('other')
                ? `${theme.bgSolid} text-white`
                : 'bg-white/80 dark:bg-[#211A1E] text-[#5B4D54] dark:text-[#DFD1D7]'
            }`}
          >
            Diğer Diller
          </button>
        </div>
      </section>

      {/* Category Curated Playlists */}
      {playlists.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">
            {category.name} Çalma Listeleri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => onOpenPlaylist(pl.id)}
                className={`group text-left bg-white/90 dark:bg-[#211A1E]/95 border ${theme.borderAccent} rounded-2xl p-3 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5`}
              >
                <PlaylistCover
                  title={pl.title}
                  coverUrl={pl.coverUrl}
                  colorKey={category.colorKey}
                  seed={pl.id}
                  className="w-16 h-16 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-[11px] font-semibold ${theme.textAccent}`}>
                    {getPlaylistTrackCount(pl)} şarkı
                  </div>
                  <h3 className="text-sm font-bold text-[#30282D] dark:text-[#FAF4F6] truncate">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-[#5B4D54] dark:text-[#B9A7B0] line-clamp-1">{pl.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Matched Songs */}
      <section ref={resultsRef} data-testid="mood-results-section" className="scroll-mt-20 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              data-testid="results-heading"
              className="text-base sm:text-lg font-extrabold text-[#30282D] dark:text-[#FAF4F6]"
            >
              Yeni müzik önerilerin
            </h2>
            <p data-testid="results-meta" className="text-xs sm:text-sm font-medium text-[#5B4D54] dark:text-[#DFD1D7]">
              {category.name} · {languageLabel} · {recommendedTracks.length} Şarkı
            </p>
          </div>
          {isUpdating && (
            <span
              data-testid="results-loading-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#211A1E] border border-[#E6DADE] dark:border-[#3D3037] text-xs font-bold text-[#9F5C76] dark:text-[#E5B8C7]"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Öneriler güncelleniyor...</span>
            </span>
          )}
        </div>

        {recommendedTracks.length === 0 && !isUpdating ? (
          <div className="rounded-2xl border border-[#EDE2E5] dark:border-[#362A31] bg-white/85 dark:bg-[#211A1E] p-6 text-center text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
            Seçili dil filtresi için eşleşen şarkı bulunamadı. Farklı bir dil seçmeyi deneyebilirsin.
          </div>
        ) : (
          <div
            key={animGen}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-2.5 ${
              animGen > 0 ? 'animate-tracks-enter' : ''
            } ${isUpdating ? 'opacity-55 transition-opacity' : ''}`}
          >
            {recommendedTracks.map((track, idx) => (
              <TrackRowCard
                key={track.id}
                track={track}
                index={idx}
                isFavorite={favoriteIds.has(track.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddToPlaylist}
                onInspectTrack={onInspectTrack}
                languages={languages}
                accentColorKey={category.colorKey}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
