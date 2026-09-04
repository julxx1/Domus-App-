import { useCallback, useMemo } from 'react'
import * as Haptics from 'expo-haptics'

/**
 * Semantic haptics — components call `haptics.selection()`, never
 * `Haptics.impactAsync(...)` directly, so the mapping from "what happened"
 * to "how it feels" lives in one place instead of being re-decided ad hoc on
 * every screen. Trivial taps (e.g. a plain text button) intentionally have
 * no haptic — only meaningful state changes do.
 */
export interface DomusHaptics {
  /** Tab change, segmented control, filter toggle. */
  selection: () => void
  /** Minor confirmation — a chip selected, a checkbox toggled. */
  lightImpact: () => void
  /** A more deliberate action — opening a sheet, an important toggle. */
  mediumImpact: () => void
  /** Task completed successfully (duty checked off, item saved). */
  success: () => void
  /** Recoverable problem the user should notice. */
  warning: () => void
  /** A destructive/blocking confirmation (e.g. delete account step). */
  error: () => void
}

export function useDomusHaptics(): DomusHaptics {
  const selection = useCallback(() => void Haptics.selectionAsync(), [])
  const lightImpact = useCallback(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), [])
  const mediumImpact = useCallback(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), [])
  const success = useCallback(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), [])
  const warning = useCallback(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), [])
  const error = useCallback(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), [])

  return useMemo(
    () => ({ selection, lightImpact, mediumImpact, success, warning, error }),
    [selection, lightImpact, mediumImpact, success, warning, error]
  )
}
