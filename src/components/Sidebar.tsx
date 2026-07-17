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

const STORAGE_KEY = 'ccs.sidebar.collapsed';

/**
 * Persistent sidebar. Same behavior on all screen sizes — matches the
 * pattern in ccg-resources. No mobile drawer, no hamburger. Users
 * collapse the sidebar to a 64px icons-only strip on smaller screens
 * via the chevron toggle; the collapse state is remembered per browser.
 */
export default function Sidebar({ navigation, email, onLogout }: SidebarProps) {
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
      className={`${widthClass} bg-[#0D1F35] text-white sticky top-0 h-screen flex-shrink-0 flex flex-col transition-[width] duration-150`}
    >
      {/* Brand + collapse toggle. Same layout at every screen width —
          collapsed mode centres the CCS icon, expanded shows the full
          brand label + chevron. */}
      <div className="px-3 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
        {!collapsed ? (
          <Link href="/resources" className="flex items-center gap-2.5 min-w-0 flex-1 px-2">
            <img src="/icon.png" alt="Closing Clients System" className="w-8 h-8 object-contain shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white leading-tight truncate">Closing Clients System</div>
              <div className="text-xs text-white/50 leading-tight mt-0.5 truncate">Resources</div>
            </div>
          </Link>
        ) : (
          <Link href="/resources" className="flex justify-center w-full">
            <img src="/icon.png" alt="Closing Clients System" className="w-8 h-8 object-contain" />
          </Link>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 shrink-0 ${collapsed ? 'absolute -right-3 top-5 bg-[#0D1F35] border border-white/10 shadow' : ''}`}
        >
          {collapsed ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav — flat list, order from navigation.json */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2 space-y-1' : 'px-3 space-y-0.5'}`}>
        {hydrated && navigation.map((s) => (
          <Link
            key={s.slug}
            href={`/resources/${s.slug}`}
            title={collapsed ? s.title : undefined}
            className={`flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-2'} py-1.5 text-sm rounded-md text-white/85 hover:bg-white/10 hover:text-white`}
          >
            <SectionIcon slug={s.slug} className="w-4 h-4 text-white/60 shrink-0" />
            {!collapsed && <span className="truncate flex-1">{s.title}</span>}
          </Link>
        ))}

        {/* External: CCS Tools hub (tools.closingclientssystem.com). Renders
            below the 6 sequential steps. Small ↗ arrow shows it opens in a
            new tab. Kept as a hardcoded item (not in navigation.json) because
            the schema only supports internal /resources/* slugs and adding
            external-link support would touch the router + section-card grid
            too. Cross-tool link, not a resource — belongs outside the data. */}
        <a
          href="https://tools.closingclientssystem.com"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'CCS Tools' : undefined}
          className={`flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-2'} py-1.5 text-sm rounded-md text-white/85 hover:bg-white/10 hover:text-white`}
        >
          {/* Toolbox / grid icon */}
          <svg className="w-4 h-4 text-white/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          {!collapsed && (
            <>
              <span className="truncate flex-1">CCS Tools</span>
              {/* External-link arrow */}
              <svg className="w-3 h-3 text-white/40 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </>
          )}
        </a>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 px-3 py-3 space-y-2">
        {!collapsed && (
          <div className="px-1">
            <div className="text-xs font-medium text-white/85 truncate">{email}</div>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-2 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-md ${collapsed ? 'justify-center px-2' : 'px-2'}`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
