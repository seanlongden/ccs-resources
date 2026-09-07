import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import * as gh from '@/lib/github-app';
import { generateBranchName, previewUrlFor } from '@/lib/admin-tools';
import { sql, ensureSchema } from '@/lib/db';
import { extractYouTubeId, fetchOEmbed } from '@/lib/youtube';
import { RECORDINGS_FILE, type RecordingsFile, type Recording } from '@/lib/recordings';

export const dynamic = 'force-dynamic';

// MVP: one category, ordered by upload recency inside each category.
// Add more slugs here as new categories are introduced.
const ALLOWED_CATEGORIES = new Set([
  'coaching-calls',
]);

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
    if (!categorySlug || !ALLOWED_CATEGORIES.has(categorySlug)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
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

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Date must be YYYY-MM-DD.' }, { status: 400 });
    }

    await ensureSchema();

    const branchName = generateBranchName();
    const baseSha = await gh.createBranch(branchName, 'main');
    await sql`
      INSERT INTO ai_branches (branch_name, base_sha, created_by, preview_url, seed_slug, status)
      VALUES (${branchName}, ${baseSha}, ${admin.email}, ${previewUrlFor(branchName)}, ${'call-recordings/' + categorySlug}, 'open')
    `;

    const { content, sha } = await gh.readFile(RECORDINGS_FILE, branchName);
    const file = JSON.parse(content) as RecordingsFile;

    const category = file.categories.find((c) => c.slug === categorySlug);
    if (!category) {
      return NextResponse.json(
        { error: `Category not found in recordings.json: ${categorySlug}` },
        { status: 500 },
      );
    }
    if (!Array.isArray(category.recordings)) category.recordings = [];

    const newItem: Recording = { title, youtubeId };
    if (date) newItem.date = date;
    if (slideDeckUrl) newItem.slideDeckUrl = slideDeckUrl;

    category.recordings.unshift(newItem);

    const newContent = JSON.stringify(file, null, 2) + '\n';
    await gh.writeFile(
      branchName,
      RECORDINGS_FILE,
      newContent,
      `Add recording: ${title} (${categorySlug})`,
      sha,
    );

    await sql`
      UPDATE ai_branches
      SET files_touched = ${JSON.stringify([RECORDINGS_FILE])}::jsonb
      WHERE branch_name = ${branchName}
    `;

    // Auto-merge to main so uploads go live immediately.
    await gh.mergeBranch(branchName, 'main');
    await sql`
      UPDATE ai_branches
      SET status = 'merged', merged_at = NOW()
      WHERE branch_name = ${branchName}
    `;

    return NextResponse.json({
      ok: true,
      branchName,
      categoryUrl: `/call-recordings/${categorySlug}`,
      youtubeId,
      title,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Recording upload failed:', msg);
    const status = msg === 'UNAUTHORIZED' ? 401 : msg === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
