import { forwardRef, useState } from 'react'
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native'
import Icon from '@/components/Icon'
import { useDomusTheme } from '../hooks/useDomusTheme'

export interface DomusInputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  helperText?: string
  error?: string
  disabled?: boolean
  /** Adds a show/hide toggle and forces `secureTextEntry` under the hood. */
  secure?: boolean
}

/**
 * Readability over glass — inputs stay on an opaque/near-opaque elevated
 * surface, never the translucent glass material, per the brief.
 */
export const DomusInput = forwardRef<TextInput, DomusInputProps>(function DomusInput(
  { label, helperText, error, disabled = false, secure = false, onFocus, onBlur, ...inputProps },
  ref
) {
  const theme = useDomusTheme()
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(secure)

  const borderColor = error
    ? theme.colors.status.error
    : focused
      ? theme.colors.accent.primary
      : theme.colors.separator.primary

  return (
    <View style={{ marginBottom: theme.semanticSpacing.contentGap }}>
      {label ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.text.tertiary, marginBottom: theme.spacing[2], textTransform: 'uppercase' },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          ref={ref}
          editable={!disabled}
          secureTextEntry={secure && hidden}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={e => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={e => {
            setFocused(false)
            onBlur?.(e)
          }}
          style={[
            {
              height: 52,
              backgroundColor: theme.colors.background.elevated,
              borderWidth: focused ? 1.5 : 1,
              borderColor,
              borderRadius: theme.radius.medium,
              paddingHorizontal: theme.spacing[5],
              paddingRight: secure ? theme.spacing[10] : theme.spacing[5],
              color: theme.colors.text.primary,
              opacity: disabled ? 0.5 : 1,
              fontFamily: theme.typography.body.fontFamily,
              fontSize: theme.typography.body.fontSize,
            },
          ]}
          {...inputProps}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden(v => !v)}
            hitSlop={8}
            style={{ position: 'absolute', right: theme.spacing[4], width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={theme.colors.text.tertiary} strokeWidth={1.8} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={[theme.typography.footnote, { color: theme.colors.status.error, marginTop: theme.spacing[2] }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[theme.typography.footnote, { color: theme.colors.text.tertiary, marginTop: theme.spacing[2] }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  )
})
