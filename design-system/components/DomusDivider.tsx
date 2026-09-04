import { View } from 'react-native'
import { useDomusTheme } from '../hooks/useDomusTheme'

export function DomusDivider({ subtle = false }: { subtle?: boolean }) {
  const theme = useDomusTheme()
  return (
    <View
      style={{
        height: 1,
        backgroundColor: subtle ? theme.colors.separator.subtle : theme.colors.separator.primary,
      }}
    />
  )
}
