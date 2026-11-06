import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, needsRevalidation, type SessionData } from '@/lib/session';
import { readResourceAsset } from '@/lib/resource-assets';

export async function GET(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.email || !session.hasAccess || session.status === 'no_subscription' || needsRevalidation(session.lastVerified)) {
    return NextResponse.json({ error: 'Open The Resources And Sign In Again Before Downloading.' }, { status: 401 });
  }
  const asset = readResourceAsset(process.cwd(), request.nextUrl.searchParams.get('file'));
  if (!asset) return NextResponse.json({ error: 'File Not Found. Return To The Templates Page For The Current Link.' }, { status: 404 });
  return new NextResponse(new Uint8Array(asset.bytes), { headers: {
    'Content-Type': asset.type, 'Content-Disposition': `attachment; filename="${asset.filename}"`,
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
  } });
}
