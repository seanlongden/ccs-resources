import test from 'node:test';
import assert from 'node:assert/strict';
import { routePreviewRequest, PREVIEW_PORT } from '../lib/next-app-isolation.mjs';

const local = { method: 'GET', host: `127.0.0.1:${PREVIEW_PORT}`, remoteAddress: '127.0.0.1' };
const route = (pathname, overrides = {}) => routePreviewRequest({ ...local, pathname, ...overrides });

test('fixture authentication is confined to the loopback preview', () => {
  assert.equal(route('/api/auth').fixture.email, 'student@preview.invalid');
  for (const overrides of [{ host: 'resources.closingclientsystem.com' }, { remoteAddress: '192.168.1.2' }]) {
    assert.equal(route('/api/auth', overrides).status, 403);
  }
});
test('all write methods and live-service routes are denied before Next handles them', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    assert.equal(route('/api/auth', { method }).status, 405);
    assert.equal(route('/api/content/page', { method }).status, 405);
  }
  for (const pathname of ['/api/stripe', '/api/admin', '/admin', '/resources/call-recordings', '/api/recordings']) {
    assert.equal(route(pathname).status, 403);
  }
  assert.deepEqual(route('/api/content/page'), { next: true });
  assert.deepEqual(route('/resources/ccs-install/welcome'), { next: true });
});
