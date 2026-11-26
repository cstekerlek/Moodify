import React from 'react';
import {
  ArrowRight,
  AudioWaveform,
  BookOpen,
  Heart,
  ListMusic,
  Radio,
  Smile,
  Sparkles,
  X,
} from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../constants/musicConfig';

interface OnboardingScreenProps {
  onStart: () => void;
  isInitialGate?: boolean;
}

const GUIDE_SECTIONS = [
  {
    num: '1',
    heading: 'Moodify nedir?',
    body: 'Moodify; o anki ruh hâline, seçtiğin müzik diline ve dinleme zevkine göre kişiselleştirilmiş şarkılar ve çalma listeleri sunan müzik keşif platformudur.',
    icon: Sparkles,
    badgeClass: 'text-[#9F5C76] bg-[#F5E7EC] dark:text-[#E5B8C7] dark:bg-[#3A242E]',
  },
  {
    num: '2',
    heading: 'Ruh hâli nasıl seçilir?',
    body: 'Keşfet ekranındaki beş büyük renkli ruh hâli kartından (Mutlu & Neşeli, Hüzünlü & Melankolik, Sakin & Odaklanma, Enerjik & Antrenman, Stresli & Rahatlama) birini seçebilir veya Ruh Hâlim stüdyosunda birden fazla duyguyu harmanlayabilirsin.',
    icon: Smile,
    badgeClass: 'text-[#C2410C] bg-[#FFEDD5] dark:text-[#FDBA74] dark:bg-[#431407]',
  },
  {
    num: '3',
    heading: 'Sana uygun müzik listesi nasıl oluşturulur?',
    body: 'Dil filtresinden Türkçe, İngilizce veya Karışık seçimini yaptığında ruh hâline en uygun 12 şarkılık liste otomatik hazırlanır. Dilersen Müzik Ruleti ile sürpriz liste çevirebilir veya Moodify Cinema sahnelerinden seçebilirsin.',
    icon: ListMusic,
    badgeClass: 'text-[#1D4ED8] bg-[#E0E7FF] dark:text-[#A5B4FC] dark:bg-[#1E294E]',
  },
  {
    num: '4',
    heading: 'Şarkılar müzik platformlarında nasıl açılır?',
    body: 'Her şarkı kartındaki Spotify, YouTube Music, YouTube ve Apple Music logolarına dokunarak şarkıyı doğrudan ilgili platformda açabilir; "+4" butonuyla SoundCloud, Deezer, TIDAL ve Amazon Music’e geçebilirsin.',
    icon: Radio,
    badgeClass: 'text-[#047857] bg-[#D1FAE5] dark:text-[#6EE7B7] dark:bg-[#064E3B]',
  },
  {
    num: '5',
    heading: 'Favoriler ve çalma listeleri nasıl kullanılır?',
    body: 'Beğendiğin şarkıları kalp ikonuyla Favoriler’e ekle, liste ekle ikonuyla kendi listelerine kaydet veya "Çalma Listem Olarak Kaydet" butonuyla önerilen listeleri Çalma Listelerim sayfasına aktar.',
    icon: Heart,
    badgeClass: 'text-[#BE123C] bg-[#FFE4E6] dark:text-[#FDA4AF] dark:bg-[#4C0519]',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart, isInitialGate = false }) => {
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onStart]);

  return (
    <div
      data-testid="readme-onboarding-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="readme-popup-title"
      onClick={(e) => {
        if (!isInitialGate && e.target === e.currentTarget) onStart();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 text-[#30282D] dark:text-[#FAF4F6] ${
        isInitialGate
          ? 'bg-gradient-to-br from-[#F7EBF0] via-[#FAF6F5] to-[#EFE1E7] dark:from-[#261920] dark:via-[#171215] dark:to-[#22171D]'
          : 'bg-[#171215]/75 dark:bg-black/80 backdrop-blur-md'
      }`}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-3xl overflow-hidden shadow-2xl">
        {/* Popup Header Banner */}
        <div className="relative h-36 sm:h-44 w-full shrink-0 bg-[#241A20]">
          <img
            src={HERO_BANNER_IMAGE}
            alt="Moodify"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#24181F] via-[#24181F]/55 to-transparent" />

          <div className="absolute top-3.5 left-4 sm:left-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 backdrop-blur-xs text-white text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-[#E8B7C7]" />
            <span>Read Me · Kullanım Rehberi</span>
          </div>

          <button
            type="button"
            onClick={onStart}
            data-testid="readme-close-button"
            aria-label="Read Me penceresini kapat"
            className="absolute top-3.5 right-3.5 sm:right-4 w-9 h-9 rounded-xl bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3.5 left-4 right-4 sm:left-5 sm:right-5 flex items-center gap-3 text-white">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] flex items-center justify-center shrink-0 shadow">
              <AudioWaveform className="w-5 h-5" />
            </div>
            <div>
              <h1 id="readme-popup-title" className="text-lg sm:text-2xl font-extrabold tracking-tight leading-tight">
                MOODIFY’YE HOŞ GELDİN!
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#F2DADF]">
                Müziğini ruh hâline göre keşfet.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable 5 Guide Headings */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {GUIDE_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.num}
                className="flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl border border-[#EDE2E5] dark:border-[#362A31] bg-[#FAF6F5] dark:bg-[#191317]"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${sec.badgeClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h2 className="text-sm sm:text-base font-extrabold text-[#30282D] dark:text-[#FAF4F6]">
                    {sec.num}. {sec.heading}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5B4D54] dark:text-[#DFD1D7] leading-relaxed">
                    {sec.body}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        {/* Sticky Popup Footer CTA */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#EDE2E5] dark:border-[#362A31] bg-[#FFFDFC] dark:bg-[#211A1E]">
          <span className="text-xs sm:text-sm text-[#7D6C74] dark:text-[#B9A7B0]">
            Bu rehbere istediğin zaman <strong>Yardım (?)</strong> menüsünden tekrar ulaşabilirsin.
          </span>
          <button
            type="button"
            onClick={onStart}
            data-testid="readme-start-button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-sm sm:text-base font-extrabold shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Hemen Başla</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
