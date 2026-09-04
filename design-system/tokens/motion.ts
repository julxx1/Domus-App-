import { Easing } from 'react-native-reanimated'

/**
 * Motion principles this system enforces: fast, fluid, interruptible, subtle,
 * spatially logical. No bounce, no long durations, nothing that blocks
 * navigation on completion.
 */
export const duration = {
  fast: 140,
  normal: 220,
  slow: 320,
} as const

/** cubic-bezier(0.22, 1, 0.36, 1) — matches `theme/tokens.ts`'s easeOut for continuity with existing screens. */
export const easing = {
  standard: Easing.bezier(0.22, 1, 0.36, 1),
  entrance: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.bezier(0.55, 0, 0.85, 0.4),
} as const

export const spring = {
  /** Snappy, for controls that must feel immediate (segmented control, tab lens). */
  responsive: { damping: 26, stiffness: 320, mass: 0.9 },
  /** Softer settle, for sheets/cards entering. */
  gentle: { damping: 22, stiffness: 180, mass: 1 },
} as const

/** Press-compression target — never below this, per the "don't overdo it" rule. */
export const pressScale = 0.975

/** Default translate distance for enter animations (List rows, cards). */
export const enterDistance = 8
