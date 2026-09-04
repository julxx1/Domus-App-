import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/**
 * iOS "Reduce Transparency" — when on, `DomusGlass` boosts opacity/border
 * instead of relying on whatever happens to render behind it. Defaults to
 * `false` (normal glass) until the OS answers; fails safe to `false` on
 * platforms/RN versions without the API rather than throwing.
 */
export function useReduceTransparency(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false)

  useEffect(() => {
    let mounted = true
    const isReduceTransparencyEnabled = (
      AccessibilityInfo as unknown as { isReduceTransparencyEnabled?: () => Promise<boolean> }
    ).isReduceTransparencyEnabled
    if (typeof isReduceTransparencyEnabled === 'function') {
      isReduceTransparencyEnabled().then(enabled => {
        if (mounted) setReduceTransparency(enabled)
      }).catch(() => {})
    }

    const sub = AccessibilityInfo.addEventListener?.(
      // Not in the official RN types, but present on iOS at runtime.
      'reduceTransparencyChanged' as never,
      (enabled: boolean) => setReduceTransparency(enabled)
    )

    return () => {
      mounted = false
      sub?.remove?.()
    }
  }, [])

  return reduceTransparency
}
