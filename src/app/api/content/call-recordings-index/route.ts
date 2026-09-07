import { NextResponse } from 'next/server';
import { readLocalRecordings } from '@/lib/recordings';

interface IndexedRecording {
  title: string;
  youtubeId: string;
  categorySlug: string;
  categoryName: string;
  date?: string;
}

let cache: IndexedRecording[] | null = null;

function buildIndex(): IndexedRecording[] {
  if (cache) return cache;
  const file = readLocalRecordings();
  const out: IndexedRecording[] = [];
  for (const cat of file.categories) {
    for (const r of cat.recordings ?? []) {
      out.push({
        title: r.title,
        youtubeId: r.youtubeId,
        categorySlug: cat.slug,
        categoryName: cat.title,
        date: r.date,
      });
    }
  }
  out.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  cache = out;
  return out;
}

export async function GET() {
  return NextResponse.json({ recordings: buildIndex() });
}
