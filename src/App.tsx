import React from 'react';
import {
  ArrowUp,
  AudioWaveform,
  Clapperboard,
  Compass,
  Dices,
  FolderHeart,
  Heart,
  HelpCircle,
  Moon,
  Search,
  Sparkles,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  CINEMA_SCENES,
  DEFAULT_CURATED_PLAYLISTS,
  DEFAULT_LANGUAGES,
  DEFAULT_MOOD_CATEGORIES,
} from './constants/musicConfig';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from './lib/firebase';
import {
  calculateMoodMatchScore,
  generateMoodPlaylist,
  matchesLanguageSelection,
  meetsMoodThreshold,
} from './lib/recommendation';
import type {
  AppView,
  CuratedPlaylist,
  LanguageConfig,
  MoodCategory,
  Track,
  UserPlaylist,
  UserProfile,
} from './types/music';
import { AdminPanelView } from './components/AdminPanelView';
import { CinemaDetailView, CinemaView } from './components/CinemaView';
import { DiscoverView } from './components/DiscoverView';
import { FavoritesView } from './components/FavoritesView';
import { HelpView } from './components/HelpView';
import { LibraryView } from './components/LibraryView';
import { AddToPlaylistModal, PlaylistEditorModal, TrackInspectModal } from './components/Modals';
import { MoodCategoryView } from './components/MoodCategoryView';
import { MoodStudioView } from './components/MoodStudioView';
import { MyPlaylistsView } from './components/MyPlaylistsView';
import { OnboardingScreen } from './components/OnboardingScreen';
import { PlaylistDetailView } from './components/PlaylistDetailView';
import { ProfileView } from './components/ProfileView';
import { RouletteView } from './components/RouletteView';

const GUEST_STORAGE_KEY = 'moodify_guest_v2';
const README_SEEN_KEY = 'moodify_readme_popup_v2';
const THEME_STORAGE_KEY = 'moodify_theme';

function getTodayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultGuestProfile(): UserProfile {
  return {
    uid: 'guest',
    displayName: 'Misafir Dinleyici',
    photoURL: null,
    preferredLanguages: [],
    preferredGenres: [],
    recentViews: [],
    onboardingSeen: false,
    streakCount: 1,
    lastVisitDate: getTodayDateStr(),
    isGuest: true,
  };
}

interface GuestStoredState {
  profile: UserProfile;
  favorites: Track[];
  playlists: UserPlaylist[];
}

