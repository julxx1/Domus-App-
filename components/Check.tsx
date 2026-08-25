import { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import Icon from './Icon'
import { colors, motion } from '@/theme/tokens'

const EASE = Easing.bezier(motion.easeOut.x1, motion.easeOut.y1, motion.easeOut.x2, motion.easeOut.y2)
const SPRING = Easing.bezier(
  motion.easeSpring.x1, motion.easeSpring.y1, motion.easeSpring.x2, motion.easeSpring.y2
)

interface CheckProps {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  size?: number
  color?: string
  accessibilityLabel?: string
}

/**
 * Animated checkbox.
 *
 * The bounce fires on the press, not on the resulting state change, so it feels
 * immediate even if persistence lags. Colours cross-fade rather than snapping.
 */
export default function Check({
  checked,
  onToggle,
  disabled = false,
  size = 32,
  color = colors.sage,
  accessibilityLabel,
}: CheckProps) {
  const scale = useSharedValue(1)
  const fill = useSharedValue(checked ? 1 : 0)

  useEffect(() => {
    fill.value = withTiming(checked ? 1 : 0, { duration: motion.duration.base, easing: EASE })
  }, [checked, fill])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: fill.value > 0.5 ? color : 'transparent',
    borderColor: fill.value > 0.5 ? color : colors.lineStrong,
    opacity: 1,
  }))

  const iconStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: 0.6 + fill.value * 0.4 }],
  }))

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={() => {
          scale.value = withSequence(
            withTiming(0.82, { duration: 70, easing: EASE }),
            withTiming(1.12, { duration: 110, easing: SPRING }),
            withTiming(1, { duration: 90, easing: EASE })
          )
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onToggle()
        }}
      >
        <Animated.View
          style={[
            styles.box,
            { width: size, height: size, borderRadius: size / 2, opacity: disabled ? 0.4 : 1 },
            boxStyle,
          ]}
        >
          <Animated.View style={iconStyle}>
            <Icon name="check" size={size * 0.47} color="#fff" strokeWidth={2.8} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
