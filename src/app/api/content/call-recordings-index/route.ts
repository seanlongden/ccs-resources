import { NextResponse } from 'next/server';
import { getRecordingsFile, sortRecordingsNewestFirst } from '@/lib/recordings';

interface IndexedRecording {
  title: string;
  youtubeId: string;
  categorySlug: string;
  categoryName: string;
  date?: string;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const file = await getRecordingsFile();
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
  return NextResponse.json({ recordings: sortRecordingsNewestFirst(out) });
}
