import { useCallback, useRef } from 'react'
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon, { type IconName } from './Icon'
import { colors, fonts, radii } from '@/theme/tokens'

/**
 * Structural props rather than `BottomTabBarProps`.
 *
 * expo-router re-exports its own copy of the bottom-tabs types, and the two are
 * nominally incompatible (they disagree on `ColorValue` vs `string` deep inside
 * header options). Declaring only what this component actually consumes keeps
 * it compatible with both and independent of either package's internals.
 */
export interface TabBarProps {
  state: {
    index: number
    routes: { key: string; name: string }[]
  }
  navigation: {
    emit(event: {
      type: 'tabPress'
      target: string
      canPreventDefault: true
    }): { defaultPrevented: boolean }
    navigate(name: string): void
  }
}

/** Tab order is part of the product spec — index drives travel direction. */
const TABS: { name: string; icon: IconName; label: string }[] = [
  { name: 'index', icon: 'home', label: 'Inicio' },
  { name: 'seguridad', icon: 'shield', label: 'Seguridad' },
  { name: 'agenda', icon: 'calendar', label: 'Agenda' },
  { name: 'chat', icon: 'chat', label: 'Chat' },
  { name: 'mercado', icon: 'cart', label: 'Mercado' },
]

const EASE = Easing.out(Easing.cubic)
const BAR_PADDING = 6
const LENS_INSET = 6
const DURATION = 300 // total tap→settle, split across the sequence stages below

/**
 * ── Stability notes (read before touching this file) ───────────────────────
 *
 * This is a deliberately de-risked rewrite after a silent native crash in
 * Expo Go (no Metro error — a UI-thread/JSI-level failure). The previous
 * version's `useFrameCallback` worklet read `measured.current` — a plain JS
 * ref — from the UI thread every frame. Refs are not synced to the UI thread;
 * that produced stale/undefined reads that fed NaN into `transform`, which is
 * consistent with a hard native crash and no JS-side error.
 *
 * Rules this file follows to avoid repeating that:
 * - No `useFrameCallback`, no per-frame velocity sampling.
 * - No BlurView, no `experimentalBlurMethod` — the glass surface is a plain
 *   translucent View (background + border + top highlight + shadow).
 * - Every worklet only reads Reanimated `SharedValue`s, never a React ref.
 * - Tab positions are read from a plain ref, but ONLY on the JS thread
 *   (inside `onLayout`/`onPress` handlers), then written into SharedValues —
 *   never dereferenced inside a `'worklet'`/`useAnimatedStyle` body.
 * - Every position/width is guarded with `Number.isFinite` before it drives
 *   an animation; a bad measurement is a no-op, never a NaN transform.
 * - `cancelAnimation` runs before retargeting on rapid taps, so animations
 *   never stack.
 * - Navigation (`navigation.navigate`) fires synchronously on tap and never
 *   waits on the animation — a broken animation can't block moving screens.
 *
 * The lens motion itself is a fixed 5-stage sequence (rest → launch →
 * travel → arrival → settle) driven by `withSequence`/`withTiming`, not a
 * physics spring — simpler to reason about and to keep finite.
 */
