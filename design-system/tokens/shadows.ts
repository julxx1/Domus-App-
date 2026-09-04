import type { ViewStyle } from 'react-native'

/**
 * Elevation as a small named scale, not per-component magic numbers.
 * `shadowColor` is intentionally omitted here — pass the theme's
 * `glass.shadow`/`text.primary` token at the call site, since it must differ
 * between light and dark.
 */
type Elevation = Pick<ViewStyle, 'shadowOpacity' | 'shadowRadius' | 'shadowOffset' | 'elevation'>

export const elevation: Record<'none' | 'low' | 'medium' | 'high', Elevation> = {
  none: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  low: { shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  medium: { shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  high: { shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
}
