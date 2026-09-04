/** Base 4pt-ish scale — every layout gap should come from here, not a literal. */
export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
} as const

/** Named for where they're used, so call sites read as intent, not numbers. */
export const semanticSpacing = {
  screenHorizontal: spacing[6],
  sectionGap: spacing[8],
  cardPadding: spacing[5],
  controlGap: spacing[3],
  contentGap: spacing[4],
} as const
