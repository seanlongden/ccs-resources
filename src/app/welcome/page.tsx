'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, type NavItem, type AuthData } from '@/components/Sidebar';

interface NavSection extends NavItem {
  itemCount?: number;
}

const SIDEBAR_KEY = 'ccs_sidebar_collapsed';

export default function WelcomePage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [navigation, setNavigation] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const collapsed = window.localStorage.getItem(SIDEBAR_KEY) === '1';
      setSidebarCollapsed(collapsed);
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

      // Fire-and-forget: mark this user as having seen the welcome page.
      // Any subsequent login will skip straight to /resources.
      try {
        await fetch('/api/user/mark-welcome-seen', { method: 'POST' });
      } catch (e) {
        console.error('mark-welcome-seen failed (non-fatal):', e);
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
        <main className="px-8 py-12 max-w-4xl">
          <div className="mb-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Welcome</div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Closing Clients System</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">A quick walkthrough of what&apos;s inside and how to use it. Then pick your path below.</p>
          </div>

          {/* Video placeholder */}
          <div className="mb-10 aspect-video bg-gray-900 rounded-xl border border-gray-200 flex items-center justify-center">
            <div className="text-center text-white/60">
              <svg className="w-12 h-12 mx-auto mb-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">Walkthrough video coming soon</p>
            </div>
          </div>

          {/* Two cards: DFY + Access Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/done-for-you"
              className="group block bg-white rounded-xl border border-gray-200 p-6 hover:border-[#0D1F35] hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-[#0D1F35] text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Go to Done For You</h3>
              <p className="text-sm text-gray-500">Everything you need on your side when we&apos;re running the system for you.</p>
            </Link>

            <Link
              href="/resources"
              className="group block bg-white rounded-xl border border-gray-200 p-6 hover:border-[#0D1F35] hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 text-[#0D1F35] flex items-center justify-center mb-4 group-hover:bg-[#0D1F35] group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Access the resources</h3>
              <p className="text-sm text-gray-500">Browse CCS Install and CCS Training. Everything you need to learn and set up yourself.</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
