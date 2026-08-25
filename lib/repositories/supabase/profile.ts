import { supabase } from '@/lib/supabase/client'
import type { ID, Member, Profile, Role } from '@/lib/domain/types'
import type { ProfileRow } from '@/lib/supabase/types'
import type { ProfileRepository } from '../types'

/**
 * Backed by the real `profiles`/`households` tables. Only reachable once the
 * app is inside (tabs) — AuthGate guarantees a session + household exist by
 * then, so every call here can assume `auth.uid()` resolves.
 *
 * `addMember`/`removeMember` aren't meaningful here: real membership only
 * changes through `create_household`/`join_household_with_code` (an invite
 * code, not a direct insert) — see supabase/migrations/20260812000000_*.sql.
 * They throw rather than silently no-op, so a future caller notices instead
 * of assuming a member was added.
 */
async function getProfile(): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('No hay sesión activa.')

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (profileError) throw profileError
  const profileRow = profileData as ProfileRow

  let familyName = ''
  if (profileRow.household_id) {
    const { data: householdData } = await supabase
      .from('households')
      .select('name')
      .eq('id', profileRow.household_id)
      .maybeSingle()
    familyName = (householdData as { name: string } | null)?.name ?? ''
  }

  return toProfile(profileRow, familyName)
}

export const supabaseProfileRepository: ProfileRepository = {
  get: getProfile,

  async update(patch) {
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    if (!userId) throw new Error('No hay sesión activa.')

    const dbPatch: Record<string, unknown> = {}
    if (patch.name !== undefined) dbPatch.name = patch.name
    if (patch.color !== undefined) dbPatch.color = patch.color
    // `role`/household rename intentionally NOT handled here — role is
    // server-assigned on join/create (and self-changes are reverted by a DB
    // trigger regardless), and renaming the household is a household-level
    // action, not a profile field. See docs/SUPABASE_AUTH_IMPLEMENTATION.md.

    if (Object.keys(dbPatch).length > 0) {
      const { error } = await supabase.from('profiles').update(dbPatch).eq('id', userId)
      if (error) throw error
    }

    return getProfile()
  },

  async listMembers() {
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    if (!userId) throw new Error('No hay sesión activa.')

    const { data: selfData, error: selfError } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', userId)
      .single()
    if (selfError) throw selfError
    const selfRow = selfData as { household_id: string | null }
    if (!selfRow.household_id) return []

    const { data: rows, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('household_id', selfRow.household_id)
      .neq('id', userId)
    if (error) throw error

    return ((rows ?? []) as ProfileRow[]).map(row => ({
      id: row.id,
      name: row.name,
      role: row.role as Role,
      color: row.color,
      atHome: true,
    }))
  },

  async addMember(): Promise<Member> {
    throw new Error('Los miembros se unen con un código de invitación, no se agregan directamente.')
  },

  async removeMember(_id: ID): Promise<void> {
    throw new Error('Quitar miembros de la familia aún no está disponible.')
  },
}

function toProfile(
  row: { id: string; name: string; role: string; color: string; email: string },
  familyName: string
): Profile {
  return {
    id: row.id,
    name: row.name,
    role: row.role as Role,
    color: row.color,
    familyName,
    email: row.email,
  }
}
