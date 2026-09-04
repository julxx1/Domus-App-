# DOMUS Design System 2.0

Phase 1 — foundation only. **Nothing in `design-system/` is wired into a real
screen yet.** Existing screens keep using `theme/tokens.ts` and their own
components exactly as before; this system lives alongside them until Phase 2
migrates screens one at a time.

## Philosophy

Apple-first + Liquid Glass + warm DOMUS identity. Premium, calm, fluid,
family-oriented — not a generic SaaS UI, not glass-everywhere, not a clone of
Apple Settings. Hierarchy comes from material, depth, typography, whitespace
and motion — not from painting terracotta across every container.

## Colors

Two layers, in `design-system/tokens/colors.ts`:
- `brand` — the raw DOMUS palette (unchanged, ported from `theme/tokens.ts`).
- `lightColors`/`darkColors` — semantic tokens components actually consume
  (`background.primary`, `text.secondary`, `glass.tint`, …). Never reach for
  a raw hex in a component; always go through `theme.colors.*`.

Dark mode is not an inversion — deep warm charcoal, a desaturated terracotta
that reads correctly on near-black, and a text hierarchy tuned for real
contrast rather than 1:1 opposite values.

## Typography

`design-system/tokens/typography.ts` — a centralized scale
(`display`/`largeTitle`/`title1`/`title2`/`title3`/`headline`/`body`/
`callout`/`subheadline`/`footnote`/`caption`), adapted from (not copied from)
the Apple HIG scale.

Two families:
- **Newsreader** (serif) — DOMUS's editorial voice. Used only by `display`
  and `largeTitle`. Reserved for big emotional moments (a screen's title, the
  Home greeting) — never buttons, forms, labels, nav, or settings.
- **System font** — `fontFamily: undefined`, which is how RN opts into San
  Francisco (iOS) / Roboto (Android) rather than fighting the platform with a
  bundled approximation. Every functional style uses this.

`theme/tokens.ts`'s Plus Jakarta Sans (`fonts.sans*`) is untouched and still
used by every existing screen — this system doesn't use it for new
functional UI, per the brief, but doesn't remove it either.

## Spacing & Shape

`tokens/spacing.ts` — numeric scale (0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48)
plus semantic names (`screenHorizontal`, `sectionGap`, `cardPadding`,
`controlGap`, `contentGap`). No arbitrary values like `17`/`23` without a
real visual reason.

`tokens/radius.ts` — `small` (10) / `medium` (14) / `large` (20) / `xlarge`
(28) / `pill` (999). Glass/floating controls lean toward `pill`; content
surfaces stay at `medium`/`large`.

## Materials — Liquid Glass

`design-system/components/DomusGlass.tsx` is the **only** place glass gets
built. No screen should touch `BlurView` or hand-roll translucency directly.

Five variants (`tokens/glass.ts`), each with one job:

| Variant | Use |
|---|---|
| `regular` | Default surface — sheets, headers |
| `thin` | Lighter touch, content sits close behind it |
| `prominent` | Stronger presence — a selected/primary floating control |
| `control` | Compact interactive controls — segmented control, chips |
| `floating` | Detached elements, strongest shadow — tab bar lens, FAB |

**Native Liquid Glass (`expo-glass-effect`) is NOT installed.** It ships in
SDK 54 for iOS 26's real `UIGlassEffect`, but whether it's bundled into Expo
Go for this SDK version was never confirmed, and DOMUS already has one real
crash in its history from an experimental blur prop
(`experimentalBlurMethod`, documented in `components/TabBar.tsx`). Per the
brief's own instruction — "stability is more important than perfect
refraction" — this phase does **not** gamble on it.

**Current fallback (the only implementation right now):** layered
translucency — tinted `View` background + top highlight strip + border +
shadow. Zero native blur, zero risk. This is the exact approach that already
fixed the real Expo Go crash in the bottom tab bar.

`DomusGlass` is written capability-based on purpose: if native glass is ever
confirmed safe, it becomes an additional branch inside this one component —
every consumer (`DomusButton`, `DomusSegmentedControl`, etc.) stays
unchanged, because they only ever see `DomusGlass`, never the underlying
implementation.

