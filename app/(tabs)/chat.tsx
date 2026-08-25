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
import { EmptyState, Eyebrow, PressableScale, Title } from '@/components/Shared'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import type { Message } from '@/lib/domain/types'
import { colors, fonts, motion, radii, spacing } from '@/theme/tokens'

const CHANNEL_ID = 'familia'
const TAB_BAR_CLEARANCE = 80

/**
 * Chat (tab 3).
 *
 * The messages here are LOCAL AND TEMPORARY — they never leave the phone and
 * nothing is realtime. The banner says so explicitly rather than implying a
 * working family chat. The composer, bubbles, scroll and keyboard behaviour are
 * real, so replacing the repository with Supabase later needs no UI changes.
 */
export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<ScrollView>(null)
  const didInitialScroll = useRef(false)

  const profile = useAsyncData(() => repositories.profile.get(), [])
  const messages = useAsyncData(() => repositories.messages.listMessages(CHANNEL_ID), [])
  const list = messages.data ?? []

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
    if (!text) return
    setDraft('')
    await repositories.messages.send(CHANNEL_ID, profile.data?.id ?? 'me', text)
    await messages.reload()
  }, [draft, messages, profile.data?.id])

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Stagger index={0} style={styles.header}>
        <Eyebrow>Conversaciones</Eyebrow>
        <Title>Chat</Title>
      </Stagger>

      <View style={styles.notice}>
        <Icon name="bell" size={13} color={colors.terraDeep} strokeWidth={2} />
        <Text style={styles.noticeText}>
          Mensajes locales de prueba. Aún no se sincronizan con tu familia.
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {list.length === 0 ? (
            <EmptyState
              title="Aún no hay mensajes"
              description="Escribe abajo para probar la interfaz."
            />
          ) : (
            list.map((message, index) => (
              <Bubble
                key={message.id}
                message={message}
                mine={message.senderId === (profile.data?.id ?? 'me')}
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
            disabled={draft.trim().length === 0}
            accessibilityLabel="Enviar"
            style={[
              styles.send,
              { backgroundColor: draft.trim() ? colors.terra : colors.lineStrong },
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
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.screenX,
    marginBottom: 12,
    padding: 10,
    borderRadius: radii.sm + 2,
    backgroundColor: 'rgba(201,123,74,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(201,123,74,0.22)',
  },
  noticeText: { flex: 1, fontFamily: fonts.sans, fontSize: 11.5, color: colors.terraDeep, lineHeight: 16 },
  messages: { paddingHorizontal: spacing.screenX, paddingBottom: 12, gap: 8 },
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
