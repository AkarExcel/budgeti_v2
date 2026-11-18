/**
 * Budgeti Service Worker
 * Strategy:
 *  - App shell (HTML, JS, CSS, fonts) → Cache-first, update in background
 *  - API routes → Network-first with IndexedDB cache fallback (handled in-page)
 *  - Static assets → Cache-first
 */

const CACHE_NAME = 'budgeti-v2.4.0';
const OFFLINE_PAGE = '/offline';

// App shell assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // Don't fail install if offline page isn't available yet
        console.warn('[SW] Precache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Skip API routes — the app handles those with its own offline queue
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip Next.js internal routes
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests: network-first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNav(request));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirst(request));
});

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'budgeti-sync') {
    event.waitUntil(notifyClientsToSync());
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Budgeti', {
      body: data.body || '',
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: 'budgeti-reminder',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url === targetUrl);
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      })
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstNav(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Try the root shell
    const shell = await caches.match('/');
    if (shell) return shell;

    return new Response(
      `<!DOCTYPE html><html><head><title>Budgeti — Offline</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{background:#0f172a;color:#94a3b8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
      .card{text-align:center;padding:2rem}h1{color:#34d399;font-size:1.5rem}p{font-size:.9rem}</style></head>
      <body><div class="card"><h1>₦ Budgeti</h1><p>You're offline. Your data is cached and will sync when you reconnect.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({ type: 'BUDGETI_SYNC' });
  });
}
