import type {
  CinemaScene,
  CuratedPlaylist,
  LanguageConfig,
  MoodCategory,
  MoodColorKey,
  Track,
} from '../types/music';

export const HERO_BANNER_IMAGE = '/src/assets/images/hero_dusty_rose_studio_1795675789496.jpg';

export const GENRE_ARTWORK = {
  popDance: '/src/assets/images/cover_pop_dance_1795093563899.jpg',
  rockIndie: '/src/assets/images/cover_rock_indie_1795093563915.jpg',
  hiphopRnb: '/src/assets/images/cover_hiphop_rnb_1795093564294.jpg',
  electronicLofi: '/src/assets/images/cover_electronic_lofi_1795093564448.jpg',
  acousticJazz: '/src/assets/images/cover_acoustic_jazz_1795093564548.jpg',
};

export function resolveTrackFallbackCover(track: Pick<Track, 'coverUrl' | 'genre' | 'valence' | 'energy'>): string {
  if (track.coverUrl) return track.coverUrl;
  const g = (track.genre || '').toLowerCase();
  if (/(rock|alternative|indie|metal)/.test(g)) return GENRE_ARTWORK.rockIndie;
  if (/(hip-hop|rap|r&b|reggae)/.test(g)) return GENRE_ARTWORK.hiphopRnb;
  if (/(electronic|house|techno|lo-fi|ambient)/.test(g)) return GENRE_ARTWORK.electronicLofi;
  if (/(acoustic|folk|jazz|blues|classical|soundtrack|arabesk|türk halk|türk sanat)/.test(g)) {
    return GENRE_ARTWORK.acousticJazz;
  }
  return GENRE_ARTWORK.popDance;
}

export const MOOD_COLOR_THEMES: Record<
  MoodColorKey,
  {
    bgSoft: string;
    pageAtmosphere: string;
    bgSolid: string;
    bgGradient: string;
    textAccent: string;
    borderAccent: string;
    ringAccent: string;
    badgeBg: string;
    hex: string;
    secondaryHex: string;
  }
