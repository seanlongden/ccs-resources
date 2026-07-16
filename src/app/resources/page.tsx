'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar, { SectionIcon } from '@/components/Sidebar';

interface AuthData {
  authenticated: boolean;
  email?: string;
  status?: string;
}

interface NavSection {
  title: string;
  slug: string;
  description?: string;
  itemCount?: number;
  children?: NavItem[];
}

interface NavItem {
  title: string;
  slug: string;
  fullSlug: string;
  type?: string;
}

interface SearchResult {
  slug: string;
  title: string;
  isSection: boolean;
  chunk: number;
}

export default function ResourcesPage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [navigation, setNavigation] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/content/page?search=${encodeURIComponent(query)}`);
      const results = await res.json();
      setSearchResults(results);
    } catch (e) {
      console.error('Search failed:', e);
      setSearchResults([]);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

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

  // After Phase 1 killed the ccs-install / welcome sections, the tri-bucket
  // filter (orientation / guided / reference) is dead. The new 6-step
  // structure is a single flat sequence — every section is a step, no
  // featured guided track. All navigation items render as equal-weight
  // cards below.
  const reference = navigation;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={navigation} email={auth.email} onLogout={handleLogout} />

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar (search only — logo is in sidebar) */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 h-14 flex items-center">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0D1F35] focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Search Results Overlay */}
        {searchQuery && (
          <div className="fixed inset-0 z-40 bg-black/50 pt-14" onClick={() => setSearchQuery('')}>
            <div className="max-w-2xl mx-auto mt-4 px-4" onClick={e => e.stopPropagation()}>
              <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto">
                {isSearching ? (
                  <div className="p-6 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.slice(0, 10).map((result) => (
                      <Link
                        key={result.slug}
                        href={`/resources/${result.slug}`}
                        className="block px-4 py-3 hover:bg-gray-50"
                        onClick={() => setSearchQuery('')}
                      >
                        <p className="font-medium text-gray-900">{result.title}</p>
                        <p className="text-sm text-gray-400 mt-0.5 truncate">{result.slug}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">No results found for &quot;{searchQuery}&quot;</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="px-8 py-12 max-w-4xl">
          <div className="mb-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">The System</div>
            <h1 className="text-3xl font-bold text-gray-900">Get set up in 6 steps</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">Everything you need to run an outbound engine that books qualified sales calls. Follow the steps in order — tick each one off as you finish it.</p>
          </div>

          {/* Featured "CCS INSTALL" guided-track card lived here — removed
              in Phase 1 hotfix because it referenced the old 'ccs-install'
              slug which no longer exists. If we want a featured card for
              Step 1 (Start Here) later, re-introduce here. */}

          {/* All 6 steps rendered as equal-weight cards */}
          {reference.length > 0 && (
            <div className="mt-14">
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">The 6 steps</div>
                <h2 className="text-xl font-bold text-gray-900">Pick up where you left off</h2>
                <p className="text-gray-500 mt-1 text-sm max-w-2xl">Everything Matt has published. Jump straight to the section you need.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reference.map((section) => {
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
    </div>
  );
}
