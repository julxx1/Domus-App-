import { useEffect, type ReactNode } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { PressableScale } from './Shared'
import { colors, fonts, motion, radii } from '@/theme/tokens'

const EASE = Easing.bezier(motion.easeOut.x1, motion.easeOut.y1, motion.easeOut.x2, motion.easeOut.y2)

// ── Text field ───────────────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  ...inputProps
}: { label: string; hint?: string } & TextInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        placeholderTextColor={colors.muteLight}
        style={[styles.input, inputProps.multiline && styles.inputMultiline]}
        {...inputProps}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

// ── Primary / secondary buttons ──────────────────────────────────────────────

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = colors.terra,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  tone?: string
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[
        styles.primary,
        { backgroundColor: disabled ? colors.lineStrong : tone },
      ]}
    >
      <Text style={[styles.primaryText, { color: disabled ? colors.mute : '#fff' }]}>{label}</Text>
    </PressableScale>
  )
}

export function GhostButton({
  label,
  onPress,
  tone = colors.ink,
}: {
  label: string
  onPress: () => void
  tone?: string
}) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} style={styles.ghost}>
      <Text style={[styles.ghostText, { color: tone }]}>{label}</Text>
    </PressableScale>
  )
}

// ── Chip selector ────────────────────────────────────────────────────────────

export function Chip({
  label,
  active,
  onPress,
  tone = colors.terra,
}: {
  label: string
  active: boolean
  onPress: () => void
  tone?: string
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          borderColor: active ? tone : colors.line,
          backgroundColor: active ? tone + '1A' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? tone : colors.mute }]}>{label}</Text>
    </PressableScale>
  )
}

// ── Sheet header ─────────────────────────────────────────────────────────────

export function SheetHeader({
  title,
  eyebrow,
  onClose,
  right,
}: {
  title: string
  eyebrow?: string
  onClose: () => void
  right?: ReactNode
}) {
  return (
    <View style={styles.sheetHeader}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.label}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={styles.sheetTitle}>{title}</Text>
      </View>
      {right}
      <PressableScale onPress={onClose} scaleTo={0.93} accessibilityLabel="Cerrar" style={styles.closeBtn}>
        <Text style={styles.closeIcon}>✕</Text>
      </PressableScale>
    </View>
  )
}

// ── Progress bar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, tone }: { value: number; tone?: string }) {
  const width = useSharedValue(0)
  const clamped = Math.max(0, Math.min(1, value))

  useEffect(() => {
    // 360ms reads as "the bar is filling" rather than "the bar jumped".
    width.value = withTiming(clamped, { duration: 360, easing: EASE })
  }, [clamped, width])

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }))

  const color = tone ?? (clamped >= 1 ? colors.sage : colors.terra)

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, barStyle, { backgroundColor: color }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  fieldGroup: { marginBottom: 16 },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.mute,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md - 2,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  inputMultiline: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.mute,
    marginTop: 6,
  },
  primary: {
    height: 54,
    borderRadius: radii.lg - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: fonts.sansBold, fontSize: 15 },
  ghost: {
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { fontFamily: fonts.sansSemiBold, fontSize: 14 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: fonts.sansSemiBold, fontSize: 12.5 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.mute,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.line,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
})