> = {
  orange: {
    // Mutlu & Neşeli: Turuncu ve Şeftali
    bgSoft: 'bg-[#FFF5EC] dark:bg-[#29180F]',
    pageAtmosphere:
      'bg-gradient-to-b from-[#FFF1E6] via-[#FFE7D4]/70 to-[#FAF6F5] dark:from-[#26160D] dark:via-[#1E1412] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#EA580C] to-[#FB923C] hover:from-[#C2410C] hover:to-[#F97316]',
    bgGradient: 'from-[#FF9A62]/30 via-[#FDBA74]/20 to-[#FFF7F0] dark:from-[#EA580C]/30 dark:via-[#9A3412]/20 dark:to-[#241612]',
    textAccent: 'text-[#C2410C] dark:text-[#FDBA74]',
    borderAccent: 'border-[#FDBA74] dark:border-[#7C2D12]',
    ringAccent: 'ring-[#F97316]/35',
    badgeBg: 'bg-[#FFEDD5] text-[#9A3412] dark:bg-[#431407] dark:text-[#FED7AA]',
    hex: '#F97316',
    secondaryHex: '#FDBA74',
  },
  gray: {
    // Hüzünlü & Melankolik: Gri ve Lavanta
    bgSoft: 'bg-[#F3F1F8] dark:bg-[#1C1A26]',
    pageAtmosphere:
      'bg-gradient-to-b from-[#ECEAF4] via-[#F2EFF8] to-[#FAF6F5] dark:from-[#1B1926] dark:via-[#191621] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#5B6478] to-[#7C6BAE] hover:from-[#475569] hover:to-[#6D5A9E]',
    bgGradient: 'from-[#94A3B8]/25 via-[#C4B5FD]/25 to-[#F6F4FA] dark:from-[#475569]/30 dark:via-[#4C1D95]/20 dark:to-[#1B1926]',
    textAccent: 'text-[#57536E] dark:text-[#C4B5FD]',
    borderAccent: 'border-[#CBD5E1] dark:border-[#3F3B57]',
    ringAccent: 'ring-[#8B5CF6]/30',
    badgeBg: 'bg-[#E9E5F5] text-[#474363] dark:bg-[#2E2942] dark:text-[#DDD6FE]',
    hex: '#64748B',
    secondaryHex: '#A78BFA',
  },
  blue: {
    // Sakin & Odaklanma: Mavi ve Açık Lila
    bgSoft: 'bg-[#EFF5FF] dark:bg-[#131B2E]',
    pageAtmosphere:
      'bg-gradient-to-b from-[#E8F1FF] via-[#F0EEFF]/80 to-[#FAF6F5] dark:from-[#131C30] dark:via-[#181729] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#2563EB] to-[#818CF8] hover:from-[#1D4ED8] hover:to-[#6366F1]',
    bgGradient: 'from-[#60A5FA]/25 via-[#DDD6FE]/30 to-[#F3F7FF] dark:from-[#2563EB]/30 dark:via-[#4338CA]/20 dark:to-[#151B2B]',
    textAccent: 'text-[#1D4ED8] dark:text-[#A5B4FC]',
    borderAccent: 'border-[#BFDBFE] dark:border-[#2E3F6B]',
    ringAccent: 'ring-[#3B82F6]/35',
    badgeBg: 'bg-[#E0E7FF] text-[#1E40AF] dark:bg-[#1E294E] dark:text-[#C7D2FE]',
    hex: '#3B82F6',
    secondaryHex: '#C4B5FD',
  },
  red: {
    // Enerjik & Antrenman: Kırmızı ve Mercan
    bgSoft: 'bg-[#FFF1F0] dark:bg-[#2B1215]',
    pageAtmosphere:
      'bg-gradient-to-b from-[#FFE6E4] via-[#FFDAD8]/65 to-[#FAF6F5] dark:from-[#2A1216] dark:via-[#221216] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#DC2626] to-[#FB7185] hover:from-[#B91C1C] hover:to-[#F43F5E]',
    bgGradient: 'from-[#EF4444]/25 via-[#FB7185]/25 to-[#FFF4F3] dark:from-[#DC2626]/30 dark:via-[#9F1239]/25 dark:to-[#241216]',
    textAccent: 'text-[#BE123C] dark:text-[#FDA4AF]',
    borderAccent: 'border-[#FECACA] dark:border-[#7F1D1D]',
    ringAccent: 'ring-[#EF4444]/35',
    badgeBg: 'bg-[#FFE4E6] text-[#9F1239] dark:bg-[#4C0519] dark:text-[#FECDD3]',
    hex: '#E11D48',
    secondaryHex: '#FB7185',
  },
  green: {
    // Stresli & Rahatlama: Yeşil ve Mint
    bgSoft: 'bg-[#ECFDF5] dark:bg-[#0F241C]',
    pageAtmosphere:
      'bg-gradient-to-b from-[#E3FAEF] via-[#DCFCE7]/60 to-[#FAF6F5] dark:from-[#0F261D] dark:via-[#121F1B] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#059669] to-[#34D399] hover:from-[#047857] hover:to-[#10B981]',
    bgGradient: 'from-[#10B981]/25 via-[#A7F3D0]/30 to-[#F2FCF7] dark:from-[#059669]/30 dark:via-[#065F46]/25 dark:to-[#10221B]',
    textAccent: 'text-[#047857] dark:text-[#6EE7B7]',
    borderAccent: 'border-[#A7F3D0] dark:border-[#14533C]',
    ringAccent: 'ring-[#10B981]/35',
    badgeBg: 'bg-[#D1FAE5] text-[#065F46] dark:bg-[#064E3B] dark:text-[#A7F3D0]',
    hex: '#10B981',
    secondaryHex: '#6EE7B7',
  },
  rose: {
    // Moodify Toz Pembe / Gül Kurusu
    bgSoft: 'bg-[#F9EFF2] dark:bg-[#291E24]',
    pageAtmosphere:
      'bg-gradient-to-b from-[#F5E7EC] via-[#FAF6F5] to-[#FAF6F5] dark:from-[#241B20] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1]',
    bgGradient: 'from-[#D8A1B3]/30 via-[#F2DADF]/25 to-[#FFFDFC] dark:from-[#B97891]/25 dark:via-[#6E4253]/20 dark:to-[#211A1E]',
    textAccent: 'text-[#9F5C76] dark:text-[#E5B8C7]',
    borderAccent: 'border-[#E6CCD4] dark:border-[#513B44]',
    ringAccent: 'ring-[#B97891]/35',
    badgeBg: 'bg-[#F3E2E7] text-[#7D4359] dark:bg-[#3A2730] dark:text-[#ECC7D3]',
    hex: '#B97891',
    secondaryHex: '#D8A1B3',
  },
  purple: {
    bgSoft: 'bg-[#F5F0FA] dark:bg-[#21182B]',
    pageAtmosphere: 'bg-gradient-to-b from-[#F3ECFA] to-[#FAF6F5] dark:from-[#201829] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#8B5CF6] to-[#B97891] hover:from-[#7C3AED] hover:to-[#A6657E]',
    bgGradient: 'from-[#8B5CF6]/20 via-[#D8A1B3]/20 to-transparent',
    textAccent: 'text-[#7C3AED] dark:text-[#C4B5FD]',
    borderAccent: 'border-[#DDD6FE] dark:border-[#4C1D95]',
    ringAccent: 'ring-[#8B5CF6]/35',
    badgeBg: 'bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#2E1065] dark:text-[#DDD6FE]',
    hex: '#8B5CF6',
    secondaryHex: '#D8A1B3',
  },
  teal: {
    bgSoft: 'bg-[#ECFEFF] dark:bg-[#112429]',
    pageAtmosphere: 'bg-gradient-to-b from-[#E5FAFC] to-[#FAF6F5] dark:from-[#112328] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#0891B2] to-[#14B8A6] hover:from-[#0E7490] hover:to-[#0D9488]',
    bgGradient: 'from-[#06B6D4]/20 via-[#5EEAD4]/15 to-transparent',
    textAccent: 'text-[#0E7490] dark:text-[#67E8F9]',
    borderAccent: 'border-[#A5F3FC] dark:border-[#164E63]',
    ringAccent: 'ring-[#06B6D4]/35',
    badgeBg: 'bg-[#CFFAFE] text-[#155E75] dark:bg-[#164E63] dark:text-[#A5F3FC]',
    hex: '#06B6D4',
    secondaryHex: '#5EEAD4',
  },
  amber: {
    bgSoft: 'bg-[#FFFBEB] dark:bg-[#291F0F]',
    pageAtmosphere: 'bg-gradient-to-b from-[#FEF3C7] to-[#FAF6F5] dark:from-[#271E0F] dark:to-[#171215]',
    bgSolid: 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#B45309] hover:to-[#D97706]',
    bgGradient: 'from-[#F59E0B]/20 via-[#FDE68A]/20 to-transparent',
    textAccent: 'text-[#B45309] dark:text-[#FCD34D]',
    borderAccent: 'border-[#FDE68A] dark:border-[#78350F]',
    ringAccent: 'ring-[#F59E0B]/35',
    badgeBg: 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#451A03] dark:text-[#FDE68A]',
    hex: '#F59E0B',
    secondaryHex: '#FCD34D',
  },
};

