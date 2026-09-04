import { Platform } from 'react-native'

/**
 * Typography tokens.
 *
 * Two type families, used for two different jobs:
 *  - `serif` (Newsreader, already loaded by app/_layout.tsx) — DOMUS's
 *    editorial voice. Reserved for large, emotional moments: the greeting on
 *    Home, a screen's big title. Never functional UI.
 *  - `system` — the platform's native font (San Francisco on iOS, Roboto on
 *    Android) via `undefined` fontFamily, which is how RN opts into the
 *    system font rather than fighting it with a bundled approximation.
 *    Everything functional — buttons, forms, labels, nav, settings — uses
 *    this.
 *
 * `fonts.sans*` (Plus Jakarta Sans) still exists in `theme/tokens.ts` for
 * existing screens and is untouched by this file — this system intentionally
 * moves away from it for new functional UI per the brief.
 */
export const fontFamily = {
  serif: 'Newsreader_600SemiBold',
  serifMedium: 'Newsreader_500Medium',
  serifItalic: 'Newsreader_500Medium_Italic',
  /** Native system font — `undefined` is deliberate, not a placeholder. */
  system: Platform.select<string | undefined>({ ios: undefined, android: undefined, default: undefined }),
} as const

export type FontWeight = '400' | '500' | '600' | '700'

export interface TypeStyle {
  fontFamily?: string
  fontSize: number
  lineHeight: number
  fontWeight: FontWeight
  letterSpacing?: number
}

/**
 * Adapted, not copied, from Apple's HIG type scale — sizes are tuned to
 * DOMUS's own layouts rather than lifted verbatim. `display`/`largeTitle`
 * default to the serif brand voice; everything else is system/functional.
 */
export const typography = {
  display: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 40, fontWeight: '600' } as TypeStyle,
  largeTitle: { fontFamily: fontFamily.serif, fontSize: 28, lineHeight: 34, fontWeight: '600' } as TypeStyle,
  title1: { fontFamily: fontFamily.system, fontSize: 22, lineHeight: 28, fontWeight: '700' } as TypeStyle,
  title2: { fontFamily: fontFamily.system, fontSize: 19, lineHeight: 24, fontWeight: '700' } as TypeStyle,
  title3: { fontFamily: fontFamily.system, fontSize: 17, lineHeight: 22, fontWeight: '600' } as TypeStyle,
  headline: { fontFamily: fontFamily.system, fontSize: 15, lineHeight: 20, fontWeight: '600' } as TypeStyle,
  body: { fontFamily: fontFamily.system, fontSize: 15, lineHeight: 21, fontWeight: '400' } as TypeStyle,
  callout: { fontFamily: fontFamily.system, fontSize: 14, lineHeight: 19, fontWeight: '500' } as TypeStyle,
  subheadline: { fontFamily: fontFamily.system, fontSize: 13, lineHeight: 18, fontWeight: '500' } as TypeStyle,
  footnote: { fontFamily: fontFamily.system, fontSize: 12, lineHeight: 16, fontWeight: '400' } as TypeStyle,
  caption: {
    fontFamily: fontFamily.system,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  } as TypeStyle,
} as const

export type TypographyScale = keyof typeof typography
