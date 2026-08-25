import { readJSON, writeJSON, uid } from '@/lib/storage/kv'
import type { Duty, DutyCompletion, ID } from '@/lib/domain/types'
import type { DutyRepository } from '../types'
import { weekdayIndex } from '@/lib/utils/date'

const DUTIES_KEY = 'duties'
/** Completions are stored per day so a single day's writes stay small. */
const completionsKey = (date: string) => `completions:${date}`

async function allDuties(): Promise<Duty[]> {
  return readJSON<Duty[]>(DUTIES_KEY, [])
}

function repeatsOn(duty: Duty, date: string): boolean {
  const day = weekdayIndex(date) // 0 = Monday
  if (duty.repeat === 'daily') return true
  if (duty.repeat === 'weekdays') return day <= 4
  return duty.repeatDays.includes(day)
}

export const localDutyRepository: DutyRepository = {
  async listAll() {
    return allDuties()
  },

  async listForDate(date) {
    const duties = await allDuties()
    return duties.filter(d => repeatsOn(d, date))
  },

  async create(input) {
    const duties = await allDuties()
    const duty: Duty = { ...input, id: uid(), createdAt: new Date().toISOString() }
    await writeJSON(DUTIES_KEY, [...duties, duty])
    return duty
  },

  async update(id, patch) {
    const duties = await allDuties()
    const index = duties.findIndex(d => d.id === id)
    if (index === -1) throw new Error('El deber ya no existe.')
    const updated: Duty = { ...duties[index]!, ...patch }
    const next = [...duties]
    next[index] = updated
    await writeJSON(DUTIES_KEY, next)
    return updated
  },

  async remove(id: ID) {
    const duties = await allDuties()
    await writeJSON(DUTIES_KEY, duties.filter(d => d.id !== id))
  },

  async listCompletions(date) {
    return readJSON<DutyCompletion[]>(completionsKey(date), [])
  },

  async toggleCompletion(dutyId, memberId, date) {
    const key = completionsKey(date)
    const current = await readJSON<DutyCompletion[]>(key, [])
    const existing = current.findIndex(c => c.dutyId === dutyId && c.memberId === memberId)

    if (existing !== -1) {
      await writeJSON(key, current.filter((_, i) => i !== existing))
      return false
    }

    const completion: DutyCompletion = {
      dutyId,
      memberId,
      date,
      completedAt: new Date().toISOString(),
    }
    await writeJSON(key, [...current, completion])
    return true
  },
}
