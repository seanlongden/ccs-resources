import Link from 'next/link';
import { readLocalRecordings } from '@/lib/recordings';

export const dynamic = 'force-dynamic';

export default function CallRecordingsHubPage() {
  const file = readLocalRecordings();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Call Recordings</h1>
        <p className="text-sm text-slate-600">
          Recordings from our weekly coaching calls. Browse by category.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {file.categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/call-recordings/${cat.slug}`}
            className="group block rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-900"
          >
            <h2 className="text-lg font-semibold text-slate-900 group-hover:underline">
              {cat.title}
            </h2>
            {cat.description && (
              <p className="mt-1 text-sm text-slate-600">{cat.description}</p>
            )}
            <div className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
              {cat.recordings.length}{' '}
              {cat.recordings.length === 1 ? 'recording' : 'recordings'}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
