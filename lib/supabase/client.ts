import 'react-native-url-polyfill/auto'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

/**
 * Single Supabase client for all of Domus mobile. Every screen/repository
 * imports this instance — never call `createClient` a second time.
 *
 * Not `createClient<Database>(...)`: the installed @supabase/postgrest-js
 * (2.112.3) resolves every `.select()`/`.rpc()` result to `never`/`null`
 * against a hand-written `Database` generic under this project's TS 5.9 —
 * confirmed by isolating the exact query chain, not a typo in the Database
 * type (Database['public']['Tables']['profiles']['Row'] resolves correctly
 * on its own; only the fluent query-builder's inference breaks). Repositories
 * cast query results to the concrete row types in `./types.ts` at the
 * boundary instead — same safety, without fighting a version-specific
 * generic-inference bug in the ORM.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Revisa domus-mobile/.env.'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // No URL-based OAuth/magic-link redirect capture in Expo Go — the reset
    // password screen parses the deep link itself (see app/(auth)/reset-password.tsx).
    detectSessionInUrl: false,
  },
})

/**
 * supabase-js's `autoRefreshToken` only ticks while something calls
 * `startAutoRefresh`/`stopAutoRefresh` around the app's foreground state —
 * on RN there's no `document` to drive that automatically like on web.
 * Without this, a token silently goes stale while the app is backgrounded.
 */
AppState.addEventListener('change', state => {
  if (state === 'active') {
    void supabase.auth.startAutoRefresh()
  } else {
    void supabase.auth.stopAutoRefresh()
  }
})
