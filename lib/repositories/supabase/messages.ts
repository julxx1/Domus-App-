import { supabase } from '@/lib/supabase/client'
import { requireHouseholdId } from './household'
import type { Channel, ID, Message } from '@/lib/domain/types'
import type { MessageRepository } from '../types'

interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  created_at: string
}

export function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    channelId: row.conversation_id,
    senderId: row.sender_id,
    text: row.text,
    createdAt: row.created_at,
  }
}

const MESSAGE_COLUMNS = 'id, conversation_id, sender_id, text, created_at'

export const supabaseMessageRepository: MessageRepository = {
  async listChannels() {
    const { userId, householdId } = await requireHouseholdId()

    const { data: existing, error: selectError } = await supabase
      .from('conversations')
      .select('id, name, icon')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true })
      .limit(1)
    if (selectError) throw selectError

    if (existing && existing.length > 0) {
      return existing as Channel[]
    }

    // First time this household opens Chat — create its one conversation.
    // `insert().select()` can race if two members open Chat at the exact
    // same moment; harmless here (worst case: two "Familia" conversations,
    // the UI only ever uses the first one returned by the ordered SELECT
    // above on the next load).
    const { data: created, error: insertError } = await supabase
      .from('conversations')
      .insert({ household_id: householdId, name: 'Familia', icon: 'chat', created_by: userId })
      .select('id, name, icon')
      .single()
    if (insertError) throw insertError

    return [created as Channel]
  },

  async listMessages(channelId) {
    const { data, error } = await supabase
      .from('messages')
      .select(MESSAGE_COLUMNS)
      .eq('conversation_id', channelId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return ((data ?? []) as MessageRow[]).map(rowToMessage)
  },

  async send(channelId, senderId, text) {
    const { householdId } = await requireHouseholdId()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: channelId,
        household_id: householdId,
        sender_id: senderId,
        text,
      })
      .select(MESSAGE_COLUMNS)
      .single()
    if (error) throw error
    return rowToMessage(data as MessageRow)
  },

  async remove(id: ID) {
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) throw error
  },
}
