import { useCallback } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, type GestureResponderEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useDomusHaptics } from '../hooks/useDomusHaptics'
import { DomusGlass } from './DomusGlass'

export type DomusButtonVariant = 'primary' | 'secondary' | 'glass' | 'plain' | 'destructive'

export interface DomusButtonProps {
  label: string
  onPress: () => void
  variant?: DomusButtonVariant
  loading?: boolean
  disabled?: boolean
  selected?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * `primary` keeps DOMUS terracotta for the app's real calls to action.
 * `glass`/`secondary` are for contextual, lower-emphasis actions — this is
 * the "primary can still use accent color, secondary can use glass" split
 * from the brief, not a random per-screen choice.
 */
export function DomusButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  selected = false,
}: DomusButtonProps) {
  const theme = useDomusTheme()
  const haptics = useDomusHaptics()
  const scale = useSharedValue(1)
  const isDisabled = disabled || loading

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(theme.motion.pressScale, { duration: theme.motion.duration.fast })
  }, [scale, theme])

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: theme.motion.duration.normal })
  }, [scale, theme])

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (isDisabled) return
      if (variant === 'destructive') haptics.mediumImpact()
      else if (variant !== 'plain') haptics.lightImpact()
      onPress()
      void e
    },
    [isDisabled, variant, haptics, onPress]
  )

  const textColor = resolveTextColor(theme, variant, isDisabled)

  const content = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <Text
      style={[
        theme.typography.headline,
        { color: textColor, fontFamily: theme.typography.headline.fontFamily },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  )

  if (variant === 'glass') {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, selected }}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
      >
        <DomusGlass
          variant={selected ? 'prominent' : 'control'}
          style={[styles.base, { height: 48, opacity: isDisabled ? 0.5 : 1 }]}
        >
          {content}
        </DomusGlass>
      </AnimatedPressable>
    )
  }

  if (variant === 'plain') {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[animatedStyle, styles.plain, { opacity: isDisabled ? 0.5 : 1 }]}
      >
        {content}
      </AnimatedPressable>
    )
  }

  const backgroundColor = resolveBackground(theme, variant, isDisabled)

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        animatedStyle,
        styles.base,
        {
          backgroundColor,
          borderRadius: theme.radius.large,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: theme.colors.text.primary,
        },
      ]}
    >
      {content}
    </AnimatedPressable>
  )
}

function resolveBackground(theme: ReturnType<typeof useDomusTheme>, variant: DomusButtonVariant, disabled: boolean) {
  if (disabled) return theme.colors.separator.primary
  if (variant === 'primary') return theme.colors.accent.primary
  if (variant === 'destructive') return theme.colors.status.error
  return 'transparent' // secondary — outline only
}

function resolveTextColor(theme: ReturnType<typeof useDomusTheme>, variant: DomusButtonVariant, disabled: boolean) {
  if (disabled) return theme.colors.text.tertiary
  if (variant === 'primary' || variant === 'destructive') return theme.colors.accent.onAccent
  return theme.colors.text.primary
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  plain: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
