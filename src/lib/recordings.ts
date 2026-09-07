import fs from 'fs';
import path from 'path';

/**
 * Call Recordings data types + local-filesystem reader.
 *
 * The canonical store is `content/recordings.json` in the repo. The admin
 * upload API commits to it via the GitHub App; server components read the
 * shipped copy from disk. Both surfaces share these types.
 *
 * `fs`/`path` are imported at the top level because every current caller
 * of `readLocalRecordings()` is a server-only route or server component.
 * If any client component ever imports this file it must NOT call
 * `readLocalRecordings()` — types + `RECORDINGS_FILE` are safe.
 */

export interface Recording {
  title: string;
  youtubeId: string;
  date?: string;
  slideDeckUrl?: string;
}

export interface RecordingCategory {
  slug: string;
  title: string;
  description?: string;
  recordings: Recording[];
}

export interface RecordingsFile {
  categories: RecordingCategory[];
}

export const RECORDINGS_FILE = 'content/recordings.json';

export function readLocalRecordings(): RecordingsFile {
  try {
    const p = path.join(process.cwd(), 'content', 'recordings.json');
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as RecordingsFile;
  } catch (e) {
    console.error('readLocalRecordings failed:', e);
    return { categories: [] };
  }
}

export function findCategory(
  file: RecordingsFile,
  slug: string,
): RecordingCategory | null {
  return file.categories.find((c) => c.slug === slug) ?? null;
}
