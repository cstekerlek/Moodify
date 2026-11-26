export type MoodColorKey = 'orange' | 'gray' | 'blue' | 'red' | 'green' | 'rose' | 'purple' | 'teal' | 'amber';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  language: string;
  year: number | null;
  coverUrl: string | null;
  spotifyId?: string | null;
  valence: number | null;
  energy: number | null;
  danceability: number | null;
  acousticness: number | null;
  tempo: number | null;
  popularity?: number | null;
  durationMs?: number | null;
  audioFeaturesVerified: boolean;
  source?: string;
  deleted?: boolean;
  matchScore?: number;
  inferredMoodId?: string;
}

export interface MoodCategory {
  id: string;
  name: string;
  colorKey: MoodColorKey;
  description: string;
  coverUrl: string;
  targetValence: number;
  targetEnergy: number;
  targetDanceability: number;
  targetAcousticness: number;
  targetTempo: number;
  order: number;
  active: boolean;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  active: boolean;
  order: number;
}

export interface CuratedPlaylist {
  id: string;
  title: string;
  description: string;
  moodId: string;
  language: string;
  coverUrl?: string;
  trackIds: string[];
  featured: boolean;
  isUserPlaylist?: false;
}

export interface UserPlaylist {
  id: string;
  uid?: string;
  name: string;
  description: string;
  moodId: string;
  language: string;
  coverUrl?: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
  isUserPlaylist: true;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  preferredLanguages: string[];
  preferredGenres: string[];
  recentViews: string[];
  onboardingSeen: boolean;
  streakCount: number;
  lastVisitDate: string;
  isGuest?: boolean;
}

export type AppView =
  | 'discover'
  | 'mood-studio'
  | 'mood-detail'
  | 'cinema'
  | 'cinema-detail'
  | 'roulette'
  | 'library'
  | 'playlists'
  | 'playlist-detail'
  | 'favorites'
  | 'profile'
  | 'help'
  | 'admin';

export interface CinemaScene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverUrl: string;
  moodId: string;
  language: string;
  targetValence: number;
  targetEnergy: number;
  targetAcousticness: number;
  targetTempo: number;
  preferredGenres: string[];
}

export interface CatalogMeta {
  totalUniqueTracks: number;
  preservedBaseTracks: number;
  verifiedAudioFeatureTracks: number;
  minimumRequirementMet: boolean;
  generatedAt: string;
  sources: { name: string; url: string; license: string }[];
  byLanguage: Record<string, number>;
  byGenre: Record<string, number>;
}
