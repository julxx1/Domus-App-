import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { lightTheme, type DomusTheme } from './lightTheme'
import { darkTheme } from './darkTheme'

export type ThemePreference = 'system' | 'light' | 'dark'

interface DomusThemeContextValue {
  theme: DomusTheme
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  /** The resolved mode after applying `preference` — what actually renders. */
  resolvedMode: 'light' | 'dark'
}

const DomusThemeContext = createContext<DomusThemeContextValue | null>(null)

/**
 * Single source of theme truth. Follows the OS appearance by default;
 * `setPreference('light' | 'dark')` overrides it (for a future Settings
 * toggle — not built yet, the architecture just needs to already support it
 * per the brief). Nothing else in the app should call `useColorScheme()`
 * directly — that's exactly the scattered-logic problem this centralizes.
 */
export function DomusThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [preference, setPreference] = useState<ThemePreference>('system')

  const resolvedMode = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference

  const value = useMemo<DomusThemeContextValue>(
    () => ({
      theme: resolvedMode === 'dark' ? darkTheme : lightTheme,
      preference,
      setPreference,
      resolvedMode,
    }),
    [resolvedMode, preference]
  )

  return <DomusThemeContext.Provider value={value}>{children}</DomusThemeContext.Provider>
}

export function useDomusThemeContext(): DomusThemeContextValue {
  const ctx = useContext(DomusThemeContext)
  if (!ctx) throw new Error('useDomusTheme debe usarse dentro de DomusThemeProvider')
  return ctx
}
