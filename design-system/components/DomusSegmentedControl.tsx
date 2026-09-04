import { useCallback, useRef } from 'react'
import { Pressable, Text, type LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useDomusHaptics } from '../hooks/useDomusHaptics'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { DomusGlass } from './DomusGlass'

export interface DomusSegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/**
 * One moving selection surface, not independent pills fading in/out — same
 * "measure real layout, animate a single shared value" approach already
 * proven in `components/TabBar.tsx`'s lens, reused for a generic control
 * (Agenda member filters, Security filters, etc).
 */
export function DomusSegmentedControl<T extends string>({ options, value, onChange }: DomusSegmentedControlProps<T>) {
  const theme = useDomusTheme()
  const haptics = useDomusHaptics()
  const reducedMotion = useReducedMotion()

  const layouts = useRef<{ x: number; width: number }[]>([])
  const selectorX = useSharedValue(0)
  const selectorWidth = useSharedValue(0)

  const activeIndex = options.findIndex(o => o.value === value)

  const positionSelector = useCallback(
    (index: number, animate: boolean) => {
      const layout = layouts.current[index]
      if (!layout) return
      if (animate && !reducedMotion) {
        selectorX.value = withTiming(layout.x, { duration: theme.motion.duration.normal, easing: theme.motion.easing.standard })
        selectorWidth.value = withTiming(layout.width, { duration: theme.motion.duration.normal, easing: theme.motion.easing.standard })
      } else {
        selectorX.value = layout.x
        selectorWidth.value = layout.width
      }
    },
    [selectorX, selectorWidth, reducedMotion, theme]
  )

  const onSegmentLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      layouts.current[index] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width }
      if (index === activeIndex) positionSelector(index, false)
    },
    [activeIndex, positionSelector]
  )

  const selectorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: selectorX.value }],
    width: selectorWidth.value,
  }))

  return (
    <DomusGlass variant="control" style={{ flexDirection: 'row', height: 40, padding: 3 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          selectorStyle,
          {
            position: 'absolute',
            top: 3,
            bottom: 3,
            left: 0,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.accent.primary,
          },
        ]}
      />
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onLayout={onSegmentLayout(index)}
            onPress={() => {
              haptics.selection()
              positionSelector(index, true)
              onChange(option.value)
            }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text
              style={[
                theme.typography.subheadline,
                { color: selected ? theme.colors.accent.onAccent : theme.colors.text.secondary },
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </DomusGlass>
  )
}
