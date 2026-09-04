import { Text, View } from 'react-native'
import { useDomusTheme } from '../hooks/useDomusTheme'

export type DomusBadgeTone = 'accent' | 'success' | 'warning' | 'error' | 'neutral'

export interface DomusBadgeProps {
  label: string
  tone?: DomusBadgeTone
}

export function DomusBadge({ label, tone = 'neutral' }: DomusBadgeProps) {
  const theme = useDomusTheme()
  const toneColor =
    tone === 'accent'
      ? theme.colors.accent.primary
      : tone === 'success'
        ? theme.colors.status.success
        : tone === 'warning'
          ? theme.colors.status.warning
          : tone === 'error'
            ? theme.colors.status.error
            : theme.colors.text.tertiary

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: theme.spacing[3],
        height: 22,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${toneColor}1F`, // ~12% alpha via hex suffix — tone colors here are always solid hex
      }}
    >
      <Text style={[theme.typography.caption, { color: toneColor, textTransform: 'none', letterSpacing: 0 }]}>
        {label}
      </Text>
    </View>
  )
}
