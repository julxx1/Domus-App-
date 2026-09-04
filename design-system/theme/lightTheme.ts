import { lightColors } from '../tokens/colors'
import { typography } from '../tokens/typography'
import { spacing, semanticSpacing } from '../tokens/spacing'
import { radius } from '../tokens/radius'
import { elevation } from '../tokens/shadows'
import { duration, easing, spring, pressScale, enterDistance } from '../tokens/motion'
import { glassRecipes } from '../tokens/glass'

export interface DomusTheme {
  mode: 'light' | 'dark'
  colors: typeof lightColors
  typography: typeof typography
  spacing: typeof spacing
  semanticSpacing: typeof semanticSpacing
  radius: typeof radius
  elevation: typeof elevation
  motion: { duration: typeof duration; easing: typeof easing; spring: typeof spring; pressScale: number; enterDistance: number }
  glassRecipes: typeof glassRecipes
}

export const lightTheme: DomusTheme = {
  mode: 'light',
  colors: lightColors,
  typography,
  spacing,
  semanticSpacing,
  radius,
  elevation,
  motion: { duration, easing, spring, pressScale, enterDistance },
  glassRecipes,
}