export const DEFAULT_MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: 'happy',
    name: 'Mutlu & Neşeli',
    colorKey: 'orange',
    description: 'Turuncu ve şeftali enerjisiyle pozitif, hareketli ritimler',
    coverUrl: '/src/assets/images/mood_happy_cover_1795092065987.jpg',
    targetValence: 0.82,
    targetEnergy: 0.78,
    targetDanceability: 0.74,
    targetAcousticness: 0.16,
    targetTempo: 118,
    order: 1,
    active: true,
  },
  {
    id: 'sad',
    name: 'Hüzünlü & Melankolik',
    colorKey: 'gray',
    description: 'Gri ve lavanta dokunuşlu duygusal, derin ve içe dönük tınılar',
    coverUrl: '/src/assets/images/mood_sad_cover_1795092064321.jpg',
    targetValence: 0.2,
    targetEnergy: 0.28,
    targetDanceability: 0.36,
    targetAcousticness: 0.68,
    targetTempo: 84,
    order: 2,
    active: true,
  },
  {
    id: 'focus',
    name: 'Sakin & Odaklanma',
    colorKey: 'blue',
    description: 'Mavi ve açık lila dinginliğinde çalışma ve okuma akışı',
    coverUrl: '/src/assets/images/mood_focus_cover_1795092065127.jpg',
    targetValence: 0.42,
    targetEnergy: 0.24,
    targetDanceability: 0.35,
    targetAcousticness: 0.85,
    targetTempo: 88,
    order: 3,
    active: true,
  },
  {
    id: 'energetic',
    name: 'Enerjik & Antrenman',
    colorKey: 'red',
    description: 'Kırmızı ve mercan temposuyla yüksek BPM ve tam güç',
    coverUrl: '/src/assets/images/mood_energetic_cover_1795092066244.jpg',
    targetValence: 0.68,
    targetEnergy: 0.89,
    targetDanceability: 0.72,
    targetAcousticness: 0.08,
    targetTempo: 136,
    order: 4,
    active: true,
  },
  {
    id: 'calm',
    name: 'Stresli & Rahatlama',
    colorKey: 'green',
    description: 'Yeşil ve mint huzuruyla nefesi yavaşlatan yumuşak melodiler',
    coverUrl: '/src/assets/images/mood_calm_cover_1795092065959.jpg',
    targetValence: 0.5,
    targetEnergy: 0.3,
    targetDanceability: 0.46,
    targetAcousticness: 0.74,
    targetTempo: 80,
    order: 5,
    active: true,
  },
];

