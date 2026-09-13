import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { extractYouTubeId, fetchOEmbed } from '@/lib/youtube';
import { findCategory, insertRecording, readLocalRecordings } from '@/lib/recordings';
import { ALLOWED_CATEGORY_SLUGS } from '@/lib/recording-categories';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (admin.role !== 'super_admin' && !admin.permissions.manage_recordings) {
      return NextResponse.json({ error: 'Not permitted to upload recordings.' }, { status: 403 });
    }

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
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Recording upload failed:', msg);
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'FORBIDDEN' ? 403 : 500;
    const error =
      msg === 'UNAUTHORIZED'
        ? 'Please log in as an admin to add recordings.'
        : msg === 'FORBIDDEN'
          ? 'Not permitted to add recordings.'
          : msg;
    return NextResponse.json({ error }, { status });
  }
}
