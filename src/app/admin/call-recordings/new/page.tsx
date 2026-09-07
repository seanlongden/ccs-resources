'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

// MVP: one category. Add new entries here + in ALLOWED_CATEGORIES on the
// POST route (src/app/api/admin/call-recordings/route.ts) + in
// content/recordings.json when new categories are launched.
const CATEGORIES = [
  { slug: 'coaching-calls', name: 'Coaching Calls' },
];

interface Preview {
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
}

export default function NewRecordingPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState('coaching-calls');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slideDeckUrl, setSlideDeckUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ url: string; title: string } | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Debounced preview fetch when URL changes
  useEffect(() => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) {
      setPreview(null);
      setPreviewError('');
      return;
    }
    setPreviewLoading(true);
    setPreviewError('');
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/call-recordings/preview?url=${encodeURIComponent(trimmed)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          setPreview(null);
          setPreviewError(data.error || 'Could not load preview.');
        } else {
          setPreview({
            youtubeId: data.youtubeId,
            title: data.title,
            thumbnailUrl: data.thumbnailUrl,
          });
          if (!title || !title.trim()) setTitle(data.title);
        }
      } catch {
        setPreview(null);
        setPreviewError('Network error fetching preview.');
      } finally {
        setPreviewLoading(false);
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeUrl]);

  const canSubmit = useMemo(() => {
    return !!preview && !!title.trim() && !!categorySlug && !submitting;
  }, [preview, title, categorySlug, submitting]);

  async function submit() {
    setSubmitting(true);
    setSubmitError('');
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/call-recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          categorySlug,
          title: title.trim(),
          date: date.trim() || undefined,
          slideDeckUrl: slideDeckUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Upload failed.');
      } else {
        setSuccess({ url: data.categoryUrl, title: data.title });
        setYoutubeUrl('');
        setPreview(null);
        setTitle('');
        setSlideDeckUrl('');
      }
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Add a Call Recording</h1>
        <p className="text-sm text-slate-600">
          Paste a YouTube URL. The recording appears on the public page as soon as the
          site rebuilds (~60&ndash;90s).
        </p>
      </header>

      <section className="space-y-2">
        <label className="block text-sm font-medium text-slate-900">YouTube URL</label>
        <input
          type="url"
          placeholder="https://youtu.be/..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        {previewLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading preview&hellip;
          </div>
        )}
        {previewError && (
          <div className="flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle className="h-3 w-3" /> {previewError}
          </div>
        )}
        {preview && (
          <div className="mt-3 flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <img
              src={preview.thumbnailUrl}
              alt=""
              className="h-24 w-40 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-900">
                {preview.title || '(no title)'}
              </div>
              <div className="mt-1 truncate text-xs text-slate-500">
                YouTube ID: {preview.youtubeId}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <label className="block text-sm font-medium text-slate-900">Title</label>
        <input
          type="text"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Auto-filled from YouTube; override if needed."
        />
      </section>

      <section className="space-y-2">
        <label className="block text-sm font-medium text-slate-900">Category</label>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-900">Date recorded</label>
          <input
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-900">
            Slide deck URL <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="url"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={slideDeckUrl}
            onChange={(e) => setSlideDeckUrl(e.target.value)}
            placeholder="https://docs.google.com/..."
          />
        </div>
      </section>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading&hellip;
            </span>
          ) : (
            'Publish recording'
          )}
        </button>
        {submitError && (
          <div className="flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle className="h-3 w-3" /> {submitError}
          </div>
        )}
      </div>

      {success && (
        <div className="mt-2 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div className="text-sm text-emerald-900">
            <div className="font-semibold">Published: {success.title}</div>
            <a
              href={success.url}
              className="mt-1 inline-block text-emerald-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View the category page &rarr;
            </a>
            <div className="mt-1 text-xs text-emerald-700">
              The site will rebuild in ~60&ndash;90s and the recording will appear.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
