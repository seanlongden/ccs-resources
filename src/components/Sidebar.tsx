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

// Lucide-style inline SVG paths for the 6 new step slugs. Unknown
// slugs fall back to a generic circle in <SectionIcon>.
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

// Persist desktop collapsed state across page loads. Mobile drawer
// open/closed is EPHEMERAL — resets on refresh — because on mobile
// you always want the drawer closed by default so content is visible.
const STORAGE_KEY = 'ccs.sidebar.collapsed';

export default function Sidebar({ navigation, email, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Close the mobile drawer when the viewport crosses the md breakpoint.
  // Otherwise a user who opens the drawer on mobile and rotates to
  // landscape / resizes to desktop ends up with the drawer still open
  // AND the desktop sidebar behind it — janky.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => setMobileOpen(false);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lock body scroll while the mobile drawer is open — matches native
  // mobile app pattern where the sheet blocks page scrolling.
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
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

  const desktopWidthClass = collapsed ? 'md:w-16' : 'md:w-64';

  return (
    <>
      {/* Mobile-only top bar with brand + hamburger. Hidden on md+ where
          the sidebar is always visible in the left column. */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0D1F35] text-white flex items-center justify-between h-14 px-4 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/icon.png" alt="CCS" className="w-7 h-7 object-contain flex-shrink-0" />
          <span className="font-semibold text-sm tracking-tight truncate">Closing Clients System</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="p-2 -mr-2 rounded-md text-white/70 hover:text-white hover:bg-white/10"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Backdrop — only on mobile when drawer open. Click to dismiss. */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="md:hidden fixed inset-0 z-40 bg-black/50"
        />
      )}

      {/* Sidebar itself. On mobile: fixed-position slide-over drawer,
          transformed off-screen when closed. On md+: normal sticky
          left column (relative in the flex layout), respects the
          collapsed state via width classes. */}
      <aside
        className={`
          bg-[#0D1F35] text-white flex flex-col
          fixed inset-y-0 left-0 z-50 w-64 shadow-2xl
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:shadow-none md:sticky md:top-0 md:h-screen md:overflow-y-auto md:flex-shrink-0
          md:transition-[width]
          ${desktopWidthClass}
        `}
      >
        {/* Brand row + desktop collapse toggle. On mobile the drawer
            has its own close button (X); on desktop it's a chevron. */}
        <div className={`border-b border-white/10 flex-shrink-0 flex items-center ${collapsed ? 'md:justify-center md:py-4 px-5 py-5 justify-between' : 'p-5 gap-2 justify-between'}`}>
          {/* Collapsed desktop: show only the brand icon centred, which doubles as the expand toggle */}
          {collapsed ? (
            <>
              <div className="flex items-center gap-2 md:hidden min-w-0">
                <img src="/icon.png" alt="CCS" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="font-semibold text-sm tracking-tight truncate">Closing Clients System</span>
              </div>
              <button
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="hidden md:block p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10"
              >
                <img src="/icon.png" alt="CCS" className="w-7 h-7 object-contain" />
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="md:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <img src="/icon.png" alt="CCS" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="font-semibold text-sm tracking-tight truncate">Closing Clients System</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={toggleCollapsed}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="hidden md:block p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  className="md:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Nav — flat list, order from navigation.json. When user taps
            a link on mobile the drawer auto-closes so they see the
            destination page immediately. */}
        <nav className={`flex-1 py-3 overflow-y-auto ${collapsed ? 'md:px-2 md:space-y-1' : ''}`}>
          {hydrated && navigation.map((s) => (
            <Link
              key={s.slug}
              href={`/resources/${s.slug}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? s.title : undefined}
              className={`flex items-center text-sm transition-colors text-white/70 hover:text-white hover:bg-white/[0.04] ${
                collapsed
                  ? 'md:justify-center md:p-2 md:rounded-md gap-3 px-5 py-2.5 border-l-2 border-transparent'
                  : 'gap-3 px-5 py-2.5 border-l-2 border-transparent'
              }`}
            >
              <SectionIcon slug={s.slug} className="w-[18px] h-[18px] flex-shrink-0 opacity-80" />
              {/* Section title is hidden ONLY on md+ when collapsed.
                  On mobile the drawer is always full-width, so titles
                  always show there. */}
              <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{s.title}</span>
            </Link>
          ))}
        </nav>

        {/* Footer: email + logout. Collapsed desktop: icon only.
            Mobile drawer: always shows email + logout label. */}
        <div className={`border-t border-white/10 flex-shrink-0 ${collapsed ? 'md:p-2 p-4' : 'p-4'}`}>
          {collapsed ? (
            <>
              {/* Desktop collapsed: icon-only logout */}
              <button
                onClick={onLogout}
                aria-label="Logout"
                title="Logout"
                className="hidden md:flex w-full items-center justify-center p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
              {/* Mobile drawer: full labelled footer even when desktop is collapsed */}
              <div className="md:hidden">
                <div className="text-xs text-white/40 truncate">{email}</div>
                <button onClick={onLogout} className="text-xs text-white/60 hover:text-white mt-1.5">
                  Logout
                </button>
              </div>
            </>
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
    </>
  );
}
