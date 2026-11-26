import React from 'react';
import { Disc3 } from 'lucide-react';
import type { MoodColorKey } from '../types/music';

interface PlaylistCoverProps {
  title: string;
  subtitle?: string;
  coverUrl?: string | null;
  colorKey?: MoodColorKey;
  seed?: string;
  className?: string;
}

const PALETTES: Record<MoodColorKey, [string, string, string]> = {
  orange: ['#EA580C', '#FB923C', '#9A3412'],
  gray: ['#64748B', '#A78BFA', '#334155'],
  blue: ['#2563EB', '#A5B4FC', '#1E3A8A'],
  red: ['#DC2626', '#FB7185', '#7F1D1D'],
  green: ['#059669', '#6EE7B7', '#065F46'],
  rose: ['#B97891', '#D8A1B3', '#6E4253'],
  purple: ['#7C3AED', '#D8A1B3', '#3B0764'],
  teal: ['#0891B2', '#5EEAD4', '#164E63'],
  amber: ['#D97706', '#FBBF24', '#78350F'],
};

function hashNum(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const PlaylistCover: React.FC<PlaylistCoverProps> = ({
  title,
  subtitle,
  coverUrl,
  colorKey = 'rose',
  seed,
  className = 'w-full aspect-square',
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [coverUrl]);

  if (coverUrl && !imgFailed) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[#2A2026] ${className}`}>
        <img
          src={coverUrl}
          alt={title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  const [c1, c2, c3] = PALETTES[colorKey] || PALETTES.rose;
  const h = hashNum(seed || title);
  const angle = (h % 6) * 30 + 25;
  const variant = h % 3;

  return (
    <div
      style={{
        background: `linear-gradient(${angle}deg, ${c3} 0%, ${c1} 55%, ${c2} 100%)`,
      }}
      className={`relative overflow-hidden rounded-xl text-white flex flex-col justify-between p-3.5 select-none ${className}`}
    >
      {variant === 0 && (
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-8 w-36 h-36 rounded-full border-[18px] border-white/15"
        />
      )}
      {variant === 1 && (
        <div
          aria-hidden="true"
          className="absolute -right-6 bottom-4 w-28 h-28 rotate-12 rounded-2xl border-4 border-white/20"
        />
      )}
      {variant === 2 && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent"
        />
      )}

      <div className="relative z-10 flex items-center justify-between">
        <Disc3 className="w-5 h-5 text-white/85" />
        {subtitle && (
          <span className="text-[11px] font-medium text-white/85 truncate max-w-[70%]">{subtitle}</span>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        <div className="text-sm sm:text-base font-bold leading-tight line-clamp-2 drop-shadow-xs">{title}</div>
      </div>
    </div>
  );
};
