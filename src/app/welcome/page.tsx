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
        <main className="ccs-resource-shell ccs-resource-home max-w-4xl">
          <div className="mb-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Start Here</div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome To Closing Clients System</h1>
            <p className="text-gray-500 mt-3 max-w-2xl">Start with CCS Install. You will build your cold email system one step at a time, using Grok Bot and the CCS instructions. Each step tells you what to do, what to check and when to ask CCS for help.</p>
          </div>
          <div className="space-y-4">
            {[
              ['1', 'Start With CCS Install', 'Set up Grok Bot, add the instructions and build your system in order.', '/resources/ccs-install/welcome'],
              ['2', 'Use CCS Resources When You Need Help', 'Open the lesson, example or template linked from your current Install step.', '/resources/ccs-resources'],
              ['3', 'Use CCS Training After Handover', 'Learn the daily and weekly jobs after your actual system has been checked with CCS.', '/resources/ccs-training/start'],
            ].map(([number,title,detail,href])=><Link key={href} href={href} className="group block bg-white rounded-xl border border-gray-200 p-6 hover:border-[#0D1F35] hover:shadow-md transition-all"><div className="text-xs font-semibold text-slate-400 mb-2">{number}</div><h2 className="text-lg font-bold text-gray-900">{title}</h2><p className="text-sm text-gray-500 mt-2">{detail}</p></Link>)}
          </div>
          <p className="text-sm text-gray-500 mt-8">Already using our done-for-you service? <Link href="/done-for-you" className="font-semibold text-slate-900 underline">Open Your Done-For-You Setup</Link>.</p>
        </main>
      </div>
    </div>
  );
}
