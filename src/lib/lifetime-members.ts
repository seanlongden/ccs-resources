/**
 * Google Sheet allowlist ("lifetime members" for historical naming).
 *
 * Matches the exact pattern used in ai-ark-list-builder — same sheet,
 * same public-CSV export, no cache, fresh fetch per login. Any email
 * in column A (rows 2+ — row 1 is the "Email" header) is granted
 * access even without a CCS Stripe sub.
 *
 * The sheet is publicly viewable ("anyone with the link"), so we hit
 * Google's CSV export endpoint directly with no auth key.
 *
 * A failure to fetch (network / non-200) returns FALSE so the login
 * flow falls through to the Stripe check — a Google Sheets outage
 * doesn't lock every allowlisted member out.
 */

const SHEET_ID = '1dFSTaX8jtRHwpImp60ChirduuGcMIYEpSiRUBeHGbTU';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Kept as `isLifetimeMember` for API compatibility with existing
// callers in src/lib/auth.ts and elsewhere. Conceptually this is
// "is the email on the sheet allowlist" — historically called
// "lifetime members" in this codebase.
export async function isLifetimeMember(email: string): Promise<boolean> {
  const target = email.toLowerCase().trim();
  if (!target) return false;

  try {
    const res = await fetch(SHEET_CSV_URL, {
      // Fresh fetch every login (matches ai-ark-list-builder) so
      // additions land instantly for members trying to log in.
      cache: 'no-store',
      // If the sheet were ever set back to private, Google issues a
      // 302 to a login URL. Treat any non-200 as "no match" — the
      // downstream Stripe check still runs.
      redirect: 'manual',
    });
    if (res.status !== 200) {
      console.warn(`[sheet-allowlist] non-200 response: ${res.status}`);
      return false;
    }

    const csv = await res.text();
    const lines = csv.split(/\r?\n/);
    // Skip row 0 — it's the "Email" header.
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      // Column A is the email column. CSV cells can be quoted; email
      // addresses don't contain commas so a naive split-on-first-comma
      // is safe.
      const firstCell = line.split(',')[0].trim().toLowerCase().replace(/^"|"$/g, '');
      if (firstCell === target) return true;
    }
    return false;
  } catch (err) {
    console.error('[sheet-allowlist] fetch error:', err);
    return false;
  }
}
