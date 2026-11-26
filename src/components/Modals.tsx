import React from 'react';
import { Heart, ListPlus, Plus, X } from 'lucide-react';
import { MOOD_COLOR_THEMES, resolveTrackFallbackCover } from '../constants/musicConfig';
import { fetchTrackArtwork } from '../lib/artworkCache';
import type { LanguageConfig, MoodCategory, Track, UserPlaylist } from '../types/music';
import { PlatformButtons } from './PlatformButtons';
import { PlaylistCover } from './PlaylistCover';

interface TrackInspectModalProps {
  track: Track | null;
  categories: MoodCategory[];
  languages: LanguageConfig[];
  isFavorite: boolean;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onClose: () => void;
}

export const TrackInspectModal: React.FC<TrackInspectModalProps> = ({
  track,
  languages,
  isFavorite,
  onToggleFavorite,
  onAddToPlaylist,
  onClose,
}) => {
  const [liveCover, setLiveCover] = React.useState<string | null>(track?.coverUrl || null);
  const [releaseType, setReleaseType] = React.useState<'single' | 'album' | null>(null);

  React.useEffect(() => {
    if (!track) return;
    if (track.coverUrl) {
      setLiveCover(track.coverUrl);
      setReleaseType(track.album && track.album.toLowerCase() !== 'single' ? 'album' : 'single');
      return;
    }
    let active = true;
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
  }, [track]);

  if (!track) return null;
  const langName = languages.find((l) => l.code === track.language)?.name || track.language.toUpperCase();
  const query = `${track.title} ${track.artist}`;
  const displayCover = liveCover || resolveTrackFallbackCover(track);
  const releaseLabel =
    track.album && track.album.trim().length > 0
      ? track.album
      : releaseType === 'single'
        ? 'Single'
        : 'Albüm / Single';

  const featureBars =
    track.audioFeaturesVerified && track.valence !== null && track.energy !== null
      ? [
          { label: 'Valence (Pozitiflik)', val: track.valence },
          { label: 'Energy (Enerji)', val: track.energy },
          { label: 'Danceability (Dans)', val: track.danceability ?? 0.5 },
          { label: 'Acousticness (Akustik)', val: track.acousticness ?? 0.3 },
        ]
      : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${track.title} şarkı ayrıntıları`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <PlaylistCover
              title={track.title}
              coverUrl={displayCover}
              colorKey="rose"
              seed={track.id}
              className="w-20 h-20 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
                {track.genre} · {langName}
                {track.year ? ` · ${track.year}` : ''}
              </div>
              <h2 className="mt-0.5 text-lg sm:text-xl font-extrabold text-[#30282D] dark:text-[#FAF4F6] truncate">
                {track.title}
              </h2>
              <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7] truncate">{track.artist}</p>
              <p className="text-xs text-[#7D6C74] dark:text-[#B9A7B0] truncate">{releaseLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl text-[#7D6C74] hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(track)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border cursor-pointer ${
              isFavorite
                ? 'border-[#E5A3B7] dark:border-[#7B4258] bg-[#F9EFF2] dark:bg-[#3A242E] text-[#B94A6C] dark:text-[#F4A8BF]'
                : 'border-[#EDE2E5] dark:border-[#362A31] text-[#30282D] dark:text-[#FAF4F6]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}</span>
          </button>

          <button
            type="button"
            onClick={() => onAddToPlaylist(track)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs sm:text-sm font-bold cursor-pointer"
          >
            <ListPlus className="w-4 h-4" />
            <span>Çalma Listeme Ekle</span>
          </button>
        </div>

        {/* Audio Features */}
        <div className="rounded-2xl bg-[#FAF6F5] dark:bg-[#171215] border border-[#EDE2E5] dark:border-[#362A31] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#30282D] dark:text-[#FAF4F6]">
            <span>Ses Profili</span>
            {track.tempo !== null && <span className="font-mono tabular-nums">{track.tempo} BPM</span>}
          </div>

          {featureBars.length > 0 ? (
            <div className="space-y-2.5">
              {featureBars.map((f) => (
                <div key={f.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-[#5B4D54] dark:text-[#DFD1D7]">
                    <span>{f.label}</span>
                    <span className="font-mono tabular-nums">{Math.round(f.val * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EDE2E5] dark:bg-[#2E242A] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#B97891] to-[#D8A1B3]"
                      style={{ width: `${Math.round(f.val * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
              Bu şarkı için sayısal ses özniteliği doğrulanmamıştır.
            </p>
          )}
        </div>

        {/* All 8 Platforms */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#5B4D54] dark:text-[#DFD1D7]">
            8 Müzik Platformunda Ara ve Dinle
          </div>
          <PlatformButtons query={query} />
        </div>
      </div>
    </div>
  );
};

