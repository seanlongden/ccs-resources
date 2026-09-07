import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readLocalRecordings, findCategory } from '@/lib/recordings';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CallRecordingsCategoryPage({ params }: Props) {
  const { category } = await params;
  const file = readLocalRecordings();
  const cat = findCategory(file, category);
  if (!cat) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/call-recordings" className="hover:underline">
          Call Recordings
        </Link>{' '}
        &rarr; <span className="text-slate-900">{cat.title}</span>
      </nav>

      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">{cat.title}</h1>
        {cat.description && (
          <p className="text-sm text-slate-600">{cat.description}</p>
        )}
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {cat.recordings.length}{' '}
          {cat.recordings.length === 1 ? 'recording' : 'recordings'}
        </div>
      </header>

      {cat.recordings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600">
          No recordings in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cat.recordings.map((r, i) => (
            <a
              key={i}
              href={`https://youtu.be/${r.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              <div
                className="aspect-video bg-slate-100 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://img.youtube.com/vi/${r.youtubeId}/hqdefault.jpg')`,
                }}
              />
              <div className="p-4">
                <div className="text-sm font-medium text-slate-900 group-hover:underline">
                  {r.title}
                </div>
                {r.date && (
                  <div className="mt-1 text-xs text-slate-500">{r.date}</div>
                )}
                {r.slideDeckUrl && (
                  <a
                    href={r.slideDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-slate-500 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Slide deck &rarr;
                  </a>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
