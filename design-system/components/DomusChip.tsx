import { useCallback } from 'react'
import { Pressable, Text } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Icon, { type IconName } from '@/components/Icon'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useDomusHaptics } from '../hooks/useDomusHaptics'

export type DomusChipVariant = 'action' | 'filter' | 'selected'

export interface DomusChipProps {
  label: string
  variant?: DomusChipVariant
  icon?: IconName
  onPress?: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/** Compact, contextual — never styled as a primary CTA regardless of variant. */
export function DomusChip({ label, variant = 'filter', icon, onPress }: DomusChipProps) {
  const theme = useDomusTheme()
  const haptics = useDomusHaptics()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const selected = variant === 'selected'

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.96, { duration: theme.motion.duration.fast })
  }, [scale, theme])
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: theme.motion.duration.normal })
  }, [scale, theme])
  const handlePress = useCallback(() => {
    haptics.selection()
    onPress?.()
  }, [haptics, onPress])

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[2],
          height: 32,
          paddingHorizontal: theme.spacing[4],
          borderRadius: theme.radius.pill,
          backgroundColor: selected ? theme.colors.accent.primary : theme.colors.surface.secondary,
          borderWidth: selected ? 0 : 1,
          borderColor: theme.colors.separator.primary,
        },
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={13}
          color={selected ? theme.colors.accent.onAccent : theme.colors.text.secondary}
          strokeWidth={2}
        />
      ) : null}
      <Text
        style={[
          theme.typography.subheadline,
          { color: selected ? theme.colors.accent.onAccent : theme.colors.text.secondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  )
}
