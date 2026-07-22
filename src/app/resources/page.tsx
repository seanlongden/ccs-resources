'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SectionIcon, type NavItem, type AuthData } from '@/components/Sidebar';
import { useTrack, DFY_LINKS } from '@/lib/track';

interface NavSection extends NavItem {
  itemCount?: number;
}

const SIDEBAR_KEY = 'ccs_sidebar_collapsed';

export default function ResourcesPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [navigation, setNavigation] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { track, setTrack, loaded: trackLoaded } = useTrack();

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

  const showPicker = trackLoaded && track === null;

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
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">The System</div>
            <h1 className="text-3xl font-bold text-gray-900">Closing Clients System Resources</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">Everything you need to run an outbound engine that books qualified sales calls — organized by topic so you can jump straight to what you need.</p>
          </div>

          {track === 'dfy' && (
            <div className="mt-14 max-w-2xl">
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Your Resources</div>
                <h2 className="text-xl font-bold text-gray-900">Everything you need, in order</h2>
                <p className="text-gray-500 mt-1 text-sm max-w-2xl">We&apos;re running your campaigns. Here&apos;s what you need on your end.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {DFY_LINKS.map((item, i) => (
                  <Link
                    key={item.fullSlug}
                    href={`/resources/${item.fullSlug}`}
                    className={`flex items-center gap-3 px-5 py-4 hover:bg-gray-50 group ${i > 0 ? 'border-t border-gray-100' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#0D1F35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {track !== 'dfy' && navigation.length > 0 && (
            <div className="mt-14">
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Browse by topic</div>
                <h2 className="text-xl font-bold text-gray-900">Pick up where you left off</h2>
                <p className="text-gray-500 mt-1 text-sm max-w-2xl">Jump straight to the section you need.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {navigation.map((section) => {
                  const pageCount = section.children?.length ?? 0;
                  return (
                    <Link
                      key={section.slug}
                      href={`/resources/${section.slug}`}
                      className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 group-hover:bg-[#0D1F35] group-hover:text-white group-hover:border-[#0D1F35] transition-colors">
                          <SectionIcon slug={section.slug} className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
                          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1">{section.title}</h3>
                      {section.description && (
                        <p className="text-xs text-gray-500 leading-relaxed">{section.description}</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1F35]/85 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">How are you using this?</h2>
            <p className="text-sm text-gray-500 mb-6">Pick the option that fits, so we can show you the right resources.</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setTrack('dfy')}
                className="w-full px-5 py-3 bg-[#0D1F35] text-white rounded-xl font-medium text-sm hover:bg-[#1a3a5c] transition-colors"
              >
                We&apos;re running this for you
              </button>
              <button
                type="button"
                onClick={() => setTrack('full')}
                className="w-full px-5 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                You&apos;re setting it up and running it yourself
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-5">You can change this anytime.</p>
          </div>
        </div>
      )}
    </div>
  );
}