function loadGuestState(): GuestStoredState {
  let seenFlag = false;
  try {
    seenFlag = localStorage.getItem(README_SEEN_KEY) === 'true';
  } catch {
    seenFlag = false;
  }
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) {
      return {
        profile: { ...getDefaultGuestProfile(), onboardingSeen: seenFlag },
        favorites: [],
        playlists: [],
      };
    }
    const parsed = JSON.parse(raw);
    return {
      profile: {
        ...getDefaultGuestProfile(),
        ...(parsed.profile || {}),
        onboardingSeen: seenFlag,
        isGuest: true,
      },
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
    };
  } catch {
    return {
      profile: { ...getDefaultGuestProfile(), onboardingSeen: seenFlag },
      favorites: [],
      playlists: [],
    };
  }
}

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  // Catalog state (Base JSON + Server Overrides + Firestore Overrides)
  const [baseTracks, setBaseTracks] = React.useState<Track[]>([]);
  const [catalogLoading, setCatalogLoading] = React.useState(true);
  const [catalogError, setCatalogError] = React.useState<string | null>(null);

  const [serverTrackOverrides, setServerTrackOverrides] = React.useState<Record<string, Track>>({});
  const [firestoreTrackOverrides, setFirestoreTrackOverrides] = React.useState<Record<string, Track>>({});

  const [serverPlaylistOverrides, setServerPlaylistOverrides] = React.useState<
    Record<string, CuratedPlaylist & { deleted?: boolean }>
  >({});
  const [firestorePlaylists, setFirestorePlaylists] = React.useState<Record<string, CuratedPlaylist>>({});

  const [serverCategoryOverrides, setServerCategoryOverrides] = React.useState<Record<string, MoodCategory>>({});
  const [firestoreCategories, setFirestoreCategories] = React.useState<Record<string, MoodCategory>>({});

  const [serverLanguageOverrides, setServerLanguageOverrides] = React.useState<Record<string, LanguageConfig>>({});
  const [firestoreLanguages, setFirestoreLanguages] = React.useState<Record<string, LanguageConfig>>({});

  // Auth + User state
  const [firebaseUser, setFirebaseUser] = React.useState<User | null>(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const initialGuest = React.useMemo(() => loadGuestState(), []);
  const [profile, setProfile] = React.useState<UserProfile>(initialGuest.profile);
  const [favorites, setFavorites] = React.useState<Track[]>(initialGuest.favorites);
  const [userPlaylists, setUserPlaylists] = React.useState<UserPlaylist[]>(initialGuest.playlists);

  // Navigation & View state
  const [view, setView] = React.useState<AppView>('discover');
  const [activeMoodId, setActiveMoodId] = React.useState<string>('happy');
  const [activePlaylistId, setActivePlaylistId] = React.useState<string>('');
  const [activeCinemaSceneId, setActiveCinemaSceneId] = React.useState<string>(CINEMA_SCENES[0].id);
  const [previousView, setPreviousView] = React.useState<AppView>('discover');
  const [quickSearchInput, setQuickSearchInput] = React.useState('');
  const [librarySearchQuery, setLibrarySearchQuery] = React.useState('');

  // Scroll-to-Top state
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateTo = React.useCallback(
    (nextView: AppView) => {
      if (nextView === 'help' && view !== 'help') {
        setPreviousView(view);
      }
      setView(nextView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [view]
  );

  // Discover / Mood Studio / Cinema / Roulette recommendation controls
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(['mixed']);
  const [studioMoodIds, setStudioMoodIds] = React.useState<string[]>(['happy']);
  const [studioBlendMode, setStudioBlendMode] = React.useState<boolean>(false);
  const [studioGenres, setStudioGenres] = React.useState<string[]>([]);
  const [studioEnergy, setStudioEnergy] = React.useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [moodRefreshSeed, setMoodRefreshSeed] = React.useState(0);
  const [studioRefreshSeed, setStudioRefreshSeed] = React.useState(0);
  const [cinemaRefreshSeed, setCinemaRefreshSeed] = React.useState(0);
  const lastMoodTrackIdsRef = React.useRef<Set<string>>(new Set());
  const lastStudioTrackIdsRef = React.useRef<Set<string>>(new Set());
  const lastCinemaTrackIdsRef = React.useRef<Set<string>>(new Set());

  // Roulette state
  const [rouletteMoodId, setRouletteMoodId] = React.useState<string | null>(null);
  const [rouletteRefreshSeed, setRouletteRefreshSeed] = React.useState(0);
  const [rouletteSpinning, setRouletteSpinning] = React.useState(false);
  const [rouletteRotationDeg, setRouletteRotationDeg] = React.useState(0);
  const lastRouletteTrackIdsRef = React.useRef<Set<string>>(new Set());
  const rouletteTimerRef = React.useRef<number | null>(null);

  // Modals & Toasts
  const [inspectedTrack, setInspectedTrack] = React.useState<Track | null>(null);
  const [playlistModalOpen, setPlaylistModalOpen] = React.useState(false);
  const [editingUserPlaylist, setEditingUserPlaylist] = React.useState<UserPlaylist | null>(null);
  const [trackForPlaylistModal, setTrackForPlaylistModal] = React.useState<Track | null>(null);
  const [initialReadMeDismissed, setInitialReadMeDismissed] = React.useState(false);
  const [showOnboardingForce, setShowOnboardingForce] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; tone: 'success' | 'error' } | null>(null);

  const showToast = React.useCallback((msg: string, tone: 'success' | 'error' = 'success') => {
    setToast({ msg, tone });
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  React.useEffect(() => {
    return () => {
      if (rouletteTimerRef.current !== null) {
        window.clearTimeout(rouletteTimerRef.current);
      }
    };
  }, []);

  // Load static JSON catalog + server overrides
  const loadCatalog = React.useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const [catRes, ovRes] = await Promise.all([
        fetch('/data/tracks-catalog.json'),
        fetch('/api/catalog/overrides').catch(() => null),
      ]);
      if (!catRes.ok) throw new Error('Müzik kataloğu yüklenemedi.');
      const tracksJson: Track[] = await catRes.json();
      setBaseTracks(tracksJson);

      if (ovRes && ovRes.ok) {
        const ov = await ovRes.json();
        setServerTrackOverrides(ov.tracks || {});
        setServerPlaylistOverrides(ov.playlists || {});
        setServerCategoryOverrides(ov.categories || {});
        setServerLanguageOverrides(ov.languages || {});
      }
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : 'Katalog yüklenirken hata oluştu.');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCatalog();
    testFirestoreConnection();
  }, [loadCatalog]);

  // Subscribe to public Firestore admin-managed collections
  React.useEffect(() => {
    const unsubTracks = onSnapshot(
      collection(db, 'customTracks'),
      (snap) => {
        const map: Record<string, Track> = {};
        snap.forEach((d) => {
          const v = d.data();
          map[d.id] = {
            id: v.id || d.id,
            title: v.title,
            artist: v.artist,
            album: v.album || '',
            genre: v.genre || 'Pop',
            language: v.language || 'tr',
            year: typeof v.year === 'number' ? v.year : null,
            coverUrl: v.coverUrl || null,
            valence: typeof v.valence === 'number' ? v.valence : 0.5,
            energy: typeof v.energy === 'number' ? v.energy : 0.5,
            danceability: typeof v.danceability === 'number' ? v.danceability : 0.5,
            acousticness: typeof v.acousticness === 'number' ? v.acousticness : 0.3,
            tempo: typeof v.tempo === 'number' ? v.tempo : 110,
            audioFeaturesVerified: typeof v.valence === 'number' && typeof v.energy === 'number',
            deleted: Boolean(v.deleted),
            source: 'Firestore Yönetici',
          };
        });
        setFirestoreTrackOverrides(map);
      },
      () => {}
    );

    const unsubPlaylists = onSnapshot(
      collection(db, 'curatedPlaylists'),
      (snap) => {
        const map: Record<string, CuratedPlaylist> = {};
        snap.forEach((d) => {
          const v = d.data();
          map[d.id] = {
            id: v.id || d.id,
            title: v.title,
            description: v.description || '',
            moodId: v.moodId || 'happy',
            language: v.language || 'mixed',
            coverUrl: v.coverUrl || undefined,
            trackIds: Array.isArray(v.trackIds) ? v.trackIds : [],
            featured: Boolean(v.featured),
          };
        });
        setFirestorePlaylists(map);
      },
      () => {}
    );

    const unsubCategories = onSnapshot(
      collection(db, 'moodCategories'),
      (snap) => {
        const map: Record<string, MoodCategory> = {};
        snap.forEach((d) => {
          const v = d.data();
          map[d.id] = {
            id: v.id || d.id,
            name: v.name,
            colorKey: v.colorKey || 'blue',
            description: v.description || '',
            coverUrl: v.coverUrl || '/src/assets/images/mood_focus_cover_1795092065127.jpg',
            targetValence: v.targetValence ?? 0.5,
            targetEnergy: v.targetEnergy ?? 0.5,
            targetDanceability: v.targetDanceability ?? 0.5,
            targetAcousticness: v.targetAcousticness ?? 0.4,
            targetTempo: v.targetTempo ?? 110,
            order: v.order ?? 10,
            active: v.active !== false,
          };
        });
        setFirestoreCategories(map);
      },
      () => {}
    );

    const unsubLanguages = onSnapshot(
      collection(db, 'languages'),
      (snap) => {
        const map: Record<string, LanguageConfig> = {};
        snap.forEach((d) => {
          const v = d.data();
          map[d.id] = {
            code: v.code || d.id,
            name: v.name,
            nativeName: v.nativeName || v.name,
            active: v.active !== false,
            order: v.order ?? 50,
          };
        });
        setFirestoreLanguages(map);
      },
      () => {}
    );

    return () => {
      unsubTracks();
      unsubPlaylists();
      unsubCategories();
      unsubLanguages();
    };
  }, []);

  // Auth listener + User Firestore sync
  React.useEffect(() => {
    let unsubFavs: (() => void) | null = null;
    let unsubLists: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubFavs) {
        unsubFavs();
        unsubFavs = null;
      }
      if (unsubLists) {
        unsubLists();
        unsubLists = null;
      }

      setFirebaseUser(user);

      if (!user) {
        const g = loadGuestState();
        setProfile(g.profile);
        setFavorites(g.favorites);
        setUserPlaylists(g.playlists);
        setAuthReady(true);
        return;
      }

      const today = getTodayDateStr();
      const userRef = doc(db, 'users', user.uid);
      try {
        let seenLocally = false;
        try {
          seenLocally = localStorage.getItem(README_SEEN_KEY) === 'true';
        } catch {
          seenLocally = false;
        }
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const guest = loadGuestState();
          const newProfileData = {
            uid: user.uid,
            displayName: (user.displayName || 'Müziksever').slice(0, 80),
            photoURL: user.photoURL || null,
            preferredLanguages: guest.profile.preferredLanguages || [],
            preferredGenres: guest.profile.preferredGenres || [],
            recentViews: guest.profile.recentViews || [],
            onboardingSeen: seenLocally,
            streakCount: 1,
            lastVisitDate: today,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfileData);
          setProfile({
            uid: user.uid,
            displayName: newProfileData.displayName,
            email: user.email,
            photoURL: newProfileData.photoURL,
            preferredLanguages: newProfileData.preferredLanguages,
            preferredGenres: newProfileData.preferredGenres,
            recentViews: newProfileData.recentViews,
            onboardingSeen: seenLocally,
            streakCount: 1,
            lastVisitDate: today,
            isGuest: false,
          });
        } else {
          const data = snap.data();
          const prevDate = data.lastVisitDate || today;
          let nextStreak = typeof data.streakCount === 'number' ? data.streakCount : 1;
          if (prevDate !== today) {
            const diffDays = Math.round(
              (new Date(today).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            nextStreak = diffDays === 1 ? nextStreak + 1 : 1;
            await updateDoc(userRef, {
              streakCount: nextStreak,
              lastVisitDate: today,
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }

          setProfile({
            uid: user.uid,
            displayName: data.displayName || user.displayName || 'Müziksever',
            email: user.email,
            photoURL: data.photoURL ?? user.photoURL ?? null,
            preferredLanguages: Array.isArray(data.preferredLanguages) ? data.preferredLanguages : [],
            preferredGenres: Array.isArray(data.preferredGenres) ? data.preferredGenres : [],
            recentViews: Array.isArray(data.recentViews) ? data.recentViews : [],
            onboardingSeen: seenLocally,
            streakCount: nextStreak,
            lastVisitDate: today,
            isGuest: false,
          });
        }

        const favQuery = query(
          collection(db, 'users', user.uid, 'favorites'),
          where('uid', '==', user.uid)
        );
        unsubFavs = onSnapshot(favQuery, (favSnap) => {
          const list: Track[] = [];
          favSnap.forEach((d) => {
            const v = d.data();
            list.push({
              id: v.trackId || d.id,
              title: v.title,
              artist: v.artist,
              album: v.album || '',
              genre: v.genre || 'Pop',
              language: v.language || 'tr',
              year: null,
              coverUrl: v.coverUrl || null,
              valence: typeof v.valence === 'number' ? v.valence : null,
              energy: typeof v.energy === 'number' ? v.energy : null,
              danceability: typeof v.danceability === 'number' ? v.danceability : null,
              acousticness: typeof v.acousticness === 'number' ? v.acousticness : null,
              tempo: typeof v.tempo === 'number' ? v.tempo : null,
              audioFeaturesVerified: typeof v.valence === 'number' && typeof v.energy === 'number',
            });
          });
          setFavorites(list);
        });

        const plQuery = query(
          collection(db, 'users', user.uid, 'playlists'),
          where('uid', '==', user.uid)
        );
        unsubLists = onSnapshot(plQuery, (plSnap) => {
          const list: UserPlaylist[] = [];
          plSnap.forEach((d) => {
            const v = d.data();
            list.push({
              id: v.id || d.id,
              uid: v.uid,
              name: v.name,
              description: v.description || '',
              moodId: v.moodId || 'happy',
              language: v.language || 'mixed',
              coverUrl: v.coverUrl || undefined,
              trackIds: Array.isArray(v.trackIds) ? v.trackIds : [],
              createdAt: v.createdAt?.toDate ? v.createdAt.toDate().toISOString() : new Date().toISOString(),
              updatedAt: v.updatedAt?.toDate ? v.updatedAt.toDate().toISOString() : new Date().toISOString(),
              isUserPlaylist: true,
            });
          });
          setUserPlaylists(list);
        });
      } catch (err) {
        console.error('Kullanıcı profili senkronizasyon hatası:', err);
      } finally {
        setAuthReady(true);
      }
    });

    return () => {
      unsubAuth();
      if (unsubFavs) unsubFavs();
      if (unsubLists) unsubLists();
    };
  }, []);

  // Persist guest changes in localStorage
  React.useEffect(() => {
    if (!authReady || firebaseUser) return;
    try {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({ profile, favorites, playlists: userPlaylists })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [authReady, firebaseUser, profile, favorites, userPlaylists]);

  // Merged Catalogs
  const categories = React.useMemo<MoodCategory[]>(() => {
    const map = new Map<string, MoodCategory>();
    for (const c of DEFAULT_MOOD_CATEGORIES) map.set(c.id, c);
    for (const [id, c] of Object.entries(serverCategoryOverrides)) map.set(id, c);
    for (const [id, c] of Object.entries(firestoreCategories)) map.set(id, c);
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [serverCategoryOverrides, firestoreCategories]);

  const languages = React.useMemo<LanguageConfig[]>(() => {
    const map = new Map<string, LanguageConfig>();
    for (const l of DEFAULT_LANGUAGES) map.set(l.code, l);
    for (const [code, l] of Object.entries(serverLanguageOverrides)) map.set(code, l);
    for (const [code, l] of Object.entries(firestoreLanguages)) map.set(code, l);
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [serverLanguageOverrides, firestoreLanguages]);

  const tracks = React.useMemo<Track[]>(() => {
    const map = new Map<string, Track>();
    for (const t of baseTracks) map.set(t.id, t);
    for (const [id, t] of Object.entries(serverTrackOverrides)) map.set(id, t);
    for (const [id, t] of Object.entries(firestoreTrackOverrides)) map.set(id, t);
    return Array.from(map.values());
  }, [baseTracks, serverTrackOverrides, firestoreTrackOverrides]);

  const tracksById = React.useMemo(() => {
    const m = new Map<string, Track>();
    for (const t of tracks) {
      if (!t.deleted) m.set(t.id, t);
    }
    return m;
  }, [tracks]);

  const curatedPlaylists = React.useMemo<CuratedPlaylist[]>(() => {
    const map = new Map<string, CuratedPlaylist>();
    for (const pl of DEFAULT_CURATED_PLAYLISTS) map.set(pl.id, pl);
    for (const [id, pl] of Object.entries(serverPlaylistOverrides)) {
      if ((pl as any).deleted) map.delete(id);
      else map.set(id, pl);
    }
    for (const [id, pl] of Object.entries(firestorePlaylists)) map.set(id, pl);
    return Array.from(map.values());
  }, [serverPlaylistOverrides, firestorePlaylists]);

  const favoriteIds = React.useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  // Deterministic dynamic track resolution for curated playlists
  const resolvePlaylistTracks = React.useCallback(
    (pl: CuratedPlaylist | UserPlaylist): Track[] => {
      if ('isUserPlaylist' in pl && pl.isUserPlaylist) {
        return pl.trackIds.map((id) => tracksById.get(id)).filter((t): t is Track => Boolean(t));
      }
      if (pl.trackIds && pl.trackIds.length > 0) {
        return pl.trackIds.map((id) => tracksById.get(id)).filter((t): t is Track => Boolean(t));
      }
      const cat = categories.find((c) => c.id === pl.moodId) || categories[0];
      if (!cat || tracks.length === 0) return [];
      const langFilter = pl.language && pl.language !== 'all' && pl.language !== 'mixed' ? [pl.language] : ['mixed'];
      const langVerified = tracks.filter(
        (t) => !t.deleted && t.audioFeaturesVerified && matchesLanguageSelection(t.language, langFilter)
      );
      const moodStrict = langVerified.filter((t) => meetsMoodThreshold(t, [cat]));
      const candidatePool = moodStrict.length >= 6 ? moodStrict : langVerified;
      return candidatePool
        .map((t) => ({ ...t, matchScore: calculateMoodMatchScore(t, [cat]) }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 12);
    },
    [tracksById, categories, tracks]
  );

  // Mood Category View recommendations
  const activeMoodCategory = React.useMemo(
    () => categories.find((c) => c.id === activeMoodId) || categories[0],
    [categories, activeMoodId]
  );

  const moodRecommendedTracks = React.useMemo(() => {
    if (!activeMoodCategory || tracks.length === 0) return [];
    const list = generateMoodPlaylist({
      tracks,
      selectedMoods: [activeMoodCategory],
      selectedLanguages,
      limit: 12,
      excludeIds: moodRefreshSeed > 0 ? lastMoodTrackIdsRef.current : undefined,
    });
    lastMoodTrackIdsRef.current = new Set(list.map((t) => t.id));
    return list;
  }, [activeMoodCategory, tracks, selectedLanguages, moodRefreshSeed]);

  // Mood Studio recommendations
  const studioGeneratedTracks = React.useMemo(() => {
    if (tracks.length === 0) return [];
    const selectedMoodObjs = categories.filter((c) => studioMoodIds.includes(c.id));
    const list = generateMoodPlaylist({
      tracks,
      selectedMoods: selectedMoodObjs.length > 0 ? selectedMoodObjs : [categories[0]],
      selectedLanguages,
      selectedGenres: studioGenres,
      energyFilter: studioEnergy,
      limit: 12,
      excludeIds: studioRefreshSeed > 0 ? lastStudioTrackIdsRef.current : undefined,
    });
    lastStudioTrackIdsRef.current = new Set(list.map((t) => t.id));
    return list;
  }, [tracks, categories, studioMoodIds, selectedLanguages, studioGenres, studioEnergy, studioRefreshSeed]);

  // Moodify Cinema scene & tracks
  const activeCinemaScene = React.useMemo(
    () => CINEMA_SCENES.find((s) => s.id === activeCinemaSceneId) || CINEMA_SCENES[0],
    [activeCinemaSceneId]
  );

  const cinemaSceneTracks = React.useMemo(() => {
    if (!activeCinemaScene || tracks.length === 0) return [];
    const isUserMixed = selectedLanguages.length === 0 || selectedLanguages.includes('mixed');
    const effectiveLangs =
      isUserMixed && activeCinemaScene.language !== 'mixed'
        ? [activeCinemaScene.language]
        : selectedLanguages;

    const syntheticMood: MoodCategory = {
      id: activeCinemaScene.moodId,
      name: activeCinemaScene.title,
      colorKey: 'rose',
      description: activeCinemaScene.description,
      coverUrl: activeCinemaScene.coverUrl,
      targetValence: activeCinemaScene.targetValence,
      targetEnergy: activeCinemaScene.targetEnergy,
      targetDanceability: 0.52,
      targetAcousticness: activeCinemaScene.targetAcousticness,
      targetTempo: activeCinemaScene.targetTempo,
      order: 1,
      active: true,
    };

    const list = generateMoodPlaylist({
      tracks,
      selectedMoods: [syntheticMood],
      selectedLanguages: effectiveLangs,
      selectedGenres: activeCinemaScene.preferredGenres,
      limit: 12,
      excludeIds: cinemaRefreshSeed > 0 ? lastCinemaTrackIdsRef.current : undefined,
    });
    lastCinemaTrackIdsRef.current = new Set(list.map((t) => t.id));
    return list;
  }, [activeCinemaScene, tracks, selectedLanguages, cinemaRefreshSeed]);

  // Music Roulette rolled mood & tracks
  const rolledMoodCategory = React.useMemo(
    () => (rouletteMoodId ? categories.find((c) => c.id === rouletteMoodId) || null : null),
    [categories, rouletteMoodId]
  );

  const rouletteTracks = React.useMemo(() => {
    if (!rolledMoodCategory || tracks.length === 0) return [];
    const list = generateMoodPlaylist({
      tracks,
      selectedMoods: [rolledMoodCategory],
      selectedLanguages,
      limit: 12,
      excludeIds: rouletteRefreshSeed > 0 ? lastRouletteTrackIdsRef.current : undefined,
    });
    lastRouletteTrackIdsRef.current = new Set(list.map((t) => t.id));
    return list;
  }, [rolledMoodCategory, tracks, selectedLanguages, rouletteRefreshSeed]);

  // Actions
  const handleUpdateProfile = React.useCallback(
    async (patch: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      if (!firebaseUser) return;
      const allowedPatch: Record<string, any> = { updatedAt: serverTimestamp() };
      if (patch.displayName !== undefined) allowedPatch.displayName = patch.displayName;
      if (patch.photoURL !== undefined) allowedPatch.photoURL = patch.photoURL;
      if (patch.preferredLanguages !== undefined) allowedPatch.preferredLanguages = patch.preferredLanguages;
      if (patch.preferredGenres !== undefined) allowedPatch.preferredGenres = patch.preferredGenres;
      if (patch.recentViews !== undefined) allowedPatch.recentViews = patch.recentViews;
      if (patch.onboardingSeen !== undefined) allowedPatch.onboardingSeen = patch.onboardingSeen;
      if (patch.streakCount !== undefined) allowedPatch.streakCount = patch.streakCount;
      if (patch.lastVisitDate !== undefined) allowedPatch.lastVisitDate = patch.lastVisitDate;

      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), allowedPatch);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    },
    [firebaseUser]
  );

  const pushRecentView = React.useCallback(
    (entry: string) => {
      const next = [entry, ...(profile.recentViews || []).filter((e) => e !== entry)].slice(0, 15);
      handleUpdateProfile({ recentViews: next });
    },
    [profile.recentViews, handleUpdateProfile]
  );

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Google hesabınla giriş yapıldı.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Giriş penceresi kapatıldı.', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    showToast('Hesaptan çıkış yapıldı.');
  };

  const handleToggleFavorite = async (track: Track) => {
    const exists = favoriteIds.has(track.id);
    if (!firebaseUser) {
      setFavorites((prev) => (exists ? prev.filter((t) => t.id !== track.id) : [track, ...prev]));
      showToast(exists ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi.');
      return;
    }

    const favRef = doc(db, 'users', firebaseUser.uid, 'favorites', track.id);
    try {
      if (exists) {
        await deleteDoc(favRef);
        showToast('Favorilerden çıkarıldı.');
      } else {
        await setDoc(favRef, {
          uid: firebaseUser.uid,
          trackId: track.id,
          title: track.title.slice(0, 180),
          artist: track.artist.slice(0, 180),
          album: track.album ? track.album.slice(0, 180) : null,
          genre: track.genre ? track.genre.slice(0, 64) : null,
          language: track.language ? track.language.slice(0, 16) : null,
          coverUrl: track.coverUrl ? track.coverUrl.slice(0, 500) : null,
          valence: track.valence,
          energy: track.energy,
          danceability: track.danceability,
          acousticness: track.acousticness,
          tempo: track.tempo,
          createdAt: serverTimestamp(),
        });
        showToast('Favorilere eklendi.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/favorites/${track.id}`);
    }
  };

  const handleSaveUserPlaylist = async (data: {
    id?: string;
    name: string;
    description: string;
    moodId: string;
    language: string;
    coverUrl?: string;
    trackIds?: string[];
  }) => {
    const isEdit = Boolean(data.id);
    const id = data.id || `upl_${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    if (!firebaseUser) {
      setUserPlaylists((prev) => {
        if (isEdit) {
          return prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  name: data.name,
                  description: data.description,
                  moodId: data.moodId,
                  language: data.language,
                  coverUrl: data.coverUrl,
                  updatedAt: nowIso,
                }
              : p
          );
        }
        return [
          {
            id,
            name: data.name,
            description: data.description,
            moodId: data.moodId,
            language: data.language,
            coverUrl: data.coverUrl,
            trackIds: data.trackIds || [],
            createdAt: nowIso,
            updatedAt: nowIso,
            isUserPlaylist: true,
          },
          ...prev,
        ];
      });
      setPlaylistModalOpen(false);
      setEditingUserPlaylist(null);
      showToast(isEdit ? 'Çalma listesi güncellendi.' : 'Çalma listesi oluşturuldu.');
      return;
    }

    const plRef = doc(db, 'users', firebaseUser.uid, 'playlists', id);
    try {
      if (isEdit) {
        await updateDoc(plRef, {
          name: data.name,
          description: data.description || null,
          moodId: data.moodId,
          language: data.language,
          coverUrl: data.coverUrl || null,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(plRef, {
          uid: firebaseUser.uid,
          id,
          name: data.name,
          description: data.description || null,
          moodId: data.moodId,
          language: data.language,
          coverUrl: data.coverUrl || null,
          trackIds: data.trackIds || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setPlaylistModalOpen(false);
      setEditingUserPlaylist(null);
      showToast(isEdit ? 'Çalma listesi güncellendi.' : 'Çalma listesi oluşturuldu.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/playlists/${id}`);
    }
  };

  const handleDeleteUserPlaylist = async (playlistId: string) => {
    if (!firebaseUser) {
      setUserPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      if (view === 'playlist-detail' && activePlaylistId === playlistId) {
        navigateTo('playlists');
      }
      showToast('Çalma listesi silindi.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid, 'playlists', playlistId));
      if (view === 'playlist-detail' && activePlaylistId === playlistId) {
        navigateTo('playlists');
      }
      showToast('Çalma listesi silindi.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${firebaseUser.uid}/playlists/${playlistId}`);
    }
  };

  const handleAddTrackToUserPlaylist = async (playlistId: string, track: Track) => {
    const target = userPlaylists.find((p) => p.id === playlistId);
    if (!target) return;
    if (target.trackIds.includes(track.id)) {
      setTrackForPlaylistModal(null);
      return;
    }
    const nextIds = [...target.trackIds, track.id].slice(0, 100);
    if (!firebaseUser) {
      setUserPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? { ...p, trackIds: nextIds, updatedAt: new Date().toISOString() } : p))
      );
      setTrackForPlaylistModal(null);
      showToast(`"${track.title}" listeye eklendi.`);
      return;
    }
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid, 'playlists', playlistId), {
        trackIds: nextIds,
        updatedAt: serverTimestamp(),
      });
      setTrackForPlaylistModal(null);
      showToast(`"${track.title}" listeye eklendi.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}/playlists/${playlistId}`);
    }
  };

  const handleRemoveTrackFromUserPlaylist = async (playlistId: string, trackId: string) => {
    const target = userPlaylists.find((p) => p.id === playlistId);
    if (!target) return;
    const nextIds = target.trackIds.filter((id) => id !== trackId);
    if (!firebaseUser) {
      setUserPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? { ...p, trackIds: nextIds, updatedAt: new Date().toISOString() } : p))
      );
      showToast('Şarkı listeden çıkarıldı.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid, 'playlists', playlistId), {
        trackIds: nextIds,
        updatedAt: serverTimestamp(),
      });
      showToast('Şarkı listeden çıkarıldı.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}/playlists/${playlistId}`);
    }
  };

  const handleToggleLanguage = (code: string) => {
    if (code === 'mixed') {
      setSelectedLanguages(['mixed']);
      return;
    }
    setSelectedLanguages((prev) => {
      const cleaned = prev.filter((c) => c !== 'mixed');
      const next = cleaned.includes(code) ? cleaned.filter((c) => c !== code) : [...cleaned, code];
      return next.length === 0 ? ['mixed'] : next;
    });
  };

  const openMoodCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setActiveMoodId(categoryId);
    setPreviousView(view);
    navigateTo('mood-detail');
    if (cat) pushRecentView(`mood:${cat.id}::${cat.name}`);
  };

  const openCinemaScene = (sceneId: string) => {
    const sc = CINEMA_SCENES.find((s) => s.id === sceneId);
    setActiveCinemaSceneId(sceneId);
    setCinemaRefreshSeed(0);
    setPreviousView(view);
    navigateTo('cinema-detail');
    if (sc) pushRecentView(`cinema:${sc.id}::${sc.title}`);
  };

  const openPlaylist = (playlistId: string) => {
    setActivePlaylistId(playlistId);
    setPreviousView(view);
    navigateTo('playlist-detail');
    const pl =
      userPlaylists.find((p) => p.id === playlistId) ||
      curatedPlaylists.find((p) => p.id === playlistId);
    if (pl) {
      const label = 'isUserPlaylist' in pl && pl.isUserPlaylist === true ? pl.name : pl.title;
      pushRecentView(`pl:${pl.id}::${label}`);
    }
  };

  const handleSpinRoulette = () => {
    const pool = categories.filter((c) => c.active).slice(0, 5);
    if (pool.length === 0 || rouletteSpinning) return;
    const candidates = pool.length > 1 ? pool.filter((c) => c.id !== rouletteMoodId) : pool;
    const pickedIdxInCandidates = Math.floor(Math.random() * candidates.length);
    const picked = candidates[pickedIdxInCandidates];
    const pickedSliceIndex = pool.findIndex((c) => c.id === picked.id);

    const stepDeg = 360 / pool.length;
    const sliceCenter = pickedSliceIndex * stepDeg + stepDeg / 2;
    const targetMod = (360 - sliceCenter + 360) % 360;
    const currentMod = rouletteRotationDeg % 360;
    const deltaMod = (targetMod - currentMod + 360) % 360;
    const nextDeg = rouletteRotationDeg + 720 + deltaMod;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setRouletteRotationDeg(nextDeg);
      setRouletteMoodId(picked.id);
      setRouletteRefreshSeed((s) => s + 1);
      return;
    }

    setRouletteSpinning(true);
    setRouletteRotationDeg(nextDeg);
    if (rouletteTimerRef.current !== null) window.clearTimeout(rouletteTimerRef.current);
    rouletteTimerRef.current = window.setTimeout(() => {
      setRouletteMoodId(picked.id);
      setRouletteRefreshSeed((s) => s + 1);
      setRouletteSpinning(false);
    }, 900);
  };

  const handleInspectTrack = (track: Track) => {
    setInspectedTrack(track);
    pushRecentView(`track:${track.id}::${track.title} — ${track.artist}`);
  };

  const handleOpenRecentItem = (entry: string) => {
    const [prefix] = entry.split('::');
    if (prefix.startsWith('mood:')) {
      openMoodCategory(prefix.replace('mood:', ''));
    } else if (prefix.startsWith('cinema:')) {
      openCinemaScene(prefix.replace('cinema:', ''));
    } else if (prefix.startsWith('pl:')) {
      openPlaylist(prefix.replace('pl:', ''));
    } else if (prefix.startsWith('track:')) {
      const t = tracksById.get(prefix.replace('track:', ''));
      if (t) setInspectedTrack(t);
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLibrarySearchQuery(quickSearchInput);
    navigateTo('library');
  };

  const handleDismissReadMe = React.useCallback(() => {
    setInitialReadMeDismissed(true);
    setShowOnboardingForce(false);
    try {
      localStorage.setItem(README_SEEN_KEY, 'true');
      if (!firebaseUser) {
        const nextProfile = { ...profile, onboardingSeen: true };
        localStorage.setItem(
          GUEST_STORAGE_KEY,
          JSON.stringify({ profile: nextProfile, favorites, playlists: userPlaylists })
        );
      }
    } catch {
      // ignore
    }
    if (!profile.onboardingSeen) {
      handleUpdateProfile({ onboardingSeen: true });
    }
    setView('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [firebaseUser, profile, favorites, userPlaylists, handleUpdateProfile]);

  // Every app entry gate: show ONLY the Read Me popup first before revealing the rest of the app
  if (!initialReadMeDismissed) {
    return <OnboardingScreen isInitialGate onStart={handleDismissReadMe} />;
  }

  const activePlaylistObj =
    userPlaylists.find((p) => p.id === activePlaylistId) ||
    curatedPlaylists.find((p) => p.id === activePlaylistId) ||
    null;

  // Strictly the 8 primary navigation items requested
  const navItems: { id: AppView; label: string; mobileLabel: string; icon: React.ComponentType<any> }[] = [
    { id: 'discover', label: 'Keşfet', mobileLabel: 'Keşfet', icon: Compass },
    { id: 'mood-studio', label: 'Ruh Hâlim', mobileLabel: 'Ruh Hâlim', icon: Sparkles },
    { id: 'cinema', label: 'Moodify Cinema', mobileLabel: 'Cinema', icon: Clapperboard },
    { id: 'roulette', label: 'Müzik Ruleti', mobileLabel: 'Rulet', icon: Dices },
    { id: 'playlists', label: 'Çalma Listelerim', mobileLabel: 'Listeler', icon: FolderHeart },
    { id: 'favorites', label: 'Favoriler', mobileLabel: 'Favoriler', icon: Heart },
    { id: 'profile', label: 'Profil', mobileLabel: 'Profil', icon: UserIcon },
    { id: 'help', label: 'Yardım (?)', mobileLabel: 'Yardım', icon: HelpCircle },
  ];

  const isNavActive = (itemId: AppView) => {
    if (view === itemId) return true;
    if (itemId === 'discover' && (view === 'mood-detail' || view === 'library')) return true;
    if (itemId === 'cinema' && view === 'cinema-detail') return true;
    if (itemId === 'playlists' && view === 'playlist-detail') return true;
    if (itemId === 'profile' && view === 'admin') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#FAF6F5] dark:bg-[#171215] text-[#30282D] dark:text-[#FAF4F6] flex">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] sticky top-0 h-screen p-4 justify-between">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => navigateTo('discover')}
            className="flex items-center gap-3 px-2 py-1 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B97891] to-[#D8A1B3] text-white flex items-center justify-center shrink-0 shadow-sm">
              <AudioWaveform className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight leading-none text-[#30282D] dark:text-[#FAF4F6]">
                Moodify
              </div>
              <div className="text-[11px] text-[#7D6C74] dark:text-[#B9A7B0] mt-0.5">Ruh Hâli Müzik Keşfi</div>
            </div>
          </button>

          <nav aria-label="Ana Menü" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={item.id === 'help' ? 'sidebar-help-button' : `sidebar-nav-${item.id}`}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white shadow-sm'
                      : 'text-[#5B4D54] dark:text-[#DFD1D7] hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.id === 'favorites' && favorites.length > 0 && (
                    <span
                      className={`ml-auto text-[11px] font-mono tabular-nums ${
                        active ? 'text-white/95' : 'text-[#8E7D85]'
                      }`}
                    >
                      {favorites.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Profile Card */}
        <button
          type="button"
          onClick={() => navigateTo('profile')}
          className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] hover:border-[#D8A1B3] dark:hover:border-[#B97891] transition-colors text-left cursor-pointer"
        >
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#F5E7EC] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7] flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate">{profile.displayName}</div>
            <div className="text-[11px] text-[#7D6C74] dark:text-[#B9A7B0] truncate">
              {profile.isGuest ? 'Misafir Oturumu' : 'Bağlı Hesap'}
            </div>
          </div>
        </button>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC]/90 dark:bg-[#211A1E]/90 backdrop-blur-md px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigateTo('discover')}
            className="lg:hidden flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B97891] to-[#D8A1B3] text-white flex items-center justify-center">
              <AudioWaveform className="w-5 h-5" />
            </div>
            <span className="font-extrabold tracking-tight text-sm sm:text-base">Moodify</span>
          </button>

          <form onSubmit={handleQuickSearchSubmit} className="flex-1 min-w-0 max-w-md relative">
            <Search className="w-4 h-4 text-[#8E7D85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={quickSearchInput}
              onChange={(e) => setQuickSearchInput(e.target.value)}
              placeholder="Şarkı, sanatçı veya tür ara..."
              className="w-full min-w-0 pl-8 pr-2.5 py-2 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-[#30282D] dark:text-[#FAF4F6] focus:outline-none focus:ring-2 focus:ring-[#B97891]/40"
            />
          </form>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('favorites')}
              aria-label="Favoriler"
              className={`lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border cursor-pointer ${
                view === 'favorites'
                  ? 'border-[#B97891] bg-[#F9EFF2] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7]'
                  : 'border-[#EDE2E5] dark:border-[#362A31] text-[#5B4D54] dark:text-[#DFD1D7]'
              }`}
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('profile')}
              aria-label="Profil"
              className={`lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border cursor-pointer ${
                view === 'profile' || view === 'admin'
                  ? 'border-[#B97891] bg-[#F9EFF2] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7]'
                  : 'border-[#EDE2E5] dark:border-[#362A31] text-[#5B4D54] dark:text-[#DFD1D7]'
              }`}
            >
              <UserIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              data-testid="mobile-help-button"
              onClick={() => navigateTo('help')}
              aria-label="Yardım (?)"
              title="Yardım (?)"
              className={`lg:hidden min-h-[40px] px-2.5 flex items-center justify-center gap-1 rounded-xl border cursor-pointer ${
                view === 'help'
                  ? 'border-[#B97891] bg-[#F9EFF2] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7]'
                  : 'border-[#EDE2E5] dark:border-[#362A31] text-[#5B4D54] dark:text-[#DFD1D7]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-bold sm:hidden">?</span>
              <span className="text-xs font-bold hidden sm:inline">Yardım</span>
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-[#30282D] dark:text-[#FAF4F6] hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227] cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#B97891]" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 lg:pb-12">
          {catalogLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-10 w-64 rounded-xl bg-[#EDE2E5] dark:bg-[#2B2227]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-56 rounded-2xl bg-[#EDE2E5] dark:bg-[#2B2227]" />
                ))}
              </div>
            </div>
          ) : catalogError ? (
            <div className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-rose-200 dark:border-rose-900 rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm font-bold text-rose-600">{catalogError}</p>
              <button
                type="button"
                onClick={loadCatalog}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white text-xs font-bold cursor-pointer"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <>
              {view === 'discover' && (
                <DiscoverView
                  categories={categories}
                  languages={languages}
                  selectedLanguages={selectedLanguages}
                  onToggleLanguage={handleToggleLanguage}
                  onSelectMoodCategory={openMoodCategory}
                  onOpenMoodStudio={() => navigateTo('mood-studio')}
                  featuredPlaylists={curatedPlaylists.filter((p) => p.featured)}
                  onOpenPlaylist={openPlaylist}
                  getPlaylistTrackCount={(pl) => resolvePlaylistTracks(pl).length}
                />
              )}

              {view === 'mood-detail' && activeMoodCategory && (
                <MoodCategoryView
                  category={activeMoodCategory}
                  playlists={curatedPlaylists.filter((p) => p.moodId === activeMoodCategory.id)}
                  recommendedTracks={moodRecommendedTracks}
                  languages={languages}
                  selectedLanguages={selectedLanguages}
                  onToggleLanguage={handleToggleLanguage}
                  onBack={() => navigateTo('discover')}
                  onRefreshTracks={() => setMoodRefreshSeed((s) => s + 1)}
                  onSaveAsPlaylist={() =>
                    handleSaveUserPlaylist({
                      name: `${activeMoodCategory.name} Seçkim`,
                      description: activeMoodCategory.description,
                      moodId: activeMoodCategory.id,
                      language: selectedLanguages[0] || 'mixed',
                      trackIds: moodRecommendedTracks.map((t) => t.id),
                    })
                  }
                  onOpenPlaylist={openPlaylist}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(track) => setTrackForPlaylistModal(track)}
                  onInspectTrack={handleInspectTrack}
                  getPlaylistTrackCount={(pl) => resolvePlaylistTracks(pl).length}
                  onNotifyReady={showToast}
                />
              )}

              {view === 'mood-studio' && (
                <MoodStudioView
                  categories={categories}
                  languages={languages}
                  selectedMoodIds={studioMoodIds}
                  onToggleMood={(id) => {
                    setStudioMoodIds((prev) => {
                      if (!studioBlendMode) return [id];
                      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
                      return next.length === 0 ? [id] : next;
                    });
                  }}
                  blendMode={studioBlendMode}
                  onToggleBlendMode={() => {
                    setStudioBlendMode((b) => {
                      const next = !b;
                      if (!next && studioMoodIds.length > 1) {
                        setStudioMoodIds([studioMoodIds[0]]);
                      }
                      return next;
                    });
                  }}
                  selectedLanguages={selectedLanguages}
                  onToggleLanguage={handleToggleLanguage}
                  selectedGenres={studioGenres}
                  onToggleGenre={(genre) =>
                    setStudioGenres((prev) =>
                      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
                    )
                  }
                  energyFilter={studioEnergy}
                  onChangeEnergy={setStudioEnergy}
                  generatedTracks={studioGeneratedTracks}
                  onRefresh={() => setStudioRefreshSeed((s) => s + 1)}
                  onSaveAsPlaylist={() => {
                    const label = categories
                      .filter((c) => studioMoodIds.includes(c.id))
                      .map((c) => c.name.split(' ')[0])
                      .join(' + ');
                    handleSaveUserPlaylist({
                      name: `${label || 'Özel'} Karışımım`,
                      description: 'Ruh Hâlim stüdyosunda oluşturuldu.',
                      moodId: studioMoodIds[0] || 'happy',
                      language: selectedLanguages[0] || 'mixed',
                      trackIds: studioGeneratedTracks.map((t) => t.id),
                    });
                  }}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(track) => setTrackForPlaylistModal(track)}
                  onInspectTrack={handleInspectTrack}
                  onNotifyReady={showToast}
                />
              )}

              {view === 'cinema' && (
                <CinemaView
                  scenes={CINEMA_SCENES}
                  categories={categories}
                  onSelectScene={openCinemaScene}
                />
              )}

              {view === 'cinema-detail' && activeCinemaScene && (
                <CinemaDetailView
                  scene={activeCinemaScene}
                  category={categories.find((c) => c.id === activeCinemaScene.moodId)}
                  tracks={cinemaSceneTracks}
                  languages={languages}
                  selectedLanguages={selectedLanguages}
                  onToggleLanguage={handleToggleLanguage}
                  onBack={() => navigateTo('cinema')}
                  onRefresh={() => setCinemaRefreshSeed((s) => s + 1)}
                  onSaveAsPlaylist={() =>
                    handleSaveUserPlaylist({
                      name: activeCinemaScene.title.replace(/\.$/, ''),
                      description: activeCinemaScene.description,
                      moodId: activeCinemaScene.moodId,
                      language: selectedLanguages[0] || activeCinemaScene.language || 'mixed',
                      coverUrl: activeCinemaScene.coverUrl,
                      trackIds: cinemaSceneTracks.map((t) => t.id),
                    })
                  }
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(track) => setTrackForPlaylistModal(track)}
                  onInspectTrack={handleInspectTrack}
                  onNotifyReady={showToast}
                />
              )}

              {view === 'roulette' && (
                <RouletteView
                  categories={categories}
                  languages={languages}
                  selectedLanguages={selectedLanguages}
                  onToggleLanguage={handleToggleLanguage}
                  rolledMood={rolledMoodCategory}
                  rolledTracks={rouletteTracks}
                  isSpinning={rouletteSpinning}
                  rotationDeg={rouletteRotationDeg}
                  onSpin={handleSpinRoulette}
                  onSaveAsPlaylist={() => {
                    if (!rolledMoodCategory) return;
                    handleSaveUserPlaylist({
                      name: `Rulet: ${rolledMoodCategory.name}`,
                      description: 'Müzik Ruleti ile şansa seçilen sürpriz liste.',
                      moodId: rolledMoodCategory.id,
                      language: selectedLanguages[0] || 'mixed',
                      coverUrl: rolledMoodCategory.coverUrl,
                      trackIds: rouletteTracks.map((t) => t.id),
                    });
                  }}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(track) => setTrackForPlaylistModal(track)}
                  onInspectTrack={handleInspectTrack}
                  onNotifyReady={showToast}
                />
              )}

              {view === 'library' && (
                <LibraryView
                  tracks={tracks}
                  categories={categories}
                  languages={languages}
                  initialSearch={librarySearchQuery}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(track) => setTrackForPlaylistModal(track)}
                  onInspectTrack={handleInspectTrack}
                />
              )}

              {view === 'playlists' && (
                <MyPlaylistsView
                  userPlaylists={userPlaylists}
                  categories={categories}
                  onCreateNew={() => {
                    setEditingUserPlaylist(null);
                    setPlaylistModalOpen(true);
                  }}
                  onOpenPlaylist={openPlaylist}
                  onEditPlaylist={(pl) => {
                    setEditingUserPlaylist(pl);
                    setPlaylistModalOpen(true);
                  }}
                  onDeletePlaylist={handleDeleteUserPlaylist}
                  curatedPlaylists={curatedPlaylists}
                  getPlaylistTrackCount={(pl) => resolvePlaylistTracks(pl).length}
                />
              )}

              {view === 'playlist-detail' && activePlaylistObj && (
                <PlaylistDetailView
                  playlist={activePlaylistObj}
                  tracks={resolvePlaylistTracks(activePlaylistObj)}
                  categories={categories}
                  languages={languages}
                  onBack={() => navigateTo(previousView === 'playlist-detail' ? 'playlists' : previousView)}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(track) => setTrackForPlaylistModal(track)}
                  onInspectTrack={handleInspectTrack}
                  onEditUserPlaylist={(pl) => {
                    setEditingUserPlaylist(pl);
                    setPlaylistModalOpen(true);
                  }}
                  onDeleteUserPlaylist={handleDeleteUserPlaylist}
                  onRemoveTrackFromUserPlaylist={handleRemoveTrackFromUserPlaylist}
                  onSaveCuratedToMine={(pl) => {
                    const resolved = resolvePlaylistTracks(pl);
                    handleSaveUserPlaylist({
                      name: pl.title,
                      description: pl.description,
                      moodId: pl.moodId,
                      language: pl.language,
                      coverUrl: pl.coverUrl,
                      trackIds: resolved.map((t) => t.id),
                    });
                  }}
                />
              )}

              {view === 'favorites' && (
                <FavoritesView
                  favoriteTracks={favorites}
                  languages={languages}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToPlaylist={(track) => setTrackForPlaylistModal(track)}
                  onInspectTrack={handleInspectTrack}
                  onGoDiscover={() => navigateTo('discover')}
                />
              )}

              {view === 'profile' && (
                <ProfileView
                  profile={profile}
                  languages={languages}
                  favoritesCount={favorites.length}
                  playlistsCount={userPlaylists.length}
                  onGoogleSignIn={handleGoogleSignIn}
                  onSignOut={handleSignOut}
                  onUpdateProfile={handleUpdateProfile}
                  onOpenAdminPanel={() => navigateTo('admin')}
                  onOpenRecentItem={handleOpenRecentItem}
                  isSigningIn={isSigningIn}
                />
              )}

              {view === 'help' && (
                <HelpView
                  onShowOnboarding={() => setShowOnboardingForce(true)}
                  onBack={() => navigateTo(previousView === 'help' ? 'discover' : previousView)}
                  totalTracksCount={tracks.filter((t) => !t.deleted).length}
                  verifiedTracksCount={tracks.filter((t) => !t.deleted && t.audioFeaturesVerified).length}
                  activeLanguagesCount={languages.filter((l) => l.active).length}
                />
              )}

              {view === 'admin' && (
                <AdminPanelView
                  tracks={tracks}
                  categories={categories}
                  languages={languages}
                  curatedPlaylists={curatedPlaylists}
                  firebaseEmail={firebaseUser?.email ?? null}
                  firebaseEmailVerified={Boolean(firebaseUser?.emailVerified)}
                  onGoogleSignIn={handleGoogleSignIn}
                  onBack={() => navigateTo('profile')}
                  onToast={showToast}
                  onUpsertTrackOverride={(track) =>
                    setServerTrackOverrides((prev) => ({ ...prev, [track.id]: track }))
                  }
                  onBulkTrackOverrides={(items) =>
                    setServerTrackOverrides((prev) => {
                      const next = { ...prev };
                      for (const t of items) next[t.id] = t;
                      return next;
                    })
                  }
                  onUpsertPlaylistOverride={(pl) =>
                    setServerPlaylistOverrides((prev) => ({ ...prev, [pl.id]: pl }))
                  }
                  onDeletePlaylistOverride={(id) =>
                    setServerPlaylistOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), id, deleted: true } as any }))
                  }
                  onUpsertCategoryOverride={(cat) =>
                    setServerCategoryOverrides((prev) => ({ ...prev, [cat.id]: cat }))
                  }
                  onUpsertLanguageOverride={(lang) =>
                    setServerLanguageOverrides((prev) => ({ ...prev, [lang.code]: lang }))
                  }
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (<= 15% viewport height) */}
      <nav
        aria-label="Mobil Menü"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC]/95 dark:bg-[#211A1E]/95 backdrop-blur-md grid grid-cols-5 px-1"
      >
        {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]].map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                active ? 'text-[#B97891] dark:text-[#D8A1B3]' : 'text-[#7D6C74] dark:text-[#B9A7B0]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Scroll-to-Top Fixed Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Yukarı Çık"
          title="Yukarı Çık"
          className="fixed bottom-20 lg:bottom-6 right-5 z-40 w-11 h-11 rounded-full bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white shadow-lg flex items-center justify-center transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Modals */}
      <TrackInspectModal
        track={inspectedTrack}
        categories={categories}
        languages={languages}
        isFavorite={inspectedTrack ? favoriteIds.has(inspectedTrack.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToPlaylist={(t) => {
          setInspectedTrack(null);
          setTrackForPlaylistModal(t);
        }}
        onClose={() => setInspectedTrack(null)}
      />

      <PlaylistEditorModal
        open={playlistModalOpen}
        initialPlaylist={editingUserPlaylist}
        categories={categories}
        languages={languages}
        onSave={handleSaveUserPlaylist}
        onClose={() => {
          setPlaylistModalOpen(false);
          setEditingUserPlaylist(null);
        }}
      />

      <AddToPlaylistModal
        track={trackForPlaylistModal}
        userPlaylists={userPlaylists}
        categories={categories}
        onSelectPlaylist={handleAddTrackToUserPlaylist}
        onCreateWithTrack={(name, track) => {
          handleSaveUserPlaylist({
            name,
            description: 'Moodify üzerinden oluşturuldu.',
            moodId: 'happy',
            language: track.language || 'mixed',
            trackIds: [track.id],
          });
          setTrackForPlaylistModal(null);
        }}
        onClose={() => setTrackForPlaylistModal(null)}
      />

      {showOnboardingForce && <OnboardingScreen onStart={handleDismissReadMe} />}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="moodify-toast"
          className={`fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-bold text-white whitespace-nowrap ${
            toast.tone === 'error' ? 'bg-rose-600' : 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3]'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
