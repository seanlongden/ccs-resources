'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

const ORIENTATION_SLUGS = ['welcome'];
const GUIDED_SLUGS = ['ccs-install'];

// Clean line-icon set (Lucide-style, inline). 24×24 viewBox, currentColor.
const ICON_PATHS: Record<string, React.ReactNode> = {
  'welcome': (
    <path d="M3 9l9-6 9 6v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V9z" />
  ),
  'key-resources': (
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
  ),
  'set-up': (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
  'offers-guarantees-case-studies': (
    <>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </>
  ),
  'cold-email': (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  'sales': (
    <>
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </>
  ),
  'onboarding': (
    <>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </>
  ),
  'hiring-team': (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  'operations-scaling': (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),
};

function SectionIcon({ slug, className }: { slug: string; className?: string }) {
  // CCS Install uses the actual brand mark (PNG) instead of a line icon
  if (slug === 'ccs-install') {
    return <img src="/icon.png" alt="" className={className} />;
  }
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

  const orientation = navigation.filter(s => ORIENTATION_SLUGS.includes(s.slug));
  const guided = navigation.filter(s => GUIDED_SLUGS.includes(s.slug));
  const reference = navigation.filter(s => !ORIENTATION_SLUGS.includes(s.slug) && !GUIDED_SLUGS.includes(s.slug));

  const SidebarLink = ({ section, accent }: { section: NavSection; accent?: boolean }) => (
    <Link
      href={`/resources/${section.slug}`}
      className={`flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${
        accent
          ? 'text-white font-semibold bg-gradient-to-r from-[#5eea8d]/10 to-[#4babf5]/10 border-l-2 border-[#5eea8d] hover:from-[#5eea8d]/15 hover:to-[#4babf5]/15'
          : 'text-white/65 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent'
      }`}
    >
      <span className="flex items-center gap-3 min-w-0">
        <SectionIcon
          slug={section.slug}
          className={
            section.slug === 'ccs-install'
              ? 'w-[18px] h-[18px] object-contain flex-shrink-0'
              : 'w-[18px] h-[18px] flex-shrink-0 opacity-70'
          }
        />
        <span className="truncate">{section.title}</span>
      </span>
    </Link>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="px-5 pt-5 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/35">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D1F35] text-white sticky top-0 h-screen overflow-y-auto flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
          <img src="/icon.png" alt="CCS" className="w-7 h-7 object-contain" />
          <span className="font-semibold text-sm tracking-tight">Closing Clients System</span>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {orientation.length > 0 && orientation.map(s => <SidebarLink key={s.slug} section={s} />)}

          {guided.length > 0 && (
            <>
              <div className="my-3 mx-5 border-t border-white/10"></div>
              {guided.map(s => <SidebarLink key={s.slug} section={s} accent />)}
            </>
          )}

          {reference.length > 0 && (
            <>
              <div className="my-3 mx-5 border-t border-white/10"></div>
              <SectionLabel>Browse</SectionLabel>
              {reference.map(s => <SidebarLink key={s.slug} section={s} />)}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="text-xs text-white/40 truncate">{auth.email}</div>
          <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white mt-1.5">
            Logout
          </button>
        </div>
      </aside>

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
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Start here</div>
            <h1 className="text-3xl font-bold text-gray-900">Install your Closing Clients System</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">Work through the 5 modules in order. Each module unlocks what you need for the next phase. Tick steps off as you complete them.</p>
          </div>

          {/* CCS INSTALL — Featured guided track card */}
          {guided.length > 0 && guided.map((section) => (
            <Link
              key={section.slug}
              href={`/resources/${section.slug}`}
              className="block group relative bg-white rounded-2xl border-2 border-[#5eea8d] p-8 hover:shadow-xl transition-all duration-150"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(94,234,141,0.05) 0%, rgba(75,171,245,0.05) 100%)'
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                    <img src="/icon.png" alt="CCS" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-emerald-700 mb-1">Guided Track</div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  {section.children?.length ?? 0} modules
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-5 max-w-2xl">
                {section.description}
              </p>

              {/* Module preview — 5 step indicators */}
              {section.children && section.children.length > 0 && (
                <div className="mb-6 space-y-2">
                  {section.children.map((module, i) => (
                    <div key={module.slug} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-semibold">
                        {i + 1}
                      </div>
                      <span className="text-gray-700">{module.title}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="inline-flex items-center gap-2 bg-emerald-700 group-hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Start the Install
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}

          {/* Reference library — all real-content sections */}
          {reference.length > 0 && (
            <div className="mt-14">
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Reference library</div>
                <h2 className="text-xl font-bold text-gray-900">Browse by topic</h2>
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
