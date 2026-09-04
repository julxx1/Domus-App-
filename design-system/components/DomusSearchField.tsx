import { Pressable, TextInput, View } from 'react-native'
import Icon from '@/components/Icon'
import { useDomusTheme } from '../hooks/useDomusTheme'

export interface DomusSearchFieldProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

/** Compact search field — a `DomusInput` variant with a leading icon and clear button, not a separate visual language. */
export function DomusSearchField({ value, onChangeText, placeholder = 'Buscar' }: DomusSearchFieldProps) {
  const theme = useDomusTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        backgroundColor: theme.colors.background.elevated,
        borderWidth: 1,
        borderColor: theme.colors.separator.primary,
        borderRadius: theme.radius.medium,
        paddingHorizontal: theme.spacing[4],
        gap: theme.spacing[2],
      }}
    >
      <Icon name="search" size={16} color={theme.colors.text.tertiary} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        style={{
          flex: 1,
          height: '100%',
          color: theme.colors.text.primary,
          fontFamily: theme.typography.body.fontFamily,
          fontSize: theme.typography.body.fontSize,
        }}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          onPress={() => onChangeText('')}
          hitSlop={8}
        >
          <Icon name="x" size={14} color={theme.colors.text.tertiary} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </View>
  )
}
