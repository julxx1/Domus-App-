import { useDomusThemeContext } from '../theme/DomusThemeProvider'
import type { DomusTheme } from '../theme/lightTheme'

/** The only hook screens/components need for styling — `theme.colors.*`, `theme.spacing`, etc. */
export function useDomusTheme(): DomusTheme {
  return useDomusThemeContext().theme
}
