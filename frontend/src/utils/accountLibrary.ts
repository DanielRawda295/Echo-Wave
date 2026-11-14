import { jwtDecode } from 'jwt-decode';
import type { StateStorage } from 'zustand/middleware';

export function getAccountId(token: string | null): string | null {
  try {
    const { sub } = jwtDecode<{ sub?: unknown }>(token || '');
    return (typeof sub === 'number' || typeof sub === 'string') && /^\d+$/.test(String(sub)) && Number(sub) > 0
      ? String(sub) : null;
  } catch { return null; }
}

export function getStoredAccountId(): string | null {
  try { return getAccountId(localStorage.getItem('token') || sessionStorage.getItem('token')); }
  catch { return null; }
}

export function accountLibraryKey(collection: string, accountId: string | null): string {
  return `echowave.${collection}.v2:${accountId || 'signed-out'}`;
}

export function forgetAccountLibrary(accountId: string | null): void {
  if (!accountId) return;
  for (const collection of ['favorites', 'recentlyPlayed']) {
    accountLibraryStorage.removeItem?.(accountLibraryKey(collection, accountId));
  }
}

// Signed-out state is transient. Logout must never overwrite an account's saved lists.
export const accountLibraryStorage: StateStorage = {
  getItem(name) {
    if (name.endsWith(':signed-out')) return null;
    try {
      const value = localStorage.getItem(name);
      if (value) JSON.parse(value);
      return value;
    } catch { return null; }
  },
  setItem(name, value) {
    if (name.endsWith(':signed-out')) return;
    try { localStorage.setItem(name, value); } catch { /* Keep the in-memory library usable if storage is unavailable. */ }
  },
  removeItem(name) {
    try { localStorage.removeItem(name); } catch { /* Storage may be unavailable. */ }
  },
};

export function migrateCurrentLibrary(collection: string, accountId: string | null): void {
  if (!accountId) return;
  try {
    const legacyKey = `echowave.${collection}.v1`;
    const value = localStorage.getItem(legacyKey);
    if (!value) return;
    const key = accountLibraryKey(collection, accountId);
    // The old app cleared its global lists on every login, so an existing list
    // can only be retained for the account already signed in during this upgrade.
    if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    localStorage.removeItem(legacyKey);
  } catch { /* A damaged legacy record must not prevent signing in. */ }
}
