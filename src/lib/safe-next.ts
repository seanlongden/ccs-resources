/** Only allow same-origin relative paths in login redirects. */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  if (raw.includes('://')) return null;
  return raw;
}

export function loginUrl(next?: string | null): string {
  const safe = safeNextPath(next);
  return safe ? `/?next=${encodeURIComponent(safe)}` : '/';
}
