'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { Sidebar, type NavItem, type AuthData } from '@/components/Sidebar';
import { renderContent, findSiblings, type NavLite } from '@/lib/content-renderer';
import LessonView from '@/components/LessonView';
import navigationData from '../../../../content/navigation.json';

type AccessLevel = 'free' | 'trial' | 'active' | 'lifetime';
type UserStatus = 'active' | 'trialing' | 'canceled_with_access' | 'lifetime' | 'no_subscription';

interface GatingInfo {
  requiredLevel: AccessLevel;
  reason?: string;
}

interface PageData {
  title: string;
  slug: string;
  fullSlug: string;
  content: string;
  isSection?: boolean;
  children?: { title: string; fullSlug: string }[];
  gating?: GatingInfo;
}

interface NavChild {
  title: string;
  slug: string;
  fullSlug?: string;
  type?: string;
  childCount?: number;
  description?: string;
  children?: NavChild[];
}

interface NavSection {
  title: string;
  slug: string;
  fullSlug?: string;
  description?: string;
  children?: NavChild[];
}

const TOP_LEVEL_SLUGS = new Set((navigationData as NavSection[]).map(s => s.slug));
const SIDEBAR_KEY = 'ccs_sidebar_collapsed';
const RECENTS_KEY = 'ccs_recently_viewed';

function hasAccess(userStatus: UserStatus | undefined, requiredLevel: AccessLevel): boolean {
  if (requiredLevel === 'free') return true;
  if (!userStatus || userStatus === 'no_subscription') return false;
  const statusToLevel: Record<UserStatus, number> = {
    'no_subscription': 0, 'trialing': 1, 'canceled_with_access': 2, 'active': 3, 'lifetime': 4,
  };
  const levelToNumber: Record<AccessLevel, number> = {
    'free': 0, 'trial': 1, 'active': 3, 'lifetime': 4,
  };
  return statusToLevel[userStatus] >= levelToNumber[requiredLevel];
}

function getLockedMessage(requiredLevel: AccessLevel): string {
  switch (requiredLevel) {
    case 'active': return 'This content is available for active members only.';
    case 'lifetime': return 'This content is exclusive to lifetime members.';
    default: return 'Please log in to access this content.';
  }
}

export default function ResourcePage() {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [page, setPage] = useState<PageData | null>(null);
  const [section, setSection] = useState<NavSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const params = useParams();

  const slugParts = params.slug as string[];
  const fullSlug = slugParts ? slugParts.join('/') : '';
  const isTopLevelSection = TOP_LEVEL_SLUGS.has(fullSlug);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const collapsed = window.localStorage.getItem(SIDEBAR_KEY) === '1';
      setSidebarCollapsed(collapsed);
    } catch { /* ignore */ }
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

      if (isTopLevelSection) {
        try {
          const navRes = await fetch('/api/content/navigation');
          const navData: NavSection[] = await navRes.json();
          const found = navData.find(s => s.slug === fullSlug);
          if (found) {
            const onlyChild = found.children?.length === 1 ? found.children[0] : null;
            if (onlyChild?.fullSlug) {
              router.replace(`/resources/${onlyChild.fullSlug}`);
              return;
            }
            setSection(found);
          } else {
            setError('Section not found');
          }
        } catch (e) {
          console.error('Failed to load section:', e);
          setError('Failed to load section');
        }
      } else {
        try {
          const pageRes = await fetch(`/api/content/page?slug=${encodeURIComponent(fullSlug)}`);
          if (!pageRes.ok) {
            setError('Page not found');
            setLoading(false);
            return;
          }
          const pageData = await pageRes.json();
          setPage(pageData);
        } catch (e) {
          console.error('Failed to load page:', e);
          setError('Failed to load page');
        }
      }

      setLoading(false);
    }
    init();
  }, [router, fullSlug, isTopLevelSection]);

  // Track visit in recents (localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (error || !fullSlug) return;
    const title = page?.title ?? section?.title;
    if (!title) return;
    try {
      const raw = window.localStorage.getItem(RECENTS_KEY);
      const current = raw ? (JSON.parse(raw) as { slug: string; title: string; ts: number }[]) : [];
      const filtered = current.filter((r) => r.slug !== fullSlug);
      const next = [{ slug: fullSlug, title, ts: Date.now() }, ...filtered].slice(0, 5);
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  }, [page, section, error, fullSlug]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  };

  // Ancestor breadcrumb + prev/next siblings (CCG pattern)
  const siblings = useMemo(() => {
    if (!fullSlug) return { parents: [] };
    return findSiblings(navigationData as unknown as NavLite[], fullSlug);
  }, [fullSlug]);

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

  const currentTitle = section?.title ?? page?.title;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        navigation={navigationData as unknown as NavItem[]}
        auth={auth}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 pt-8 pb-12">
          {/* Breadcrumb — Home + ancestor chain + current title */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0 mb-8" aria-label="Breadcrumb">
            <Link href="/resources" className="flex items-center gap-1 hover:text-slate-900">
              <Home className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Resources</span>
            </Link>
            {(siblings.parents ?? []).map((p) => (
              <span key={p.fullSlug} className="flex items-center gap-1.5 min-w-0">
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" strokeWidth={1.75} />
                <Link href={`/resources/${p.fullSlug}`} className="hover:text-slate-900 truncate max-w-[180px]">
                  {p.title}
                </Link>
              </span>
            ))}
            {currentTitle && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" strokeWidth={1.75} />
                <span className="text-slate-900 font-medium truncate max-w-[280px]">{currentTitle}</span>
              </>
            )}
          </nav>

          {section && !error && (
            <SectionLanding section={section} />
          )}

          {page && !error && (
            <ContentPage page={page} auth={auth} />
          )}

          {error && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Page not found</h3>
              <p className="text-sm text-slate-500 mb-6">The resource you are looking for does not exist or has been moved.</p>
              <Link href="/resources" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1F35] text-white rounded-lg hover:bg-[#1a3a5c] text-sm font-medium">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                Back to Resources
              </Link>
            </div>
          )}

          {/* Ancestor-based Prev/Next (only on content pages, not section landings) */}
          {page && !error && (siblings.prev || siblings.next) && (
            <nav className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-3">
              {siblings.prev ? (
                <Link
                  href={`/resources/${siblings.prev.fullSlug}`}
                  className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-400 group"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-wider text-slate-400 uppercase">Previous</div>
                    <div className="text-sm font-medium text-slate-900 truncate">{siblings.prev.title}</div>
                  </div>
                </Link>
              ) : <div />}
              {siblings.next ? (
                <Link
                  href={`/resources/${siblings.next.fullSlug}`}
                  className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-400 group text-right justify-end"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-wider text-slate-400 uppercase">Next</div>
                    <div className="text-sm font-medium text-slate-900 truncate">{siblings.next.title}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                </Link>
              ) : <div />}
            </nav>
          )}
        </div>
      </main>
    </div>
  );
}

