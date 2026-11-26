import { CORE_LANGUAGE_CODES } from '../constants/musicConfig';
import type { MoodCategory, Track } from '../types/music';

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, Number(n.toFixed(3))));
}

export function clampTempo(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 105;
  return Math.round(Math.max(40, Math.min(230, n)));
}

export function normalizeTrackKey(title: string, artist: string): string {
  const clean = (s: string) =>
    String(s || '')
      .toLowerCase()
      .replace(/\(.*?\)|\[.*?\]/g, '')
      .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff\u0600-\u06ff\u0370-\u03ff\u3040-\u30ff\u4e00-\u9faf\uac00-\ud7af]+/gi, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  return `${clean(title)}::${clean(artist.split(/[;,]/)[0])}`;
}

export function calculateMoodMatchScore(track: Track, selectedMoods: MoodCategory[]): number {
  if (!track.audioFeaturesVerified || track.valence === null || track.energy === null || track.tempo === null) {
    return 0;
  }
  const moods = selectedMoods.length > 0 ? selectedMoods : [];
  if (moods.length === 0) return 75;

  const count = moods.length;
  let tVal = 0;
  let tEng = 0;
  let tDan = 0;
  let tAco = 0;
  let tTmp = 0;

  for (const m of moods) {
    tVal += m.targetValence / count;
    tEng += m.targetEnergy / count;
    tDan += (m.targetDanceability ?? 0.5) / count;
    tAco += (m.targetAcousticness ?? 0.4) / count;
    tTmp += m.targetTempo / count;
  }

  const dVal = Math.abs(track.valence - tVal);
  const dEng = Math.abs(track.energy - tEng);
  const dDan = Math.abs((track.danceability ?? 0.5) - tDan);
  const dAco = Math.abs((track.acousticness ?? 0.4) - tAco);
  const dTmp = Math.min(1, Math.abs(track.tempo - tTmp) / 85);

  const weightedDist = dVal * 0.34 + dEng * 0.32 + dAco * 0.16 + dTmp * 0.11 + dDan * 0.07;
  const rawScore = Math.max(10, Math.min(99, Math.round((1 - weightedDist * 1.42) * 100)));
  return rawScore;
}

export function meetsMoodThreshold(track: Track, selectedMoods: MoodCategory[]): boolean {
  if (!track.audioFeaturesVerified || track.valence === null || track.energy === null || track.tempo === null) {
    return false;
  }
  if (selectedMoods.length !== 1) return true; // Blended moods use centroid scoring

  const moodId = selectedMoods[0].id;
  const v = track.valence;
  const e = track.energy;
  const a = track.acousticness ?? 0.3;
  const t = track.tempo;

  switch (moodId) {
    case 'happy':
      return v >= 0.55 && e >= 0.48;
    case 'sad':
      return v <= 0.44 && e <= 0.56;
    case 'focus':
      return a >= 0.42 && e <= 0.54;
    case 'energetic':
      return e >= 0.66 && t >= 108;
    case 'calm':
      return e <= 0.54 && t <= 116 && a >= 0.28;
    default:
      return true;
  }
}

export function inferTrackMoodId(track: Track, categories: MoodCategory[]): string {
  if (!track.audioFeaturesVerified || categories.length === 0) {
    return categories[0]?.id || 'happy';
  }
  let bestId = categories[0].id;
  let bestScore = -1;
  for (const cat of categories) {
    const s = calculateMoodMatchScore(track, [cat]);
    if (s > bestScore) {
      bestScore = s;
      bestId = cat.id;
    }
  }
  return bestId;
}

export function matchesLanguageSelection(trackLang: string, selectedLanguages: string[]): boolean {
  if (!selectedLanguages || selectedLanguages.length === 0 || selectedLanguages.includes('mixed')) {
    return true;
  }
  if (selectedLanguages.includes('other') && !CORE_LANGUAGE_CODES.includes(trackLang)) {
    return true;
  }
  return selectedLanguages.includes(trackLang);
}

export interface GeneratePlaylistOptions {
  tracks: Track[];
  selectedMoods: MoodCategory[];
  selectedLanguages: string[];
  selectedGenres?: string[];
  energyFilter?: 'all' | 'low' | 'medium' | 'high';
  limit?: number;
  excludeIds?: Set<string>;
}

