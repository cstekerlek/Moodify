import React from 'react';
import { BookmarkPlus, ChevronDown, ChevronUp, Layers, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { CORE_LANGUAGE_CODES, MOOD_COLOR_THEMES, MUSIC_GENRES } from '../constants/musicConfig';
import { formatSelectedLanguagesLabel, useRecommendationFeedback } from '../hooks/useRecommendationFeedback';
import { computeAudioProfileStats } from '../lib/recommendation';
import type { LanguageConfig, MoodCategory, Track } from '../types/music';
import { TrackRowCard } from './TrackRowCard';

interface MoodStudioViewProps {
  categories: MoodCategory[];
  languages: LanguageConfig[];
  selectedMoodIds: string[];
  onToggleMood: (id: string) => void;
  blendMode: boolean;
  onToggleBlendMode: () => void;
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  energyFilter: 'all' | 'low' | 'medium' | 'high';
  onChangeEnergy: (val: 'all' | 'low' | 'medium' | 'high') => void;
  generatedTracks: Track[];
  onRefresh: () => void;
  onSaveAsPlaylist: () => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
  onNotifyReady?: (msg: string) => void;
}

export const MoodStudioView: React.FC<MoodStudioViewProps> = ({
  categories,
  languages,
  selectedMoodIds,
  onToggleMood,
  blendMode,
  onToggleBlendMode,
  selectedLanguages,
  onToggleLanguage,
  selectedGenres,
  onToggleGenre,
  energyFilter,
  onChangeEnergy,
  generatedTracks,
  onRefresh,
  onSaveAsPlaylist,
  favoriteIds,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
  onNotifyReady,
}) => {
  const [genresExpanded, setGenresExpanded] = React.useState(false);
  const activeCategories = categories.filter((c) => c.active);
  const activeLangs = languages.filter((l) => l.active);
  const coreLangs = activeLangs.filter((l) => CORE_LANGUAGE_CODES.includes(l.code));
  const isMixed = selectedLanguages.length === 0 || selectedLanguages.includes('mixed');
  const stats = computeAudioProfileStats(generatedTracks);
  const primaryCat = activeCategories.find((c) => c.id === selectedMoodIds[0]) || activeCategories[0];
  const selectedMoodNames = activeCategories.filter((c) => selectedMoodIds.includes(c.id)).map((c) => c.name);
  const moodLabel = selectedMoodNames.length > 0 ? selectedMoodNames.join(' + ') : primaryCat?.name || 'Ruh Hâli';
  const languageLabel = formatSelectedLanguagesLabel(selectedLanguages, languages);

  const { resultsRef, isUpdating, animGen, triggerUpdate } = useRecommendationFeedback({
    tracks: generatedTracks,
    onNotifyReady,
  });

  const handleMoodClick = (id: string) => {
    if (!blendMode && selectedMoodIds.length === 1 && selectedMoodIds[0] === id) return;
    if (blendMode && selectedMoodIds.length === 1 && selectedMoodIds[0] === id) return;
    triggerUpdate(() => onToggleMood(id));
  };

  const handleLanguageClick = (code: string) => {
    if (code === 'mixed' && isMixed) return;
    triggerUpdate(() => onToggleLanguage(code));
  };

  const handleEnergyClick = (val: 'all' | 'low' | 'medium' | 'high') => {
    if (energyFilter === val) return;
    triggerUpdate(() => onChangeEnergy(val));
  };

  const handleGenreClick = (genre: string) => {
    triggerUpdate(() => onToggleGenre(genre));
  };

  const handleRefreshClick = () => {
    if (isUpdating) return;
    triggerUpdate(onRefresh);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">Ruh Hâlim</h1>
          <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
            Ruh hâlini, dilini ve müzik türlerini birleştirerek sana özel bir karışım oluştur.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBlendMode}
          aria-pressed={blendMode}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors self-start sm:self-auto cursor-pointer ${
            blendMode
              ? 'border-[#B97891] bg-[#F9EFF2] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7]'
              : 'border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] text-[#30282D] dark:text-[#FAF4F6]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Karma Ruh Hali: {blendMode ? 'Açık (Çoklu Seçim)' : 'Kapalı'}</span>
        </button>
      </div>

      {/* Compact Studio Control Panel */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {activeCategories.map((cat) => {
            const active = selectedMoodIds.includes(cat.id);
            const theme = MOOD_COLOR_THEMES[cat.colorKey] || MOOD_COLOR_THEMES.blue;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleMoodClick(cat.id)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  active
                    ? `${theme.borderAccent} ${theme.bgSoft} ring-2 ${theme.ringAccent}`
                    : 'border-[#EDE2E5] dark:border-[#362A31] hover:border-[#D8A1B3]'
                }`}
              >
                <img
                  src={cat.coverUrl}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#30282D] dark:text-[#FAF4F6] truncate">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-[#7D6C74] dark:text-[#B9A7B0] truncate">
                    {cat.targetTempo} BPM
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#F2E9EC] dark:border-[#362A31] grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#7D6C74] dark:text-[#B9A7B0] mr-1">Dil:</span>
            <button
              type="button"
              onClick={() => handleLanguageClick('mixed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                isMixed
                  ? 'bg-[#30282D] dark:bg-[#FAF4F6] text-white dark:text-[#30282D]'
                  : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
              }`}
            >
              Karışık
            </button>
            {coreLangs.map((l) => {
              const active = !isMixed && selectedLanguages.includes(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageClick(l.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                      : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleLanguageClick('other')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                !isMixed && selectedLanguages.includes('other')
                  ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                  : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
              }`}
            >
              Diğer
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-[#7D6C74] dark:text-[#B9A7B0] mr-1">Enerji:</span>
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'low', label: 'Sakin' },
                { id: 'medium', label: 'Orta' },
                { id: 'high', label: 'Yüksek' },
              ].map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => handleEnergyClick(e.id as 'all' | 'low' | 'medium' | 'high')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    energyFilter === e.id
                      ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                      : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setGenresExpanded((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E6DADE] dark:border-[#3D3037] text-xs font-semibold text-[#5B4D54] dark:text-[#DFD1D7] cursor-pointer"
            >
              <span>Türler {selectedGenres.length > 0 ? `(${selectedGenres.length})` : ''}</span>
              {genresExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {genresExpanded && (
          <div className="pt-3 border-t border-[#F2E9EC] dark:border-[#362A31] flex flex-wrap gap-1.5">
            {MUSIC_GENRES.map((genre) => {
              const active = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreClick(genre)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                      : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7] hover:bg-[#EDE0E5]'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-[#F2E9EC] dark:border-[#362A31] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-[#5B4D54] dark:text-[#DFD1D7]">
            <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-[#30282D] dark:text-[#FAF4F6]">
              <Sparkles className="w-4 h-4 text-[#B97891]" />
              Profil:
            </span>
            <span>V {stats.avgValence.toFixed(2)}</span>
            <span>·</span>
            <span>E {stats.avgEnergy.toFixed(2)}</span>
            <span>·</span>
            <span>{stats.avgTempo} BPM</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSaveAsPlaylist}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6DADE] dark:border-[#3D3037] text-xs font-semibold hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227] cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4 text-[#B97891]" />
              <span>Listeyi Kaydet</span>
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleRefreshClick}
              data-testid="studio-refresh-button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs font-bold cursor-pointer disabled:opacity-75"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Yenileniyor...' : 'Önerileri Yenile'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section ref={resultsRef} data-testid="studio-results-section" className="scroll-mt-20 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              data-testid="results-heading"
              className="text-base sm:text-lg font-extrabold text-[#30282D] dark:text-[#FAF4F6]"
            >
              Yeni müzik önerilerin
            </h2>
            <p data-testid="results-meta" className="text-xs sm:text-sm font-medium text-[#5B4D54] dark:text-[#DFD1D7]">
              {moodLabel} · {languageLabel} · {generatedTracks.length} Şarkı
            </p>
          </div>
          {isUpdating && (
            <span
              data-testid="results-loading-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#E6DADE] dark:border-[#3D3037] text-xs font-bold text-[#9F5C76] dark:text-[#E5B8C7]"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Öneriler güncelleniyor...</span>
            </span>
          )}
        </div>

        {generatedTracks.length === 0 && !isUpdating ? (
          <div className="rounded-2xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] p-6 text-center text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
            Seçtiğin filtrelere uygun şarkı bulunamadı. Farklı bir dil, tür veya enerji seviyesi deneyebilirsin.
          </div>
        ) : (
          <div
            key={animGen}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-2.5 ${
              animGen > 0 ? 'animate-tracks-enter' : ''
            } ${isUpdating ? 'opacity-55 transition-opacity' : ''}`}
          >
            {generatedTracks.map((track, idx) => (
              <TrackRowCard
                key={track.id}
                track={track}
                index={idx}
                isFavorite={favoriteIds.has(track.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddToPlaylist}
                onInspectTrack={onInspectTrack}
                languages={languages}
                accentColorKey={primaryCat?.colorKey || 'rose'}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
