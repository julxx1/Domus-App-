import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Icon from '@/components/Icon'
import Sheet from '@/components/Sheet'
import { Field, SheetHeader } from '@/components/Form'
import { Eyebrow, PressableScale, Title } from '@/components/Shared'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import type { MarketItem } from '@/lib/domain/types'
import { colors, fonts, motion, radii, spacing } from '@/theme/tokens'

const TAB_BAR_CLEARANCE = 80
const EASE = Easing.bezier(motion.easeOut.x1, motion.easeOut.y1, motion.easeOut.x2, motion.easeOut.y2)

/** Sticky-note paper colours — a fixed small palette, not the app theme. */
const NOTE_COLORS = ['#FFF4B8', '#FFD6B8', '#FFB8B8', '#FFD0E4', '#D8E8C8', '#D0E8F0']
const NOTE_ICONS = ['box', 'milk', 'bread', 'egg', 'tomato', 'leaf', 'heart', 'star', 'cart']

/**
 * Mercado (tab 4) — 1:1 with `domus-app/src/screens/MercadoScreen.jsx`.
 *
 * A summary card (pending/total, % complete) sits above a corkboard of sticky
 * notes with a dashed "Agregar" tile at the end. The progress bar is
 * CONDITIONAL on the web (`total > 0 &&`) — at 0/0 it is simply absent, not
 * rendered at zero width. This mirrors that exactly.
 */
export default function MercadoScreen() {
  const insets = useSafeAreaInsets()
  const [showAdd, setShowAdd] = useState(false)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const items = useAsyncData(() => repositories.market.list(), [])
  const list = items.data ?? []

  const pending = list.filter(i => !i.done).length
  const total = list.length
  const percent = total > 0 ? Math.round(((total - pending) / total) * 100) : 0

  const toggle = useCallback(
    async (id: string) => {
      items.set(prev => (prev ?? []).map(i => (i.id === id ? { ...i, done: !i.done } : i)))
      await repositories.market.toggleDone(id)
      await items.reload()
    },
    [items]
  )

  // Play the exit animation, then actually delete after it finishes (~200ms) —
  // matches the web's item-out timing.
  const remove = useCallback((id: string) => {
    setRemovingIds(prev => new Set(prev).add(id))
    setTimeout(async () => {
      await repositories.market.remove(id)
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      await items.reload()
    }, 200)
  }, [items])

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(motion.duration.base)} style={styles.header}>
          <View>
            <Eyebrow>Despensa del hogar</Eyebrow>
            <Title>Mercado</Title>
          </View>
          <PressableScale
            onPress={() => setShowAdd(true)}
            accessibilityLabel="Agregar producto"
            style={styles.addBtn}
          >
            <Icon name="plus" size={18} color="#fff" strokeWidth={2.2} />
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(motion.duration.base)} style={styles.summaryWrap}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryValue}>
                  <Text style={{ color: colors.terraDeep }}>{pending}</Text>
                  <Text style={styles.summaryValueTotal}> / {total}</Text>
                </Text>
                <Text style={styles.summaryLabel}>por comprar</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.summaryValue, { color: colors.sageDeep }]}>{percent}%</Text>
                <Text style={styles.summaryLabel}>completado</Text>
              </View>
            </View>

            {total > 0 ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
            ) : null}
          </View>
        </Animated.View>

        <View style={styles.corkboardWrap}>
          <View style={styles.corkboard}>
            <View style={styles.notesFlow}>
              {list.map(item => (
                <StickyNote
                  key={item.id}
                  item={item}
                  removing={removingIds.has(item.id)}
                  onToggle={() => void toggle(item.id)}
                  onDelete={() => remove(item.id)}
                />
              ))}

              <PressableScale
                onPress={() => setShowAdd(true)}
                accessibilityLabel="Agregar producto"
                style={styles.addTile}
              >
                <Icon name="plus" size={22} color={colors.mute} strokeWidth={1.8} />
                <Text style={styles.addTileText}>Agregar</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </ScrollView>

      <Sheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <AgregarForm onClose={() => setShowAdd(false)} onSaved={() => void items.reload()} />
      </Sheet>
    </View>
  )
}

// ── Sticky note ──────────────────────────────────────────────────────────────

function StickyNote({
  item,
  removing,
  onToggle,
  onDelete,
}: {
  item: MarketItem
  removing: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const opacity = useSharedValue(item.done ? 0.5 : 1)
  const checkScale = useSharedValue(item.done ? 1 : 0)

  const animatedNoteStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const animatedCheckStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }))

  function handleToggle() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    opacity.value = withTiming(item.done ? 1 : 0.5, { duration: 220, easing: EASE })
    checkScale.value = item.done
      ? withTiming(0, { duration: 150, easing: EASE })
      : withSequence(withTiming(1.3, { duration: 90, easing: EASE }), withTiming(1, { duration: 130, easing: EASE }))
    onToggle()
  }

  return (
    <Animated.View
      entering={FadeIn.duration(motion.duration.base)}
      exiting={removing ? FadeOut.duration(motion.duration.fast) : undefined}
    >
      <Animated.View
        style={[
          styles.note,
          animatedNoteStyle,
          { backgroundColor: item.color, transform: [{ rotate: `${item.rot}deg` }] },
        ]}
      >
        <View style={styles.noteTape} />

        <PressableScale
          onPress={onDelete}
          scaleTo={0.85}
          accessibilityLabel={`Eliminar ${item.name}`}
          style={styles.noteDelete}
        >
          <Text style={styles.noteDeleteText}>×</Text>
        </PressableScale>

        <Icon name={item.icon} size={20} color="rgba(61,58,54,0.5)" strokeWidth={1.6} />

        <Text
          style={[styles.noteName, item.done && styles.noteTextDone]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {item.note ? (
          <Text style={[styles.noteSub, item.done && styles.noteTextDone]} numberOfLines={2}>
            {item.note}
          </Text>
        ) : null}

        <PressableScale onPress={handleToggle} accessibilityLabel={item.name} style={styles.noteCheckRow}>
          <View
            style={[
              styles.noteCheck,
              item.done && { backgroundColor: colors.ok, borderColor: colors.ok },
            ]}
          >
            <Animated.View style={animatedCheckStyle}>
              <Icon name="check" size={11} color="#fff" strokeWidth={3} />
            </Animated.View>
          </View>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  )
}

