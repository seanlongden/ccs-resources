import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { markWelcomeSeen } from '@/lib/db';

// POST /api/user/mark-welcome-seen
// Called by /welcome page on mount so the next login skips the walkthrough.
export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.email || !session.hasAccess) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await markWelcomeSeen(session.email);
    // Cache the flag on the session so subsequent /api/auth GETs skip the
    // Postgres roundtrip (saves ~30-100ms per page navigation).
    session.welcomeSeen = true;
    await session.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('mark-welcome-seen error:', error);
    return NextResponse.json({ error: 'Failed to mark welcome seen' }, { status: 500 });
  }
}
