'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { RECORDING_CATEGORIES } from '@/lib/recording-categories';

interface AdminRecording {
  id: number;
  categorySlug: string;
  title: string;
  youtubeId: string;
  date?: string;
  slideDeckUrl?: string;
}

export default function ManageRecordingsPage() {
  const [recordings, setRecordings] = useState<AdminRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, AdminRecording>>({});

  async function load() {
    setError('');
    const res = await fetch('/api/admin/call-recordings');
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not load recordings.');
      setRecordings([]);
      return;
    }
    const list = (data.recordings ?? []) as AdminRecording[];
    setRecordings(list);
    const next: Record<number, AdminRecording> = {};
    for (const r of list) next[r.id] = { ...r };
    setDrafts(next);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function updateDraft(id: number, patch: Partial<AdminRecording>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  async function save(id: number) {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    setError('');
    try {
      const res = await fetch('/api/admin/call-recordings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: draft.title,
          date: draft.date,
          categorySlug: draft.categorySlug,
          slideDeckUrl: draft.slideDeckUrl ?? '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save.');
        return;
      }
      await load();
    } finally {
      setSavingId(null);
    }
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`Remove "${title}" from the site?`)) return;
    setSavingId(id);
    setError('');
    try {
      const res = await fetch('/api/admin/call-recordings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not remove.');
        return;
      }
      await load();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Manage Call Recordings</h1>
          <p className="text-sm text-slate-600">
            Fix a title or date, move a call to the other list, or remove it.
          </p>
        </div>
        <Link
          href="/admin/call-recordings/new"
          className="text-sm font-medium text-slate-900 underline"
        >
          Add a recording
        </Link>
      </header>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading recordings&hellip;
        </div>
      ) : recordings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          No recordings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {recordings.map((r) => {
            const draft = drafts[r.id] ?? r;
            const busy = savingId === r.id;
            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Title</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={draft.title}
                      onChange={(e) => updateDraft(r.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Date recorded</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={draft.date ?? ''}
                      onChange={(e) => updateDraft(r.id, { date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Category</label>
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={draft.categorySlug}
                      onChange={(e) => updateDraft(r.id, { categorySlug: e.target.value })}
                    >
                      {RECORDING_CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600">
                      Slide deck URL
                    </label>
                    <input
                      type="url"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={draft.slideDeckUrl ?? ''}
                      onChange={(e) => updateDraft(r.id, { slideDeckUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <a
                    href={`https://youtu.be/${r.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 underline"
                  >
                    Open on YouTube
                  </a>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => save(r.id)}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
                    >
                      {busy ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(r.id, draft.title)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
