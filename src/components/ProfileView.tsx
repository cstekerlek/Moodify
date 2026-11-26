import React from 'react';
import {
  Check,
  Clock,
  Flame,
  Heart,
  ListMusic,
  LogIn,
  LogOut,
  Save,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { MUSIC_GENRES } from '../constants/musicConfig';
import type { LanguageConfig, UserProfile } from '../types/music';

interface ProfileViewProps {
  profile: UserProfile;
  languages: LanguageConfig[];
  favoritesCount: number;
  playlistsCount: number;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => Promise<void> | void;
  onOpenAdminPanel: () => void;
  onOpenRecentItem: (entry: string) => void;
  isSigningIn?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  languages,
  favoritesCount,
  playlistsCount,
  onGoogleSignIn,
  onSignOut,
  onUpdateProfile,
  onOpenAdminPanel,
  onOpenRecentItem,
  isSigningIn = false,
}) => {
  const [displayName, setDisplayName] = React.useState(profile.displayName);
  const [savingName, setSavingName] = React.useState(false);

  React.useEffect(() => {
    setDisplayName(profile.displayName);
  }, [profile.displayName]);

  const activeLangs = languages.filter((l) => l.active);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      await onUpdateProfile({ displayName: trimmed.slice(0, 80) });
    } finally {
      setSavingName(false);
    }
  };

  const toggleLanguage = (code: string) => {
    const current = profile.preferredLanguages || [];
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code].slice(0, 14);
    onUpdateProfile({ preferredLanguages: next });
  };

  const toggleGenre = (genre: string) => {
    const current = profile.preferredGenres || [];
    const next = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre].slice(0, 20);
    onUpdateProfile({ preferredGenres: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">Profil</h1>
        <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
          Hesabını yönet, müzik tercihlerini kişiselleştir ve son keşiflerine göz at.
        </p>
      </div>

      {/* Account Card */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-[#EDE2E5] dark:border-[#362A31] shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#F5E7EC] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7] flex items-center justify-center shrink-0">
                <UserIcon className="w-7 h-7" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#30282D] dark:text-[#FAF4F6] truncate">
                  {profile.displayName}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    profile.isGuest
                      ? 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7]'
                      : 'bg-[#F3E2E7] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7]'
                  }`}
                >
                  {profile.isGuest ? 'Misafir Oturumu' : 'Bağlı Hesap'}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#5B4D54] dark:text-[#B9A7B0]">
                {profile.isGuest
                  ? 'Favorilerin ve listelerin şimdilik bu tarayıcıda saklanır. Google ile giriş yaparak tüm cihazlarda eşitleyebilirsin.'
                  : 'Favorilerin, çalma listelerin ve tercihlerin bulut hesabınla güvenle senkronize ediliyor.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {profile.isGuest ? (
              <button
                type="button"
                disabled={isSigningIn}
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSigningIn ? 'Bağlanılıyor...' : 'Google ile Giriş Yap'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-xs sm:text-sm font-semibold text-[#30282D] dark:text-[#FAF4F6] hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] whitespace-nowrap cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mt-5 pt-5 border-t border-[#F2E9EC] dark:border-[#362A31] grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#FAF6F5] dark:bg-[#171215] p-3.5 border border-[#EDE2E5] dark:border-[#362A31]">
            <div className="flex items-center gap-1.5 text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
              <Heart className="w-3.5 h-3.5 text-[#B97891]" />
              <span>Favori Şarkı</span>
            </div>
            <div className="mt-1 text-xl font-extrabold font-mono tabular-nums text-[#30282D] dark:text-[#FAF4F6]">
              {favoritesCount}
            </div>
          </div>

          <div className="rounded-xl bg-[#FAF6F5] dark:bg-[#171215] p-3.5 border border-[#EDE2E5] dark:border-[#362A31]">
            <div className="flex items-center gap-1.5 text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
              <ListMusic className="w-3.5 h-3.5 text-[#B97891]" />
              <span>Çalma Listem</span>
            </div>
            <div className="mt-1 text-xl font-extrabold font-mono tabular-nums text-[#30282D] dark:text-[#FAF4F6]">
              {playlistsCount}
            </div>
          </div>

          <div className="rounded-xl bg-[#FAF6F5] dark:bg-[#171215] p-3.5 border border-[#EDE2E5] dark:border-[#362A31]">
            <div className="flex items-center gap-1.5 text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Keşif Serisi</span>
            </div>
            <div className="mt-1 text-xl font-extrabold font-mono tabular-nums text-[#30282D] dark:text-[#FAF4F6]">
              {profile.streakCount || 1} gün
            </div>
          </div>
        </div>

        {/* Display Name Editor */}
        <form onSubmit={handleSaveName} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={80}
            placeholder="Görünen adın"
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-[#30282D] dark:text-[#FAF4F6]"
          />
          <button
            type="submit"
            disabled={savingName || !displayName.trim() || displayName.trim() === profile.displayName}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white text-xs sm:text-sm font-bold disabled:opacity-40 whitespace-nowrap cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingName ? 'Kaydediliyor...' : 'Adı Güncelle'}</span>
          </button>
        </form>
      </section>

      {/* Preferred Languages */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-5 space-y-3">
        <div>
          <h2 className="text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">Tercih Edilen Müzik Dilleri</h2>
          <p className="text-xs text-[#5B4D54] dark:text-[#B9A7B0]">
            Keşfet ekranında öncelikli olarak görmek istediğin dilleri seçebilirsin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeLangs.map((lang) => {
            const selected = (profile.preferredLanguages || []).includes(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => toggleLanguage(lang.code)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selected
                    ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                    : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7] hover:bg-[#EDE0E5]'
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5" />}
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Preferred Genres */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-5 space-y-3">
        <div>
          <h2 className="text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">Sevdiğin Müzik Türleri</h2>
          <p className="text-xs text-[#5B4D54] dark:text-[#B9A7B0]">
            İlgi alanına giren türleri işaretleyerek profilini özelleştir.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MUSIC_GENRES.map((genre) => {
            const selected = (profile.preferredGenres || []).includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selected
                    ? 'bg-gradient-to-r from-[#B97891] to-[#D8A1B3] text-white'
                    : 'bg-[#F5ECEF] dark:bg-[#2B2227] text-[#5B4D54] dark:text-[#DFD1D7] hover:bg-[#EDE0E5]'
                }`}
              >
                {selected && <Check className="w-3 h-3" />}
                <span>{genre}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Views */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#B97891]" />
          <h2 className="text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">Son Görüntülenenler</h2>
        </div>
        {!profile.recentViews || profile.recentViews.length === 0 ? (
          <p className="text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
            Bir çalma listesi açtığında veya şarkı incelediğinde burada görünecek.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.recentViews.slice(0, 12).map((entry, idx) => {
              const label = entry.includes('::') ? entry.split('::').slice(1).join('::') : entry;
              return (
                <button
                  key={`${entry}-${idx}`}
                  type="button"
                  onClick={() => onOpenRecentItem(entry)}
                  className="px-3 py-1.5 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#171215] text-xs font-medium text-[#5B4D54] dark:text-[#DFD1D7] hover:border-[#B97891] transition-colors cursor-pointer"
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Subtle Admin Entry */}
      <section className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onOpenAdminPanel}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#7D6C74] dark:text-[#B9A7B0] hover:text-[#30282D] dark:hover:text-[#FAF4F6] hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] transition-colors cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Yönetici Paneli</span>
        </button>
      </section>
    </div>
  );
};
