import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import Icon, { type IconName } from '@/components/Icon'
import { useDomusTheme } from '../hooks/useDomusTheme'

export interface DomusEmptyStateProps {
  title: string
  description?: string
  icon?: IconName
  children?: ReactNode
}

export function DomusEmptyState({ title, description, icon, children }: DomusEmptyStateProps) {
  const theme = useDomusTheme()
  return (
    <View
      style={{
        alignItems: 'center',
        gap: theme.spacing[2],
        backgroundColor: theme.colors.surface.secondary,
        borderWidth: 1,
        borderColor: theme.colors.separator.primary,
        borderRadius: theme.radius.large,
        paddingVertical: theme.spacing[8],
        paddingHorizontal: theme.spacing[6],
      }}
    >
      {icon ? (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: theme.radius.medium,
            backgroundColor: theme.colors.background.elevated,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing[2],
          }}
        >
          <Icon name={icon} size={22} color={theme.colors.text.tertiary} strokeWidth={1.6} />
        </View>
      ) : null}
      <Text style={[theme.typography.headline, { color: theme.colors.text.primary, textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            theme.typography.footnote,
            { color: theme.colors.text.tertiary, textAlign: 'center', lineHeight: 18 },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  )
}
