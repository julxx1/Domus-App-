import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { useDomusTheme } from '../hooks/useDomusTheme'
import { DomusIconButton } from './DomusIconButton'

export interface DomusHeaderProps {
  title: string
  eyebrow?: string
  /** `large` for a screen's top (Home-style), `compact` for secondary/pushed screens. */
  size?: 'large' | 'compact'
  onBack?: () => void
  trailing?: ReactNode
}

/**
 * Primitive only — this does not attempt scroll-collapse behavior yet (the
 * brief defers "scrolling states" to a later phase). Screens still build
 * their own header layout for now; this exists so a future migration has a
 * consistent piece to adopt.
 */
export function DomusHeader({ title, eyebrow, size = 'compact', onBack, trailing }: DomusHeaderProps) {
  const theme = useDomusTheme()
  const titleStyle = size === 'large' ? theme.typography.largeTitle : theme.typography.title2

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: size === 'large' ? 'flex-start' : 'center',
        gap: theme.spacing[4],
        paddingHorizontal: theme.semanticSpacing.screenHorizontal,
        paddingTop: theme.spacing[4],
        paddingBottom: theme.spacing[5],
      }}
    >
      {onBack ? <DomusIconButton icon="chev-l" accessibilityLabel="Volver" onPress={onBack} /> : null}
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.accent.primary, marginBottom: theme.spacing[1] },
            ]}
          >
            {eyebrow.toUpperCase()}
          </Text>
        ) : null}
        <Text style={[titleStyle, { color: theme.colors.text.primary }]}>{title}</Text>
      </View>
      {trailing}
    </View>
  )
}
