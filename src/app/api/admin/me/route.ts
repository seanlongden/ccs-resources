import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { getCurrentAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.email || !session.hasAccess) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Not an admin.' }, { status: 403 });
    }
    if (admin.role !== 'super_admin' && !admin.permissions.manage_recordings) {
      return NextResponse.json(
        { error: 'Not permitted to manage recordings.' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      email: admin.email,
      role: admin.role,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('GET /api/admin/me failed:', msg);
    return NextResponse.json({ error: 'Could not check admin session.' }, { status: 500 });
  }
}
