import { supabase } from '@/lib/supabase/client'
import { requireHouseholdId } from './household'
import type { ID, MarketItem } from '@/lib/domain/types'
import type { MarketRepository } from '../types'

interface PantryRow {
  id: string
  name: string
  note: string | null
  icon: string
  color: string
  rot: number
  done: boolean
  created_at: string
}

/**
 * `pantry_items` has no `done_at` column — the local repo tracked it, but
 * nothing in the DB schema captured it and no screen reads it beyond the
 * boolean toggle. Rather than adding an unused column, `doneAt` is derived:
 * `done ? createdAt : null` is wrong (it's not the real timestamp), so it's
 * simply set to `null` when done and non-null-but-approximate isn't offered —
 * MarketItem.doneAt becomes best-effort here: present (now) right after a
 * toggle in this session, `null` after a fresh fetch. No screen currently
 * displays `doneAt`, so this doesn't regress anything visible.
 */
function toDomain(row: PantryRow, doneAt: string | null = null): MarketItem {
  return {
    id: row.id,
    name: row.name,
    note: row.note,
    icon: row.icon,
    color: row.color,
    rot: row.rot,
    done: row.done,
    doneAt: row.done ? doneAt : null,
    createdAt: row.created_at,
  }
}

const PANTRY_COLUMNS = 'id, name, note, icon, color, rot, done, created_at'

export const supabaseMarketRepository: MarketRepository = {
  async list() {
    const { householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('pantry_items')
      .select(PANTRY_COLUMNS)
      .eq('household_id', householdId)
      .order('done', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    return ((data ?? []) as PantryRow[]).map(row => toDomain(row))
  },

  async create(input) {
    const { userId, householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('pantry_items')
      .insert({
        household_id: householdId,
        name: input.name,
        note: input.note,
        icon: input.icon,
        color: input.color,
        rot: input.rot,
        added_by: userId,
      })
      .select(PANTRY_COLUMNS)
      .single()
    if (error) throw error
    return toDomain(data as PantryRow)
  },

  async update(id, patch) {
    const dbPatch: Record<string, unknown> = {}
    if (patch.name !== undefined) dbPatch.name = patch.name
    if (patch.note !== undefined) dbPatch.note = patch.note
    if (patch.icon !== undefined) dbPatch.icon = patch.icon
    if (patch.color !== undefined) dbPatch.color = patch.color
    if (patch.rot !== undefined) dbPatch.rot = patch.rot
    if (patch.done !== undefined) dbPatch.done = patch.done

    const { data, error } = await supabase
      .from('pantry_items')
      .update(dbPatch)
      .eq('id', id)
      .select(PANTRY_COLUMNS)
      .single()
    if (error) throw error
    return toDomain(data as PantryRow, patch.doneAt ?? null)
  },

  async toggleDone(id) {
    const { data: current, error: fetchError } = await supabase
      .from('pantry_items')
      .select('done')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    const nextDone = !(current as { done: boolean }).done
    const { data, error } = await supabase
      .from('pantry_items')
      .update({ done: nextDone })
      .eq('id', id)
      .select(PANTRY_COLUMNS)
      .single()
    if (error) throw error
    return toDomain(data as PantryRow, nextDone ? new Date().toISOString() : null)
  },

  async remove(id: ID) {
    const { error } = await supabase.from('pantry_items').delete().eq('id', id)
    if (error) throw error
  },

  async clearCompleted() {
    const { householdId } = await requireHouseholdId()
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('household_id', householdId)
      .eq('done', true)
    if (error) throw error
  },
}
