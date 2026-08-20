import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { isAdmin } from '@/lib/admin';
import { neon } from '@neondatabase/serverless';

// GET/POST /api/admin/reset-welcome?email=X
// Deletes the users-table row for the given email so their next login
// re-shows the /welcome page. Admin-only (session must be an admin).
// Defaults to the caller's own email if `email` param not passed.
async function handler(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.email || !session.hasAccess) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!isAdmin(session.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const url = new URL(req.url);
  const target = (url.searchParams.get('email') ?? session.email).toLowerCase().trim();

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }
  const sql = neon(dbUrl);
  const result = await sql`DELETE FROM users WHERE email = ${target} RETURNING email`;

  return NextResponse.json({
    ok: true,
    deleted: (result as Array<{ email: string }>).map((r) => r.email),
    target,
  });
}

export const GET = handler;
export const POST = handler;
