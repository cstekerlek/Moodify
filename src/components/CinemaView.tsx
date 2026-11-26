import React from 'react';
import { ArrowLeft, ArrowRight, BookmarkPlus, Clapperboard, Globe2, RefreshCw } from 'lucide-react';
import { CORE_LANGUAGE_CODES, MOOD_COLOR_THEMES } from '../constants/musicConfig';
import type { CinemaScene, LanguageConfig, MoodCategory, Track } from '../types/music';
import { PlatformButtons } from './PlatformButtons';
import { TrackRowCard } from './TrackRowCard';

interface CinemaViewProps {
  scenes: CinemaScene[];
  categories: MoodCategory[];
  onSelectScene: (sceneId: string) => void;
}

export const CinemaView: React.FC<CinemaViewProps> = ({ scenes, categories, onSelectScene }) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9F5C76] dark:text-[#E5B8C7]">
            <Clapperboard className="w-4 h-4" />
            <span>Sinematik Sahne Seçkileri</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
            Moodify Cinema
          </h1>
          <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
            Kendini bir film sahnesinin içinde hayal et; sahneyi seç, o ânın müzikleri hazırlansın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenes.map((scene) => {
          const cat = categories.find((c) => c.id === scene.moodId);
          const theme = MOOD_COLOR_THEMES[cat?.colorKey || 'rose'] || MOOD_COLOR_THEMES.rose;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelectScene(scene.id)}
              className="group text-left bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl overflow-hidden hover:border-[#D8A1B3] dark:hover:border-[#B97891] hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#241A20]">
                <img
                  src={scene.coverUrl}
                  alt={scene.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2 text-white">
                  <h2 className="text-base font-extrabold leading-snug drop-shadow-xs">{scene.title}</h2>
                  <span
                    style={{ backgroundColor: theme.hex }}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5 shadow"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                <p className="text-xs text-[#5B4D54] dark:text-[#DFD1D7] leading-relaxed line-clamp-2">
                  {scene.subtitle}
                </p>
                <div className="text-[11px] font-semibold text-[#9F5C76] dark:text-[#E5B8C7]">
                  {cat?.name || 'Sinema Seçkisi'} · 12 şarkı
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface CinemaDetailViewProps {
  scene: CinemaScene;
  category?: MoodCategory;
  tracks: Track[];
  languages: LanguageConfig[];
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
  onBack: () => void;
  onRefresh: () => void;
  onSaveAsPlaylist: () => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
}

export const CinemaDetailView: React.FC<CinemaDetailViewProps> = ({
  scene,
  category,
  tracks,
  languages,
  selectedLanguages,
  onToggleLanguage,
  onBack,
  onRefresh,
  onSaveAsPlaylist,
  favoriteIds,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
}) => {
  const colorKey = category?.colorKey || 'rose';
  const theme = MOOD_COLOR_THEMES[colorKey] || MOOD_COLOR_THEMES.rose;
  const activeLangs = languages.filter((l) => l.active);
  const coreLangs = activeLangs.filter((l) => CORE_LANGUAGE_CODES.includes(l.code));
  const isMixed = selectedLanguages.length === 0 || selectedLanguages.includes('mixed');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] text-xs sm:text-sm font-semibold text-[#30282D] dark:text-[#FAF4F6] hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Moodify Cinema’ya Dön</span>
        </button>

        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${theme.badgeBg}`}>
          {category?.name || 'Cinema Sahnesi'}
        </span>
      </div>

      {/* Widescreen Cinematic Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#1E161B] text-white shadow-lg">
        <img
          src={scene.coverUrl}
          alt={scene.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191216] via-[#191216]/75 to-[#191216]/35" />

        <div className="relative z-10 p-5 sm:p-8 space-y-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E8B7C7]">
              <Clapperboard className="w-3.5 h-3.5" />
              <span>Moodify Cinema</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-balance">{scene.title}</h1>
            <p className="text-sm sm:text-base text-[#F5E8EC] leading-relaxed">{scene.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sahneyi Yenile</span>
            </button>
            <button
              type="button"
              onClick={onSaveAsPlaylist}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Çalma Listem Olarak Kaydet</span>
            </button>
          </div>

          {/* Language filter inside scene */}
          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5E8EC] mr-1">
              <Globe2 className="w-3.5 h-3.5 text-[#E8B7C7]" />
              <span>Dil:</span>
            </span>
            <button
              type="button"
              onClick={() => onToggleLanguage('mixed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                isMixed ? 'bg-[#FAF6F5] text-[#30282D]' : 'bg-white/15 text-white hover:bg-white/25'
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {lang.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onToggleLanguage('other')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                !isMixed && selectedLanguages.includes('other')
                  ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              Diğer
            </button>
          </div>

          <div className="pt-2">
            <div className="text-xs font-medium text-[#DFD1D7] mb-1.5">Sahne adını platformlarda ara:</div>
            <PlatformButtons query={scene.title.replace(/\.$/, '')} compact />
          </div>
        </div>
      </section>

      {/* Scene Tracks */}
      <section className="space-y-2.5">
        <h2 className="text-base sm:text-lg font-bold text-[#30282D] dark:text-[#FAF4F6]">
          Sahne Müzikleri ({tracks.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {tracks.map((track, idx) => (
            <TrackRowCard
              key={track.id}
              track={track}
              index={idx}
              isFavorite={favoriteIds.has(track.id)}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onInspectTrack={onInspectTrack}
              languages={languages}
              accentColorKey={colorKey}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
