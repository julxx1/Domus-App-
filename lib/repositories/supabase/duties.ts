import { supabase } from '@/lib/supabase/client'
import { requireHouseholdId } from './household'
import { weekdayIndex } from '@/lib/utils/date'
import type { Duty, DutyCompletion, ID, RepeatMode } from '@/lib/domain/types'
import type { DutyRepository } from '../types'

interface ChoreRow {
  id: string
  title: string
  icon: string
  repeat: string
  repeat_days: number[]
  scheduled_time: string | null
  assignee_ids: string[]
  created_at: string
}

function toDomain(row: ChoreRow): Duty {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    repeat: row.repeat as RepeatMode,
    repeatDays: row.repeat_days,
    // Postgres TIME comes back as "HH:MM:SS" — the domain only ever wants "HH:MM".
    time: row.scheduled_time ? row.scheduled_time.slice(0, 5) : null,
    assigneeIds: row.assignee_ids,
    createdAt: row.created_at,
  }
}

function repeatsOn(duty: Duty, date: string): boolean {
  const day = weekdayIndex(date) // 0 = Monday
  if (duty.repeat === 'daily') return true
  if (duty.repeat === 'weekdays') return day <= 4
  return duty.repeatDays.includes(day)
}

const CHORE_COLUMNS = 'id, title, icon, repeat, repeat_days, scheduled_time, assignee_ids, created_at'

export const supabaseDutyRepository: DutyRepository = {
  async listAll() {
    const { householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('chores')
      .select(CHORE_COLUMNS)
      .eq('household_id', householdId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return ((data ?? []) as ChoreRow[]).map(toDomain)
  },

  async listForDate(date) {
    const { householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('chores')
      .select(CHORE_COLUMNS)
      .eq('household_id', householdId)
    if (error) throw error
    return ((data ?? []) as ChoreRow[]).map(toDomain).filter(d => repeatsOn(d, date))
  },

  async create(input) {
    const { userId, householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('chores')
      .insert({
        household_id: householdId,
        title: input.title,
        icon: input.icon,
        repeat: input.repeat,
        repeat_days: input.repeatDays,
        scheduled_time: input.time,
        assignee_ids: input.assigneeIds,
        created_by: userId,
      })
      .select(CHORE_COLUMNS)
      .single()
    if (error) throw error
    return toDomain(data as ChoreRow)
  },

  async update(id, patch) {
    const dbPatch: Record<string, unknown> = {}
    if (patch.title !== undefined) dbPatch.title = patch.title
    if (patch.icon !== undefined) dbPatch.icon = patch.icon
    if (patch.repeat !== undefined) dbPatch.repeat = patch.repeat
    if (patch.repeatDays !== undefined) dbPatch.repeat_days = patch.repeatDays
    if (patch.time !== undefined) dbPatch.scheduled_time = patch.time
    if (patch.assigneeIds !== undefined) dbPatch.assignee_ids = patch.assigneeIds

    const { data, error } = await supabase
      .from('chores')
      .update(dbPatch)
      .eq('id', id)
      .select(CHORE_COLUMNS)
      .single()
    if (error) throw error
    return toDomain(data as ChoreRow)
  },

  async remove(id: ID) {
    const { error } = await supabase.from('chores').delete().eq('id', id)
    if (error) throw error
  },

  async listCompletions(date) {
    const { householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('chore_completions')
      .select('chore_id, user_id, completed_date, completed_at')
      .eq('household_id', householdId)
      .eq('completed_date', date)
    if (error) throw error
    return ((data ?? []) as { chore_id: string; user_id: string; completed_date: string; completed_at: string }[]).map(
      row => ({
        dutyId: row.chore_id,
        memberId: row.user_id,
        date: row.completed_date,
        completedAt: row.completed_at,
      })
    ) as DutyCompletion[]
  },

  async toggleCompletion(dutyId, memberId, date) {
    const { householdId } = await requireHouseholdId()
    const { data: existing, error: findError } = await supabase
      .from('chore_completions')
      .select('id')
      .eq('chore_id', dutyId)
      .eq('user_id', memberId)
      .eq('completed_date', date)
      .maybeSingle()
    if (findError) throw findError

    if (existing) {
      const { error } = await supabase.from('chore_completions').delete().eq('id', (existing as { id: string }).id)
      if (error) throw error
      return false
    }

    const { error } = await supabase.from('chore_completions').insert({
      chore_id: dutyId,
      household_id: householdId,
      user_id: memberId,
      completed_date: date,
    })
    if (error) throw error
    return true
  },
}
