import { readJSON, writeJSON, uid } from '@/lib/storage/kv'
import type { ID, MarketItem } from '@/lib/domain/types'
import type { MarketRepository } from '../types'

const KEY = 'market'

async function all(): Promise<MarketItem[]> {
  return readJSON<MarketItem[]>(KEY, [])
}

export const localMarketRepository: MarketRepository = {
  async list() {
    // Pending first, then completed — matches how the list reads on screen.
    const items = await all()
    return [...items].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      return a.createdAt.localeCompare(b.createdAt)
    })
  },

  async create(input) {
    const items = await all()
    const item: MarketItem = {
      ...input,
      id: uid(),
      done: false,
      doneAt: null,
      createdAt: new Date().toISOString(),
    }
    await writeJSON(KEY, [...items, item])
    return item
  },

  async update(id, patch) {
    const items = await all()
    const index = items.findIndex(i => i.id === id)
    if (index === -1) throw new Error('El producto ya no existe.')
    const updated: MarketItem = { ...items[index]!, ...patch }
    const next = [...items]
    next[index] = updated
    await writeJSON(KEY, next)
    return updated
  },

  async toggleDone(id) {
    const items = await all()
    const index = items.findIndex(i => i.id === id)
    if (index === -1) throw new Error('El producto ya no existe.')
    const current = items[index]!
    const updated: MarketItem = {
      ...current,
      done: !current.done,
      doneAt: current.done ? null : new Date().toISOString(),
    }
    const next = [...items]
    next[index] = updated
    await writeJSON(KEY, next)
    return updated
  },

  async remove(id: ID) {
    const items = await all()
    await writeJSON(KEY, items.filter(i => i.id !== id))
  },

  async clearCompleted() {
    const items = await all()
    await writeJSON(KEY, items.filter(i => !i.done))
  },
}
