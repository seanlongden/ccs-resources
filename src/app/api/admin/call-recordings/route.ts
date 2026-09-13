import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { extractYouTubeId, fetchOEmbed } from '@/lib/youtube';
import {
  deleteRecording,
  findCategory,
  insertRecording,
  listAdminRecordings,
  readLocalRecordings,
  updateRecording,
} from '@/lib/recordings';
import { ALLOWED_CATEGORY_SLUGS } from '@/lib/recording-categories';

export const dynamic = 'force-dynamic';

async function requireRecordingsAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== 'super_admin' && !admin.permissions.manage_recordings) {
    throw new Error('FORBIDDEN');
  }
  return admin;
}

function authError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'FORBIDDEN' ? 403 : 500;
  const error =
    msg === 'UNAUTHORIZED'
      ? 'Please log in as an admin to manage recordings.'
      : msg === 'FORBIDDEN'
        ? 'Not permitted to manage recordings.'
        : msg;
  return NextResponse.json({ error }, { status });
}

export async function GET() {
  try {
    await requireRecordingsAdmin();
    const recordings = await listAdminRecordings();
    return NextResponse.json({ recordings });
  } catch (e: unknown) {
    console.error('List recordings failed:', e);
    return authError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRecordingsAdmin();

    const body = (await req.json()) as {
      youtubeUrl?: string;
      categorySlug?: string;
      title?: string;
      date?: string;
      slideDeckUrl?: string;
    };

    const youtubeUrl = (body.youtubeUrl ?? '').trim();
    const categorySlug = (body.categorySlug ?? '').trim();
    const date = (body.date ?? '').trim();
    const slideDeckUrl = (body.slideDeckUrl ?? '').trim();

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'YouTube URL is required.' }, { status: 400 });
    }
    if (!categorySlug || !ALLOWED_CATEGORY_SLUGS.has(categorySlug)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }
    if (!findCategory(readLocalRecordings(), categorySlug)) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 400 });
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return NextResponse.json({ error: 'Could not parse a YouTube ID from that URL.' }, { status: 400 });
    }

    let title = (body.title ?? '').trim();
    if (!title) {
      const meta = await fetchOEmbed(youtubeId);
      title = meta?.title ?? 'Untitled recording';
    }

    if (!date) {
      return NextResponse.json({ error: 'Date recorded is required.' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Date must be YYYY-MM-DD.' }, { status: 400 });
    }

    await insertRecording({
      categorySlug,
      title,
      youtubeId,
      date,
      slideDeckUrl: slideDeckUrl || undefined,
      createdBy: admin.email,
    });

    return NextResponse.json({
      ok: true,
      categoryUrl: `/resources/call-recordings/${categorySlug}`,
      youtubeId,
      title,
    });
  } catch (e: unknown) {
    console.error('Recording upload failed:', e);
    return authError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRecordingsAdmin();
    const body = (await req.json()) as {
      id?: number;
      categorySlug?: string;
      title?: string;
      date?: string;
      slideDeckUrl?: string | null;
    };
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: 'Recording id is required.' }, { status: 400 });
    }

    const patch: {
      categorySlug?: string;
      title?: string;
      date?: string;
      slideDeckUrl?: string | null;
    } = {};

    if (body.categorySlug !== undefined) {
      const categorySlug = body.categorySlug.trim();
      if (!ALLOWED_CATEGORY_SLUGS.has(categorySlug)) {
        return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
      }
      patch.categorySlug = categorySlug;
    }
    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
      patch.title = title;
    }
    if (body.date !== undefined) {
      const date = body.date.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Date must be YYYY-MM-DD.' }, { status: 400 });
      }
      patch.date = date;
    }
    if (body.slideDeckUrl !== undefined) {
      const slide = (body.slideDeckUrl ?? '').trim();
      patch.slideDeckUrl = slide || null;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const ok = await updateRecording(id, patch);
    if (!ok) return NextResponse.json({ error: 'Recording not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('Update recording failed:', e);
    return authError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRecordingsAdmin();
    const body = (await req.json()) as { id?: number };
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: 'Recording id is required.' }, { status: 400 });
    }
    const ok = await deleteRecording(id);
    if (!ok) return NextResponse.json({ error: 'Recording not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('Delete recording failed:', e);
    return authError(e);
  }
}
