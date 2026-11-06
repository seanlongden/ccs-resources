// Runs the real Next app with read-only loopback fixtures, never live accounts.
import { createServer } from 'node:http';
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PREVIEW_PORT, routePreviewRequest } from './lib/next-app-isolation.mjs';
import { readResourceAsset } from '../src/lib/resource-assets.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
if (process.env.NODE_ENV === 'production') throw new Error('The preview cannot run in production mode.');
const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout.trim();
if (branch !== 'codex/ccs-resources-preview') throw new Error('Run only on the preview branch.');
const envFiles = readdirSync(root).filter(name => name.startsWith('.env') && name !== '.env.example');
if (envFiles.length) throw new Error('Remove live/local environment files from this isolated worktree.');
if (!existsSync(path.join(root, 'node_modules/next'))) throw new Error('Install app dependencies first.');

// Preserve only local runtime settings before importing the actual application.
const allowed = new Set(['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'TZ', 'TERM']);
for (const key of Object.keys(process.env)) if (!allowed.has(key)) delete process.env[key];
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.SESSION_SECRET = 'isolated-preview-fixture-not-a-live-session-secret';
const searchBuild = spawnSync(process.execPath, ['scripts/build-search-index.js'], { stdio: 'inherit' });
if (searchBuild.status !== 0) throw new Error('Could not build the local content search index.');

const next = (await import('next')).default;
const app = next({ dev: true, dir: root, hostname: '127.0.0.1', port: PREVIEW_PORT });
await app.prepare();
const handle = app.getRequestHandler();
const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-CCS-Preview', 'local-next-app-read-only');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws://127.0.0.1:4327; frame-src 'none'; form-action 'none'; object-src 'none'; base-uri 'self'");
  let url;
  try { url = new URL(req.url, `http://127.0.0.1:${PREVIEW_PORT}`); }
  catch { res.writeHead(400).end(); return; }
  const route = routePreviewRequest({
    method: req.method, host: req.headers.host,
    remoteAddress: req.socket.remoteAddress, pathname: url.pathname,
  });
  if (route.location) { res.writeHead(route.status, { Location: route.location }).end(); return; }
  if (route.asset) {
    const asset = readResourceAsset(root, url.searchParams.get('file'));
    if (!asset) { res.writeHead(404).end('File Not Found.'); return; }
    res.writeHead(200, { 'Content-Type': asset.type, 'Content-Disposition': `attachment; filename="${asset.filename}"`, 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : asset.bytes); return;
  }
  if (route.fixture) {
    res.writeHead(route.status, { 'Content-Type': 'application/json' });
    res.end(req.method === 'HEAD' ? undefined : JSON.stringify(route.fixture));
    return;
  }
  if (!route.next) { res.writeHead(route.status, { 'Content-Type': 'text/plain' }).end('Private preview: this action is unavailable.'); return; }
  try { await handle(req, res); }
  catch (error) { console.error(error.message); if (!res.headersSent) res.writeHead(500).end('Preview rendering failed.'); }
});
server.listen(PREVIEW_PORT, '127.0.0.1', () => console.log(`Actual CCS app preview: http://127.0.0.1:${PREVIEW_PORT}/resources/ccs-install/welcome`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.close(); app.close().finally(() => process.exit(0)); });