export default function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets()
  const reducedMotion = useReducedMotion()

  const tabLayouts = useRef<{ x: number; width: number }[]>([])
  const hasPositioned = useRef(false)

  const lensX = useSharedValue(0)
  const lensWidth = useSharedValue(0)
  const lensScaleX = useSharedValue(1)
  const lensScaleY = useSharedValue(1)

  const positionLens = useCallback(
    (index: number, animate: boolean) => {
      if (index < 0 || index >= TABS.length) return
      const m = tabLayouts.current[index]
      if (!m || !Number.isFinite(m.x) || !Number.isFinite(m.width)) return

      cancelAnimation(lensX)
      cancelAnimation(lensScaleX)
      cancelAnimation(lensScaleY)

      lensWidth.value = m.width // constant across tabs (equal flex columns)

      if (!animate || reducedMotion) {
        lensX.value = m.x
        lensScaleX.value = 1
        lensScaleY.value = 1
        return
      }

      const launch = DURATION * 0.28
      const travel = DURATION * 0.44
      const settle = DURATION * 0.28

      lensX.value = withTiming(m.x, { duration: DURATION, easing: EASE })
      lensScaleX.value = withSequence(
        withTiming(1.15, { duration: launch, easing: EASE }),
        withTiming(0.98, { duration: travel, easing: EASE }),
        withTiming(1, { duration: settle, easing: EASE })
      )
      lensScaleY.value = withSequence(
        withTiming(0.97, { duration: launch, easing: EASE }),
        withTiming(1.02, { duration: travel, easing: EASE }),
        withTiming(1, { duration: settle, easing: EASE })
      )
    },
    [lensX, lensWidth, lensScaleX, lensScaleY, reducedMotion]
  )

  const onTabLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout
      if (!Number.isFinite(x) || !Number.isFinite(width)) return
      tabLayouts.current[index] = { x, width }

      if (!hasPositioned.current && tabLayouts.current.filter(Boolean).length === TABS.length) {
        hasPositioned.current = true
        positionLens(state.index, false)
      } else if (index === state.index && hasPositioned.current) {
        // A later layout pass (rotation, dynamic type) re-syncs silently.
        positionLens(index, false)
      }
    },
    [positionLens, state.index]
  )

  const lensStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: lensX.value },
      { scaleX: lensScaleX.value },
      { scaleY: lensScaleY.value },
    ],
    width: lensWidth.value,
  }))

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: Math.max(insets.bottom - 20, 8) }]}
    >
      <View style={styles.bar}>
        {/* Liquid lens — one instance, travels under the tab row. */}
        <Animated.View style={[styles.lens, lensStyle]} pointerEvents="none">
          <View style={styles.lensHighlight} />
        </Animated.View>

        {state.routes.map((route, index) => {
          const tab = TABS.find(t => t.name === route.name)
          if (!tab) return null

          return (
            <TabButton
              key={route.key}
              tab={tab}
              lensX={lensX}
              lensWidth={lensWidth}
              onLayout={onTabLayout(index)}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                })
                if (state.index === index || event.defaultPrevented) return

                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                navigation.navigate(route.name)
                positionLens(index, true)
              }}
            />
          )
        })}
      </View>
    </View>
  )
}

interface TabButtonProps {
  tab: { icon: IconName; label: string }
  lensX: SharedValue<number>
  lensWidth: SharedValue<number>
  onPress: () => void
  onLayout: (e: LayoutChangeEvent) => void
}

function TabButton({ tab, lensX, lensWidth, onPress, onLayout }: TabButtonProps) {
  const selfX = useSharedValue(0)

  // Continuous 0→1 "how much of the lens currently sits over me" — this is
  // what makes the icon/label react as the glass arrives and leaves, instead
  // of snapping on a boolean `focused` at some threshold. Reads only real
  // SharedValues (selfX, lensX, lensWidth), never a ref.
  const coverage = useDerivedValue(() => {
    if (lensWidth.value === 0) return 0
    const dist = Math.abs(lensX.value - selfX.value)
    return interpolate(dist, [0, lensWidth.value], [1, 0], Extrapolation.CLAMP)
  })

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(coverage.value, [0, 1], [0.96, 1.08], Extrapolation.CLAMP) }],
  }))

  const inkStyle = useAnimatedStyle(() => ({
    opacity: coverage.value,
  }))

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(coverage.value, [0, 1], [0.72, 1], Extrapolation.CLAMP),
  }))

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      hitSlop={6}
      onLayout={e => {
        const { x } = e.nativeEvent.layout
        if (Number.isFinite(x)) selfX.value = x
        onLayout(e)
      }}
      onPress={onPress}
      style={styles.tab}
    >
      <Animated.View style={iconStyle}>
        <Icon name={tab.icon} size={19} color={colors.mute} strokeWidth={1.7} />
        <Animated.View style={[StyleSheet.absoluteFill, inkStyle]}>
          <Icon name={tab.icon} size={19} color={colors.ink} strokeWidth={2.1} />
        </Animated.View>
      </Animated.View>
      <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
        {tab.label}
      </Animated.Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 62,
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: BAR_PADDING,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(250,244,235,0.88)',
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  lens: {
    position: 'absolute',
    top: LENS_INSET,
    bottom: LENS_INSET,
    left: 0,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,252,247,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
    shadowColor: colors.terraDeep,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  lensHighlight: {
    position: 'absolute',
    top: 2,
    left: '10%',
    right: '10%',
    height: '38%',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  tab: {
    flex: 1,
    minHeight: 46,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    letterSpacing: 0.1,
    color: colors.ink,
  },
})
