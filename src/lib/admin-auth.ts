import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './session';
import { sql, ensureSchema } from './db';
import { encrypt, decrypt } from './crypto';

// Only seanlongden0@gmail.com is a hardcoded super-admin. Anyone else with
// admin access must be invited via /admin/admins (super-admin only flow).
const SUPER_ADMIN_EMAILS = new Set([
  'seanlongden0@gmail.com',
]);

export type AdminPermissions = {
  edit_content?: boolean;
  edit_template?: boolean;
  add_page?: boolean;
  delete_page?: boolean;
  edit_admins?: boolean;
  edit_system_prompt?: boolean;
  manage_recordings?: boolean;
};

export type AdminRecord = {
  id: number;
  email: string;
  role: 'super_admin' | 'editor';
  permissions: AdminPermissions;
  has_anthropic_key: boolean;
  created_at: string;
};

export async function getCurrentAdmin(): Promise<AdminRecord | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.email || !session.hasAccess) return null;

  const email = session.email.toLowerCase().trim();
  await ensureSchema();

  // Bootstrap super admin if missing
  if (SUPER_ADMIN_EMAILS.has(email)) {
    const existing = await sql`SELECT id FROM admins WHERE lower(email) = ${email}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO admins (email, role, permissions)
        VALUES (${email}, 'super_admin', ${JSON.stringify({
          edit_content: true, edit_template: true, add_page: true,
          delete_page: true, edit_admins: true, edit_system_prompt: true,
          manage_recordings: true,
        })}::jsonb)
        ON CONFLICT (email) DO NOTHING
      `;
    }
  }

  const rows = (await sql`
    SELECT id, email, role, permissions, anthropic_key_enc IS NOT NULL AS has_anthropic_key, created_at
    FROM admins WHERE lower(email) = ${email}
  `) as Array<Record<string, unknown>>;

  if (rows.length === 0) return null;
  const r = rows[0] as { id: number; email: string; role: 'super_admin' | 'editor'; permissions: AdminPermissions | null; has_anthropic_key: boolean; created_at: string };
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    permissions: r.permissions || {},
    has_anthropic_key: r.has_anthropic_key,
    created_at: r.created_at,
  };
}

export async function requireAdmin(): Promise<AdminRecord> {
  const a = await getCurrentAdmin();
  if (!a) throw new Error('UNAUTHORIZED');
  return a;
}

export async function requireSuperAdmin(): Promise<AdminRecord> {
  const a = await requireAdmin();
  if (a.role !== 'super_admin') throw new Error('FORBIDDEN');
  return a;
}

export async function setAnthropicKey(email: string, plaintextKey: string): Promise<void> {
  const { enc, iv, tag } = encrypt(plaintextKey);
  await sql`
    UPDATE admins
    SET anthropic_key_enc = ${enc}, anthropic_key_iv = ${iv}, anthropic_key_tag = ${tag}
    WHERE lower(email) = ${email.toLowerCase()}
  `;
}

export async function getDecryptedAnthropicKey(email: string): Promise<string | null> {
  const rows = (await sql`
    SELECT anthropic_key_enc, anthropic_key_iv, anthropic_key_tag
    FROM admins WHERE lower(email) = ${email.toLowerCase()}
  `) as Array<{ anthropic_key_enc: string | null; anthropic_key_iv: string | null; anthropic_key_tag: string | null }>;
  if (rows.length === 0 || !rows[0].anthropic_key_enc) return null;
  return decrypt(rows[0].anthropic_key_enc, rows[0].anthropic_key_iv!, rows[0].anthropic_key_tag!);
}

export async function listAdmins(): Promise<AdminRecord[]> {
  const rows = (await sql`
    SELECT id, email, role, permissions,
           anthropic_key_enc IS NOT NULL AS has_anthropic_key, created_at
    FROM admins ORDER BY role DESC, created_at ASC
  `) as Array<{ id: number; email: string; role: 'super_admin' | 'editor'; permissions: AdminPermissions | null; has_anthropic_key: boolean; created_at: string }>;
  return rows.map(r => ({
    id: r.id, email: r.email, role: r.role,
    permissions: r.permissions || {}, has_anthropic_key: r.has_anthropic_key,
    created_at: r.created_at,
  }));
}

export async function inviteAdmin(
  email: string,
  permissions: AdminPermissions,
  invitedBy: string
): Promise<void> {
  await sql`
    INSERT INTO admins (email, role, permissions, invited_by)
    VALUES (${email.toLowerCase()}, 'editor', ${JSON.stringify(permissions)}::jsonb, ${invitedBy})
    ON CONFLICT (email) DO UPDATE SET permissions = EXCLUDED.permissions
  `;
}

export async function removeAdmin(email: string): Promise<void> {
  if (SUPER_ADMIN_EMAILS.has(email.toLowerCase())) {
    throw new Error('Cannot remove a hardcoded super admin');
  }
  await sql`DELETE FROM admins WHERE lower(email) = ${email.toLowerCase()}`;
}
