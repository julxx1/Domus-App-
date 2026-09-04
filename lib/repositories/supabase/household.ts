import { supabase } from '@/lib/supabase/client'

/**
 * Shared by every Supabase-backed repository that writes household-scoped
 * content (events, duties, market — profile has its own variant since it
 * doesn't need a household_id). Throws rather than returning null: every
 * caller here only ever runs once (auth)/(onboarding) gating has confirmed a
 * session + household exist, so a missing one means something upstream broke.
 */
export async function requireHouseholdId(): Promise<{ userId: string; householdId: string }> {
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('No hay sesión activa.')

  const { data, error } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', userId)
    .single()
  if (error) throw error

  const householdId = (data as { household_id: string | null }).household_id
  if (!householdId) throw new Error('Tu cuenta todavía no pertenece a un hogar.')

  return { userId, householdId }
}