// ── Add form ─────────────────────────────────────────────────────────────────

function AgregarForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [icon, setIcon] = useState('box')
  const [color, setColor] = useState(NOTE_COLORS[0]!)
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && !saving

  async function save() {
    if (!canSave) return
    setSaving(true)
    const rot = Math.floor(Math.random() * 7) - 3
    await repositories.market.create({
      name: name.trim(),
      note: note.trim() || null,
      icon,
      color,
      rot,
    })
    onSaved()
    onClose()
  }

  return (
    <View>
      <SheetHeader title="Agregar al mercado" onClose={onClose} />

      <Field
        value={name}
        onChangeText={setName}
        placeholder="¿Qué necesitas?"
        label="Producto"
        autoFocus
      />
      <Field
        value={note}
        onChangeText={setNote}
        placeholder="Nota opcional (cantidad, marca…)"
        label="Nota"
      />

      <Text style={styles.formLabel}>ÍCONO</Text>
      <View style={styles.iconRow}>
        {NOTE_ICONS.map(n => {
          const active = icon === n
          return (
            <PressableScale
              key={n}
              onPress={() => setIcon(n)}
              accessibilityLabel={n}
              style={[styles.iconOption, active && { backgroundColor: colors.terraSoft }]}
            >
              <Icon name={n} size={16} color={active ? colors.terraDeep : colors.ink} />
            </PressableScale>
          )
        })}
      </View>

      <Text style={styles.formLabel}>COLOR NOTA</Text>
      <View style={styles.colorRow}>
        {NOTE_COLORS.map(c => (
          <PressableScale
            key={c}
            onPress={() => setColor(c)}
            accessibilityLabel={`Color ${c}`}
            style={[
              styles.colorSwatch,
              { backgroundColor: c },
              color === c && styles.colorSwatchActive,
            ]}
          />
        ))}
      </View>

      <PressableScale
        onPress={() => void save()}
        disabled={!canSave}
        accessibilityLabel="Agregar"
        style={[styles.submit, { backgroundColor: canSave ? colors.ink : colors.lineStrong }]}
      >
        <Text style={[styles.submitText, { color: canSave ? colors.cream : colors.mute }]}>
          {saving ? 'Agregando…' : 'Agregar'}
        </Text>
      </PressableScale>
      <View style={{ height: 12 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    paddingBottom: 14,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md - 2,
    backgroundColor: colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryWrap: { paddingHorizontal: spacing.screenX, paddingBottom: 18 },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg - 4,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  summaryValue: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, lineHeight: 26 },
  summaryValueTotal: { fontSize: 14, color: colors.mute },
  summaryLabel: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.mute, marginTop: 3 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.sage },

  corkboardWrap: { paddingHorizontal: 14 },
  corkboard: {
    backgroundColor: '#F2E9D5',
    borderRadius: radii.xl - 4,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingVertical: 16,
    paddingHorizontal: 10,
    minHeight: 160,
  },
  notesFlow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  note: {
    width: 128,
    height: 128,
    borderRadius: 6,
    padding: 12,
    paddingBottom: 10,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  noteTape: {
    position: 'absolute',
    top: -7,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 2,
    transform: [{ rotate: '2deg' }],
  },
  noteDelete: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(61,58,54,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteDeleteText: { fontSize: 12, color: 'rgba(61,58,54,0.6)', lineHeight: 14 },
  noteName: {
    fontFamily: fonts.serif,
    fontWeight: '600',
    fontSize: 14,
    color: colors.ink,
    marginTop: 6,
    flex: 1,
  },
  noteSub: { fontFamily: fonts.sans, fontSize: 10.5, color: 'rgba(61,58,54,0.55)', marginTop: 2, fontStyle: 'italic' },
  noteTextDone: { textDecorationLine: 'line-through' },
  noteCheckRow: { position: 'absolute', bottom: 10, right: 12 },
  noteCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(61,58,54,0.25)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addTile: {
    width: 128,
    height: 128,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.muteLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ rotate: '-1deg' }],
  },
  addTileText: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.mute, marginTop: 4 },

  formLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.mute,
    marginBottom: 8,
  },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  iconOption: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  colorSwatch: { width: 28, height: 28, borderRadius: 14 },
  colorSwatchActive: { borderWidth: 2, borderColor: colors.terra },
  submit: {
    height: 50,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontFamily: fonts.sansBold, fontSize: 15 },
})