export function generateMoodPlaylist(options: GeneratePlaylistOptions): Track[] {
  const {
    tracks,
    selectedMoods,
    selectedLanguages,
    selectedGenres = [],
    energyFilter = 'all',
    limit = 12,
    excludeIds,
  } = options;

  const isMixed =
    !selectedLanguages || selectedLanguages.length === 0 || selectedLanguages.includes('mixed');

  // Strict language filter ALWAYS applies — never leak other languages!
  const langPool = tracks.filter(
    (t) => !t.deleted && matchesLanguageSelection(t.language, selectedLanguages)
  );

  let pool = langPool.filter((t) => {
    if (selectedGenres.length > 0 && !selectedGenres.includes(t.genre)) return false;
    if (energyFilter === 'low' && (t.energy ?? 0.5) > 0.45) return false;
    if (energyFilter === 'medium' && ((t.energy ?? 0.5) <= 0.45 || (t.energy ?? 0.5) > 0.72)) return false;
    if (energyFilter === 'high' && (t.energy ?? 0.5) <= 0.72) return false;
    return true;
  });

  if (pool.length === 0) {
    pool = langPool;
  }

  const verifiedPool = pool.filter((t) => t.audioFeaturesVerified);
  const strictMoodPool = verifiedPool.filter((t) => meetsMoodThreshold(t, selectedMoods));
  // Use strict mood-qualified tracks if enough exist; otherwise rank all verified tracks in the same language
  const candidatePool = strictMoodPool.length >= Math.min(limit, 8) ? strictMoodPool : verifiedPool;

  const scored = candidatePool.map((t) => {
    const matchScore = calculateMoodMatchScore(t, selectedMoods);
    const freshnessPenalty = excludeIds && excludeIds.has(t.id) ? -6 : 0;
    const jitter = (Math.random() - 0.5) * 4;
    return {
      ...t,
      matchScore,
      _rank: matchScore + freshnessPenalty + jitter,
    };
  });

  scored.sort((a, b) => b._rank - a._rank);

  const topCandidates = scored.slice(0, Math.max(limit * 4, 48));
  const picked: Track[] = [];
  const artistCount: Record<string, number> = {};
  const langCount: Record<string, number> = {};

  const maxPerLang = isMixed ? Math.max(2, Math.ceil(limit / 4)) : limit;

  for (const item of topCandidates) {
    if (picked.length >= limit) break;
    const artistKey = item.artist.split(',')[0].trim().toLowerCase();
    if ((artistCount[artistKey] || 0) >= 2) continue;
    if (isMixed && (langCount[item.language] || 0) >= maxPerLang) continue;

    picked.push(item);
    artistCount[artistKey] = (artistCount[artistKey] || 0) + 1;
    langCount[item.language] = (langCount[item.language] || 0) + 1;
  }

  if (picked.length < limit) {
    for (const item of topCandidates) {
      if (picked.length >= limit) break;
      if (picked.some((p) => p.id === item.id)) continue;
      picked.push(item);
    }
  }

  return picked.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export function computeAudioProfileStats(tracks: Track[]) {
  const verified = tracks.filter((t) => t.audioFeaturesVerified && t.valence !== null && t.energy !== null && t.tempo !== null);
  if (verified.length === 0) {
    return { avgValence: 0, avgEnergy: 0, avgDanceability: 0, avgAcousticness: 0, avgTempo: 0, verifiedCount: 0 };
  }
  const n = verified.length;
  return {
    avgValence: Number((verified.reduce((s, t) => s + (t.valence ?? 0), 0) / n).toFixed(2)),
    avgEnergy: Number((verified.reduce((s, t) => s + (t.energy ?? 0), 0) / n).toFixed(2)),
    avgDanceability: Number((verified.reduce((s, t) => s + (t.danceability ?? 0.5), 0) / n).toFixed(2)),
    avgAcousticness: Number((verified.reduce((s, t) => s + (t.acousticness ?? 0.3), 0) / n).toFixed(2)),
    avgTempo: Math.round(verified.reduce((s, t) => s + (t.tempo ?? 100), 0) / n),
    verifiedCount: n,
  };
}

export function detectDuplicateTracks(tracks: Track[]) {
  const map = new Map<string, Track[]>();
  for (const t of tracks) {
    if (t.deleted) continue;
    const key = normalizeTrackKey(t.title, t.artist);
    const arr = map.get(key) || [];
    arr.push(t);
    map.set(key, arr);
  }
  const duplicates: { key: string; items: Track[] }[] = [];
  for (const [key, items] of map.entries()) {
    if (items.length > 1) duplicates.push({ key, items });
  }
  return duplicates;
}

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export function normalizeImportedTrack(obj: Record<string, any>, idx: number, sourceName: string): Track | null {
  const getField = (keys: string[], fallback: any) => {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
        return obj[k];
      }
    }
    return fallback;
  };

  const title = String(getField(['title', 'track_name', 'name', 'song', 'sarki'], '')).trim();
  const artist = String(getField(['artist', 'artists', 'artist_name', 'sanatci'], '')).trim();
  if (!title || !artist) return null;

  const album = String(getField(['album', 'album_name', 'albüm'], 'Single')).trim();
  const genre = String(getField(['genre', 'track_genre', 'tur', 'tür'], 'Pop')).trim();
  const language = String(getField(['language', 'lang', 'dil'], 'en')).trim().toLowerCase().slice(0, 16);
  const yearRaw = Number(getField(['year', 'release_year', 'yil'], NaN));
  const year = Number.isFinite(yearRaw) && yearRaw >= 1900 && yearRaw <= 2100 ? Math.round(yearRaw) : null;
  const coverRaw = String(getField(['coverurl', 'cover_url', 'artwork'], '')).trim();

  return {
    id: `imp_${idx}_${Date.now().toString(36)}`,
    title: title.slice(0, 180),
    artist: artist.replace(/;/g, ', ').slice(0, 180),
    album: album.slice(0, 180),
    genre: genre.slice(0, 64),
    language: language || 'en',
    year,
    coverUrl: coverRaw || null,
    valence: clamp01(parseFloat(getField(['valence'], 0.5))),
    energy: clamp01(parseFloat(getField(['energy'], 0.5))),
    danceability: clamp01(parseFloat(getField(['danceability'], 0.5))),
    acousticness: clamp01(parseFloat(getField(['acousticness'], 0.3))),
    tempo: clampTempo(parseFloat(getField(['tempo', 'bpm'], 110))),
    audioFeaturesVerified: true,
    source: sourceName,
  };
}
