'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker on mount.
 * Must be rendered inside a Client Component.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[Budgeti SW] Registered', reg.scope);

          // Register background-sync tag when supported
          if ('sync' in reg) {
            (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } })
              .sync.register('budgeti-sync')
              .catch(() => {
                // Background sync not supported — silent fail; we handle sync in-app
              });
          }
        })
        .catch((err) => {
          console.warn('[Budgeti SW] Registration failed:', err);
        });
    }
  }, []);

  return null;
}
