import React from 'react';
import { BookmarkPlus, Dices, Globe2, RefreshCw, Sparkles } from 'lucide-react';
import { CORE_LANGUAGE_CODES, MOOD_COLOR_THEMES } from '../constants/musicConfig';
import type { LanguageConfig, MoodCategory, Track } from '../types/music';
import { TrackRowCard } from './TrackRowCard';

interface RouletteViewProps {
  categories: MoodCategory[];
  languages: LanguageConfig[];
  selectedLanguages: string[];
  onToggleLanguage: (code: string) => void;
  rolledMood: MoodCategory | null;
  rolledTracks: Track[];
  isSpinning: boolean;
  rotationDeg: number;
  onSpin: () => void;
  onSaveAsPlaylist: () => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
}

export const RouletteView: React.FC<RouletteViewProps> = ({
  categories,
  languages,
  selectedLanguages,
  onToggleLanguage,
  rolledMood,
  rolledTracks,
  isSpinning,
  rotationDeg,
  onSpin,
  onSaveAsPlaylist,
  favoriteIds,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
}) => {
  const activeCategories = categories.filter((c) => c.active).slice(0, 5);
  const activeLangs = languages.filter((l) => l.active);
  const coreLangs = activeLangs.filter((l) => CORE_LANGUAGE_CODES.includes(l.code));
  const isMixed = selectedLanguages.length === 0 || selectedLanguages.includes('mixed');

  const winningTheme = rolledMood
    ? MOOD_COLOR_THEMES[rolledMood.colorKey] || MOOD_COLOR_THEMES.rose
    : MOOD_COLOR_THEMES.rose;

  // Build wheel conic gradient from the 5 mood colors
  const sliceColors = activeCategories.map((c) => (MOOD_COLOR_THEMES[c.colorKey] || MOOD_COLOR_THEMES.rose).hex);
  const stepDeg = sliceColors.length > 0 ? 360 / sliceColors.length : 72;
  const conicStops = sliceColors
    .map((hex, i) => `${hex} ${i * stepDeg}deg ${(i + 1) * stepDeg}deg`)
    .join(', ');

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9F5C76] dark:text-[#E5B8C7]">
          <Dices className="w-4 h-4" />
          <span>Sürpriz Keşif Çarkı</span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
          Müzik Ruleti
        </h1>
        <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
          Karar veremediğinde çarkı çevir; dil tercihine uygun rastgele bir ruh hâli ve 12 sürpriz şarkı gelsin.
        </p>
      </div>

      {/* Roulette Stage */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-3xl p-5 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Interactive Wheel */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center py-2">
            <div className="relative flex flex-col items-center">
              {/* Top Pointer */}
              <div
                aria-hidden="true"
                className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#30282D] dark:border-t-[#FAF4F6] mb-1 z-20"
              />

              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 bg-[#FAF6F5] dark:bg-[#171215] border-4 border-[#E6CCD4] dark:border-[#4B3641] shadow-lg">
                <div
                  style={{
                    background: conicStops ? `conic-gradient(${conicStops})` : '#D8A1B3',
                    transform: `rotate(${rotationDeg}deg)`,
                    transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className="w-full h-full rounded-full relative overflow-hidden"
                >
                  {activeCategories.map((cat, idx) => {
                    const angle = idx * stepDeg + stepDeg / 2;
                    return (
                      <div
                        key={cat.id}
                        style={{
                          transform: `rotate(${angle}deg)`,
                        }}
                        className="absolute inset-0 flex items-start justify-center pt-4 pointer-events-none"
                      >
                        <span className="text-[10px] font-extrabold text-white drop-shadow-xs px-1 text-center max-w-[74px] leading-tight">
                          {cat.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Center Spin Hub */}
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={onSpin}
                  className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-[#FFFDFC] dark:bg-[#211A1E] border-4 border-[#B97891] text-[#30282D] dark:text-[#FAF4F6] shadow-md flex flex-col items-center justify-center gap-0.5 hover:scale-105 active:scale-95 transition-transform disabled:opacity-75 cursor-pointer z-10"
                >
                  <Sparkles className={`w-5 h-5 text-[#B97891] ${isSpinning ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-extrabold leading-tight text-center px-1">
                    {isSpinning ? 'Çevriliyor...' : rolledMood ? 'Tekrar Çevir' : 'Bana Sürpriz Yap'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls & Winning Result Summary */}
          <div className="lg:col-span-7 space-y-4">
            {/* Language Preferences */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B4D54] dark:text-[#DFD1D7]">
                <Globe2 className="w-3.5 h-3.5 text-[#B97891]" />
                <span>Sürpriz Şarkı Dili:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleLanguage('mixed')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    isMixed
                      ? 'bg-[#30282D] dark:bg-[#FAF4F6] text-white dark:text-[#30282D]'
                      : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
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
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                          : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
                      }`}
                    >
                      {lang.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => onToggleLanguage('other')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    !isMixed && selectedLanguages.includes('other')
                      ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                      : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
                  }`}
                >
                  Diğer
                </button>
              </div>
            </div>

            {rolledMood ? (
              <div
                className={`rounded-2xl border ${winningTheme.borderAccent} ${winningTheme.bgSoft} p-4 sm:p-5 space-y-3`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rolledMood.coverUrl}
                    alt={rolledMood.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
                  />
                  <div className="min-w-0">
                    <div className={`text-xs font-bold ${winningTheme.textAccent}`}>Rulet Seçimi</div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#30282D] dark:text-[#FAF4F6] truncate">
                      {rolledMood.name}
                    </h2>
                    <p className="text-xs text-[#5B4D54] dark:text-[#DFD1D7] line-clamp-1">
                      {rolledMood.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSpinning}
                    onClick={onSpin}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60 ${winningTheme.bgSolid}`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>Tekrar Çevir</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSaveAsPlaylist}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6DADE] dark:border-[#3D3037] bg-white/90 dark:bg-[#211A1E] text-[#30282D] dark:text-[#FAF4F6] text-xs sm:text-sm font-semibold hover:opacity-90 cursor-pointer"
                  >
                    <BookmarkPlus className={`w-4 h-4 ${winningTheme.textAccent}`} />
                    <span>Çalma Listem Olarak Kaydet</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#191317] p-5 space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#30282D] dark:text-[#FAF4F6]">
                  Çarkı çevirmeye hazır mısın?
                </h2>
                <p className="text-xs sm:text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
                  “Bana Sürpriz Yap” butonuna bastığında beş ruh hâlinden biri rastgele seçilir ve seçili diline uygun
                  12 şarkılık taze bir liste hazırlanır.
                </p>
                <button
                  type="button"
                  onClick={onSpin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-sm font-bold cursor-pointer shadow-xs"
                >
                  <Dices className="w-4 h-4" />
                  <span>Bana Sürpriz Yap</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rolled Surprise Tracklist */}
      {rolledMood && rolledTracks.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-[#30282D] dark:text-[#FAF4F6]">
            Sürpriz Çalma Listen ({rolledTracks.length} şarkı)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {rolledTracks.map((track, idx) => (
              <TrackRowCard
                key={track.id}
                track={track}
                index={idx}
                isFavorite={favoriteIds.has(track.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddToPlaylist}
                onInspectTrack={onInspectTrack}
                languages={languages}
                accentColorKey={rolledMood.colorKey}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
