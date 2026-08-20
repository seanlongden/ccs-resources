import { neon } from '@neondatabase/serverless';

/**
 * Neon Postgres client for ccs-resources. Currently used only for the
 * per-user `has_seen_welcome` flag so we can decide whether to route
 * first-time visitors to /welcome or straight to /resources.
 *
 * Gracefully degrades: if DATABASE_URL is missing (e.g. local dev with
 * no DB configured, or transient config drift), every function returns
 * a safe default that DOES NOT block the app — hasSeenWelcome() returns
 * true so users skip the walkthrough rather than seeing it forever.
 */

const url = process.env.DATABASE_URL;
const sql = url ? neon(url) : null;

let tableEnsured = false;
async function ensureTable() {
  if (!sql || tableEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT NOT NULL PRIMARY KEY,
      has_seen_welcome BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableEnsured = true;
}

/** Insert-if-missing. Idempotent. Called on every successful login. */
export async function ensureUser(email: string): Promise<void> {
  if (!sql) return;
  const normalized = email.toLowerCase().trim();
  await ensureTable();
  await sql`
    INSERT INTO users (email) VALUES (${normalized})
    ON CONFLICT (email) DO NOTHING
  `;
}

/** Returns true if the user has seen the welcome page (or DB is unavailable). */
export async function hasSeenWelcome(email: string): Promise<boolean> {
  if (!sql) return true; // Safe default: skip walkthrough when DB missing.
  const normalized = email.toLowerCase().trim();
  await ensureTable();
  const rows = (await sql`
    SELECT has_seen_welcome FROM users WHERE email = ${normalized} LIMIT 1
  `) as Array<{ has_seen_welcome: boolean }>;
  return rows[0]?.has_seen_welcome ?? false;
}

/** Marks the welcome page as seen. Called from /welcome page on mount. */
export async function markWelcomeSeen(email: string): Promise<void> {
  if (!sql) return;
  const normalized = email.toLowerCase().trim();
  await ensureTable();
  await sql`
    INSERT INTO users (email, has_seen_welcome, updated_at)
    VALUES (${normalized}, TRUE, now())
    ON CONFLICT (email) DO UPDATE SET
      has_seen_welcome = TRUE,
      updated_at = now()
  `;
}
