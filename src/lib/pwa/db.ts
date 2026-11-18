/**
 * IndexedDB wrapper for Budgeti offline storage.
 * Stores a full snapshot of each API collection and a mutation queue.
 */

const DB_NAME = 'budgeti-offline';
const DB_VERSION = 1;

export type StoreNames =
  | 'transactions'
  | 'budgets'
  | 'categories'
  | 'accounts'
  | 'goals'
  | 'settings'
  | 'syncQueue'
  | 'meta';

export interface QueuedMutation {
  id: string;        // unique local id
  createdAt: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;       // relative API path e.g. /api/transactions
  body?: unknown;
  // The optimistic local record (for rollback hint, not strictly needed)
  localRecord?: unknown;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;

      const collectionStores: StoreNames[] = [
        'transactions',
        'budgets',
        'categories',
        'accounts',
        'goals',
      ];

      collectionStores.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('syncQueue')) {
        const qs = db.createObjectStore('syncQueue', { keyPath: 'id' });
        qs.createIndex('createdAt', 'createdAt');
      }

      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

async function getAll<T>(store: StoreNames): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function putAll<T>(store: StoreNames, records: T[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    // Clear then bulk-put for a fresh snapshot
    const clearReq = os.clear();
    clearReq.onsuccess = () => {
      records.forEach((r) => os.put(r));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    clearReq.onerror = () => reject(clearReq.error);
  });
}

async function putOne<T>(store: StoreNames, record: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteOne(store: StoreNames, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export async function getMeta(key: string): Promise<unknown> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meta', 'readonly');
    const req = tx.objectStore('meta').get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  return putOne('meta', { key, value });
}

// ─── Snapshot APIs ────────────────────────────────────────────────────────────

export const offlineDB = {
  // Save full dashboard snapshot after a successful network fetch
  async saveSnapshot(data: {
    transactions: unknown[];
    budgets: unknown[];
    categories: unknown[];
    accounts: unknown[];
    goals: unknown[];
    settings: unknown;
  }) {
    await Promise.all([
      putAll('transactions', data.transactions),
      putAll('budgets', data.budgets),
      putAll('categories', data.categories),
      putAll('accounts', data.accounts),
      putAll('goals', data.goals),
      // Settings is a singleton; store with key='current'
      putOne('settings', { key: 'current', ...(data.settings as object) }),
    ]);
    await setMeta('lastSyncedAt', new Date().toISOString());
    await setMeta('hasSnapshot', true);
  },

  async getSnapshot() {
    const [transactions, budgets, categories, accounts, goals, settingsRows] =
      await Promise.all([
        getAll<unknown>('transactions'),
        getAll<unknown>('budgets'),
        getAll<unknown>('categories'),
        getAll<unknown>('accounts'),
        getAll<unknown>('goals'),
        getAll<{ key: string } & Record<string, unknown>>('settings'),
      ]);

    // Remove the 'key' field from the settings singleton
    const settingsRow = settingsRows[0];
    let settings: unknown = null;
    if (settingsRow) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { key: _k, ...rest } = settingsRow;
      settings = rest;
    }

    return { transactions, budgets, categories, accounts, goals, settings };
  },

  async hasSnapshot(): Promise<boolean> {
    const v = await getMeta('hasSnapshot');
    return v === true;
  },

  // Optimistic local updates (applied immediately while request queued)
  async upsertTransaction(tx: unknown) {
    return putOne('transactions', tx);
  },
  async removeTransaction(id: string) {
    return deleteOne('transactions', id);
  },
  async upsertBudget(b: unknown) {
    return putOne('budgets', b);
  },
  async removeBudget(id: string) {
    return deleteOne('budgets', id);
  },
  async upsertGoal(g: unknown) {
    return putOne('goals', g);
  },
  async upsertAccount(a: unknown) {
    return putOne('accounts', a);
  },
  async upsertCategory(c: unknown) {
    return putOne('categories', c);
  },
  async updateSettings(s: unknown) {
    return putOne('settings', { key: 'current', ...(s as object) });
  },

  // ─── Sync Queue ─────────────────────────────────────────────────────────────

  async enqueue(mutation: Omit<QueuedMutation, 'id' | 'createdAt'>): Promise<QueuedMutation> {
    const entry: QueuedMutation = {
      ...mutation,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    await putOne('syncQueue', entry);
    return entry;
  },

  async getQueue(): Promise<QueuedMutation[]> {
    const all = await getAll<QueuedMutation>('syncQueue');
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async dequeue(id: string): Promise<void> {
    return deleteOne('syncQueue', id);
  },

  async clearQueue(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readwrite');
      tx.objectStore('syncQueue').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async queueLength(): Promise<number> {
    const q = await getAll('syncQueue');
    return q.length;
  },
};
