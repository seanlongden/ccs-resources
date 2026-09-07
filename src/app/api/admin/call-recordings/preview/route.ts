import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { extractYouTubeId, fetchOEmbed } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (admin.role !== 'super_admin' && !admin.permissions.manage_recordings) {
      return NextResponse.json({ error: 'Not permitted.' }, { status: 403 });
    }

    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      return NextResponse.json(
        { error: 'Could not parse a YouTube ID from that URL.' },
        { status: 400 },
      );
    }

    const meta = await fetchOEmbed(youtubeId);
    return NextResponse.json({
      youtubeId,
      title: meta?.title ?? '',
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
