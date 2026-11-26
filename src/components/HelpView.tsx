import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Database,
  Dices,
  ExternalLink,
  Globe2,
  Heart,
  HelpCircle,
  ListMusic,
  MessageCircleQuestion,
  Radio,
  Smile,
} from 'lucide-react';
import { MUSIC_PLATFORMS } from '../constants/musicConfig';
import { PlatformIcon } from './PlatformButtons';

interface HelpViewProps {
  onShowOnboarding: () => void;
  onBack: () => void;
  totalTracksCount: number;
  verifiedTracksCount: number;
  activeLanguagesCount: number;
}

interface HelpTopic {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string;
  actionLabel?: string;
}

export const HelpView: React.FC<HelpViewProps> = ({
  onShowOnboarding,
  onBack,
  totalTracksCount,
  verifiedTracksCount,
  activeLanguagesCount,
}) => {
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set(['how-to-use']));

  const toggleTopic = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const topics: HelpTopic[] = [
    {
      id: 'how-to-use',
      title: 'Moodify nasıl kullanılır?',
      icon: HelpCircle,
      content:
        'Keşfet sayfasından o anki ruh hâlini seçebilir, dil filtresini belirleyerek sana özel hazırlanan 12 şarkılık çalma listelerini inceleyebilirsin. Ayrıca Moodify Cinema ile tematik sahnelere dalabilir veya Müzik Ruleti ile şansa sürpriz listeler oluşturabilirsin.',
    },
    {
      id: 'mood-categories',
      title: 'Ruh hâli kategorileri ne anlama gelir?',
      icon: Smile,
      content:
        'Beş ana kategori ses özniteliklerine göre ayrılmıştır: Mutlu & Neşeli (Turuncu & Şeftali — yüksek pozitiflik ve enerji), Hüzünlü & Melankolik (Gri & Lavanta — düşük enerji ve duygusal derinlik), Sakin & Odaklanma (Mavi & Açık Lila — yüksek akustik ve ders/çalışma dengesi), Enerjik & Antrenman (Kırmızı & Mercan — yüksek BPM ve güç), Stresli & Rahatlama (Yeşil & Mint — dingin ve yumuşak tempo).',
    },
    {
      id: 'roulette',
      title: 'Müzik ruleti nasıl çalışır?',
      icon: Dices,
      content:
        'Müzik Ruleti ekranında "Bana Sürpriz Yap" butonuna bastığında çark beş ruh hâlinden birini rastgele seçer ve seçili müzik diline uygun 12 taze şarkıdan oluşan bir liste hazırlar. İstersen "Tekrar Çevir" ile yeni bir sürpriz alabilir veya listeyi kaydedebilirsin.',
    },
    {
      id: 'cinema',
      title: 'Moodify Cinema nedir?',
      icon: Clapperboard,
      content:
        'Moodify Cinema, şarkıları günlük hayattan film sahnelerine dönüştürür. "Gece Ankara sokaklarında.", "Yağmurlu bir pazar sabahı." veya "Gece uzun yolculuğu." gibi 8 atmosferik sahneden birini seçerek o sahneye uyumlu özel şarkı listesini açabilirsin.',
    },
    {
      id: 'playlists',
      title: 'Çalma listesi nasıl oluşturulur?',
      icon: ListMusic,
      content:
        'Ruh hâli, Moodify Cinema veya Müzik Ruleti ekranlarında "Çalma Listem Olarak Kaydet" butonuna basarak listeyi anında kaydedebilirsin. Ayrıca Çalma Listelerim sayfasındaki "Yeni Çalma Listesi Oluştur" butonuyla sıfırdan kendi listeni kurup şarkı ekleyip çıkarabilirsin.',
    },
    {
      id: 'favorites',
      title: 'Favorilere şarkı nasıl eklenir?',
      icon: Heart,
      content:
        'Herhangi bir şarkı satırının sağındaki kalp ikonuna dokunarak şarkıyı Favoriler’e ekleyebilir veya çıkarabilirsin. Favoriler sekmesinden beğendiğin tüm şarkıları arayabilir ve dilediğin platformda açabilirsin.',
    },
    {
      id: 'languages',
      title: 'Dil seçimi nasıl yapılır?',
      icon: Globe2,
      content:
        'Keşfet, Ruh Hâlim, kategori detayları ve Müzik Ruleti ekranlarındaki dil çubuğundan Karışık modunu koruyabilir ya da Türkçe, İngilizce, İspanyolca, Fransızca, İtalyanca, Almanca, Korece, Japonca ve diğer dillerden bir veya birkaçını seçebilirsin. Seçilen dillerin dışındaki şarkılar gösterilmez.',
    },
    {
      id: 'platforms',
      title: 'Spotify, YouTube Music ve diğer platformlarda şarkılar nasıl açılır?',
      icon: Radio,
      content:
        'Moodify her şarkı satırında Spotify, YouTube Music, YouTube ve Apple Music ikonlarını doğrudan sunar. "+4" butonuna tıklayarak SoundCloud, Deezer, TIDAL ve Amazon Music dahil tüm 8 platformda doğrudan arama sayfasını açabilirsin.',
    },
    {
      id: 'dataset',
      title: 'Veri seti nasıl yüklenir?',
      icon: Database,
      content:
        `Moodify hâlihazırda ${totalTracksCount.toLocaleString('tr-TR')} benzersiz şarkı (${verifiedTracksCount.toLocaleString('tr-TR')} doğrulanmış ses profili ve ${activeLanguagesCount} dil) içerir. Yönetici yetkisine sahip kullanıcılar Profil > Yönetici Paneli > Veri Seti Yönetimi sekmesinden yeni CSV veya JSON açık veri setleri yükleyebilir.`,
    },
    {
      id: 'faq',
      title: 'Sık sorulan sorular',
      icon: MessageCircleQuestion,
      content:
        'Hesap açmadan kullanabilir miyim? Evet, misafir olarak favori ve çalma listelerin tarayıcında saklanır; Google ile giriş yaparsan bulut hesabınla eşitlenir. Şarkılar uygulama içinde mi çalıyor? Moodify telif güvenliği için şarkıları kendi sunucusunda barındırmaz, tek dokunuşla resmi müzik platformlarında açar.',
    },
    {
      id: 'readme-reopen',
      title: 'Read Me’yi yeniden görüntüle',
      icon: BookOpen,
      content:
        'Uygulamayı ilk açtığında gördüğün kullanım rehberini (Read Me ekranını) aşağıdaki butona dokunarak istediğin zaman yeniden açabilirsin.',
      actionLabel: 'Read Me Ekranını Şimdi Aç',
    },
  ];

  return (
    <div data-testid="help-view" className="space-y-6">
      {/* Header + Back & Re-open Read Me CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            data-testid="help-back-button"
            className="mt-0.5 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E] text-xs sm:text-sm font-semibold text-[#30282D] dark:text-[#FAF4F6] hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
              Yardım Merkezi
            </h1>
            <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
              Merak ettiğin başlığa dokunarak kısa ve net açıklamayı görüntüle.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onShowOnboarding}
          data-testid="help-reopen-readme-top"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs sm:text-sm font-bold whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <BookOpen className="w-4 h-4" />
          <span>Read Me’yi Yeniden Görüntüle</span>
        </button>
      </div>

      {/* 11 Interactive Accordion Help Topics */}
      <section aria-label="Yardım Konuları" className="space-y-2.5">
        {topics.map((topic) => {
          const Icon = topic.icon;
          const isOpen = openIds.has(topic.id);
          return (
            <div
              key={topic.id}
              className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleTopic(topic.id)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left hover:bg-[#FAF6F5] dark:hover:bg-[#282025] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F5E7EC] dark:bg-[#3A242E] text-[#9F5C76] dark:text-[#E5B8C7] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">
                    {topic.title}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#9F5C76] dark:text-[#E5B8C7] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8E7D85] shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 pt-1 pl-16 sm:pl-[68px] space-y-3 border-t border-[#F5ECEF] dark:border-[#2E242A]">
                  <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7] leading-relaxed">{topic.content}</p>
                  {topic.actionLabel && (
                    <button
                      type="button"
                      onClick={onShowOnboarding}
                      data-testid="help-reopen-readme-inline"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs sm:text-sm font-bold cursor-pointer shadow-xs"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{topic.actionLabel}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Supported Platforms Visual Showcase */}
      <section className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-[#B97891]" />
          <h2 className="text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">
            Desteklenen Müzik Platformları
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {MUSIC_PLATFORMS.map((p) => (
            <span
              key={p.id}
              style={{ backgroundColor: p.color, color: p.textColor }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
            >
              <PlatformIcon id={p.id} />
              <span>{p.name}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};
