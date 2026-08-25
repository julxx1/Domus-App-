import { readJSON, writeJSON, uid } from '@/lib/storage/kv'
import type { CalendarEvent, ID } from '@/lib/domain/types'
import type { EventRepository } from '../types'

const KEY = 'events'

async function all(): Promise<CalendarEvent[]> {
  return readJSON<CalendarEvent[]>(KEY, [])
}

export const localEventRepository: EventRepository = {
  async listByDate(date) {
    const events = await all()
    return events
      .filter(e => e.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  },

  async datesWithEvents(month) {
    const events = await all()
    // `month` is YYYY-MM and dates are YYYY-MM-DD, so a prefix match is enough.
    return [...new Set(events.filter(e => e.date.startsWith(month)).map(e => e.date))]
  },

  async create(input) {
    const events = await all()
    const event: CalendarEvent = { ...input, id: uid(), createdAt: new Date().toISOString() }
    await writeJSON(KEY, [...events, event])
    return event
  },

  async update(id, patch) {
    const events = await all()
    const index = events.findIndex(e => e.id === id)
    if (index === -1) throw new Error('El evento ya no existe.')
    const updated: CalendarEvent = { ...events[index]!, ...patch }
    const next = [...events]
    next[index] = updated
    await writeJSON(KEY, next)
    return updated
  },

  async remove(id: ID) {
    const events = await all()
    await writeJSON(KEY, events.filter(e => e.id !== id))
  },
}
