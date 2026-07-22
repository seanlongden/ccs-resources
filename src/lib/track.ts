'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * "Track" is a purely client-side UX filter, not an access-control
 * mechanism. It just decides which nav / homepage view to show:
 *   - 'dfy'  — Done-For-You clients: short, focused view (5 links)
 *   - 'full' — Coaching / self-serve / DWY: full 3-section nav
 *
 * Every logged-in user can still reach every page directly by URL
 * regardless of this setting. Never use this for gating real content.
 */
export type Track = 'dfy' | 'full';

export const TRACK_KEY = 'ccs_track';

// Fired whenever setTrack/clearTrack runs, so every useTrack() instance in
// the tree (e.g. Sidebar.tsx and resources/page.tsx are separate component
// trees, not siblings sharing state) picks up the change immediately instead
// of only on next mount. The native 'storage' event alone doesn't fire in
// the tab that made the change, so we pair it with a custom event.
const TRACK_EVENT = 'ccs-track-changed';

function readStoredTrack(): Track | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(TRACK_KEY);
    return stored === 'dfy' || stored === 'full' ? stored : null;
  } catch {
    return null;
  }
}

export interface DfyLink {
  title: string;
  fullSlug: string;
  description: string;
}

// The fixed 5-link flat list shown to DFY clients, in this exact order.
export const DFY_LINKS: DfyLink[] = [
  {
    title: 'Get Instantly + Your Inboxes',
    fullSlug: 'ccs-install/get-instantly',
    description: 'Set up the tool your cold email sends from.',
  },
  {
    title: 'Get AI Ark',
    fullSlug: 'ccs-install/get-ai-ark',
    description: 'Set up the tool we use to build your lead lists.',
  },
  {
    title: 'Reply Management',
    fullSlug: 'cold-email/reply-management',
    description: 'How to handle replies as they come in.',
  },
  {
    title: 'Sales Assets',
    fullSlug: 'sales/sales-assets',
    description: 'Assets to help you close what gets booked.',
  },
  {
    title: 'Lead Magnets',
    fullSlug: 'sales/lead-magnets',
    description: 'Lead magnets to support your sales process.',
  },
];

export function useTrack() {
  const [track, setTrackState] = useState<Track | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTrackState(readStoredTrack());
    setLoaded(true);

    function onChange() {
      setTrackState(readStoredTrack());
    }
    window.addEventListener(TRACK_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(TRACK_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setTrack = useCallback((next: Track) => {
    try {
      window.localStorage.setItem(TRACK_KEY, next);
    } catch {
      /* ignore */
    }
    setTrackState(next);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(TRACK_EVENT));
  }, []);

  const clearTrack = useCallback(() => {
    try {
      window.localStorage.removeItem(TRACK_KEY);
    } catch {
      /* ignore */
    }
    setTrackState(null);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(TRACK_EVENT));
  }, []);

  return { track, setTrack, clearTrack, loaded };
}