interface PlaylistEditorModalProps {
  open: boolean;
  initialPlaylist?: UserPlaylist | null;
  categories: MoodCategory[];
  languages: LanguageConfig[];
  onSave: (data: {
    id?: string;
    name: string;
    description: string;
    moodId: string;
    language: string;
    coverUrl?: string;
  }) => void;
  onClose: () => void;
}

export const PlaylistEditorModal: React.FC<PlaylistEditorModalProps> = ({
  open,
  initialPlaylist,
  categories,
  languages,
  onSave,
  onClose,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [moodId, setMoodId] = React.useState('happy');
  const [language, setLanguage] = React.useState('mixed');
  const [coverUrl, setCoverUrl] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setName(initialPlaylist?.name || '');
      setDescription(initialPlaylist?.description || '');
      setMoodId(initialPlaylist?.moodId || categories[0]?.id || 'happy');
      setLanguage(initialPlaylist?.language || 'mixed');
      setCoverUrl(initialPlaylist?.coverUrl || '');
    }
  }, [open, initialPlaylist, categories]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialPlaylist?.id,
      name: name.trim().slice(0, 120),
      description: description.trim().slice(0, 300),
      moodId,
      language,
      coverUrl: coverUrl.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Çalma Listesi Düzenle"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-3xl p-6 space-y-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#30282D] dark:text-[#FAF4F6]">
            {initialPlaylist ? 'Çalma Listesini Düzenle' : 'Yeni Çalma Listesi'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl text-[#7D6C74] hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#5B4D54] dark:text-[#DFD1D7] mb-1">Liste Adı</label>
            <input
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Akşam Yürüyüşü"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5B4D54] dark:text-[#DFD1D7] mb-1">Açıklama</label>
            <textarea
              rows={2}
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kısa bir not..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5B4D54] dark:text-[#DFD1D7] mb-1">Ruh Hâli</label>
              <select
                value={moodId}
                onChange={(e) => setMoodId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B4D54] dark:text-[#DFD1D7] mb-1">Dil</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215]"
              >
                <option value="mixed">Karışık</option>
                {languages
                  .filter((l) => l.active)
                  .map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5B4D54] dark:text-[#DFD1D7] mb-1">
              Kapak Görseli URL (İsteğe bağlı)
            </label>
            <input
              type="url"
              maxLength={500}
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] text-xs sm:text-sm font-semibold cursor-pointer"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs sm:text-sm font-bold cursor-pointer"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

interface AddToPlaylistModalProps {
  track: Track | null;
  userPlaylists: UserPlaylist[];
  categories: MoodCategory[];
  onSelectPlaylist: (playlistId: string, track: Track) => void;
  onCreateWithTrack: (name: string, track: Track) => void;
  onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  track,
  userPlaylists,
  categories,
  onSelectPlaylist,
  onCreateWithTrack,
  onClose,
}) => {
  const [newName, setNewName] = React.useState('');

  if (!track) return null;

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateWithTrack(newName.trim().slice(0, 120), track);
    setNewName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Çalma Listesine Ekle"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-3xl p-6 space-y-4 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-[#30282D] dark:text-[#FAF4F6]">Çalma Listesine Ekle</h2>
            <p className="text-xs text-[#7D6C74] dark:text-[#B9A7B0] truncate">
              {track.title} · {track.artist}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl text-[#7D6C74] hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {userPlaylists.length === 0 ? (
            <p className="text-xs text-[#7D6C74] py-3">Henüz bir çalma listen yok. Aşağıdan hemen oluşturabilirsin.</p>
          ) : (
            userPlaylists.map((pl) => {
              const cat = categories.find((c) => c.id === pl.moodId);
              const theme = MOOD_COLOR_THEMES[cat?.colorKey || 'rose'] || MOOD_COLOR_THEMES.rose;
              const alreadyIn = pl.trackIds.includes(track.id);
              return (
                <button
                  key={pl.id}
                  type="button"
                  disabled={alreadyIn}
                  onClick={() => onSelectPlaylist(pl.id, track)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] hover:border-[#B97891] disabled:opacity-50 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: theme.hex }} />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#30282D] dark:text-[#FAF4F6] truncate">{pl.name}</div>
                      <div className="text-[11px] text-[#7D6C74] font-mono tabular-nums">
                        {pl.trackIds.length} şarkı
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#9F5C76] dark:text-[#E5B8C7] shrink-0">
                    {alreadyIn ? 'Eklendi' : 'Ekle'}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <form onSubmit={handleQuickCreate} className="pt-3 border-t border-[#F2E9EC] dark:border-[#362A31] flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={120}
            placeholder="Yeni liste adı yaz..."
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215]"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] disabled:opacity-40 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Oluştur</span>
          </button>
        </form>
      </div>
    </div>
  );
};
