import { useCallback } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Icon, { type IconName } from '@/components/Icon'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useDomusHaptics } from '../hooks/useDomusHaptics'
import { DomusGlass } from './DomusGlass'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface DomusFloatingButtonProps {
  icon: IconName
  onPress: () => void
  accessibilityLabel: string
  /** `accent` for the one primary floating action on a screen; `glass` for a secondary one. */
  tone?: 'accent' | 'glass'
}

/** Detached floating action — strongest shadow in the glass system (`floating` variant). */
export function DomusFloatingButton({ icon, onPress, accessibilityLabel, tone = 'accent' }: DomusFloatingButtonProps) {
  const theme = useDomusTheme()
  const haptics = useDomusHaptics()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(theme.motion.pressScale, { duration: theme.motion.duration.fast })
  }, [scale, theme])
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: theme.motion.duration.normal })
  }, [scale, theme])
  const handlePress = useCallback(() => {
    haptics.lightImpact()
    onPress()
  }, [haptics, onPress])

  if (tone === 'glass') {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
      >
        <DomusGlass variant="floating" style={styles.circle}>
          <Icon name={icon} size={22} color={theme.colors.text.primary} strokeWidth={2} />
        </DomusGlass>
      </AnimatedPressable>
    )
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        animatedStyle,
        styles.circle,
        {
          backgroundColor: theme.colors.accent.primary,
          shadowColor: theme.colors.glass.shadow,
          ...theme.elevation.high,
        },
      ]}
    >
      <Icon name={icon} size={22} color={theme.colors.accent.onAccent} strokeWidth={2} />
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
