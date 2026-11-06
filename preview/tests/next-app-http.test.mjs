import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const enabled = process.env.CCS_APP_HTTP_TEST === '1';
const request = (pathname, method = 'GET', host = '127.0.0.1:4327') => new Promise((resolve, reject) => {
  const req = http.request({ hostname: '127.0.0.1', port: 4327, path: pathname, method, headers: { Host: host } }, res => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
  });
  req.on('error', reject);
  req.setTimeout(30000, () => req.destroy(new Error('Local app timed out')));
  req.end();
});

test('real app serves the approved content, fixture identity and updated search', { skip: !enabled }, async () => {
  const auth = await request('/api/auth');
  assert.equal(JSON.parse(auth.body).email, 'student@preview.invalid');
  assert.equal(auth.headers['x-ccs-preview'], 'local-next-app-read-only');
  const source = JSON.parse(await readFile(new URL('../../content/pages-103.json', import.meta.url), 'utf8'));
  const page = await request('/api/content/page?slug=ccs-install/welcome');
  assert.equal(page.status, 200);
  assert.equal(JSON.parse(page.body).content, source['ccs-install/welcome'].content);
  assert.equal(JSON.parse(page.body).hideSiblingNavigation, true);
  const search = await request('/api/content/page?search=Grok');
  assert.ok(JSON.parse(search.body).some(hit => hit.pageSlug === 'ccs-install/welcome'));
  assert.equal((await request('/resources/ccs-install/welcome')).status, 200);
  assert.equal((await request('/api/content/page?slug=ccs-install/get-instantly')).status, 200);
});

test('running preview rejects writes, service routes and a production Host', { skip: !enabled }, async () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    assert.equal((await request('/api/auth', method)).status, 405);
  }
  for (const pathname of ['/api/admin', '/api/stripe', '/api/recordings', '/resources/call-recordings']) {
    assert.equal((await request(pathname)).status, 403);
  }
  assert.equal((await request('/api/auth', 'GET', 'resources.closingclientsystem.com')).status, 403);
  const legacy = await request('/resources/install/start');
  assert.equal(legacy.status, 307);
  assert.equal(legacy.headers.location, '/resources/ccs-install/welcome');
});
