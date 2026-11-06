import fs from 'node:fs';
import path from 'node:path';

// Used by the authenticated app route and the isolated local preview.
export function readResourceAsset(root: string, requested: string | null) {
  if (!requested || requested.includes('\\') || requested.includes('\0')) return null;
  const base = path.resolve(root, 'content/rebuild');
  const target = path.resolve(base, requested);
  const allowed = /^(ai-pack\/(?:templates|skills)\/[^/]+\.(?:md|csv)|ai-pack\/(?:README\.md|AGENTS\.md|manifest\.json)|example\/[^/]+\.(?:md|csv|json)|ccs-ai-pack\.zip)$/;
  if (!allowed.test(requested) || !target.startsWith(base + path.sep)) return null;
  try {
    const real = fs.realpathSync(target);
    if (!real.startsWith(base + path.sep) || !fs.statSync(real).isFile()) return null;
    const bytes = fs.readFileSync(real);
    const ext = path.extname(real);
    const type = ({ '.zip': 'application/zip', '.csv': 'text/csv; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8' } as Record<string, string>)[ext];
    return { bytes, type, filename: path.basename(real) };
  } catch { return null; }
}
