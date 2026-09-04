import type { Repositories } from './types'
import { supabaseProfileRepository } from './supabase/profile'
import { supabaseEventRepository } from './supabase/events'
import { supabaseDutyRepository } from './supabase/duties'
import { supabaseMarketRepository } from './supabase/market'
import { supabaseMessageRepository } from './supabase/messages'
import { localCameraRepository } from './local/cameras'

/**
 * THE SWAP POINT.
 *
 * Screens and hooks import `repositories` from here and never reach for a
 * concrete implementation. `profile`/`events`/`duties`/`market`/`messages`
 * are real (Supabase, shared across the household) — every screen that reads
 * them only ever renders once (auth)/(onboarding) gating in AuthGate has
 * confirmed a session and household exist. `cameras` stays on local
 * AsyncStorage — it needs a native ONVIF client, separate future work.
 */
export const repositories: Repositories = {
  profile: supabaseProfileRepository,
  events: supabaseEventRepository,
  duties: supabaseDutyRepository,
  market: supabaseMarketRepository,
  messages: supabaseMessageRepository,
  cameras: localCameraRepository,
}

export type { Repositories } from './types'
