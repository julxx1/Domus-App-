import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated'

/**
 * Thin re-export of Reanimated's own `useReducedMotion` — it already reads
 * the OS "Reduce Motion" setting correctly and is already proven working in
 * this app (components/TabBar.tsx). No reason to reimplement it; this exists
 * so design-system components import from one consistent place instead of
 * reaching into `react-native-reanimated` directly.
 */
export function useReducedMotion(): boolean {
  return useReanimatedReducedMotion()
}
