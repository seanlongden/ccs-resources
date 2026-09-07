'use client';

/**
 * Layout wrapper for the Call Recordings section. Renders the same
 * Sidebar + auth flow as the resources catch-all page.tsx so the
 * section feels like part of the site instead of a standalone microsite.
 *
 * Child pages (hub + category) render inside the main column and can be
 * server components — this layout only handles the shell.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, type NavItem, type AuthData } from '@/components/Sidebar';
import navigationData from '../../../../../content/navigation.json';

const SIDEBAR_KEY = 'ccs_sidebar_collapsed';

export default function CallRecordingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [ready, setReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (cancelled) return;
        if (!data.authenticated) {
          router.push('/');
          return;
        }
        setAuth(data);
      } catch {
        if (!cancelled) router.push('/');
        return;
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0D1F35] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-8 h-8 mx-auto mb-3 text-white/40 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-white/60 text-sm">Loading&hellip;</p>
        </div>
      </div>
    );
  }

  if (!auth?.authenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        navigation={navigationData as unknown as NavItem[]}
        auth={auth}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
