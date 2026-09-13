'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { loginUrl } from '@/lib/safe-next';

export default function CallRecordingsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (cancelled) return;
        if (res.status === 401) {
          router.replace(loginUrl(pathname));
          return;
        }
        if (!res.ok) {
          setDenied(true);
          setReady(true);
          return;
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setDenied(true);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking admin login&hellip;</p>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Admin access needed</h1>
          <p className="mt-2 text-sm text-slate-600">
            Log in with the email that was added to the admin list, then open this page again.
          </p>
          <a
            href={loginUrl(pathname)}
            className="mt-4 inline-block text-sm font-medium text-slate-900 underline"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
