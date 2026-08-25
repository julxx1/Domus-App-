/**
 * Domus design tokens.
 *
 * Ported 1:1 from the web app's CSS custom properties (`domus-app/src/index.css`).
 * These values ARE the product's visual identity — do not "modernise" them.
 */

export const colors = {
  cream: '#F5EFE6',
  creamDeep: '#EFE7D8',
  card: '#FBF6EC',
  cardWarm: '#F7EFE2',
  paper: '#FFFCF7',

  terra: '#C97B4A',
  terraDeep: '#A35E33',
  terraSoft: '#E8B89A',

  sage: '#7A8B6F',
  sageDeep: '#5C6E54',
  sageSoft: '#B8C6AC',

  clay: '#B85842',
  ochre: '#D4A256',
  blush: '#D4877A',

  ink: '#3D3A36',
  inkSoft: '#5A554F',
  mute: '#8A7E72',
  muteLight: '#B9AFA2',

  line: '#E5DBC8',
  lineStrong: '#D4C6AE',

  ok: '#6B8E5C',
  warn: '#C77F3C',
  danger: '#B85842',
} as const

export const memberColors = {
  mama: '#7A8B6F',
  papa: '#C97B4A',
  sofia: '#B85842',
  diego: '#D4A256',
  lucia: '#D4877A',
} as const

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const

export const fonts = {
  serif: 'Newsreader_600SemiBold',
  serifMedium: 'Newsreader_500Medium',
  serifItalic: 'Newsreader_500Medium_Italic',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
} as const

/**
 * Motion tokens — mirror of the web app's `--ease-*` / `--dur-*` variables.
 * Durations in ms. Navigation sits at 260ms per the spec's 240–280ms window.
 */
export const motion = {
  duration: {
    tap: 120,
    fast: 180,
    base: 220,
    nav: 260,
    sheet: 300,
    sheetOut: 220,
  },
  /** cubic-bezier(0.22, 1, 0.36, 1) — the product's primary curve. */
  easeOut: { x1: 0.22, y1: 1, x2: 0.36, y2: 1 },
  /** cubic-bezier(0.55, 0, 0.85, 0.4) — exits. */
  easeIn: { x1: 0.55, y1: 0, x2: 0.85, y2: 0.4 },
  /** cubic-bezier(0.34, 1.56, 0.64, 1) — checks / springy confirmations. */
  easeSpring: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
} as const

/**
 * Liquid Glass — warm, moderate. Applied sparingly (bottom nav, sheets, toasts,
 * floating controls). Never a heavy blur over the map or live video.
 */
export const glass = {
  tint: 'light' as const,
  intensity: 40,
  background: 'rgba(251,246,236,0.82)',
  backgroundStrong: 'rgba(251,246,236,0.92)',
  border: 'rgba(255,252,247,0.65)',
  shadow: {
    shadowColor: '#3D3A36',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const

export const spacing = {
  screenX: 22,
  gap: 8,
} as const

export type Colors = typeof colors
export type Motion = typeof motion
