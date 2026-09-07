/**
 * Call Recordings data types + local-filesystem reader.
 *
 * The canonical store is `content/recordings.json` in the repo. The admin
 * upload API commits to it via the GitHub App; server components read the
 * shipped copy from disk. Both surfaces share these types.
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

/**
 * Read the on-disk recordings file. Server components use this; the admin
 * POST route uses GitHub App reads instead so it can commit atomically.
 */
export function readLocalRecordings(): RecordingsFile {
  // Deferred import so Next.js doesn't try to bundle `fs` into client code.
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
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
