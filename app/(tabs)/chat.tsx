import { useCallback, useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { EmptyState, PressableScale, Title } from '@/components/Shared'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import { supabase } from '@/lib/supabase/client'
import { rowToMessage } from '@/lib/repositories/supabase/messages'
import type { Message } from '@/lib/domain/types'
import { colors, fonts, motion, radii, spacing } from '@/theme/tokens'

const TAB_BAR_CLEARANCE = 80

/**
 * Chat (tab 3) — real, shared with the household via Supabase Realtime.
 *
 * Every household gets exactly one conversation ("Familia"), created on
 * first open by `repositories.messages.listChannels()` (find-or-create).
 * New messages arrive live via a `postgres_changes` subscription rather than
 * polling/reload — `send()` only inserts; the subscription is what actually
 * appends the bubble, for the sender too, so there's a single code path for
 * "a message showed up" instead of an optimistic-append plus a possible
 * realtime duplicate.
 */
export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const didInitialScroll = useRef(false)

  const profile = useAsyncData(() => repositories.profile.get(), [])
  const channels = useAsyncData(() => repositories.messages.listChannels(), [])
  const channelId = channels.data?.[0]?.id ?? null

  const messages = useAsyncData(
    () => (channelId ? repositories.messages.listMessages(channelId) : Promise.resolve([] as Message[])),
    [channelId]
  )
  const list = messages.data ?? []

  useEffect(() => {
    if (!channelId) return
    const sub = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${channelId}` },
        payload => {
          const incoming = rowToMessage(payload.new as Parameters<typeof rowToMessage>[0])
          messages.set(prev => {
            const current = prev ?? []
            if (current.some(m => m.id === incoming.id)) return current
            return [...current, incoming]
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(sub)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId])

  useEffect(() => {
    if (list.length === 0) return
    // First load jumps; later arrivals glide, so history doesn't animate past.
    const animated = didInitialScroll.current
    didInitialScroll.current = true
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated }), 50)
    return () => clearTimeout(t)
  }, [list.length])

  const send = useCallback(async () => {
    const text = draft.trim()
    if (!text || !channelId || !profile.data || sending) return
    setDraft('')
    setSending(true)
    try {
      await repositories.messages.send(channelId, profile.data.id, text)
      // Bubble appears via the realtime subscription above, not here.
    } finally {
      setSending(false)
    }
  }, [draft, channelId, profile.data, sending])

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Stagger index={0} style={styles.header}>
        <Title>Chat</Title>
      </Stagger>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {list.length === 0 ? (
            <EmptyState
              title="Aún no hay mensajes"
              description="Escribe abajo para empezar la conversación de tu hogar."
            />
          ) : (
            list.map((message, index) => (
              <Bubble
                key={message.id}
                message={message}
                mine={message.senderId === profile.data?.id}
                // Only messages added after the initial render animate in.
                animate={didInitialScroll.current && index === list.length - 1}
              />
            ))
          )}
        </ScrollView>

        <View style={[styles.composer, { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Escribe un mensaje…"
            placeholderTextColor={colors.muteLight}
            style={styles.input}
            multiline
            onSubmitEditing={() => void send()}
          />
          <PressableScale
            onPress={() => void send()}
            disabled={draft.trim().length === 0 || sending}
            accessibilityLabel="Enviar"
            style={[
              styles.send,
              { backgroundColor: draft.trim() && !sending ? colors.terra : colors.lineStrong },
            ]}
          >
            <Icon name="send" size={17} color="#fff" strokeWidth={2} />
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

function Bubble({
  message,
  mine,
  animate,
}: {
  message: Message
  mine: boolean
  animate: boolean
}) {
  const time = new Date(message.createdAt).toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <Animated.View
      entering={animate ? FadeInDown.duration(motion.duration.base) : undefined}
      style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}
    >
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, mine && { color: colors.cream }]}>{message.text}</Text>
        <Text style={[styles.bubbleTime, mine && { color: 'rgba(245,239,230,0.7)' }]}>{time}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.screenX, paddingTop: 16, paddingBottom: 14 },
  messages: { paddingHorizontal: spacing.screenX, paddingBottom: 12, gap: 8, flexGrow: 1 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: colors.ink, borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.ink, lineHeight: 20 },
  bubbleTime: { fontFamily: fonts.sans, fontSize: 10, color: colors.mute, marginTop: 4, alignSelf: 'flex-end' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: spacing.screenX,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