**When to use glass vs. not:** interactive/floating layers only — nav,
floating buttons, toolbars, segmented controls, chips, sheets, contextual
menus. Normal content (cards, list rows, body text backgrounds) stays calm
and opaque — `DomusCard`'s default variants never use glass.

## Motion

`tokens/motion.ts` — `duration.fast/normal/slow` (140/220/320ms), two easing
curves (`standard` mirrors `theme/tokens.ts`'s existing ease-out for visual
continuity), two spring presets (`responsive`/`gentle`), a shared
`pressScale` (0.975) and `enterDistance` (8).

Principles: fast, fluid, interruptible, subtle, spatially logical. No huge
bounce, no long animations, never block navigation waiting on a decorative
animation to finish.

`useReducedMotion()` (`design-system/hooks`) re-exports Reanimated's own
hook — already proven working in `components/TabBar.tsx` — rather than
reimplementing OS-level reduce-motion detection.

## Haptics

`useDomusHaptics()` exposes six semantic actions —
`selection`/`lightImpact`/`mediumImpact`/`success`/`warning`/`error` — never
call `expo-haptics` directly from a component. Trivial taps (plain-text
buttons) intentionally get no haptic.

## Accessibility

- `useReduceTransparency()` — when iOS "Reduce Transparency" is on,
  `DomusGlass` boosts fill opacity and border strength instead of relying on
  whatever's behind it, and drops the highlight strip.
- `useReducedMotion()` — components using it (`DomusProgress`,
  `DomusSegmentedControl`) skip animated transitions and jump straight to
  the end state.
- Text on glass never depends on legibility "getting lucky" — the opaque
  fallback (Reduce Transparency path) guarantees contrast regardless.

## Dark mode

Architecture exists now (`DomusThemeProvider`, `lightTheme`/`darkTheme`,
every token has a dark value) — screens are **not** migrated to consume it
in Phase 1. `DomusThemeProvider` follows system appearance by default;
`setPreference('light' | 'dark')` overrides it, for a future Settings toggle
that doesn't exist yet.

## Components

All in `design-system/components/`, all theme-driven (no component accepts
a raw hex):

`DomusGlass`, `DomusButton` (primary/secondary/glass/plain/destructive),
`DomusIconButton`, `DomusFloatingButton`, `DomusCard`
(content/elevated/interactive), `DomusInput` (label/error/helper/secure with
show-hide), `DomusSearchField`, `DomusSegmentedControl` (one moving
selection surface, same measured-layout approach as the tab bar lens),
`DomusChip` (action/filter/selected), `DomusBadge`, `DomusAvatar`,
`DomusHeader` (primitive only — no scroll-collapse yet), `DomusSheetSurface`
(material wrapper only — `components/Sheet.tsx` still owns modal/transition
logic), `DomusDivider`, `DomusProgress`, `DomusEmptyState`.

Every interactive component defines default/pressed/disabled/loading/
selected states explicitly — none of these are invented per-screen.

## Performance rules

1. No unnecessary `BlurView` layers (none are used at all right now).
2. No nested glass surfaces.
3. Never animate blur intensity continuously.
4. Animate transform/opacity, not layout properties.
5. Reuse Reanimated shared values; don't recreate them per render.
6. No native measurement every frame.
7. No experimental effects that risk an Expo Go crash.

## Showcase

`app/design-system.tsx` — internal, dev-only. Not in the tab bar, not linked
from anywhere in the app. Reach it with `router.push('/design-system')` from
a dev console, or type it into Expo Go's URL bar. Wraps itself in
`DomusThemeProvider` locally since the real app tree doesn't mount the
provider yet. Safe to delete as a single file with zero impact elsewhere.

## What Phase 1 deliberately does NOT do

- No screen (Home, Security, Agenda, Chat, Market, Profile, Auth, Family) was
  redesigned or migrated to these components.
- The stable Liquid Glass bottom tab bar (`components/TabBar.tsx`) was not
  touched — Phase 2's job.
- No native dependency was added (`expo-glass-effect` investigated, not
  installed).
- No SF Symbols integration — the existing SVG `Icon` system
  (`components/Icon.tsx`) is reused as-is per the brief ("if the current SVG
  icon system is more stable, preserve it").