export const DEFAULT_LANGUAGES: LanguageConfig[] = [
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', active: true, order: 1 },
  { code: 'en', name: 'İngilizce', nativeName: 'English', active: true, order: 2 },
  { code: 'es', name: 'İspanyolca', nativeName: 'Español', active: true, order: 3 },
  { code: 'fr', name: 'Fransızca', nativeName: 'Français', active: true, order: 4 },
  { code: 'it', name: 'İtalyanca', nativeName: 'Italiano', active: true, order: 5 },
  { code: 'de', name: 'Almanca', nativeName: 'Deutsch', active: true, order: 6 },
  { code: 'ko', name: 'Korece', nativeName: '한국어', active: true, order: 7 },
  { code: 'ja', name: 'Japonca', nativeName: '日本語', active: true, order: 8 },
  { code: 'pt', name: 'Portekizce', nativeName: 'Português', active: true, order: 9 },
  { code: 'ar', name: 'Arapça', nativeName: 'العربية', active: true, order: 10 },
  { code: 'ru', name: 'Rusça', nativeName: 'Русский', active: true, order: 11 },
  { code: 'hi', name: 'Hintçe', nativeName: 'हिन्दी', active: true, order: 12 },
  { code: 'el', name: 'Yunanca', nativeName: 'Ελληνικά', active: true, order: 13 },
  { code: 'nl', name: 'Felemenkçe', nativeName: 'Nederlands', active: true, order: 14 },
];

export const CORE_LANGUAGE_CODES = ['tr', 'en', 'es', 'fr', 'it', 'de', 'ko', 'ja'];

