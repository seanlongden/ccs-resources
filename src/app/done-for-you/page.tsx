'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, type NavItem, type AuthData } from '@/components/Sidebar';

interface NavSection extends NavItem {
  itemCount?: number;
}

const SIDEBAR_KEY = 'ccs_sidebar_collapsed';

const DFY_LINKS = [
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

export default function DoneForYouPage() {
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
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Done For You</div>
            <h1 className="text-3xl font-bold text-gray-900">Everything you need, in order.</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">We&apos;re running your campaigns. Here&apos;s what you need on your end &mdash; the tools to get set up, and the assets to close what gets booked.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {DFY_LINKS.map((item, i) => (
              <Link
                key={item.fullSlug}
                href={`/resources/${item.fullSlug}`}
                className={`flex items-start gap-3 px-6 py-5 hover:bg-gray-50 group ${i > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 group-hover:bg-[#0D1F35] group-hover:text-white transition-colors text-sm font-semibold tabular-nums">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-[#0D1F35] shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link href="/welcome" className="text-sm text-gray-500 hover:text-[#0D1F35]">
              &larr; Back to Welcome
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
