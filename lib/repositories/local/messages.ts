import { readJSON, writeJSON, uid } from '@/lib/storage/kv'
import type { Channel, ID, Message } from '@/lib/domain/types'
import type { MessageRepository } from '../types'

/**
 * LOCAL-ONLY CHAT — TEMPORARY.
 *
 * This exists purely so the chat UI (composer, bubbles, scrolling, keyboard
 * behaviour) can be built and felt on a real device before a backend exists.
 * Messages never leave the phone and nothing here is realtime. The screen must
 * say so; see `app/chat/[id].tsx`.
 *
 * Replacing this with a Supabase implementation should not require UI changes.
 */

const channelsKey = 'channels'
const messagesKey = (channelId: string) => `messages:${channelId}`

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'familia', name: 'Familia', icon: 'home' },
]

export const localMessageRepository: MessageRepository = {
  async listChannels() {
    return readJSON<Channel[]>(channelsKey, DEFAULT_CHANNELS)
  },

  async listMessages(channelId) {
    const msgs = await readJSON<Message[]>(messagesKey(channelId), [])
    return [...msgs].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },

  async send(channelId, senderId, text) {
    const key = messagesKey(channelId)
    const msgs = await readJSON<Message[]>(key, [])
    const message: Message = {
      id: uid(),
      channelId,
      senderId,
      text,
      createdAt: new Date().toISOString(),
      local: true,
    }
    await writeJSON(key, [...msgs, message])
    return message
  },

  async remove(id: ID) {
    const channels = await readJSON<Channel[]>(channelsKey, DEFAULT_CHANNELS)
    // The id space is global, so the message could live in any channel.
    for (const channel of channels) {
      const key = messagesKey(channel.id)
      const msgs = await readJSON<Message[]>(key, [])
      if (msgs.some(m => m.id === id)) {
        await writeJSON(key, msgs.filter(m => m.id !== id))
        return
      }
    }
  },
}
