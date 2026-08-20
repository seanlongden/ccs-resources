'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, type NavItem, type AuthData } from '@/components/Sidebar';

interface NavSection extends NavItem {
  itemCount?: number;
}

interface RecentItem {
  slug: string;
  title: string;
  ts: number;
  href?: string; // Optional absolute path override — used by pages not under /resources/*
}

const SIDEBAR_KEY = 'ccs_sidebar_collapsed';
const RECENTS_KEY = 'ccs_recently_viewed';

export default function ResourcesPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [navigation, setNavigation] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const collapsed = window.localStorage.getItem(SIDEBAR_KEY) === '1';
      setSidebarCollapsed(collapsed);
      const raw = window.localStorage.getItem(RECENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RecentItem[];
        if (Array.isArray(parsed)) setRecents(parsed.slice(0, 5));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(v => {
      const next = !v;
      try { window.localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const authRes = await fetch('/api/auth');
        const authData = await authRes.json();
        if (!authData.authenticated) {
          router.push('/');
          return;
        }
        setAuth(authData);
      } catch (e) {
        console.error('Auth check failed:', e);
        router.push('/');
        return;
      }

      try {
        const navRes = await fetch('/api/content/navigation');
        const navData = await navRes.json();
        setNavigation(navData);
      } catch (e) {
        console.error('Failed to load navigation:', e);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1F35] flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth?.authenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        navigation={navigation}
        auth={auth}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div className="flex-1 min-w-0">
        <main className="px-8 py-12 max-w-3xl">
          <div className="mb-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">The System</div>
            <h1 className="text-3xl font-bold text-gray-900">Closing Clients System Resources</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">Pick up where you left off, or use the sidebar to browse.</p>
          </div>

          {recents.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recently viewed
              </div>
              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                {recents.map((r) => (
                  <Link
                    key={r.slug}
                    href={r.href ?? `/resources/${r.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group"
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              You haven&apos;t opened anything yet. Head to{' '}
              <Link href="/welcome" className="text-[#0D1F35] font-medium underline">Get Started</Link>{' '}
              or use the sidebar to browse.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
