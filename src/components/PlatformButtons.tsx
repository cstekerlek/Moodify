import React from 'react';
import { MUSIC_PLATFORMS } from '../constants/musicConfig';

interface PlatformButtonsProps {
  query: string;
  compact?: boolean;
}

export function PlatformIcon({ id, className = 'w-3.5 h-3.5' }: { id: string; className?: string }) {
  switch (id) {
    case 'spotify':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.59 14.42a.62.62 0 0 1-.85.2c-2.34-1.43-5.28-1.75-8.74-.96a.62.62 0 1 1-.27-1.21c3.79-.86 7.04-.49 9.66 1.11.29.18.38.57.2.86zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.67-1.64-6.74-2.11-9.9-1.15a.78.78 0 1 1-.46-1.49c3.61-1.1 8.1-.57 11.17 1.32.37.23.48.71.26 1.06zm.11-2.84C14.72 8.96 9.43 8.78 6.37 9.71a.93.93 0 1 1-.54-1.78c3.52-1.07 9.37-.86 13.06 1.33a.93.93 0 0 1-.97 1.6z" />
        </svg>
      );
    case 'youtube-music':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 15.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-1.5 6V10l3.8 2-3.8 2z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.95C17.93 4.78 12 4.78 12 4.78s-5.93 0-7.64.46A2.75 2.75 0 0 0 2.42 7.2 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.94 1.95c1.71.46 7.64.46 7.64.46s5.93 0 7.64-.46a2.75 2.75 0 0 0 1.94-1.95A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.42-4.81zM10 15.1V8.9l5.2 3.1-5.2 3.1z" />
        </svg>
      );
    case 'apple-music':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="M18 3.2v11.6a3.3 3.3 0 1 1-1.9-3V6.8l-7.2 1.8v7.9a3.3 3.3 0 1 1-1.9-3V5.8L18 3.2z" />
        </svg>
      );
    case 'soundcloud':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="M11.6 8.3v8.5h6.7a2.6 2.6 0 0 0 .2-5.2 3.7 3.7 0 0 0-6.9-3.3zm-2 1.7v6.8h1.1V10H9.6zm-2 1.3v5.5h1.1v-5.5H7.6zm-2 1.6v3.9h1.1v-3.9H5.6zm-2 1.1v2.8h1.1V14H3.6z" />
        </svg>
      );
    case 'deezer':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="M3 16.5h3.2v2H3v-2zm4.6 0h3.2v2H7.6v-2zm4.6 0h3.2v2h-3.2v-2zm4.6 0H20v2h-3.2v-2zm-9.2-3.4h3.2v2H7.6v-2zm4.6 0h3.2v2h-3.2v-2zm4.6 0H20v2h-3.2v-2zm-4.6-3.4h3.2v2h-3.2v-2zm4.6 0H20v2h-3.2v-2zm0-3.4H20v2h-3.2v-2z" />
        </svg>
      );
    case 'tidal':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="m7 7.5 3 3-3 3-3-3 3-3zm5 0 3 3-3 3-3-3 3-3zm5 0 3 3-3 3-3-3 3-3zm-5 5 3 3-3 3-3-3 3-3z" />
        </svg>
      );
    case 'amazon-music':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <path d="M12 4a6.5 6.5 0 0 0-6.5 6.5v3.2a2.3 2.3 0 0 0 4.6 0V11a2 2 0 0 0-2-2h-.4a4.5 4.5 0 0 1 8.6 0h-.4a2 2 0 0 0-2 2v2.7a2.3 2.3 0 0 0 4.6 0v-3.2A6.5 6.5 0 0 0 12 4zm-6.2 14.3a11.3 11.3 0 0 0 12.4 0 .75.75 0 1 0-.8-1.26 9.8 9.8 0 0 1-10.8 0 .75.75 0 1 0-.8 1.26z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
  }
}

export const PlatformButtons: React.FC<PlatformButtonsProps> = ({ query, compact = false }) => {
  const [expanded, setExpanded] = React.useState(false);
  const visiblePlatforms = compact && !expanded ? MUSIC_PLATFORMS.slice(0, 4) : MUSIC_PLATFORMS;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visiblePlatforms.map((p) => (
        <a
          key={p.id}
          href={p.buildUrl(query)}
          target="_blank"
          rel="noopener noreferrer"
          title={`${p.name} üzerinde "${query}" ara`}
          style={{ backgroundColor: p.color, color: p.textColor }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-transform active:scale-95 hover:opacity-90 whitespace-nowrap shadow-xs"
        >
          <PlatformIcon id={p.id} />
          <span>{p.name}</span>
        </a>
      ))}
      {compact && MUSIC_PLATFORMS.length > 4 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-[#E6CCD4] dark:border-[#362A31] bg-white dark:bg-[#211A1E] text-[#5B4952] dark:text-[#DFD1D7] hover:bg-[#F9EFF2] dark:hover:bg-[#2B2227] whitespace-nowrap cursor-pointer"
        >
          {expanded ? 'Daha Az' : `+${MUSIC_PLATFORMS.length - 4} Platform`}
        </button>
      )}
    </div>
  );
};
