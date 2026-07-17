'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Settings, Mail, Send, Handshake, TrendingUp,
  ChevronsLeft, ChevronsRight,
  LogOut, FileText, Folder, ExternalLink, Wrench,
  Search, X, Loader2,
  type LucideIcon,
} from 'lucide-react';

interface SidebarSearchResult {
  pageSlug: string;
  anchor: string;
  heading: string;
  snippet: string;
  breadcrumb: string[];
  pageTitle: string;
}

export interface NavItem {
  title: string;
  slug: string;
  fullSlug?: string;
  group?: 'main-modules';
  icon?: string;
  order?: number;
  description?: string;
  children?: NavItem[];
}

export const ICON_MAP: Record<string, LucideIcon> = {
  home: Home, settings: Settings, mail: Mail, send: Send,
  handshake: Handshake, trending: TrendingUp, folder: Folder,
};

export interface AuthData {
  authenticated: boolean;
  email?: string;
  status?: string;
}

export type GroupKey = 'main-modules';

export const SECTION_META: Record<string, {
  group: GroupKey;
  icon: LucideIcon;
  description: string;
  order: number;
}> = {
  'start-here': { group: 'main-modules', icon: Home, order: 1, description: "A 5-minute overview of the Closing Clients System so you know what you're building." },
  'setup': { group: 'main-modules', icon: Settings, order: 2, description: 'Buy and configure Instantly, leads, inboxes, warm-up. Text-only — no video needed per step.' },
  'offer-and-email': { group: 'main-modules', icon: Mail, order: 3, description: 'Craft the offer, write the email, get both reviewed before you launch.' },
  'launch-and-replies': { group: 'main-modules', icon: Send, order: 4, description: 'Send campaigns, manage inboxes, handle every reply type.' },
  'close-and-onboard': { group: 'main-modules', icon: Handshake, order: 5, description: 'Sales call playbook, contracts, onboarding new clients.' },
  'scale': { group: 'main-modules', icon: TrendingUp, order: 6, description: 'Hire, systemise, and grow beyond what you can run yourself.' },
};

export const LEGACY_SLUGS = new Set<string>([]);

export const GROUP_LABELS: Record<GroupKey, string> = {
  'main-modules': 'The 6 Steps',
};

export function resolveSectionGroup(s: NavItem): GroupKey | 'legacy' | undefined {
  if (s.group) return s.group;
  const meta = SECTION_META[s.slug];
  if (meta) return meta.group;
  if (LEGACY_SLUGS.has(s.slug)) return 'legacy';
  return undefined;
}

export function resolveSectionIcon(s: NavItem): LucideIcon {
  if (s.icon && ICON_MAP[s.icon]) return ICON_MAP[s.icon];
  const meta = SECTION_META[s.slug];
  if (meta) return meta.icon;
  return Folder;
}

export function resolveSectionOrder(s: NavItem): number {
  if (s.order !== undefined) return s.order;
  return SECTION_META[s.slug]?.order ?? 99;
}

export function resolveSectionDescription(s: NavItem): string {
  if (s.description) return s.description;
  return SECTION_META[s.slug]?.description ?? '';
}

// Re-exported so pages can render the section icon in cards without
// duplicating the resolveSectionIcon lookup.
export function SectionIcon({ slug, className }: { slug: string; className?: string }) {
  const meta = SECTION_META[slug];
  const Icon = meta?.icon ?? Folder;
  return <Icon className={className} strokeWidth={1.75} />;
}

export function useNavGrouped(navigation: NavItem[]) {
  return useMemo(() => {
    const grouped: Record<GroupKey, NavItem[]> = { 'main-modules': [] };
    const legacy: NavItem[] = [];
    for (const s of navigation) {
      const g = resolveSectionGroup(s);
      if (g === 'main-modules') grouped[g].push(s);
      else if (g === 'legacy') legacy.push(s);
    }
    (Object.keys(grouped) as GroupKey[]).forEach(k => {
      grouped[k].sort((a, b) => resolveSectionOrder(a) - resolveSectionOrder(b));
    });
    return { newGrouped: grouped, legacy };
  }, [navigation]);
}

interface SidebarProps {
  navigation: NavItem[];
  auth: AuthData;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  navigation, auth, onLogout, collapsed, onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { newGrouped } = useNavGrouped(navigation);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SidebarSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (e) {
      console.error('Sidebar search failed:', e);
      setSearchResults([]);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => performSearch(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [searchOpen]);

  const handleResultClick = useCallback((pageSlug: string, anchor: string) => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    router.push(`/resources/${pageSlug}${anchor ? '#' + anchor : ''}`);
  }, [router]);

