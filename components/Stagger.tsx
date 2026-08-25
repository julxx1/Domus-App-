import type { ReactNode } from 'react'
import Animated, { Easing, FadeInDown } from 'react-native-reanimated'
import type { StyleProp, ViewStyle } from 'react-native'
import { motion } from '@/theme/tokens'

/**
 * Section-level entrance. The spec caps this at four or five animated GROUPS per
 * screen — individual rows and icons are deliberately not animated, both to
 * avoid visual noise and to keep realtime list updates from replaying it.
 */
interface StaggerProps {
  children: ReactNode
  /** 0-4. Each step delays entry by 30ms, matching the web app's .s0–.s4. */
  index?: 0 | 1 | 2 | 3 | 4
  style?: StyleProp<ViewStyle>
}

export default function Stagger({ children, index = 0, style }: StaggerProps) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.springify()
        .damping(22)
        .stiffness(200)
        .delay(index * 30)
        .withInitialValues({ transform: [{ translateY: 6 }], opacity: 0 })}
    >
      {children}
    </Animated.View>
  )
}

/** Timing variant for cases where a spring reads as too playful. */
export const staggerTiming = (index: number) =>
  FadeInDown.duration(motion.duration.base)
    .delay(index * 30)
    .easing(Easing.bezier(motion.easeOut.x1, motion.easeOut.y1, motion.easeOut.x2, motion.easeOut.y2))
