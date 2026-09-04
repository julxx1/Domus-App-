/**
 * Concentric shape scale. Glass/floating controls lean toward `pill`; content
 * surfaces stay at `medium`/`large` so the UI doesn't read as one uniform
 * blob of rounded rectangles.
 */
export const radius = {
  small: 10,
  medium: 14,
  large: 20,
  xlarge: 28,
  pill: 999,
} as const

export type RadiusScale = keyof typeof radius
