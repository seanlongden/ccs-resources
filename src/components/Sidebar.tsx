'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NavSection {
  title: string;
  slug: string;
  description?: string;
}

interface SidebarProps {
  navigation: NavSection[];
  email?: string;
  onLogout: () => void;
}

// Lucide-style inline SVG paths, 24×24 viewBox, currentColor.
// Keyed by the 6-step slugs shipped in Phase 1. Any slug not in this map
// falls back to a generic circle in <SectionIcon> below — safe for new
// sections added later.
const ICON_PATHS: Record<string, React.ReactNode> = {
  'start-here': (
    <path d="M3 9l9-6 9 6v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V9z" />
  ),
  'setup': (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
  'offer-and-email': (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  'launch-and-replies': (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
  'close-and-onboard': (
    <>
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </>
  ),
  'scale': (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),
};

export function SectionIcon({ slug, className }: { slug: string; className?: string }) {
  const paths = ICON_PATHS[slug];
  if (!paths) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  );
}

// LocalStorage key for the collapsed state — persists across page loads.
// Kept simple: a single boolean, per-browser (fine for a UI preference).
const STORAGE_KEY = 'ccs.sidebar.collapsed';

export default function Sidebar({ navigation, email, onLogout }: SidebarProps) {
  // Start collapsed:false to avoid a hydration mismatch on the server-
  // rendered pass. The effect below reads localStorage on mount and
  // flips to the stored value if different.
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') setCollapsed(true);
    } catch {
      /* localStorage unavailable — default to expanded */
    }
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const widthClass = collapsed ? 'w-16' : 'w-64';

  return (
    <aside
      className={`${widthClass} bg-[#0D1F35] text-white sticky top-0 h-screen overflow-y-auto flex-shrink-0 flex flex-col transition-[width] duration-200 ease-in-out`}
    >
      {/* Brand row + collapse toggle. In collapsed mode the toggle sits
          top-centre. In expanded mode it's tucked to the right of the
          brand label. */}
      <div className={`border-b border-white/10 flex-shrink-0 flex items-center ${collapsed ? 'justify-center py-4' : 'p-5 gap-2 justify-between'}`}>
        {collapsed ? (
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10"
          >
            <img src="/icon.png" alt="CCS" className="w-7 h-7 object-contain" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <img src="/icon.png" alt="CCS" className="w-7 h-7 object-contain flex-shrink-0" />
              <span className="font-semibold text-sm tracking-tight truncate">Closing Clients System</span>
            </div>
            <button
              onClick={toggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Nav — flat list of sections. Previous tri-bucket (orientation /
          guided / reference) was tied to the pre-Phase-1 slugs
          ('welcome', 'ccs-install') that no longer exist. Rendering
          straight from navigation.json in order keeps the sidebar aligned
          with whatever ships in that file. */}
      <nav className={`flex-1 py-3 overflow-y-auto ${collapsed ? 'px-2 space-y-1' : ''}`}>
        {hydrated && navigation.map((s) => (
          <Link
            key={s.slug}
            href={`/resources/${s.slug}`}
            title={collapsed ? s.title : undefined}
            className={`flex items-center text-sm transition-colors text-white/70 hover:text-white hover:bg-white/[0.04] ${
              collapsed
                ? 'justify-center p-2 rounded-md'
                : 'gap-3 px-5 py-2.5 border-l-2 border-transparent'
            }`}
          >
            <SectionIcon slug={s.slug} className="w-[18px] h-[18px] flex-shrink-0 opacity-80" />
            {!collapsed && <span className="truncate">{s.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer: email + logout. In collapsed mode both collapse into a
          single icon-button; the email is dropped (it takes too much
          horizontal room and doesn't help navigation). */}
      <div className={`border-t border-white/10 flex-shrink-0 ${collapsed ? 'p-2' : 'p-4'}`}>
        {collapsed ? (
          <button
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
            className="w-full flex items-center justify-center p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        ) : (
          <>
            <div className="text-xs text-white/40 truncate">{email}</div>
            <button onClick={onLogout} className="text-xs text-white/60 hover:text-white mt-1.5">
              Logout
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
