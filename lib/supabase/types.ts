/**
 * Hand-written row/RPC-result types for the tables the mobile client
 * actually touches in this phase (profiles, households, household_invitations).
 *
 * These are NOT threaded through `createClient<Database>(...)` — see the
 * comment in `./client.ts` for why (a confirmed generic-inference bug between
 * this TS version and the installed @supabase/postgrest-js). Repositories
 * cast `.select()`/`.rpc()` results to these types at the call site instead.
 */

import type { Role } from '@/lib/domain/types'

/** Same 8-value set as `profiles_role_check` in the DB — kept in sync with `Role` in domain/types.ts. */
export type FamilyRole = Role
export type InvitationRole = Exclude<FamilyRole, 'Admin'>

export interface ProfileRow {
  id: string
  email: string
  name: string
  first_name: string | null
  last_name: string | null
  role: FamilyRole
  color: string
  avatar_url: string | null
  household_id: string | null
  created_at: string
  updated_at: string
}

export interface HouseholdRow {
  id: string
  name: string
  owner_id: string
  invite_code: string
  home_lat: number | null
  home_lng: number | null
  created_at: string
}

export interface HouseholdInvitationRow {
  id: string
  household_id: string
  code: string
  role: InvitationRole
  created_by: string
  expires_at: string
  used_at: string | null
  used_by: string | null
  created_at: string
}

