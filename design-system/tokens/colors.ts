/**
 * DOMUS Design System 2.0 — color tokens.
 *
 * Two layers:
 *  1. `brand` — the raw DOMUS palette, ported 1:1 from `theme/tokens.ts`
 *     (unchanged, still used by every existing screen). This file never
 *     invents new brand hues.
 *  2. `semantic` (light/dark) — what components actually consume. Screens
 *     built on this system reference `theme.colors.background.primary`, never
 *     a raw hex — that's what lets dark mode and future re-tuning happen in
 *     one place instead of a find-replace across the app.
 */

export const brand = {
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

  white: '#FFFFFF',
  black: '#000000',
} as const

export interface SemanticColors {
  background: {
    primary: string
    secondary: string
    elevated: string
  }
  surface: {
    primary: string
    secondary: string
    /** Opaque fallback tint under a glass layer — see `tokens/glass.ts`. */
    glass: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
  accent: {
    primary: string
    subtle: string
    /** Text/icon color safe to place on top of `accent.primary`. */
    onAccent: string
  }
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
  separator: {
    primary: string
    subtle: string
  }
  glass: {
    tint: string
    border: string
    highlight: string
    shadow: string
  }
}

export const lightColors: SemanticColors = {
  background: {
    primary: brand.cream,
    secondary: brand.creamDeep,
    elevated: brand.paper,
  },
  surface: {
    primary: brand.card,
    secondary: brand.cardWarm,
    glass: 'rgba(251,246,236,0.72)',
  },
  text: {
    primary: brand.ink,
    secondary: brand.inkSoft,
    tertiary: brand.mute,
    inverse: brand.cream,
  },
  accent: {
    primary: brand.terra,
    subtle: 'rgba(201,123,74,0.12)',
    onAccent: brand.white,
  },
  status: {
    success: brand.ok,
    warning: brand.warn,
    error: brand.danger,
    info: brand.sageDeep,
  },
  separator: {
    primary: brand.line,
    subtle: 'rgba(229,219,200,0.6)',
  },
  glass: {
    tint: 'rgba(255,252,247,0.62)',
    border: 'rgba(255,255,255,0.7)',
    highlight: 'rgba(255,255,255,0.45)',
    shadow: brand.ink,
  },
}

/**
 * Not an inversion. Warm deep charcoal (not neutral/blue-black), a restrained
 * terracotta that reads correctly on dark surfaces (the light-mode terra is
 * slightly desaturated here so it doesn't vibrate against near-black), and a
 * text hierarchy tuned for actual contrast rather than 1:1 opposite values.
 */
export const darkColors: SemanticColors = {
  background: {
    primary: '#1C1916',
    secondary: '#151310',
    elevated: '#242019',
  },
  surface: {
    primary: '#26221D',
    secondary: '#2E2922',
    glass: 'rgba(38,34,29,0.68)',
  },
  text: {
    primary: '#F3ECE1',
    secondary: '#C9BFB0',
    tertiary: '#8F8578',
    inverse: brand.ink,
  },
  accent: {
    primary: '#D89468',
    subtle: 'rgba(216,148,104,0.16)',
    onAccent: '#241A12',
  },
  status: {
    success: '#8CAE7B',
    warning: '#D99A5C',
    error: '#CD8065',
    info: '#93AE85',
  },
  separator: {
    primary: '#3A342C',
    subtle: 'rgba(58,52,44,0.6)',
  },
  glass: {
    tint: 'rgba(38,34,29,0.6)',
    border: 'rgba(255,255,255,0.09)',
    highlight: 'rgba(255,255,255,0.06)',
    shadow: '#000000',
  },
}