export const MUSIC_GENRES: string[] = [
  'Pop',
  'Rock',
  'Alternative',
  'Indie',
  'Hip-hop',
  'Rap',
  'R&B',
  'Jazz',
  'Blues',
  'Classical',
  'Electronic',
  'House',
  'Techno',
  'Dance',
  'Acoustic',
  'Folk',
  'Türkçe Pop',
  'Türkçe Rock',
  'Türkçe Rap',
  'Arabesk',
  'Türk Halk Müziği',
  'Türk Sanat Müziği',
  'Lo-fi',
  'Ambient',
  'Metal',
  'Reggae',
  'Soundtrack',
];

export interface MusicPlatform {
  id: string;
  name: string;
  color: string;
  textColor: string;
  buildUrl: (query: string) => string;
}

export const MUSIC_PLATFORMS: MusicPlatform[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    color: '#1DB954',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    color: '#FF0000',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://music.youtube.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#DC2626',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q).replace(/%20/g, '+')}`,
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    color: '#FA243C',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://music.apple.com/search?term=${encodeURIComponent(q)}`,
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    color: '#FF5500',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://soundcloud.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'deezer',
    name: 'Deezer',
    color: '#A238FF',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://www.deezer.com/search/${encodeURIComponent(q)}`,
  },
  {
    id: 'tidal',
    name: 'TIDAL',
    color: '#0F172A',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://listen.tidal.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'amazon-music',
    name: 'Amazon Music',
    color: '#00A8E1',
    textColor: '#FFFFFF',
    buildUrl: (q) => `https://music.amazon.com/search/${encodeURIComponent(q)}`,
  },
];

