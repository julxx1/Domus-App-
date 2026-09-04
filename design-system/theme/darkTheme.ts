import { darkColors } from '../tokens/colors'
import { typography } from '../tokens/typography'
import { spacing, semanticSpacing } from '../tokens/spacing'
import { radius } from '../tokens/radius'
import { elevation } from '../tokens/shadows'
import { duration, easing, spring, pressScale, enterDistance } from '../tokens/motion'
import { glassRecipes } from '../tokens/glass'
import type { DomusTheme } from './lightTheme'

export const darkTheme: DomusTheme = {
  mode: 'dark',
  colors: darkColors,
  typography,
  spacing,
  semanticSpacing,
  radius,
  elevation,
  motion: { duration, easing, spring, pressScale, enterDistance },
  glassRecipes,
}
