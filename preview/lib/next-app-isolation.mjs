// Local development harness only. Production authentication is never modified.
export const PREVIEW_PORT = 4327;
export const PREVIEW_IDENTITY = Object.freeze({
  authenticated: true,
  email: 'student@preview.invalid',
  status: 'lifetime',
  hasSeenWelcome: true,
  preview: true,
});

export function routePreviewRequest({ method, host, remoteAddress, pathname }) {
  const localAddress = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteAddress);
  if (!localAddress || host !== `127.0.0.1:${PREVIEW_PORT}`) return { status: 403 };
  if (!['GET', 'HEAD'].includes(method)) return { status: 405 };
  if (pathname === '/api/auth') return { status: 200, fixture: PREVIEW_IDENTITY };
  if (pathname === '/' || pathname === '/welcome' || pathname === '/resources/install/start') {
    return { status: 307, location: '/resources/ccs-install/welcome' };
  }
  if (pathname === '/api/content/page' || pathname === '/api/content/navigation') return { next: true };
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin') || pathname.startsWith('/resources/call-recordings')) {
    return { status: 403 };
  }
  if (pathname === '/resources' || pathname.startsWith('/resources/') || pathname.startsWith('/_next/') ||
      ['/icon.png', '/logo.png', '/favicon.ico'].includes(pathname)) return { next: true };
  return { status: 404 };
}
