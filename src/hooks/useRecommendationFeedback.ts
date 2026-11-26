import React from 'react';
import type { LanguageConfig, Track } from '../types/music';

export function formatSelectedLanguagesLabel(
  selectedLanguages: string[],
  languages: LanguageConfig[]
): string {
  if (!selectedLanguages || selectedLanguages.length === 0 || selectedLanguages.includes('mixed')) {
    return 'Karışık';
  }
  const names = selectedLanguages.map((code) => {
    if (code === 'other') return 'Diğer Diller';
    const found = languages.find((l) => l.code === code);
    return found ? found.name : code.toUpperCase();
  });
  return names.join(', ');
}

interface UseRecommendationFeedbackOptions {
  tracks: Track[];
  onNotifyReady?: (msg: string) => void;
  settleDelayMs?: number;
}

export function useRecommendationFeedback({
  tracks,
  onNotifyReady,
  settleDelayMs = 280,
}: UseRecommendationFeedbackOptions) {
  const resultsRef = React.useRef<HTMLElement | null>(null);
  const latestRequestIdRef = React.useRef(0);
  const lastCommittedIdRef = React.useRef(0);
  const timerRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [settledRequestId, setSettledRequestId] = React.useState(0);
  const [animGen, setAnimGen] = React.useState(0);

  const tracksSignature = React.useMemo(() => tracks.map((t) => t.id).join(','), [tracks]);
  const latestTracksRef = React.useRef(tracks);
  latestTracksRef.current = tracks;

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const triggerUpdate = React.useCallback(
    (action?: () => void) => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const nextId = latestRequestIdRef.current + 1;
      latestRequestIdRef.current = nextId;
      setIsUpdating(true);

      if (action) {
        action();
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (latestRequestIdRef.current !== nextId) return;
        setIsUpdating(false);
        setSettledRequestId(nextId);
      }, settleDelayMs);
    },
    [settleDelayMs]
  );

  const cancelPending = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    latestRequestIdRef.current += 1;
    lastCommittedIdRef.current = latestRequestIdRef.current;
    setIsUpdating(false);
  }, []);

  // Commit scroll + notification ONLY after DOM reflects the latest tracks
  React.useEffect(() => {
    if (settledRequestId === 0) return;
    if (settledRequestId !== latestRequestIdRef.current) return;
    if (settledRequestId <= lastCommittedIdRef.current) return;

    const committedId = settledRequestId;
    lastCommittedIdRef.current = committedId;

    if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        if (latestRequestIdRef.current !== committedId) return;

        const currentTracks = latestTracksRef.current;
        if (!currentTracks || currentTracks.length === 0) {
          return;
        }

        setAnimGen((g) => g + 1);

        const targetEl = resultsRef.current;
        if (targetEl) {
          const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
          targetEl.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        }

        if (onNotifyReady) {
          onNotifyReady('Yeni önerilerin hazır! 🎵');
        }
      });
    });
  }, [settledRequestId, tracksSignature, onNotifyReady]);

  return {
    resultsRef,
    isUpdating,
    animGen,
    triggerUpdate,
    cancelPending,
  };
}
