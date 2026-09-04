import { useCallback, type ComponentProps } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Icon, { type IconName } from '@/components/Icon'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useDomusHaptics } from '../hooks/useDomusHaptics'
import { DomusGlass } from './DomusGlass'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface DomusIconButtonProps {
  icon: IconName
  onPress: () => void
  accessibilityLabel: string
  /** `glass` for floating/toolbar contexts; `plain` sits directly on content. */
  variant?: 'glass' | 'plain'
  size?: number
  disabled?: boolean
}

/**
 * Standard control for notifications/filters/menus/close/back. Visual circle
 * is smaller than the touch target — the `Pressable`'s hit area stays at a
 * comfortable 44pt minimum regardless of the visible circle size.
 */
export function DomusIconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  size = 40,
  disabled = false,
}: DomusIconButtonProps) {
  const theme = useDomusTheme()
  const haptics = useDomusHaptics()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.92, { duration: theme.motion.duration.fast })
  }, [scale, theme])
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: theme.motion.duration.normal })
  }, [scale, theme])
  const handlePress = useCallback(() => {
    if (disabled) return
    haptics.selection()
    onPress()
  }, [disabled, haptics, onPress])

  const iconEl: ComponentProps<typeof Icon> = {
    name: icon,
    size: Math.round(size * 0.46),
    color: theme.colors.text.primary,
    strokeWidth: 1.8,
  }

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    opacity: disabled ? 0.4 : 1,
  }

  if (variant === 'glass') {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
      >
        <DomusGlass variant="control" style={[styles.center, circleStyle]}>
          <Icon {...iconEl} />
        </DomusGlass>
      </AnimatedPressable>
    )
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        animatedStyle,
        styles.center,
        circleStyle,
        { backgroundColor: theme.colors.surface.primary, borderWidth: 1, borderColor: theme.colors.separator.primary },
      ]}
    >
      <Icon {...iconEl} />
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
})