  const activeSlug = pathname?.startsWith('/resources/') ? pathname.slice('/resources/'.length) : '';

  function isActive(fullSlug: string | undefined) {
    if (!activeSlug || !fullSlug) return false;
    return activeSlug === fullSlug || activeSlug.startsWith(fullSlug + '/');
  }

  const widthClass = collapsed ? 'w-16' : 'w-72';

  return (
    <aside className={`${widthClass} bg-[#0D1F35] text-white border-r border-black/20 flex flex-col h-screen sticky top-0 transition-[width] duration-150`}>
      {/* Brand + collapse toggle */}
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
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 shrink-0 ${collapsed ? 'absolute -right-3 top-5 bg-[#0D1F35] border border-white/10 shadow' : ''}`}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Library search (only visible when sidebar expanded). */}
      {!collapsed && (
        <div ref={searchContainerRef} className="relative px-3 pt-3 pb-1">
          <Search className="absolute left-[22px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search resources..."
            aria-label="Search resources"
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-white/25"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              aria-label="Clear search"
              className="absolute right-[18px] top-1/2 -translate-y-1/2 p-0.5 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute left-3 right-3 top-full mt-1 z-20 bg-white text-slate-900 rounded-md shadow-lg border border-slate-200 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-500">No matches.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {searchResults.slice(0, 12).map((r, idx) => (
                    <li key={`${r.pageSlug}-${r.anchor}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => handleResultClick(r.pageSlug, r.anchor)}
                        className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" strokeWidth={1.5} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-900 truncate">{r.heading}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {r.breadcrumb.join(' › ')}
                          </div>
                          {r.snippet && (
                            <div
                              className="text-[10px] text-slate-600 mt-1 line-clamp-3 leading-snug ccg-search-snippet"
                              dangerouslySetInnerHTML={{ __html: r.snippet }}
                            />
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Nav groups */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2 space-y-2' : 'px-3 space-y-5'}`}>
        {(['main-modules'] as GroupKey[]).map((g) => (
          newGrouped[g].length > 0 && (
            <div key={g}>
              {!collapsed && (
                <div className="px-2 mb-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  {GROUP_LABELS[g]}
                </div>
              )}
              <div className="space-y-0.5">
                {newGrouped[g].map((s) => {
                  const Icon = resolveSectionIcon(s);
                  const active = isActive(s.fullSlug || s.slug);
                  return (
                    <Link
                      key={s.slug}
                      href={`/resources/${s.fullSlug || s.slug}`}
                      title={collapsed ? s.title : undefined}
                      className={`flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-2'} py-1.5 text-sm rounded-md ${
                        active ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-white/60'} shrink-0`} strokeWidth={1.75} />
                      {!collapsed && <span className="truncate flex-1">{s.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )
        ))}

        {/* External: CCS Tools hub (tools.closingclientssystem.com). */}
        <div>
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Tools
            </div>
          )}
          <a
            href="https://tools.closingclientssystem.com"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'CCS Tools' : undefined}
            className={`flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-2'} py-1.5 text-sm rounded-md text-white/85 hover:bg-white/10 hover:text-white`}
          >
            <Wrench className="w-4 h-4 text-white/60 shrink-0" strokeWidth={1.75} />
            {!collapsed && (
              <>
                <span className="truncate flex-1">CCS Tools</span>
                <ExternalLink className="w-3 h-3 text-white/40 shrink-0" strokeWidth={2} />
              </>
            )}
          </a>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 px-3 py-3 space-y-2">
        {!collapsed && (
          <div className="px-1">
            <div className="text-xs font-medium text-white/85 truncate">{auth.email}</div>
            <div className="mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                auth.status === 'lifetime' ? 'bg-purple-400/20 text-purple-200' :
                auth.status === 'trialing' ? 'bg-blue-400/20 text-blue-200' :
                auth.status === 'active' ? 'bg-emerald-400/20 text-emerald-200' :
                'bg-white/10 text-white/60'
              }`}>
                {auth.status === 'lifetime' ? 'Lifetime' :
                 auth.status === 'trialing' ? 'Trial' :
                 auth.status === 'active' ? 'Active' : 'Member'}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-2 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-md ${collapsed ? 'justify-center px-2' : 'px-2'}`}
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// Default export for backwards-compat with existing imports.
export default Sidebar;
