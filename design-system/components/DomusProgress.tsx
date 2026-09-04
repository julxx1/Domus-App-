import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useReducedMotion } from '../hooks/useReducedMotion'

export interface DomusProgressProps {
  /** 0–1 */
  value: number
  tone?: string
}

export function DomusProgress({ value, tone }: DomusProgressProps) {
  const theme = useDomusTheme()
  const reducedMotion = useReducedMotion()
  const width = useSharedValue(0)
  const clamped = Math.max(0, Math.min(1, value))

  useEffect(() => {
    width.value = reducedMotion ? clamped : withTiming(clamped, { duration: theme.motion.duration.slow, easing: theme.motion.easing.standard })
  }, [clamped, width, reducedMotion, theme])

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }))
  const color = tone ?? (clamped >= 1 ? theme.colors.status.success : theme.colors.accent.primary)

  return (
    <View
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.separator.primary,
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[fillStyle, { height: '100%', borderRadius: 3, backgroundColor: color }]} />
    </View>
  )
}
