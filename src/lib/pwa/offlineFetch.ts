/**
 * offlineFetch — a drop-in wrapper around fetch() that:
 *  1. When online: calls the real API, caches the response in IndexedDB.
 *  2. When offline (GET): returns data from IndexedDB snapshot.
 *  3. When offline (POST/PUT/DELETE): applies an optimistic update to IndexedDB
 *     and enqueues the mutation for later replay.
 */

import { offlineDB } from './db';

export type OfflineGetKey =
  | 'transactions'
  | 'budgets'
  | 'categories'
  | 'accounts'
  | 'goals'
  | 'settings'
  | 'dashboard';

/** Map API path prefixes → snapshot collection keys */
const PATH_TO_STORE: Record<string, OfflineGetKey> = {
  '/api/transactions': 'transactions',
  '/api/budgets': 'budgets',
  '/api/categories': 'categories',
  '/api/accounts': 'accounts',
  '/api/goals': 'goals',
  '/api/settings': 'settings',
  '/api/dashboard': 'dashboard',
};

function matchStore(url: string): OfflineGetKey | null {
  const path = url.startsWith('/') ? url : new URL(url).pathname;
  for (const [prefix, key] of Object.entries(PATH_TO_STORE)) {
    if (path.startsWith(prefix)) return key;
  }
  return null;
}

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * offlineFetch — usage is identical to native fetch().
 * Pass `optimisticRecord` for mutations that should be reflected immediately.
 */
export async function offlineFetch(
  url: string,
  options: RequestInit & { optimisticRecord?: unknown; timeoutMs?: number } = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const { optimisticRecord, timeoutMs = 1500, ...fetchOptions } = options;

  // ── Online path ────────────────────────────────────────────────────────────
  if (isOnline()) {
    try {
      // Abort controller ensures slow network or server hangs don't stall pull-to-refresh
      let fetchPromise: Promise<Response>;
      if (!fetchOptions.signal && typeof AbortController !== 'undefined') {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), method === 'GET' ? timeoutMs : 10000);
        fetchPromise = fetch(url, { ...fetchOptions, signal: controller.signal })
          .finally(() => clearTimeout(timer));
      } else {
        fetchPromise = fetch(url, fetchOptions);
      }

      const res = await fetchPromise;

      // Cache successful GET responses
      if (method === 'GET' && res.ok) {
        const json = await res.json();
        await cacheResponse(url, json);
        // Return a synthetic Response so callers can still call .json()
        return new Response(JSON.stringify(json), {
          status: res.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return res;
    } catch (networkErr) {
      // Unexpected network error or timeout while navigator.onLine is true — fallback to IndexedDB snapshot
      return handleOffline(url, method, fetchOptions, optimisticRecord);
    }
  }

  // ── Offline path ───────────────────────────────────────────────────────────
  return handleOffline(url, method, fetchOptions, optimisticRecord);
}

// ─── Offline GET: serve from IndexedDB ────────────────────────────────────────

async function serveFromCache(url: string): Promise<Response> {
  const store = matchStore(url);
  if (!store) {
    return new Response(
      JSON.stringify({ success: false, message: 'Offline — no cached data' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (store === 'dashboard') {
      const snap = await offlineDB.getSnapshot();
      if (typeof window !== 'undefined' && snap) {
        try {
          localStorage.setItem('budgeti_dashboard_cache', JSON.stringify(snap));
        } catch {
          // ignore
        }
      }
      return jsonResponse({ success: true, isMock: false, offline: true, data: snap });
    }

    if (store === 'settings') {
      const snap = await offlineDB.getSnapshot();
      return jsonResponse({ success: true, isMock: false, offline: true, data: snap.settings });
    }

    const snap = await offlineDB.getSnapshot();
    const data = snap[store as keyof typeof snap] ?? [];
    return jsonResponse({ success: true, isMock: false, offline: true, data });
  } catch (err) {
    return jsonResponse(
      { success: false, message: 'Offline — cache read error', offline: true },
      503
    );
  }
}

// ─── Offline mutation: optimistic update + enqueue ────────────────────────────

async function enqueueMutation(
  url: string,
  method: string,
  options: RequestInit,
  optimisticRecord?: unknown
): Promise<Response> {
  const body = options.body ? JSON.parse(options.body as string) : undefined;

  // Apply optimistic update to local store
  if (optimisticRecord !== undefined) {
    await applyOptimistic(url, method, optimisticRecord, body);
  }

  // Enqueue for replay
  await offlineDB.enqueue({ method: method as 'POST' | 'PUT' | 'DELETE', url, body, localRecord: optimisticRecord });

  // Return a synthetic success response so the UI stays happy
  const fakeRecord = optimisticRecord ?? body ?? {};
  return jsonResponse({ success: true, isMock: false, offline: true, queued: true, data: fakeRecord }, 200);
}

async function applyOptimistic(url: string, method: string, record: unknown, body?: unknown) {
  const store = matchStore(url);
  if (!store || store === 'dashboard' || store === 'settings') return;

  if (method === 'DELETE') {
    const id =
      (body as Record<string, unknown>)?.id as string ||
      new URL(url, 'http://x').searchParams.get('id') ||
      '';

    switch (store) {
      case 'transactions': return offlineDB.removeTransaction(id);
      case 'budgets': return offlineDB.removeBudget(id);
    }
    return;
  }

  switch (store) {
    case 'transactions': return offlineDB.upsertTransaction(record);
    case 'budgets': return offlineDB.upsertBudget(record);
    case 'goals': return offlineDB.upsertGoal(record);
    case 'accounts': return offlineDB.upsertAccount(record);
    case 'categories': return offlineDB.upsertCategory(record);
  }
}

// ─── Cache incoming API responses ─────────────────────────────────────────────

async function cacheResponse(url: string, json: unknown) {
  const store = matchStore(url);
  if (!store) return;

  const data = (json as Record<string, unknown>)?.data;
  if (data === undefined) return;

  if (store === 'dashboard') {
    const d = data as Record<string, unknown[]>;
    if (d.transactions && d.budgets && d.categories && d.accounts && d.goals) {
      await offlineDB.saveSnapshot({
        transactions: d.transactions,
        budgets: d.budgets,
        categories: d.categories,
        accounts: d.accounts,
        goals: d.goals,
        settings: d.settings ?? {},
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('budgeti_dashboard_cache', JSON.stringify(d));
        } catch {
          // ignore
        }
      }
    }
    return;
  }

  if (store === 'settings') {
    await offlineDB.updateSettings(data);
    return;
  }

  if (Array.isArray(data)) {
    switch (store) {
      case 'transactions':
        for (const r of data) await offlineDB.upsertTransaction(r);
        break;
      case 'budgets':
        for (const r of data) await offlineDB.upsertBudget(r);
        break;
      case 'categories':
        for (const r of data) await offlineDB.upsertCategory(r);
        break;
      case 'accounts':
        for (const r of data) await offlineDB.upsertAccount(r);
        break;
      case 'goals':
        for (const r of data) await offlineDB.upsertGoal(r);
        break;
    }
  }
}

// ─── Shared offline handler ────────────────────────────────────────────────────

async function handleOffline(
  url: string,
  method: string,
  fetchOptions: RequestInit,
  optimisticRecord?: unknown
): Promise<Response> {
  if (method === 'GET') {
    return serveFromCache(url);
  }
  return enqueueMutation(url, method, fetchOptions, optimisticRecord);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getLocalCachedDashboard(): {
  transactions?: any[];
  budgets?: any[];
  categories?: any[];
  accounts?: any[];
  goals?: any[];
  settings?: any;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('budgeti_dashboard_cache');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}