function SectionLanding({ section }: { section: NavSection }) {
  return (
    <article>
      <header className="border-b border-slate-200" style={{ paddingBottom: '22px', marginBottom: '24px' }}>
        <h1
          className="text-slate-900 m-0"
          style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '10px' }}
        >
          {section.title}
        </h1>
        {section.description && (
          <p className="text-slate-500 m-0" style={{ fontSize: '14px', maxWidth: '580px' }}>
            {section.description}
          </p>
        )}
      </header>

      <SectionChildren items={section.children || []} />
    </article>
  );
}

function SectionChildren({ items }: { items: NavChild[] }) {
  const hasGroups = items.some(c => c.type === 'group');

  if (hasGroups) {
    return (
      <div className="space-y-8">
        {items.filter(c => c.type === 'group').map((group) => (
          <div key={group.slug}>
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#0D1F35] rounded-full inline-block"></span>
              {group.title}
            </h2>
            <NumberedCardList items={group.children || []} />
          </div>
        ))}
      </div>
    );
  }

  // Handle dividers as segments
  const segments: Array<{ dividerTitle?: string; items: NavChild[] }> = [];
  let currentSegment: NavChild[] = [];

  for (const child of items) {
    if (child.type === 'divider') {
      if (currentSegment.length > 0 || segments.length === 0) {
        segments.push({ items: currentSegment });
        currentSegment = [];
      }
      const label = child.title?.replace(/^---\s*/, '').replace(/\s*---$/, '').trim();
      segments.push({ dividerTitle: label, items: [] });
    } else {
      currentSegment.push(child);
    }
  }
  if (currentSegment.length > 0) {
    if (segments.length === 0) segments.push({ items: currentSegment });
    else segments[segments.length - 1].items = [...segments[segments.length - 1].items, ...currentSegment];
  }

  return (
    <div className="space-y-8">
      {segments.filter(s => s.items.length > 0 || s.dividerTitle).map((seg, si) => (
        <div key={si}>
          {seg.dividerTitle && (
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#0D1F35] rounded-full inline-block"></span>
              {seg.dividerTitle}
            </h2>
          )}
          {seg.items.length > 0 && <NumberedCardList items={seg.items} />}
        </div>
      ))}
    </div>
  );
}

/** ModuleLanding-style numbered card list. Matches CCG's .ccg-ml-row spec + mockup. */
function NumberedCardList({ items }: { items: NavChild[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const num = String(i + 1).padStart(2, '0');
        const isSection = item.type === 'section' && !!item.childCount;
        return (
          <Link
            key={item.fullSlug || item.slug}
            href={`/resources/${item.fullSlug || item.slug}`}
            className="group grid items-center bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:-translate-y-px transition-all no-underline"
            style={{ gridTemplateColumns: '56px 1fr auto', gap: '18px', padding: '16px 22px 16px 18px' }}
          >
            <div
              className="text-center border-r border-slate-200 py-1.5 text-slate-400"
              style={{ fontFamily: "'SF Mono', Monaco, Menlo, monospace", fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em' }}
            >
              {num}
            </div>
            <div className="min-w-0">
              <h3
                className="text-slate-900 m-0"
                style={{ fontSize: '15px', fontWeight: 700, marginBottom: item.description ? '3px' : 0 }}
              >
                {item.title}
              </h3>
              {item.description && (
                <p className="text-slate-500 m-0" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isSection && (
                <span
                  className="text-blue-700 bg-blue-50 rounded-full shrink-0 whitespace-nowrap"
                  style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', padding: '3px 10px' }}
                >
                  {item.childCount} lessons
                </span>
              )}
              <span className="text-slate-300 group-hover:text-slate-700 shrink-0" style={{ fontSize: '14px' }}>→</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ContentPage({ page, auth }: { page: PageData; auth: AuthData }) {
  if (page.gating && !hasAccess(auth?.status as UserStatus | undefined, page.gating.requiredLevel)) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{page.title}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{page.gating.reason || getLockedMessage(page.gating.requiredLevel)}</p>
      </div>
    );
  }

  const { html } = renderContent(page.content, page.title);

  if (page.isSection && page.children && page.children.length > 0) {
    return (
      <article>
        <header className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
        </header>
        <section className="mb-10">
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-3">In this section</div>
          <NumberedCardList items={page.children.map((c) => ({ title: c.title, slug: c.fullSlug, fullSlug: c.fullSlug }))} />
        </section>
      </article>
    );
  }

  return <LessonView title={page.title} html={html} />;
}
