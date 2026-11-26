import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  FileUp,
  FolderKanban,
  Globe2,
  ListMusic,
  Lock,
  LogIn,
  LogOut,
  Music2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { deleteDoc, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import catalogMeta from '../data/catalog-meta.json';
import { MOOD_COLOR_THEMES, MUSIC_GENRES } from '../constants/musicConfig';
import { BOOTSTRAP_ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  clamp01,
  clampTempo,
  detectDuplicateTracks,
  normalizeImportedTrack,
  normalizeTrackKey,
  parseCsvLine,
} from '../lib/recommendation';
import type {
  CuratedPlaylist,
  LanguageConfig,
  MoodCategory,
  MoodColorKey,
  Track,
} from '../types/music';

type AdminTab = 'tracks' | 'playlists' | 'dataset' | 'categories' | 'languages';

interface AdminPanelViewProps {
  tracks: Track[];
  categories: MoodCategory[];
  languages: LanguageConfig[];
  curatedPlaylists: CuratedPlaylist[];
  firebaseEmail: string | null;
  firebaseEmailVerified: boolean;
  onGoogleSignIn: () => void;
  onBack: () => void;
  onToast: (msg: string, tone?: 'success' | 'error') => void;
  onUpsertTrackOverride: (track: Track) => void;
  onBulkTrackOverrides: (tracks: Track[]) => void;
  onUpsertPlaylistOverride: (pl: CuratedPlaylist) => void;
  onDeletePlaylistOverride: (playlistId: string) => void;
  onUpsertCategoryOverride: (cat: MoodCategory) => void;
  onUpsertLanguageOverride: (lang: LanguageConfig) => void;
}

const COLOR_OPTIONS: { key: MoodColorKey; label: string }[] = [
  { key: 'orange', label: 'Turuncu' },
  { key: 'gray', label: 'Gri' },
  { key: 'blue', label: 'Mavi' },
  { key: 'red', label: 'Kırmızı' },
  { key: 'green', label: 'Yeşil' },
  { key: 'purple', label: 'Mor' },
  { key: 'teal', label: 'Turkuaz' },
  { key: 'amber', label: 'Kehribar' },
];

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  tracks,
  categories,
  languages,
  curatedPlaylists,
  firebaseEmail,
  firebaseEmailVerified,
  onGoogleSignIn,
  onBack,
  onToast,
  onUpsertTrackOverride,
  onBulkTrackOverrides,
  onUpsertPlaylistOverride,
  onDeletePlaylistOverride,
  onUpsertCategoryOverride,
  onUpsertLanguageOverride,
}) => {
  const [activeTab, setActiveTab] = React.useState<AdminTab>('tracks');

  // Auth state
  const [serverChecked, setServerChecked] = React.useState(false);
  const [serverAuthenticated, setServerAuthenticated] = React.useState(false);
  const [serverConfigured, setServerConfigured] = React.useState(false);
  const [serverUsername, setServerUsername] = React.useState<string | undefined>(undefined);
  const [loginUser, setLoginUser] = React.useState('');
  const [loginPass, setLoginPass] = React.useState('');
  const [loginBusy, setLoginBusy] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');

  const isFirebaseAdmin = Boolean(
    firebaseEmail &&
      firebaseEmailVerified &&
      firebaseEmail.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
  );
  const hasAdminAccess = serverAuthenticated || isFirebaseAdmin;

  const checkSession = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setServerAuthenticated(Boolean(data.authenticated));
        setServerConfigured(Boolean(data.configured));
        setServerUsername(data.username);
      }
    } catch {
      // Static-only or offline fallback
    } finally {
      setServerChecked(true);
    }
  }, []);

  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleServerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: loginUser.trim(), password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Yönetici girişi başarısız.');
        return;
      }
      setServerAuthenticated(true);
      setServerUsername(data.username);
      setLoginPass('');
      onToast('Sunucu yönetici oturumu açıldı.');
    } catch {
      setLoginError('Sunucu bağlantısı kurulamadı.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleServerLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setServerAuthenticated(false);
    setServerUsername(undefined);
    onToast('Yönetici oturumu kapatıldı.');
  };

  // --- TRACKS TAB STATE ---
  const [trackSearch, setTrackSearch] = React.useState('');
  const [showDeletedTracks, setShowDeletedTracks] = React.useState(false);
  const [editingTrackId, setEditingTrackId] = React.useState<string | null>(null);
  const [trackForm, setTrackForm] = React.useState({
    title: '',
    artist: '',
    album: '',
    genre: 'Pop',
    language: 'tr',
    year: '',
    coverUrl: '',
    valence: '0.65',
    energy: '0.70',
    danceability: '0.68',
    acousticness: '0.22',
    tempo: '118',
  });
  const [savingTrack, setSavingTrack] = React.useState(false);

  const resetTrackForm = () => {
    setEditingTrackId(null);
    setTrackForm({
      title: '',
      artist: '',
      album: '',
      genre: 'Pop',
      language: 'tr',
      year: '',
      coverUrl: '',
      valence: '0.65',
      energy: '0.70',
      danceability: '0.68',
      acousticness: '0.22',
      tempo: '118',
    });
  };

  const startEditTrack = (t: Track) => {
    setEditingTrackId(t.id);
    setTrackForm({
      title: t.title,
      artist: t.artist,
      album: t.album || '',
      genre: t.genre || 'Pop',
      language: t.language || 'tr',
      year: t.year ? String(t.year) : '',
      coverUrl: t.coverUrl || '',
      valence: String(t.valence ?? 0.5),
      energy: String(t.energy ?? 0.5),
      danceability: String(t.danceability ?? 0.5),
      acousticness: String(t.acousticness ?? 0.3),
      tempo: String(t.tempo ?? 115),
    });
  };

  const persistTrack = async (trackPayload: Track) => {
    if (isFirebaseAdmin) {
      const firestoreData = {
        id: trackPayload.id,
        title: trackPayload.title,
        artist: trackPayload.artist,
        album: trackPayload.album || null,
        genre: trackPayload.genre,
        language: trackPayload.language,
        year: trackPayload.year,
        coverUrl: trackPayload.coverUrl || null,
        valence: trackPayload.valence,
        energy: trackPayload.energy,
        danceability: trackPayload.danceability,
        acousticness: trackPayload.acousticness,
        tempo: trackPayload.tempo,
        deleted: Boolean(trackPayload.deleted),
        updatedAt: serverTimestamp(),
      };
      try {
        await setDoc(doc(db, 'customTracks', trackPayload.id), firestoreData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `customTracks/${trackPayload.id}`);
      }
    }

    if (serverAuthenticated) {
      const res = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(trackPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Sunucuya kayıt başarısız.');
      }
    }

    onUpsertTrackOverride(trackPayload);
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.title.trim() || !trackForm.artist.trim()) return;
    setSavingTrack(true);
    try {
      const id = editingTrackId || `adm_${Date.now().toString(36)}`;
      const yearNum = trackForm.year.trim() ? Number(trackForm.year.trim()) : NaN;
      const nextTrack: Track = {
        id,
        title: trackForm.title.trim().slice(0, 180),
        artist: trackForm.artist.trim().slice(0, 180),
        album: trackForm.album.trim().slice(0, 180) || 'Single',
        genre: trackForm.genre.trim().slice(0, 64) || 'Pop',
        language: trackForm.language.trim().toLowerCase().slice(0, 16) || 'tr',
        year: Number.isFinite(yearNum) && yearNum >= 1900 && yearNum <= 2100 ? Math.round(yearNum) : null,
        coverUrl: trackForm.coverUrl.trim().slice(0, 500) || null,
        valence: clamp01(parseFloat(trackForm.valence)),
        energy: clamp01(parseFloat(trackForm.energy)),
        danceability: clamp01(parseFloat(trackForm.danceability)),
        acousticness: clamp01(parseFloat(trackForm.acousticness)),
        tempo: clampTempo(parseFloat(trackForm.tempo)),
        audioFeaturesVerified: true,
        source: 'Yönetici Paneli',
        deleted: false,
      };
      await persistTrack(nextTrack);
      onToast(editingTrackId ? 'Şarkı güncellendi.' : 'Yeni şarkı eklendi.');
      resetTrackForm();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Şarkı kaydedilemedi.', 'error');
    } finally {
      setSavingTrack(false);
    }
  };

  const handleToggleDeleteTrack = async (t: Track) => {
    try {
      const updated: Track = { ...t, deleted: !t.deleted };
      await persistTrack(updated);
      onToast(updated.deleted ? 'Şarkı katalogdan gizlendi.' : 'Şarkı geri yüklendi.');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'İşlem başarısız.', 'error');
    }
  };

  const filteredAdminTracks = React.useMemo(() => {
    const q = trackSearch.trim().toLowerCase();
    return tracks
      .filter((t) => (showDeletedTracks ? true : !t.deleted))
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
        );
      })
      .slice(0, 40);
  }, [tracks, trackSearch, showDeletedTracks]);

  // --- PLAYLISTS TAB STATE ---
  const [editingPlaylistId, setEditingPlaylistId] = React.useState<string | null>(null);
  const [playlistForm, setPlaylistForm] = React.useState({
    title: '',
    description: '',
    moodId: categories[0]?.id || 'happy',
    language: 'mixed',
    coverUrl: '',
    featured: true,
    trackIds: [] as string[],
  });
  const [plTrackQuery, setPlTrackQuery] = React.useState('');
  const [savingPlaylist, setSavingPlaylist] = React.useState(false);

  const startNewPlaylist = () => {
    setEditingPlaylistId(null);
    setPlaylistForm({
      title: '',
      description: '',
      moodId: categories[0]?.id || 'happy',
      language: 'mixed',
      coverUrl: '',
      featured: true,
      trackIds: [],
    });
  };

  const startEditPlaylist = (pl: CuratedPlaylist) => {
    setEditingPlaylistId(pl.id);
    setPlaylistForm({
      title: pl.title,
      description: pl.description,
      moodId: pl.moodId,
      language: pl.language || 'mixed',
      coverUrl: pl.coverUrl || '',
      featured: pl.featured,
      trackIds: [...pl.trackIds],
    });
  };

  const plSearchResults = React.useMemo(() => {
    const q = plTrackQuery.trim().toLowerCase();
    if (!q) return [];
    return tracks
      .filter((t) => !t.deleted && (t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [tracks, plTrackQuery]);

  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistForm.title.trim()) return;
    setSavingPlaylist(true);
    try {
      const id = editingPlaylistId || `cpl_${Date.now().toString(36)}`;
      const payload: CuratedPlaylist = {
        id,
        title: playlistForm.title.trim().slice(0, 120),
        description: playlistForm.description.trim().slice(0, 300) || 'Moodify seçkisi',
        moodId: playlistForm.moodId || 'happy',
        language: playlistForm.language || 'mixed',
        coverUrl: playlistForm.coverUrl.trim().slice(0, 500) || undefined,
        trackIds: playlistForm.trackIds.slice(0, 80),
        featured: playlistForm.featured,
      };

      if (isFirebaseAdmin) {
        try {
          await setDoc(doc(db, 'curatedPlaylists', id), {
            id: payload.id,
            title: payload.title,
            description: payload.description,
            moodId: payload.moodId,
            language: payload.language,
            coverUrl: payload.coverUrl || null,
            trackIds: payload.trackIds,
            featured: payload.featured,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `curatedPlaylists/${id}`);
        }
      }

      if (serverAuthenticated) {
        const res = await fetch('/api/admin/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Sunucuya çalma listesi kaydedilemedi.');
      }

      onUpsertPlaylistOverride(payload);
      onToast(editingPlaylistId ? 'Çalma listesi güncellendi.' : 'Yeni çalma listesi oluşturuldu.');
      startNewPlaylist();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Kayıt başarısız.', 'error');
    } finally {
      setSavingPlaylist(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      if (isFirebaseAdmin) {
        try {
          await deleteDoc(doc(db, 'curatedPlaylists', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `curatedPlaylists/${id}`);
        }
      }
      if (serverAuthenticated) {
        await fetch(`/api/admin/playlists/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
      onDeletePlaylistOverride(id);
      onToast('Çalma listesi kaldırıldı.');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Silme işlemi başarısız.', 'error');
    }
  };

  // --- DATASET TAB STATE ---
  const [importPreview, setImportPreview] = React.useState<Track[]>([]);
  const [importErrors, setImportErrors] = React.useState<string[]>([]);
  const [duplicateSkips, setDuplicateSkips] = React.useState(0);
  const [importingBusy, setImportingBusy] = React.useState(false);

  const activeCatalogTracks = React.useMemo(() => tracks.filter((t) => !t.deleted), [tracks]);
  const duplicateClusters = React.useMemo(() => detectDuplicateTracks(tracks), [tracks]);

  const handleDatasetFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportPreview([]);
    setImportErrors([]);
    setDuplicateSkips(0);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'json') {
      setImportErrors(['Yalnızca .csv veya .json dosyaları desteklenir.']);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImportErrors(['Dosya boyutu 5 MB sınırını aşamaz.']);
      return;
    }

    try {
      const text = await file.text();
      const rawObjects: Record<string, any>[] = [];

      if (ext === 'json') {
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.tracks) ? parsed.tracks : null;
        if (!list) {
          setImportErrors(['JSON dosyası bir dizi veya "tracks" alanı içermelidir.']);
          return;
        }
        for (const item of list) {
          if (item && typeof item === 'object') {
            const lowerObj: Record<string, any> = {};
            for (const [k, v] of Object.entries(item)) lowerObj[k.toLowerCase()] = v;
            rawObjects.push(lowerObj);
          }
        }
      } else {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setImportErrors(['CSV dosyası başlık satırı ve en az 1 şarkı satırı içermelidir.']);
          return;
        }
        const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          const row: Record<string, any> = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] ?? '';
          });
          rawObjects.push(row);
        }
      }

      const existingKeys = new Set(activeCatalogTracks.map((t) => normalizeTrackKey(t.title, t.artist)));
      const seenBatchKeys = new Set<string>();
      const accepted: Track[] = [];
      const errors: string[] = [];
      let skippedDupes = 0;

      rawObjects.slice(0, 1500).forEach((obj, idx) => {
        const norm = normalizeImportedTrack(obj, idx, `Yönetici İçe Aktarma (${file.name})`);
        if (!norm) {
          if (errors.length < 5) errors.push(`Satır ${idx + 1}: Şarkı adı veya sanatçı eksik.`);
          return;
        }
        const key = normalizeTrackKey(norm.title, norm.artist);
        if (existingKeys.has(key) || seenBatchKeys.has(key)) {
          skippedDupes++;
          return;
        }
        seenBatchKeys.add(key);
        accepted.push(norm);
      });

      setImportPreview(accepted);
      setImportErrors(errors);
      setDuplicateSkips(skippedDupes);
    } catch {
      setImportErrors(['Dosya ayrıştırılamadı. Lütfen geçerli UTF-8 CSV/JSON biçimi kullanın.']);
    }
  };

  const handleCommitImport = async () => {
    if (importPreview.length === 0) return;
    setImportingBusy(true);
    try {
      if (isFirebaseAdmin) {
        const chunk = importPreview.slice(0, 400);
        const batch = writeBatch(db);
        for (const t of chunk) {
          batch.set(doc(db, 'customTracks', t.id), {
            id: t.id,
            title: t.title,
            artist: t.artist,
            album: t.album || null,
            genre: t.genre,
            language: t.language,
            year: t.year,
            coverUrl: t.coverUrl || null,
            valence: t.valence,
            energy: t.energy,
            danceability: t.danceability,
            acousticness: t.acousticness,
            tempo: t.tempo,
            deleted: false,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }

      if (serverAuthenticated) {
        const res = await fetch('/api/admin/tracks/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tracks: importPreview }),
        });
        if (!res.ok) throw new Error('Toplu sunucu kaydı başarısız.');
      }

      onBulkTrackOverrides(importPreview);
      onToast(`${importPreview.length} yeni benzersiz şarkı kataloğa eklendi.`);
      setImportPreview([]);
      setDuplicateSkips(0);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'İçe aktarma başarısız.', 'error');
    } finally {
      setImportingBusy(false);
    }
  };

  // --- CATEGORIES TAB STATE ---
  const [catForm, setCatForm] = React.useState<MoodCategory>({
    id: '',
    name: '',
    colorKey: 'blue',
    description: '',
    coverUrl: '',
    targetValence: 0.5,
    targetEnergy: 0.5,
    targetDanceability: 0.5,
    targetAcousticness: 0.4,
    targetTempo: 110,
    order: categories.length + 1,
    active: true,
  });

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    const id =
      catForm.id.trim() ||
      catForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') ||
      `cat_${Date.now().toString(36)}`;

    const payload: MoodCategory = {
      ...catForm,
      id,
      name: catForm.name.trim().slice(0, 80),
      description: catForm.description.trim().slice(0, 240) || `${catForm.name.trim()} kategorisi`,
      coverUrl: catForm.coverUrl.trim() || '/src/assets/images/mood_focus_cover_1795092065127.jpg',
      targetValence: clamp01(catForm.targetValence),
      targetEnergy: clamp01(catForm.targetEnergy),
      targetDanceability: clamp01(catForm.targetDanceability),
      targetAcousticness: clamp01(catForm.targetAcousticness),
      targetTempo: clampTempo(catForm.targetTempo),
    };

    try {
      if (isFirebaseAdmin) {
        try {
          await setDoc(doc(db, 'moodCategories', id), {
            id: payload.id,
            name: payload.name,
            colorKey: payload.colorKey,
            description: payload.description,
            coverUrl: payload.coverUrl || null,
            targetValence: payload.targetValence,
            targetEnergy: payload.targetEnergy,
            targetDanceability: payload.targetDanceability,
            targetAcousticness: payload.targetAcousticness,
            targetTempo: payload.targetTempo,
            order: payload.order,
            active: payload.active,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `moodCategories/${id}`);
        }
      }
      if (serverAuthenticated) {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }
      onUpsertCategoryOverride(payload);
      onToast('Ruh hâli kategorisi kaydedildi.');
      setCatForm({
        id: '',
        name: '',
        colorKey: 'blue',
        description: '',
        coverUrl: '',
        targetValence: 0.5,
        targetEnergy: 0.5,
        targetDanceability: 0.5,
        targetAcousticness: 0.4,
        targetTempo: 110,
        order: categories.length + 1,
        active: true,
      });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Kategori kaydedilemedi.', 'error');
    }
  };

  // --- LANGUAGES TAB STATE ---
  const [langForm, setLangForm] = React.useState({
    code: '',
    name: '',
    nativeName: '',
    order: languages.length + 1,
    active: true,
  });

  const langCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of activeCatalogTracks) {
      map[t.language] = (map[t.language] || 0) + 1;
    }
    return map;
  }, [activeCatalogTracks]);

  const persistLanguage = async (lang: LanguageConfig) => {
    if (isFirebaseAdmin) {
      try {
        await setDoc(doc(db, 'languages', lang.code), {
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          active: lang.active,
          order: lang.order,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `languages/${lang.code}`);
      }
    }
    if (serverAuthenticated) {
      await fetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(lang),
      });
    }
    onUpsertLanguageOverride(lang);
  };

  const handleSaveLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = langForm.code.trim().toLowerCase();
    if (!/^[a-z0-9_-]{2,16}$/.test(code) || !langForm.name.trim()) {
      onToast('Geçerli bir dil kodu (örn: sv) ve Türkçe ad girin.', 'error');
      return;
    }
    try {
      await persistLanguage({
        code,
        name: langForm.name.trim().slice(0, 60),
        nativeName: langForm.nativeName.trim().slice(0, 60) || langForm.name.trim().slice(0, 60),
        active: langForm.active,
        order: langForm.order,
      });
      onToast('Dil ayarları güncellendi.');
      setLangForm({ code: '', name: '', nativeName: '', order: languages.length + 2, active: true });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Dil kaydedilemedi.', 'error');
    }
  };

  // --- AUTH GATE RENDER ---
  if (!hasAdminAccess) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Profil’e Dön</span>
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Yönetici Paneli Erişimi</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Katalog, çalma listesi ve dil yönetimi yalnızca yetkili yöneticilere açıktır.
              </p>
            </div>
          </div>

          {/* Firebase Admin Login */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Firebase Yönetici Hesabı
              </div>
              {firebaseEmail && !isFirebaseAdmin && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Mevcut hesap yönetici değil
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Yetkili yönetici Google hesabınla giriş yaparak Firestore kuralları koruması altında değişiklikleri canlı
              yayınlayabilirsin.
            </p>
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Yetkili Google Hesabıyla Giriş Yap</span>
            </button>
          </div>

          {/* Server Env-Var Admin Login */}
          <form onSubmit={handleServerLogin} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sunucu Yönetici Oturumu (Ortam Değişkeni)
            </div>

            {serverChecked && !serverConfigured && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <div className="font-bold">Sunucu yönetici kimlik bilgileri henüz yapılandırılmamış</div>
                <p>
                  Bu modu kullanmak için sunucu ortamına <code>ADMIN_USERNAME</code> ve{' '}
                  <code>ADMIN_PASSWORD</code> (veya <code>ADMIN_PASSWORD_HASH</code>) ile{' '}
                  <code>ADMIN_SESSION_SECRET</code> ortam değişkenlerini ekleyin.
                </p>
              </div>
            )}

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {loginError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Yönetici kullanıcı adı"
                className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Yönetici şifresi"
                className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={loginBusy || (serverChecked && !serverConfigured)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold disabled:opacity-40 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loginBusy ? 'Doğrulanıyor...' : 'Sunucu Oturumu Aç'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-4 sm:p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B97891]" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#30282D] dark:text-[#FAF4F6]">
              Moodify Yönetici Paneli
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Aktif Yetki:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {[isFirebaseAdmin ? 'Firebase RBAC' : '', serverAuthenticated ? `Sunucu (${serverUsername})` : '']
                  .filter(Boolean)
                  .join(' + ')}
              </strong>
            </span>
            <span>·</span>
            <span className="font-mono tabular-nums">
              {activeCatalogTracks.length.toLocaleString('tr-TR')} aktif benzersiz şarkı
            </span>
            {activeCatalogTracks.length >= 5000 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                5.000+ Doğrulandı
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                5.000 altı
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Uygulamaya Dön</span>
          </button>
          {serverAuthenticated && (
            <button
              type="button"
              onClick={handleServerLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sunucu Çıkış</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'tracks', label: 'Şarkı Yönetimi', icon: Music2 },
          { id: 'playlists', label: 'Çalma Listesi Yönetimi', icon: ListMusic },
          { id: 'dataset', label: 'Veri Seti Yönetimi', icon: Database },
          { id: 'categories', label: 'Kategori Yönetimi', icon: FolderKanban },
          { id: 'languages', label: 'Dil Yönetimi', icon: Globe2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                  : 'bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] text-[#5B4D54] dark:text-[#DFD1D7] hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TRACKS */}
      {activeTab === 'tracks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveTrack}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 self-start"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingTrackId ? 'Şarkıyı Düzenle' : 'Yeni Şarkı Ekle'}
              </h2>
              {editingTrackId && (
                <button
                  type="button"
                  onClick={resetTrackForm}
                  className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  İptal
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Şarkı Adı *"
                value={trackForm.title}
                onChange={(e) => setTrackForm((f) => ({ ...f, title: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="text"
                required
                placeholder="Sanatçı *"
                value={trackForm.artist}
                onChange={(e) => setTrackForm((f) => ({ ...f, artist: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="text"
                placeholder="Albüm"
                value={trackForm.album}
                onChange={(e) => setTrackForm((f) => ({ ...f, album: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="number"
                min={1900}
                max={2100}
                placeholder="Yıl (opsiyonel)"
                value={trackForm.year}
                onChange={(e) => setTrackForm((f) => ({ ...f, year: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <select
                value={trackForm.genre}
                onChange={(e) => setTrackForm((f) => ({ ...f, genre: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {MUSIC_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                value={trackForm.language}
                onChange={(e) => setTrackForm((f) => ({ ...f, language: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            <input
              type="url"
              placeholder="Kapak Görseli URL (opsiyonel)"
              value={trackForm.coverUrl}
              onChange={(e) => setTrackForm((f) => ({ ...f, coverUrl: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { key: 'valence', label: 'Valence (0-1)' },
                { key: 'energy', label: 'Energy (0-1)' },
                { key: 'danceability', label: 'Dance (0-1)' },
                { key: 'acousticness', label: 'Acoustic (0-1)' },
                { key: 'tempo', label: 'Tempo (BPM)' },
              ].map((fld) => (
                <label key={fld.key} className="space-y-1">
                  <span className="text-slate-500 font-medium">{fld.label}</span>
                  <input
                    type="number"
                    step={fld.key === 'tempo' ? '1' : '0.01'}
                    min={fld.key === 'tempo' ? '40' : '0'}
                    max={fld.key === 'tempo' ? '230' : '1'}
                    value={(trackForm as any)[fld.key]}
                    onChange={(e) => setTrackForm((f) => ({ ...f, [fld.key]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={savingTrack}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-sm font-bold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingTrack ? 'Kaydediliyor...' : editingTrackId ? 'Değişiklikleri Kaydet' : 'Şarkıyı Ekle'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  placeholder="Şarkı, sanatçı veya tür ara (ilk 40 sonuç)..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={showDeletedTracks}
                  onChange={(e) => setShowDeletedTracks(e.target.checked)}
                />
                <span>Gizlenenleri göster</span>
              </label>
            </div>

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredAdminTracks.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                    t.deleted
                      ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 opacity-70'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{t.title}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {t.artist} · {t.genre} · {t.language.toUpperCase()}
                      {t.tempo ? ` · ${t.tempo} BPM` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditTrack(t)}
                      aria-label="Düzenle"
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleDeleteTrack(t)}
                      aria-label={t.deleted ? 'Geri yükle' : 'Kaldır'}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      {t.deleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLAYLISTS */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSavePlaylist}
            className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingPlaylistId ? 'Çalma Listesini Düzenle' : 'Yeni Editör Çalma Listesi'}
              </h2>
              {editingPlaylistId && (
                <button
                  type="button"
                  onClick={startNewPlaylist}
                  className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Yeni Oluştur
                </button>
              )}
            </div>

            <input
              type="text"
              required
              placeholder="Liste Başlığı *"
              value={playlistForm.title}
              onChange={(e) => setPlaylistForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <textarea
              rows={2}
              placeholder="Açıklama *"
              value={playlistForm.description}
              onChange={(e) => setPlaylistForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={playlistForm.moodId}
                onChange={(e) => setPlaylistForm((f) => ({ ...f, moodId: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={playlistForm.language}
                onChange={(e) => setPlaylistForm((f) => ({ ...f, language: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="mixed">Karışık Diller</option>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Kapak Görseli URL (opsiyonel)"
              value={playlistForm.coverUrl}
              onChange={(e) => setPlaylistForm((f) => ({ ...f, coverUrl: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={playlistForm.featured}
                onChange={(e) => setPlaylistForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              <span>Keşfet ekranında öne çıkar</span>
            </label>

            {/* Track Picker */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Listeye Sabit Şarkı Ekle ({playlistForm.trackIds.length}/80)
              </div>
              <input
                type="search"
                value={plTrackQuery}
                onChange={(e) => setPlTrackQuery(e.target.value)}
                placeholder="Eklemek için şarkı veya sanatçı ara..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              {plSearchResults.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                  {plSearchResults.map((t) => {
                    const added = playlistForm.trackIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={added}
                        onClick={() =>
                          setPlaylistForm((f) => ({
                            ...f,
                            trackIds: f.trackIds.includes(t.id) ? f.trackIds : [...f.trackIds, t.id].slice(0, 80),
                          }))
                        }
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                      >
                        <span className="truncate">
                          <strong>{t.title}</strong> · {t.artist}
                        </span>
                        <span className="text-emerald-600 font-bold shrink-0">{added ? 'Eklendi' : '+ Ekle'}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {playlistForm.trackIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {playlistForm.trackIds.map((tid) => {
                    const t = tracks.find((x) => x.id === tid);
                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() =>
                          setPlaylistForm((f) => ({ ...f, trackIds: f.trackIds.filter((x) => x !== tid) }))
                        }
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium hover:bg-rose-100 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        {t ? `${t.title}` : tid} ×
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPlaylist}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-sm font-bold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingPlaylist ? 'Kaydediliyor...' : 'Çalma Listesini Kaydet'}</span>
            </button>
          </form>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Mevcut Çalma Listeleri ({curatedPlaylists.length})
            </h2>
            <div className="space-y-2 max-h-[540px] overflow-y-auto">
              {curatedPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{pl.title}</span>
                      {pl.featured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Öne Çıkan
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {pl.moodId} · {pl.language} · {pl.trackIds.length > 0 ? `${pl.trackIds.length} sabit şarkı` : 'Dinamik akış'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditPlaylist(pl)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlaylist(pl.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATASET */}
      {activeTab === 'dataset' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-500">Toplam Benzersiz Şarkı</div>
              <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums">
                {activeCatalogTracks.length.toLocaleString('tr-TR')}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-500">Doğrulanmış Ses Profili</div>
              <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums">
                {activeCatalogTracks.filter((t) => t.audioFeaturesVerified).length.toLocaleString('tr-TR')}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-500">5.000+ Şarkı Şartı</div>
              <div className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {activeCatalogTracks.length >= 5000 ? 'Karşılandı' : 'Eksik'}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-500">Tekrar Eden (Duplicate)</div>
              <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums">{duplicateClusters.length}</div>
            </div>
          </div>

          {/* CSV/JSON Upload */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-[#B97891]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                CSV / JSON Veri Seti İçe Aktar
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dosyada en az <code>title</code> (veya <code>track_name</code>) ve <code>artist</code> alanları
              bulunmalıdır. Mevcut katalogdaki tekrar eden parçalar otomatik olarak filtrelenir.
            </p>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleDatasetFile}
              className="block w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B97891] file:text-white hover:file:bg-[#A6657E] cursor-pointer"
            />

            {importErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                {importErrors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F9EFF2] dark:bg-[#2B2227] border border-[#E6CCD4] dark:border-[#4B3641] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs sm:text-sm">
                  <strong>{importPreview.length}</strong> yeni benzersiz şarkı içe aktarılmaya hazır (
                  {duplicateSkips} kopya atlandı).
                </div>
                <button
                  type="button"
                  disabled={importingBusy}
                  onClick={handleCommitImport}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs font-bold cursor-pointer"
                >
                  {importingBusy ? 'Aktarılıyor...' : 'Kataloğa Aktar'}
                </button>
              </div>
            )}
          </section>

          {/* Duplicate Inspector */}
          {duplicateClusters.length > 0 && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tespit Edilen Kopya Kayıtlar ({duplicateClusters.length})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {duplicateClusters.slice(0, 20).map((cluster) => (
                  <div
                    key={cluster.key}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <strong>{cluster.items[0].title}</strong> · {cluster.items[0].artist} ({cluster.items.length} kayıt)
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleDeleteTrack(cluster.items[1])}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold cursor-pointer"
                    >
                      Fazlayı Kaldır
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sources */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Açık Veri Kaynakları ve Lisanslar</h2>
            <div className="space-y-2 text-xs">
              {catalogMeta.sources.map((src) => (
                <div
                  key={src.name}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{src.name}</div>
                    <div className="text-slate-500">{src.url}</div>
                  </div>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">{src.license}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveCategory}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {catForm.id ? 'Kategoriyi Düzenle' : 'Yeni Ruh Hâli Kategorisi'}
            </h2>
            <input
              type="text"
              required
              placeholder="Kategori Adı *"
              value={catForm.name}
              onChange={(e) => setCatForm((c) => ({ ...c, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <textarea
              rows={2}
              required
              placeholder="Kısa açıklama *"
              value={catForm.description}
              onChange={(e) => setCatForm((c) => ({ ...c, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={catForm.colorKey}
                onChange={(e) => setCatForm((c) => ({ ...c, colorKey: e.target.value as MoodColorKey }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {COLOR_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Sıra"
                value={catForm.order}
                onChange={(e) => setCatForm((c) => ({ ...c, order: Number(e.target.value) || 1 }))}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <input
              type="text"
              placeholder="Kapak Görseli URL"
              value={catForm.coverUrl}
              onChange={(e) => setCatForm((c) => ({ ...c, coverUrl: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <label>
                <span>Valence</span>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={catForm.targetValence}
                  onChange={(e) => setCatForm((c) => ({ ...c, targetValence: Number(e.target.value) }))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </label>
              <label>
                <span>Energy</span>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={catForm.targetEnergy}
                  onChange={(e) => setCatForm((c) => ({ ...c, targetEnergy: Number(e.target.value) }))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </label>
              <label>
                <span>Tempo BPM</span>
                <input
                  type="number"
                  min="40"
                  max="230"
                  value={catForm.targetTempo}
                  onChange={(e) => setCatForm((c) => ({ ...c, targetTempo: Number(e.target.value) }))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={catForm.active}
                onChange={(e) => setCatForm((c) => ({ ...c, active: e.target.checked }))}
              />
              <span>Keşfet ekranında aktif</span>
            </label>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-sm font-bold cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Kategoriyi Kaydet</span>
            </button>
          </form>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Ruh Hâli Kategorileri ({categories.length})
            </h2>
            <div className="space-y-2.5">
              {categories.map((cat) => {
                const theme = MOOD_COLOR_THEMES[cat.colorKey] || MOOD_COLOR_THEMES.blue;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: theme.hex }} />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {cat.name}{' '}
                          {!cat.active && <span className="text-xs text-rose-500 font-normal">(Pasif)</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          V {cat.targetValence} · E {cat.targetEnergy} · {cat.targetTempo} BPM
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCatForm(cat)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Düzenle
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveLanguage}
            className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 self-start"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Yeni Müzik Dili Ekle / Güncelle</h2>
            <input
              type="text"
              required
              placeholder="Dil Kodu (örn: sv, pl) *"
              value={langForm.code}
              onChange={(e) => setLangForm((l) => ({ ...l, code: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
            />
            <input
              type="text"
              required
              placeholder="Türkçe Ad (örn: İsveççe) *"
              value={langForm.name}
              onChange={(e) => setLangForm((l) => ({ ...l, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <input
              type="text"
              placeholder="Yerel Ad (örn: Svenska)"
              value={langForm.nativeName}
              onChange={(e) => setLangForm((l) => ({ ...l, nativeName: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-sm font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Dili Kaydet</span>
            </button>
          </form>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Desteklenen Müzik Dilleri ({languages.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {lang.name} <span className="text-xs font-mono text-slate-400">({lang.code})</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      {lang.nativeName} · {(langCounts[lang.code] || 0).toLocaleString('tr-TR')} şarkı
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => persistLanguage({ ...lang, active: !lang.active })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      lang.active
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {lang.active ? 'Aktif' : 'Pasif'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