export const CINEMA_SCENES: CinemaScene[] = [
  {
    id: 'cinema_ankara_night',
    title: 'Gece Ankara sokaklarında.',
    subtitle: 'Loş sokak lambaları, serin asfalt ve içe işleyen şehir ezgileri.',
    description:
      'Gece yarısından sonra Tunalı’dan Kuğulu’ya uzanan sakin adımlara eşlik eden Türkçe alternatif, indie ve duygusal rock seçkisi.',
    coverUrl: '/src/assets/images/cinema_ankara_night_1795675790463.jpg',
    moodId: 'sad',
    language: 'tr',
    targetValence: 0.28,
    targetEnergy: 0.38,
    targetAcousticness: 0.56,
    targetTempo: 92,
    preferredGenres: ['Türkçe Rock', 'Alternative', 'Indie', 'Acoustic'],
  },
  {
    id: 'cinema_rainy_sunday',
    title: 'Yağmurlu bir pazar sabahı.',
    subtitle: 'Buharlı camlar, sıcak bir fincan kahve ve dingin akustik tınılar.',
    description:
      'Haftanın tüm yorgunluğunu geride bıraktıran, yumuşak piyano ve akustik gitar eşliğinde huzurlu bir sabah sahnesi.',
    coverUrl: '/src/assets/images/cinema_rainy_sunday_1795675790327.jpg',
    moodId: 'focus',
    language: 'mixed',
    targetValence: 0.44,
    targetEnergy: 0.25,
    targetAcousticness: 0.82,
    targetTempo: 84,
    preferredGenres: ['Acoustic', 'Jazz', 'Folk', 'Lo-fi', 'Classical'],
  },
  {
    id: 'cinema_old_love',
    title: 'Eski bir aşkın ardından.',
    subtitle: 'Yarım kalmış cümleler, solgun fotoğraflar ve derin melankoli.',
    description:
      'Geçmişin izlerini taşıyan etkileyici balatlar, güçlü vokaller ve geceye yakışan duygusal şarkılar.',
    coverUrl: '/src/assets/images/cinema_old_love_1795675790936.jpg',
    moodId: 'sad',
    language: 'mixed',
    targetValence: 0.19,
    targetEnergy: 0.3,
    targetAcousticness: 0.68,
    targetTempo: 82,
    preferredGenres: ['Pop', 'Türkçe Pop', 'R&B', 'Acoustic', 'Soundtrack'],
  },
  {
    id: 'cinema_summer_friends',
    title: 'Yaz akşamı arkadaşlarla.',
    subtitle: 'Ilık rüzgâr, terasta kahkahalar ve ritmi yükselten sıcak melodiler.',
    description:
      'Gün batımından geceye uzanan keyifli buluşmalar için yüksek pozitiflik sunan pop, dans ve funk parçaları.',
    coverUrl: '/src/assets/images/cinema_summer_friends_1795675791381.jpg',
    moodId: 'happy',
    language: 'mixed',
    targetValence: 0.84,
    targetEnergy: 0.76,
    targetAcousticness: 0.18,
    targetTempo: 118,
    preferredGenres: ['Pop', 'Dance', 'Türkçe Pop', 'Electronic', 'R&B'],
  },
  {
    id: 'cinema_main_character',
    title: 'Hayatımın başrolü benim.',
    subtitle: 'Kendi filminin açılış jeneriği gibi hissettiren özgüvenli akış.',
    description:
      'Adımlarını hızlandıran, modunu yukarı çeken ve her ânı sinematik kılan güçlü ritimler ve ikonik nakaratlar.',
    coverUrl: '/src/assets/images/cinema_main_character_1795675791575.jpg',
    moodId: 'energetic',
    language: 'mixed',
    targetValence: 0.72,
    targetEnergy: 0.86,
    targetAcousticness: 0.1,
    targetTempo: 128,
    preferredGenres: ['Pop', 'Hip-hop', 'Dance', 'Rock', 'Electronic'],
  },
  {
    id: 'cinema_night_drive',
    title: 'Gece uzun yolculuğu.',
    subtitle: 'Boş otoyollar, neon ışıklar ve kesintisiz gece sürüşü.',
    description:
      'Şehir ışıkları geride kalırken ritmi hiç düşmeyen synth, elektronik, alternatif rock ve hipnotik gece parçaları.',
    coverUrl: '/src/assets/images/cinema_night_drive_1795675792171.jpg',
    moodId: 'energetic',
    language: 'mixed',
    targetValence: 0.54,
    targetEnergy: 0.74,
    targetAcousticness: 0.14,
    targetTempo: 122,
    preferredGenres: ['Electronic', 'House', 'Alternative', 'R&B', 'Soundtrack'],
  },
  {
    id: 'cinema_nostalgia_peace',
    title: 'Biraz nostalji, biraz huzur.',
    subtitle: 'Plak çıtırtısı, geçmişten tanıdık hisler ve zamansız dinginlik.',
    description:
      'Klasiklerden sıcak akustik düzenlemelere uzanan, zihnini dinlendiren nostaljik bir akşam seçkisi.',
    coverUrl: '/src/assets/images/cinema_nostalgia_peace_1795675792494.jpg',
    moodId: 'calm',
    language: 'mixed',
    targetValence: 0.52,
    targetEnergy: 0.34,
    targetAcousticness: 0.72,
    targetTempo: 86,
    preferredGenres: ['Jazz', 'Blues', 'Türk Sanat Müziği', 'Folk', 'Acoustic'],
  },
  {
    id: 'cinema_beach_sunset',
    title: 'Gün batımında sahilde.',
    subtitle: 'Kızıl ufuk, dalga sesleri ve ruhu tazeleyen sıcak esinti.',
    description:
      'Altın saat ışığıyla bütünleşen tropikal dokular, yumuşak indie pop ve huzur veren yaz sonu melodileri.',
    coverUrl: '/src/assets/images/cinema_beach_sunset_1795675793199.jpg',
    moodId: 'calm',
    language: 'mixed',
    targetValence: 0.64,
    targetEnergy: 0.46,
    targetAcousticness: 0.52,
    targetTempo: 98,
    preferredGenres: ['Indie', 'Acoustic', 'Pop', 'Reggae', 'Electronic'],
  },
];

