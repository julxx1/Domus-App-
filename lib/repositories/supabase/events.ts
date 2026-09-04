import { supabase } from '@/lib/supabase/client'
import { requireHouseholdId } from './household'
import type { CalendarEvent, EventCategory, ID } from '@/lib/domain/types'
import type { EventRepository } from '../types'

/**
 * `calendar_events.start_time`/`end_time` are TIMESTAMPTZ; the domain model
 * keeps a local calendar day (`date`) and local wall-clock times (`startTime`/
 * `endTime`) as separate strings. Combining/splitting goes through a plain JS
 * `Date` — constructing `new Date(y, m, d, h, min)` builds a LOCAL time, and
 * `.toISOString()` converts that exact moment to true UTC for storage; reading
 * back does the reverse via the device's own local getters. This assumes
 * household members share a timezone (true for a home), same assumption the
 * local repo's plain HH:MM strings always made.
 */
function combineLocal(date: string, hhmm: string): Date {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = hhmm.split(':').map(Number)
  return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 0, 0)
}

function toDateKeyLocal(dt: Date): string {
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toHHMM(dt: Date): string {
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
}

interface EventRow {
  id: string
  title: string
  note: string | null
  start_time: string
  end_time: string | null
  category: string
  member_id: string | null
  created_at: string
}

function toDomain(row: EventRow): CalendarEvent {
  const start = new Date(row.start_time)
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    date: toDateKeyLocal(start),
    startTime: toHHMM(start),
    endTime: row.end_time ? toHHMM(new Date(row.end_time)) : null,
    category: row.category as EventCategory,
    memberId: row.member_id,
    createdAt: row.created_at,
  }
}

export const supabaseEventRepository: EventRepository = {
  async listByDate(date) {
    const { householdId } = await requireHouseholdId()
    // start_time spans the local day: querying by the exact UTC range for
    // [00:00, 24:00) local avoids pulling in neighbouring-day rows near
    // midnight the way a naive date-string prefix match would on TIMESTAMPTZ.
    const dayStart = combineLocal(date, '00:00').toISOString()
    const dayEnd = combineLocal(date, '23:59').toISOString()
    const { data, error } = await supabase
      .from('calendar_events')
      .select('id, title, note, start_time, end_time, category, member_id, created_at')
      .eq('household_id', householdId)
      .gte('start_time', dayStart)
      .lte('start_time', dayEnd)
      .order('start_time', { ascending: true })
    if (error) throw error
    return ((data ?? []) as EventRow[]).map(toDomain)
  },

  async datesWithEvents(month) {
    const { householdId } = await requireHouseholdId()
    const [y, m] = month.split('-').map(Number)
    const monthStart = new Date(y ?? 1970, (m ?? 1) - 1, 1, 0, 0, 0).toISOString()
    const monthEnd = new Date(y ?? 1970, (m ?? 1), 1, 0, 0, 0).toISOString()
    const { data, error } = await supabase
      .from('calendar_events')
      .select('start_time')
      .eq('household_id', householdId)
      .gte('start_time', monthStart)
      .lt('start_time', monthEnd)
    if (error) throw error
    const dates = ((data ?? []) as { start_time: string }[]).map(r => toDateKeyLocal(new Date(r.start_time)))
    return [...new Set(dates)]
  },

  async create(input) {
    const { userId, householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        household_id: householdId,
        title: input.title,
        note: input.note,
        start_time: combineLocal(input.date, input.startTime).toISOString(),
        end_time: input.endTime ? combineLocal(input.date, input.endTime).toISOString() : null,
        category: input.category,
        member_id: input.memberId,
        created_by: userId,
      })
      .select('id, title, note, start_time, end_time, category, member_id, created_at')
      .single()
    if (error) throw error
    return toDomain(data as EventRow)
  },

  async update(id, patch) {
    const dbPatch: Record<string, unknown> = {}
    if (patch.title !== undefined) dbPatch.title = patch.title
    if (patch.note !== undefined) dbPatch.note = patch.note
    if (patch.category !== undefined) dbPatch.category = patch.category
    if (patch.memberId !== undefined) dbPatch.member_id = patch.memberId
    // date/startTime/endTime are combined together — a patch touching any one
    // of them needs the full trio to rebuild the timestamp correctly.
    if (patch.date !== undefined || patch.startTime !== undefined || patch.endTime !== undefined) {
      const { data: current, error: fetchError } = await supabase
        .from('calendar_events')
        .select('start_time, end_time')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError
      const row = current as { start_time: string; end_time: string | null }
      const existingStart = new Date(row.start_time)
      const date = patch.date ?? toDateKeyLocal(existingStart)
      const startTime = patch.startTime ?? toHHMM(existingStart)
      const endTime = patch.endTime !== undefined ? patch.endTime : row.end_time ? toHHMM(new Date(row.end_time)) : null
      dbPatch.start_time = combineLocal(date, startTime).toISOString()
      dbPatch.end_time = endTime ? combineLocal(date, endTime).toISOString() : null
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .update(dbPatch)
      .eq('id', id)
      .select('id, title, note, start_time, end_time, category, member_id, created_at')
      .single()
    if (error) throw error
    return toDomain(data as EventRow)
  },

  async remove(id: ID) {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id)
    if (error) throw error
  },
}
