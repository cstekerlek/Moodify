import React from 'react';
import { ArrowLeft, Heart, Pencil, Trash2 } from 'lucide-react';
import { MOOD_COLOR_THEMES } from '../constants/musicConfig';
import { computeAudioProfileStats } from '../lib/recommendation';
import type { CuratedPlaylist, LanguageConfig, MoodCategory, Track, UserPlaylist } from '../types/music';
import { PlatformButtons } from './PlatformButtons';
import { PlaylistCover } from './PlaylistCover';
import { TrackRowCard } from './TrackRowCard';

interface PlaylistDetailViewProps {
  playlist: CuratedPlaylist | UserPlaylist;
  tracks: Track[];
  categories: MoodCategory[];
  languages: LanguageConfig[];
  onBack: () => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
  onEditUserPlaylist?: (playlist: UserPlaylist) => void;
  onDeleteUserPlaylist?: (playlistId: string) => void;
  onRemoveTrackFromUserPlaylist?: (playlistId: string, trackId: string) => void;
  onSaveCuratedToMine?: (playlist: CuratedPlaylist) => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  tracks,
  categories,
  languages,
  onBack,
  favoriteIds,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
  onEditUserPlaylist,
  onDeleteUserPlaylist,
  onRemoveTrackFromUserPlaylist,
  onSaveCuratedToMine,
}) => {
  const isUser = 'isUserPlaylist' in playlist && playlist.isUserPlaylist === true;
  const title = isUser ? playlist.name : playlist.title;
  const category = categories.find((c) => c.id === playlist.moodId);
  const theme = MOOD_COLOR_THEMES[category?.colorKey || 'rose'] || MOOD_COLOR_THEMES.rose;
  const stats = computeAudioProfileStats(tracks);
  const langLabel =
    playlist.language === 'mixed' || playlist.language === 'all'
      ? 'Karışık Diller'
      : languages.find((l) => l.code === playlist.language)?.name || playlist.language;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] text-xs sm:text-sm font-semibold hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Geri Dön</span>
        </button>

        {isUser ? (
          <div className="flex items-center gap-2">
            {onEditUserPlaylist && (
              <button
                type="button"
                onClick={() => onEditUserPlaylist(playlist)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] text-xs font-semibold hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
            )}
            {onDeleteUserPlaylist && (
              <button
                type="button"
                onClick={() => onDeleteUserPlaylist(playlist.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sil</span>
              </button>
            )}
          </div>
        ) : (
          onSaveCuratedToMine && (
            <button
              type="button"
              onClick={() => onSaveCuratedToMine(playlist)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl ${theme.bgSolid} text-white text-xs font-semibold cursor-pointer`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Listelerime Kaydet</span>
            </button>
          )
        )}
      </div>

      {/* Hero Header */}
      <section
        className={`rounded-3xl border ${theme.borderAccent} bg-gradient-to-br ${theme.bgGradient} p-5 sm:p-6`}
      >
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <PlaylistCover
            title={title}
            subtitle={category?.name}
            coverUrl={playlist.coverUrl}
            colorKey={category?.colorKey || 'rose'}
            seed={playlist.id}
            className="w-full md:w-48 aspect-square shrink-0 shadow-lg"
          />

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B4D54] dark:text-[#DFD1D7]">
              <span className={`font-bold px-2.5 py-1 rounded-lg ${theme.badgeBg}`}>
                {category?.name || 'Çalma Listesi'}
              </span>
              <span>·</span>
              <span>{langLabel}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{tracks.length} şarkı</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
              {title}
            </h1>
            {playlist.description && (
              <p className="text-sm sm:text-base text-[#5B4D54] dark:text-[#DFD1D7] max-w-2xl">
                {playlist.description}
              </p>
            )}

            {/* Audio Feature Summary */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-[#5B4D54] dark:text-[#DFD1D7]">
              <span>Ort. Valence: {stats.avgValence.toFixed(2)}</span>
              <span>·</span>
              <span>Ort. Energy: {stats.avgEnergy.toFixed(2)}</span>
              <span>·</span>
              <span>Ort. Acoustic: {stats.avgAcousticness.toFixed(2)}</span>
              <span>·</span>
              <span>{stats.avgTempo} BPM</span>
            </div>

            <div className="pt-2">
              <div className="text-xs font-semibold text-[#7D6C74] dark:text-[#B9A7B0] mb-2">
                Bu listeyi platformlarda ara:
              </div>
              <PlatformButtons query={title} />
            </div>
          </div>
        </div>
      </section>

      {/* Tracklist */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#30282D] dark:text-[#FAF4F6]">
          Şarkı Listesi ({tracks.length})
        </h2>

        {tracks.length === 0 ? (
          <div className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-8 text-center text-sm text-[#7D6C74]">
            Bu çalma listesinde henüz şarkı bulunmuyor. Arama veya ruh hâli keşfinden şarkı ekleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {tracks.map((track, idx) => (
              <div key={track.id} className="relative">
                <TrackRowCard
                  track={track}
                  index={idx}
                  isFavorite={favoriteIds.has(track.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToPlaylist={onAddToPlaylist}
                  onInspectTrack={onInspectTrack}
                  languages={languages}
                  accentColorKey={category?.colorKey || 'rose'}
                />
                {isUser && onRemoveTrackFromUserPlaylist && (
                  <button
                    type="button"
                    onClick={() => onRemoveTrackFromUserPlaylist(playlist.id, track.id)}
                    title="Listeden çıkar"
                    className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 cursor-pointer"
                  >
                    Listeden Çıkar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
