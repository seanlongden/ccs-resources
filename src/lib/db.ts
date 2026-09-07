import { neon, NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Neon Postgres client for ccs-resources.
 *
 * Two responsibilities:
 *   1. Per-user welcome flag (users table) — existing.
 *   2. Admin panel schema (admins, ai_branches, ai_messages) — added
 *      2026-09-07 for the Call Recordings admin UI, ported from
 *      ccg-resources.
 *
 * Gracefully degrades: if DATABASE_URL is missing (e.g. local dev with
 * no DB configured), user-flag functions return safe defaults.
 * The admin schema functions throw because the admin panel is unusable
 * without a DB.
 */

type SqlFn = NeonQueryFunction<false, false>;

let _sql: SqlFn | null = null;
export function getSql(): SqlFn {
  if (_sql) return _sql;
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

// Tagged-template-callable proxy. Defers DB connection until first use so
// `next build` can import this module without DATABASE_URL.
export const sql: SqlFn = new Proxy((() => {}) as unknown as SqlFn, {
  apply(_target, _thisArg, args) {
    const fn = getSql() as unknown as (...a: unknown[]) => unknown;
    return fn(...args);
  },
  get(_target, prop) {
    const fn = getSql() as unknown as Record<string, unknown>;
    const v = fn[prop as string];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(fn) : v;
  },
});

let schemaApplied = false;

export async function ensureSchema(): Promise<void> {
  if (schemaApplied) return;
  const s = getSql();

  // Existing users table (welcome flag).
  await s`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT NOT NULL PRIMARY KEY,
      has_seen_welcome BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Admin panel schema (ported from ccg-resources).
  await s`
    CREATE TABLE IF NOT EXISTS admins (
      id                SERIAL PRIMARY KEY,
      email             TEXT NOT NULL UNIQUE,
      role              TEXT NOT NULL CHECK (role IN ('super_admin', 'editor')),
      permissions       JSONB NOT NULL DEFAULT '{}'::jsonb,
      anthropic_key_enc TEXT,
      anthropic_key_iv  TEXT,
      anthropic_key_tag TEXT,
      invited_by        TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at      TIMESTAMPTZ
    )
  `;
  await s`CREATE INDEX IF NOT EXISTS admins_email_idx ON admins (lower(email))`;

  await s`
    CREATE TABLE IF NOT EXISTS ai_branches (
      id            SERIAL PRIMARY KEY,
      branch_name   TEXT NOT NULL UNIQUE,
      base_sha      TEXT NOT NULL,
      created_by    TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'merged', 'discarded')),
      preview_url   TEXT,
      summary       TEXT,
      seed_slug     TEXT,
      files_touched JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      merged_at     TIMESTAMPTZ
    )
  `;
  await s`ALTER TABLE ai_branches ADD COLUMN IF NOT EXISTS seed_slug TEXT`;

  await s`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id          SERIAL PRIMARY KEY,
      branch_name TEXT,
      admin_email TEXT NOT NULL,
      role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool_use', 'tool_result')),
      content     JSONB NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await s`CREATE INDEX IF NOT EXISTS ai_messages_branch_idx ON ai_messages (branch_name)`;

  await s`
    DELETE FROM admins
    WHERE role = 'super_admin'
      AND lower(email) <> 'seanlongden0@gmail.com'
  `;

  schemaApplied = true;
}

// ============================================================
// Existing welcome-flag helpers (unchanged behaviour).
// Gracefully degrade when DATABASE_URL is missing.
// ============================================================

function safeSql(): SqlFn | null {
  try {
    return getSql();
  } catch {
    return null;
  }
}

async function ensureUsersTableOnly(): Promise<boolean> {
  const s = safeSql();
  if (!s) return false;
  await s`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT NOT NULL PRIMARY KEY,
      has_seen_welcome BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  return true;
}

export async function ensureUser(email: string): Promise<void> {
  const s = safeSql();
  if (!s) return;
  const normalized = email.toLowerCase().trim();
  if (!(await ensureUsersTableOnly())) return;
  await s`
    INSERT INTO users (email) VALUES (${normalized})
    ON CONFLICT (email) DO NOTHING
  `;
}

export async function hasSeenWelcome(email: string): Promise<boolean> {
  const s = safeSql();
  if (!s) return true;
  const normalized = email.toLowerCase().trim();
  if (!(await ensureUsersTableOnly())) return true;
  const rows = (await s`
    SELECT has_seen_welcome FROM users WHERE email = ${normalized} LIMIT 1
  `) as Array<{ has_seen_welcome: boolean }>;
  return rows[0]?.has_seen_welcome ?? false;
}

export async function markWelcomeSeen(email: string): Promise<void> {
  const s = safeSql();
  if (!s) return;
  const normalized = email.toLowerCase().trim();
  if (!(await ensureUsersTableOnly())) return;
  await s`
    INSERT INTO users (email, has_seen_welcome, updated_at)
    VALUES (${normalized}, TRUE, now())
    ON CONFLICT (email) DO UPDATE SET
      has_seen_welcome = TRUE,
      updated_at = now()
  `;
}
