import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { colors, fonts, motion, radii, spacing } from '@/theme/tokens'

const EASE = Easing.bezier(motion.easeOut.x1, motion.easeOut.y1, motion.easeOut.x2, motion.easeOut.y2)
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// ── Press feedback ───────────────────────────────────────────────────────────

interface PressableScaleProps {
  /** Optional: some targets (colour swatches, dots) are styled, not labelled. */
  children?: ReactNode
  onPress?: () => void
  /** 0.97 for surfaces, 0.93 for bare icon buttons — per the motion spec. */
  scaleTo?: number
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  accessibilityRole?: 'button' | 'tab' | 'link' | 'switch'
}

/**
 * Every tappable surface in Domus responds to touch. The press-out is slower
 * than the press-in so the release reads as a settle rather than a snap, and
 * the animation never gates the actual onPress.
 */
export function PressableScale({
  children,
  onPress,
  scaleTo = 0.97,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
}: PressableScaleProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(scaleTo, { duration: motion.duration.tap, easing: EASE })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150, easing: EASE })
      }}
      onPress={onPress}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  )
}

// ── Typography ───────────────────────────────────────────────────────────────

export function Eyebrow({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.eyebrow, style]}>{String(children).toUpperCase()}</Text>
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>
}

export function SectionTitle({
  children,
  eyebrow,
  action,
  onAction,
}: {
  children: ReactNode
  eyebrow?: string
  action?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Text style={styles.sectionTitle}>{children}</Text>
      </View>
      {action ? (
        <PressableScale onPress={onAction} accessibilityLabel={action}>
          <Text style={styles.action}>{action}</Text>
        </PressableScale>
      ) : null}
    </View>
  )
}

// ── Pill ─────────────────────────────────────────────────────────────────────

export function Pill({
  children,
  active = false,
  onPress,
}: {
  children: ReactNode
  active?: boolean
  onPress?: () => void
}) {
  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? colors.ink : colors.cardWarm,
          borderColor: active ? colors.ink : colors.line,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: active ? colors.cream : colors.inkSoft }]}>
        {children}
      </Text>
    </PressableScale>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDesc}>{description}</Text> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.mute,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 19,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  action: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.terraDeep,
  },
  pill: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
  empty: {
    backgroundColor: colors.cardWarm,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 24,
    marginHorizontal: spacing.screenX,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.mute,
    textAlign: 'center',
    lineHeight: 20,
  },
})
