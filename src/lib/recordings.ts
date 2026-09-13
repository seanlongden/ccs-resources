import fs from 'fs';
import path from 'path';
import { sql, ensureSchema } from './db';

/**
 * Call Recordings types, category metadata from recordings.json, and
 * published recordings stored in Postgres (call_recordings).
 *
 * Categories stay in JSON. Andrea's uploads go to the database so the
 * live site does not need a GitHub App.
 */

export interface Recording {
  id?: number;
  title: string;
  youtubeId: string;
  date?: string;
  slideDeckUrl?: string;
}

export interface AdminRecording extends Recording {
  id: number;
  categorySlug: string;
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

/** Display as 24 August 2026. Stored value stays YYYY-MM-DD for sorting. */
export function formatRecordingDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Newest recorded date first. Calls with no date sit at the bottom. */
export function sortRecordingsNewestFirst<T extends { date?: string }>(
  recordings: T[],
): T[] {
  return [...recordings].sort((a, b) => {
    const aDate = a.date && /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : '';
    const bDate = b.date && /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : '';
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return bDate.localeCompare(aDate);
  });
}

function dateToIso(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return '';
}

export async function getRecordingsFile(): Promise<RecordingsFile> {
  const file = readLocalRecordings();
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, category_slug, title, youtube_id, recorded_on, slide_deck_url
      FROM call_recordings
    `) as Array<{
      id: number;
      category_slug: string;
      title: string;
      youtube_id: string;
      recorded_on: unknown;
      slide_deck_url: string | null;
    }>;

    const byCat = new Map<string, Recording[]>();
    for (const row of rows) {
      const item: Recording = {
        id: row.id,
        title: row.title,
        youtubeId: row.youtube_id,
        date: dateToIso(row.recorded_on) || undefined,
      };
      if (row.slide_deck_url) item.slideDeckUrl = row.slide_deck_url;
      const list = byCat.get(row.category_slug) ?? [];
      list.push(item);
      byCat.set(row.category_slug, list);
    }

    for (const cat of file.categories) {
      cat.recordings = sortRecordingsNewestFirst(byCat.get(cat.slug) ?? []);
    }
  } catch (e) {
    console.error('getRecordingsFile failed:', e);
  }
  return file;
}

export async function insertRecording(input: {
  categorySlug: string;
  title: string;
  youtubeId: string;
  date: string;
  slideDeckUrl?: string;
  createdBy: string;
}): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO call_recordings (
      category_slug, title, youtube_id, recorded_on, slide_deck_url, created_by
    ) VALUES (
      ${input.categorySlug},
      ${input.title},
      ${input.youtubeId},
      ${input.date},
      ${input.slideDeckUrl ?? null},
      ${input.createdBy}
    )
  `;
}

export async function listAdminRecordings(): Promise<AdminRecording[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT id, category_slug, title, youtube_id, recorded_on, slide_deck_url
    FROM call_recordings
    ORDER BY recorded_on DESC, id DESC
  `) as Array<{
    id: number;
    category_slug: string;
    title: string;
    youtube_id: string;
    recorded_on: unknown;
    slide_deck_url: string | null;
  }>;

  return rows.map((row) => {
    const item: AdminRecording = {
      id: row.id,
      categorySlug: row.category_slug,
      title: row.title,
      youtubeId: row.youtube_id,
      date: dateToIso(row.recorded_on) || undefined,
    };
    if (row.slide_deck_url) item.slideDeckUrl = row.slide_deck_url;
    return item;
  });
}

export async function updateRecording(
  id: number,
  patch: {
    categorySlug?: string;
    title?: string;
    date?: string;
    slideDeckUrl?: string | null;
  },
): Promise<boolean> {
  await ensureSchema();
  const existing = (await sql`
    SELECT id FROM call_recordings WHERE id = ${id} LIMIT 1
  `) as Array<{ id: number }>;
  if (existing.length === 0) return false;

  if (patch.categorySlug !== undefined) {
    await sql`UPDATE call_recordings SET category_slug = ${patch.categorySlug} WHERE id = ${id}`;
  }
  if (patch.title !== undefined) {
    await sql`UPDATE call_recordings SET title = ${patch.title} WHERE id = ${id}`;
  }
  if (patch.date !== undefined) {
    await sql`UPDATE call_recordings SET recorded_on = ${patch.date} WHERE id = ${id}`;
  }
  if (patch.slideDeckUrl !== undefined) {
    await sql`UPDATE call_recordings SET slide_deck_url = ${patch.slideDeckUrl} WHERE id = ${id}`;
  }
  return true;
}

export async function deleteRecording(id: number): Promise<boolean> {
  await ensureSchema();
  const rows = (await sql`
    DELETE FROM call_recordings WHERE id = ${id} RETURNING id
  `) as Array<{ id: number }>;
  return rows.length > 0;
}
