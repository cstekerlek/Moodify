import React from 'react';
import { ExternalLink, Heart, ListPlus } from 'lucide-react';
import { MOOD_COLOR_THEMES, MUSIC_PLATFORMS, resolveTrackFallbackCover } from '../constants/musicConfig';
import { fetchTrackArtwork } from '../lib/artworkCache';
import type { LanguageConfig, MoodColorKey, Track } from '../types/music';
import { PlatformIcon } from './PlatformButtons';
import { PlaylistCover } from './PlaylistCover';

interface TrackRowCardProps {
  track: Track;
  index?: number;
  isFavorite: boolean;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onInspectTrack: (track: Track) => void;
  languages: LanguageConfig[];
  accentColorKey?: MoodColorKey;
}

export const TrackRowCard: React.FC<TrackRowCardProps> = ({
  track,
  index,
  isFavorite,
  onToggleFavorite,
  onAddToPlaylist,
  onInspectTrack,
  languages,
  accentColorKey = 'rose',
}) => {
  const [liveCover, setLiveCover] = React.useState<string | null>(track.coverUrl || null);
  const [releaseType, setReleaseType] = React.useState<'single' | 'album' | null>(null);
  const langName = languages.find((l) => l.code === track.language)?.name || track.language.toUpperCase();
  const searchQuery = `${track.title} ${track.artist}`;
  const theme = MOOD_COLOR_THEMES[accentColorKey] || MOOD_COLOR_THEMES.rose;

  React.useEffect(() => {
    let active = true;
    if (track.coverUrl) {
      setLiveCover(track.coverUrl);
      setReleaseType(track.album && track.album.toLowerCase() !== 'single' ? 'album' : 'single');
      return;
    }
    setLiveCover(null);
    setReleaseType(null);
    fetchTrackArtwork(track.title, track.artist, track.album).then((res) => {
      if (!active) return;
      if (res.coverUrl) setLiveCover(res.coverUrl);
      if (res.releaseType) setReleaseType(res.releaseType);
    });
    return () => {
      active = false;
    };
  }, [track.id, track.title, track.artist, track.album, track.coverUrl]);

  const effectiveCover = liveCover || resolveTrackFallbackCover(track);
  const releaseLabel =
    track.album && track.album.trim().length > 0
      ? track.album
      : releaseType === 'single'
        ? 'Single'
        : 'Albüm / Single';
  const desktopQuickPlatforms = MUSIC_PLATFORMS.slice(0, 4); // Spotify, YouTube Music, YouTube, Apple Music
  const mobileQuickPlatforms = MUSIC_PLATFORMS.slice(0, 2); // Spotify, YouTube Music

  return (
    <article
      className={`group bg-[#FFFDFC] dark:bg-[#211A1E] border ${
        accentColorKey === 'rose'
          ? 'border-[#EDE2E5] dark:border-[#362A31] hover:border-[#D8A1B3] dark:hover:border-[#B97891]'
          : `${theme.borderAccent} hover:shadow-sm`
      } rounded-2xl p-3 flex items-center gap-3 transition-colors`}
    >
      {/* Verified Album / Single Cover */}
      <button
        type="button"
        onClick={() => onInspectTrack(track)}
        className="w-15 h-15 shrink-0 rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B97891] cursor-pointer relative"
        title="Şarkı ayrıntılarını ve tüm platformları gör"
      >
        <PlaylistCover
          title={track.title}
          coverUrl={effectiveCover}
          colorKey={accentColorKey}
          seed={track.id}
          className="w-15 h-15"
        />
        {typeof index === 'number' && (
          <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[10px] font-mono tabular-nums font-bold text-white leading-none">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </button>

      {/* Clean Track Metadata (No decorative pills) */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onInspectTrack(track)}
            className="text-left min-w-0 flex-1 cursor-pointer"
          >
            <h3 className="text-sm font-bold text-[#30282D] dark:text-[#FAF4F6] truncate group-hover:text-[#9F5C76] dark:group-hover:text-[#E5B8C7] transition-colors">
              {track.title}
            </h3>
          </button>
          {typeof track.matchScore === 'number' && track.matchScore > 0 && (
            <span
              className={`text-[11px] font-mono tabular-nums font-bold shrink-0 ${theme.textAccent}`}
              title="Ruh Hâli Uyum Puanı"
            >
              %{track.matchScore}
            </span>
          )}
        </div>

        <p className="text-xs font-medium text-[#5B4D54] dark:text-[#DFD1D7] truncate">{track.artist}</p>

        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#7D6C74] dark:text-[#B9A7B0] truncate">
          <span className="truncate max-w-[140px]" title={releaseLabel}>
            {releaseLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{langName}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{track.genre}</span>
        </div>
      </div>

      {/* Platform Logos & Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Mobile 2 quick brand icons */}
        <div className="flex sm:hidden items-center gap-1">
          {mobileQuickPlatforms.map((p) => (
            <a
              key={p.id}
              href={p.buildUrl(searchQuery)}
              target="_blank"
              rel="noopener noreferrer"
              title={`${p.name} üzerinde dinle`}
              aria-label={`${p.name} üzerinde dinle`}
              style={{ backgroundColor: p.color, color: p.textColor }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 transition-transform active:scale-95"
            >
              <PlatformIcon id={p.id} className="w-4 h-4" />
            </a>
          ))}
        </div>

        {/* Desktop 4 quick brand icons */}
        <div className="hidden sm:flex items-center gap-1">
          {desktopQuickPlatforms.map((p) => (
            <a
              key={p.id}
              href={p.buildUrl(searchQuery)}
              target="_blank"
              rel="noopener noreferrer"
              title={`${p.name} üzerinde dinle`}
              aria-label={`${p.name} üzerinde dinle`}
              style={{ backgroundColor: p.color, color: p.textColor }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 transition-transform active:scale-95 shadow-xs"
            >
              <PlatformIcon id={p.id} className="w-4 h-4" />
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onInspectTrack(track)}
          aria-label="Tüm 8 platformda aç"
          title="8 müzik platformunda ara ve ayrıntıları gör"
          className="h-8 px-2 rounded-lg border border-[#E6DADE] dark:border-[#3D3037] text-[11px] font-bold text-[#5B4D54] dark:text-[#DFD1D7] hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227] hover:text-[#9F5C76] dark:hover:text-[#E5B8C7] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden md:inline">+4</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(track)}
          aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
            isFavorite
              ? 'border-[#E5A3B7] dark:border-[#7B4258] bg-[#F9EFF2] dark:bg-[#3A242E] text-[#B94A6C] dark:text-[#F4A8BF]'
              : 'border-[#E6DADE] dark:border-[#3D3037] text-[#8E7D85] hover:text-[#B94A6C]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => onAddToPlaylist(track)}
          aria-label="Çalma listeme ekle"
          title="Çalma listeme ekle"
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E6DADE] dark:border-[#3D3037] text-[#6D5D65] dark:text-[#CFC0C7] hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] transition-colors cursor-pointer"
        >
          <ListPlus className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
