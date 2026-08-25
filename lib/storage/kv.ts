import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Thin typed wrapper over AsyncStorage.
 *
 * Only repositories import this. Screens and hooks must go through a repository
 * so the storage engine can be swapped for Supabase without touching the UI.
 */

const BASE_PREFIX = 'domus:'

/**
 * Per-account namespace, set once a real Supabase user is known. Local Agenda/
 * Mercado/Deberes/Chat data is test data written before any account existed —
 * it stays reachable at the bare `domus:` prefix and is never deleted, but a
 * logged-in user's local data lives under `domus:<userId>:` so two accounts on
 * the same device never see each other's local-only records. Pre-auth data is
 * intentionally NOT migrated into a namespace; it's dev-test data, not owned
 * by any account.
 */
let namespace = ''

export function setUserNamespace(userId: string | null): void {
  namespace = userId ? `${userId}:` : ''
}

function prefixFor(key: string): string {
  return BASE_PREFIX + namespace + key
}

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(prefixFor(key))
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // A corrupt or unreadable entry must not crash the app; the caller gets a
    // usable default and the next write repairs it.
    return fallback
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(prefixFor(key), JSON.stringify(value))
  } catch {
    // Out of quota or a locked store. Nothing actionable at this layer.
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(prefixFor(key))
  } catch {
    // Ignore.
  }
}

/** Wipes every Domus key in the CURRENT namespace. Used by "restablecer datos". */
export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const scoped = BASE_PREFIX + namespace
    const ours = keys.filter(k => k.startsWith(scoped))
    if (ours.length > 0) await AsyncStorage.multiRemove(ours)
  } catch {
    // Ignore.
  }
}

/** Collision-resistant enough for local records; the server assigns real ids later. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
