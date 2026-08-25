import type { Repositories } from './types'
import { supabaseProfileRepository } from './supabase/profile'
import { localEventRepository } from './local/events'
import { localDutyRepository } from './local/duties'
import { localMarketRepository } from './local/market'
import { localMessageRepository } from './local/messages'
import { localCameraRepository } from './local/cameras'

/**
 * THE SWAP POINT.
 *
 * Screens and hooks import `repositories` from here and never reach for a
 * concrete implementation. `profile` is real (Supabase Auth phase 1) — every
 * screen that reads it only ever renders once (auth)/(onboarding) gating in
 * AuthGate has confirmed a session and household exist. Agenda/Deberes/
 * Mercado/Chat stay on local AsyncStorage this phase, per the phase-1 scope.
 */
export const repositories: Repositories = {
  profile: supabaseProfileRepository,
  events: localEventRepository,
  duties: localDutyRepository,
  market: localMarketRepository,
  messages: localMessageRepository,
  cameras: localCameraRepository,
}

export type { Repositories } from './types'
