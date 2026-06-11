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

const SECTION_ICONS: Record<string, string> = {
  'welcome': '👋',
  'ccs-install': '🚀',
  'key-resources': '⭐',
  'your-offer-gtm': '🎯',
  'system-build': '🔨',
  'cold-email-execution': '📬',
  'inbox-pipeline': '📥',
  'sales': '🤝',
  'onboard-clients': '🎁',
  'scaling': '📈',
};

const ORIENTATION_SLUGS = ['welcome'];
const GUIDED_SLUGS = ['ccs-install'];

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
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="text-base flex-shrink-0">{SECTION_ICONS[section.slug] || '📄'}</span>
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

        <nav className="flex-1 py-2 overflow-y-auto">
          {orientation.length > 0 && (
            <>
              <SectionLabel>Get Oriented</SectionLabel>
              {orientation.map(s => <SidebarLink key={s.slug} section={s} />)}
            </>
          )}

          {guided.length > 0 && (
            <>
              <SectionLabel>Your Guided Path</SectionLabel>
              {guided.map(s => <SidebarLink key={s.slug} section={s} accent />)}
            </>
          )}

          {reference.length > 0 && (
            <>
              <SectionLabel>Reference Library</SectionLabel>
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
        <main className="px-8 py-10 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Closing Clients System</h1>
            <p className="text-gray-500 mt-1">Your guided path + reference library.</p>
          </div>

          {/* CCS INSTALL — Featured guided track card */}
          {guided.length > 0 && (
            <div className="mb-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">Your Guided Path</div>
              {guided.map((section) => (
                <Link
                  key={section.slug}
                  href={`/resources/${section.slug}`}
                  className="block group relative bg-white rounded-2xl border-2 border-[#5eea8d] p-7 hover:shadow-lg transition-all duration-150"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(94,234,141,0.04) 0%, rgba(75,171,245,0.04) 100%)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5eea8d] to-[#4babf5] flex items-center justify-center text-2xl shadow-md">
                        {SECTION_ICONS[section.slug]}
                      </div>
                      <div>
                        <div className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-emerald-700 mb-0.5">Guided Track</div>
                        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                      {section.children?.length ?? 0} modules
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 max-w-2xl">
                    {section.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
                    Start the Install
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Welcome — small banner */}
          {orientation.length > 0 && orientation.map((section) => (
            <div key={section.slug} className="mb-10">
              <Link
                href={`/resources/${section.slug}`}
                className="group flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#0D1F35] hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{SECTION_ICONS[section.slug] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Get Oriented</span>
                  </div>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}

          {/* Reference Library grid */}
          {reference.length > 0 && (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">Reference Library</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reference.map((section) => (
                  <Link
                    key={section.slug}
                    href={`/resources/${section.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-[#0D1F35] hover:shadow-md transition-all duration-150"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{SECTION_ICONS[section.slug] || '📄'}</span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">
                        {section.children?.length ?? 0} {(section.children?.length === 1) ? 'page' : 'pages'}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 group-hover:text-[#0D1F35] mb-1">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {section.description}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