export const DEFAULT_CURATED_PLAYLISTS: CuratedPlaylist[] = [
  {
    id: 'cur_happy_sunlit',
    title: 'Altın Saat Enerjisi',
    description: 'Güne pozitif başlamak ve modunu anında yükseltmek için seçilmiş neşeli pop ve dans hitleri.',
    moodId: 'happy',
    language: 'mixed',
    coverUrl: '/src/assets/images/mood_happy_cover_1795092065987.jpg',
    trackIds: [],
    featured: true,
  },
  {
    id: 'cur_happy_tr',
    title: 'Türkçe Neşeli Akış',
    description: 'Yüksek tempolu Türkçe Pop ve dans ritimleriyle moral veren seçki.',
    moodId: 'happy',
    language: 'tr',
    coverUrl: '/src/assets/images/cover_pop_dance_1795093563899.jpg',
    trackIds: [],
    featured: true,
  },
  {
    id: 'cur_sad_rain',
    title: 'Yağmurlu Gece Defteri',
    description: 'Düşük enerjili, akustik ağırlıklı ve duygusal derinliği yüksek melankolik parçalar.',
    moodId: 'sad',
    language: 'mixed',
    coverUrl: '/src/assets/images/mood_sad_cover_1795092064321.jpg',
    trackIds: [],
    featured: true,
  },
  {
    id: 'cur_sad_tr_alt',
    title: 'İstanbul’da Sonbahar',
    description: 'Türkçe alternatif, rock ve duygusal balatlardan oluşan gece seçkisi.',
    moodId: 'sad',
    language: 'tr',
    coverUrl: '/src/assets/images/cover_rock_indie_1795093563915.jpg',
    trackIds: [],
    featured: false,
  },
  {
    id: 'cur_focus_deep',
    title: 'Derin Odak Stüdyosu',
    description: 'Yüksek akustik oran ve düşük BPM ile kesintisiz çalışma ve okuma seansları.',
    moodId: 'focus',
    language: 'mixed',
    coverUrl: '/src/assets/images/mood_focus_cover_1795092065127.jpg',
    trackIds: [],
    featured: true,
  },
  {
    id: 'cur_focus_jp',
    title: 'Tokyo Lo-fi & Piyano',
    description: 'Japonca enstrümantal, soundtrack ve sakin lo-fi tınılarıyla zihinsel berraklık.',
    moodId: 'focus',
    language: 'ja',
    coverUrl: '/src/assets/images/cover_electronic_lofi_1795093564448.jpg',
    trackIds: [],
    featured: false,
  },
  {
    id: 'cur_energetic_run',
    title: '130+ BPM Koşu & Antrenman',
    description: 'Kardiyo, ağırlık ve yüksek yoğunluklu spor seansları için tam gaz ritimler.',
    moodId: 'energetic',
    language: 'mixed',
    coverUrl: '/src/assets/images/mood_energetic_cover_1795092066244.jpg',
    trackIds: [],
    featured: true,
  },
  {
    id: 'cur_energetic_kpop',
    title: 'Seoul Nabız: K-Pop & Dans',
    description: 'Korece yüksek enerjili pop ve dans hitleriyle dinamik motivasyon.',
    moodId: 'energetic',
    language: 'ko',
    coverUrl: '/src/assets/images/cover_hiphop_rnb_1795093564294.jpg',
    trackIds: [],
    featured: true,
  },
  {
    id: 'cur_calm_botanical',
    title: 'Nefes & Sabah Dinginliği',
    description: 'Stresi azaltan yumuşak akustik gitar, bossa nova ve sıcak caz melodileri.',
    moodId: 'calm',
    language: 'mixed',
    coverUrl: '/src/assets/images/mood_calm_cover_1795092065959.jpg',
    trackIds: [],
    featured: true,
  },
  {
    id: 'cur_calm_es',
    title: 'Akdeniz Akustik Esintisi',
    description: 'İspanyolca yumuşak akustik şarkılarla huzurlu bir mola.',
    moodId: 'calm',
    language: 'es',
    coverUrl: '/src/assets/images/cover_acoustic_jazz_1795093564548.jpg',
    trackIds: [],
    featured: false,
  },
];
