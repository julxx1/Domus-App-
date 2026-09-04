/**
 * Glass material variants. Every variant is a recipe of opacity/border/
 * highlight/shadow strength — never a hex value on its own (those come from
 * the active theme's `colors.glass.*`, see `theme/lightTheme.ts`/`darkTheme.ts`).
 *
 * Deliberately five, not fifteen — each has one job:
 *  - regular   default surface (sheets, headers)
 *  - thin      lighter touch, content sits close behind it
 *  - prominent stronger presence — floating action button, key toolbar
 *  - control   compact interactive controls (segmented control, chips)
 *  - floating  detached elements with the strongest shadow (tab bar lens)
 */
export type GlassVariant = 'regular' | 'thin' | 'prominent' | 'control' | 'floating'

export interface GlassRecipe {
  /** Multiplies the theme's `glass.tint` alpha. */
  tintOpacity: number
  borderWidth: number
  highlightOpacity: number
  elevation: 'none' | 'low' | 'medium' | 'high'
  radius: 'small' | 'medium' | 'large' | 'xlarge' | 'pill'
}

export const glassRecipes: Record<GlassVariant, GlassRecipe> = {
  regular: { tintOpacity: 1, borderWidth: 1, highlightOpacity: 1, elevation: 'medium', radius: 'large' },
  thin: { tintOpacity: 0.6, borderWidth: 1, highlightOpacity: 0.6, elevation: 'low', radius: 'large' },
  prominent: { tintOpacity: 1.25, borderWidth: 1.5, highlightOpacity: 1.2, elevation: 'high', radius: 'xlarge' },
  control: { tintOpacity: 0.85, borderWidth: 1, highlightOpacity: 0.8, elevation: 'low', radius: 'pill' },
  floating: { tintOpacity: 1, borderWidth: 1, highlightOpacity: 1, elevation: 'high', radius: 'pill' },
}
