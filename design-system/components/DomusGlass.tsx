import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { useReduceTransparency } from '../hooks/useReduceTransparency'
import type { GlassVariant } from '../tokens/glass'

/**
 * The one place Liquid Glass is actually built. Nothing else in the app
 * should touch BlurView or hand-roll translucency — every glass surface
 * (nav, sheets, floating buttons, controls) renders through this.
 *
 * STABILITY NOTE: this intentionally does NOT use BlurView by default. A
 * previous implementation used `experimentalBlurMethod` and caused a silent
 * native crash in Expo Go (documented in components/TabBar.tsx). The default
 * here is the same proven-stable approach that fixed that: layered
 * translucency (tinted fill + top highlight + border + shadow), zero native
 * blur. `expo-glass-effect` (real iOS 26 Liquid Glass) is not installed —
 * unverified whether it ships in Expo Go for SDK 54, and per the brief,
 * nothing should assume a capability without checking. If/when that's
 * confirmed safe, native glass becomes an additional capability branch here
 * — every consumer of `DomusGlass` stays unchanged, since they only ever see
 * this component, never the underlying implementation.
 */
export interface DomusGlassProps {
  variant?: GlassVariant
  style?: StyleProp<ViewStyle>
  children?: ReactNode
  /** Renders a top highlight strip. Off for small controls where it'd just look like a stray line. */
  highlight?: boolean
}

export function DomusGlass({ variant = 'regular', style, children, highlight = true }: DomusGlassProps) {
  const theme = useDomusTheme()
  const reduceTransparency = useReduceTransparency()
  const recipe = theme.glassRecipes[variant]
  const radiusValue = theme.radius[recipe.radius]

  const tint = reduceTransparency
    ? scaleAlpha(theme.colors.glass.tint, Math.min(1, recipe.tintOpacity * 1.6 + 0.25))
    : scaleAlpha(theme.colors.glass.tint, recipe.tintOpacity)

  const borderColor = reduceTransparency
    ? theme.colors.separator.primary
    : scaleAlpha(theme.colors.glass.border, 1)

  const elevationStyle = theme.elevation[recipe.elevation]

  return (
    <View
      style={[
        {
          borderRadius: radiusValue,
          backgroundColor: tint,
          borderWidth: reduceTransparency ? Math.max(recipe.borderWidth, 1) : recipe.borderWidth,
          borderColor,
          overflow: 'hidden',
          shadowColor: theme.colors.glass.shadow,
          ...elevationStyle,
        },
        style,
      ]}
    >
      {highlight && !reduceTransparency ? (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              borderRadius: radiusValue,
              backgroundColor: scaleAlpha(theme.colors.glass.highlight, recipe.highlightOpacity),
            },
          ]}
        />
      ) : null}
      {children}
    </View>
  )
}

/** Scales an `rgba(r,g,b,a)` string's alpha by `factor`, clamped to [0,1]. Non-rgba input passes through unchanged. */
function scaleAlpha(rgba: string, factor: number): string {
  const match = /rgba?\(([^)]+)\)/.exec(rgba)
  if (!match) return rgba
  const parts = match[1]!.split(',').map(p => p.trim())
  const [r, g, b] = parts
  const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1
  const nextAlpha = Math.max(0, Math.min(1, a * factor))
  return `rgba(${r}, ${g}, ${b}, ${nextAlpha})`
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 1,
    left: '8%',
    right: '8%',
    height: '36%',
  },
})
