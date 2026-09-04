import { useCallback, type ReactNode } from 'react'
import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useDomusHaptics } from '../hooks/useDomusHaptics'

export type DomusCardVariant = 'content' | 'elevated' | 'interactive'

export interface DomusCardProps {
  children: ReactNode
  variant?: DomusCardVariant
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * Content grouping only when it has semantic meaning — this is not the
 * default wrapper for every block of UI. Calm opaque surface by design;
 * glass is reserved for floating/interactive layers, not content cards.
 */
export function DomusCard({ children, variant = 'content', onPress, style, accessibilityLabel }: DomusCardProps) {
  const theme = useDomusTheme()
  const haptics = useDomusHaptics()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePressIn = useCallback(() => {
    if (!onPress) return
    scale.value = withTiming(theme.motion.pressScale, { duration: theme.motion.duration.fast })
  }, [onPress, scale, theme])
  const handlePressOut = useCallback(() => {
    if (!onPress) return
    scale.value = withTiming(1, { duration: theme.motion.duration.normal })
  }, [onPress, scale, theme])
  const handlePress = useCallback(() => {
    if (!onPress) return
    haptics.selection()
    onPress()
  }, [onPress, haptics])

  const surfaceStyle: ViewStyle = {
    backgroundColor: variant === 'elevated' ? theme.colors.background.elevated : theme.colors.surface.primary,
    borderRadius: theme.radius.large,
    borderWidth: variant === 'elevated' ? 0 : 1,
    borderColor: theme.colors.separator.primary,
    padding: theme.semanticSpacing.cardPadding,
    ...(variant === 'elevated'
      ? { shadowColor: theme.colors.glass.shadow, ...theme.elevation.medium }
      : theme.elevation.none),
  }

  if (variant === 'interactive' || onPress) {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[animatedStyle, surfaceStyle, style]}
      >
        {children}
      </AnimatedPressable>
    )
  }

  return <Animated.View style={[surfaceStyle, style]}>{children}</Animated.View>
}
