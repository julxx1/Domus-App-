import { forwardRef, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import Icon from '@/components/Icon'
import { PressableScale } from '@/components/Shared'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

/**
 * Scroll + keyboard-avoiding shell shared by every (auth) screen.
 *
 * The safe-area top inset lives on the ScrollView's contentContainerStyle,
 * not on a View wrapping KeyboardAvoidingView — KeyboardAvoidingView measures
 * its OWN on-screen position to compute how much to shift for the keyboard,
 * so padding placed above it in the tree needs to be reflected in that
 * measurement. Keeping KeyboardAvoidingView flush with the real screen top
 * (offset 0) and pushing content down via the scroll content's own padding
 * avoids double-counting the inset, which was over-shifting content and
 * leaving fields/CTA unreachable.
 */
export function AuthScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 48 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export function AuthBack() {
  const router = useRouter()
  return (
    <PressableScale
      onPress={() => router.back()}
      scaleTo={0.93}
      accessibilityLabel="Volver"
      style={styles.back}
    >
      <Icon name="chev-l" size={20} color={colors.ink} strokeWidth={2.2} />
    </PressableScale>
  )
}

export function AuthHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View style={styles.errorBanner}>
      <Icon name="x" size={13} color={colors.danger} strokeWidth={2.4} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  )
}

export const AuthField = forwardRef<TextInput, { label: string; hint?: string } & TextInputProps>(
  function AuthField({ label, hint, style, ...inputProps }, ref) {
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.muteLight}
          {...inputProps}
          style={[styles.input, style]}
        />
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    )
  }
)

export const PasswordField = forwardRef<
  TextInput,
  {
    label: string
    value: string
    onChangeText: (v: string) => void
    placeholder?: string
    autoComplete?: TextInputProps['autoComplete']
    returnKeyType?: TextInputProps['returnKeyType']
    onSubmitEditing?: TextInputProps['onSubmitEditing']
  }
>(function PasswordField(
  { label, value, onChangeText, placeholder, autoComplete = 'password', returnKeyType, onSubmitEditing },
  ref
) {
  const [visible, setVisible] = useState(false)
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muteLight}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === 'done'}
          style={[styles.input, styles.passwordInput]}
        />
        <PressableScale
          onPress={() => setVisible(v => !v)}
          scaleTo={0.9}
          accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={styles.eyeBtn}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={18} color={colors.mute} strokeWidth={1.8} />
        </PressableScale>
      </View>
    </View>
  )
})

export function AuthPrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}) {
  const isDisabled = disabled || loading
  return (
    <PressableScale
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityLabel={label}
      style={[styles.primary, { backgroundColor: isDisabled ? colors.lineStrong : colors.terra }]}
    >
      {loading ? (
        <ActivityIndicator color={isDisabled ? colors.mute : '#fff'} />
      ) : (
        <Text style={[styles.primaryText, { color: isDisabled ? colors.mute : '#fff' }]}>{label}</Text>
      )}
    </PressableScale>
  )
}

export function AuthFooterLink({ prompt, action, onPress }: { prompt: string; action: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={action} style={styles.footerLink}>
      <Text style={styles.footerText}>
        {prompt} <Text style={styles.footerAction}>{action}</Text>
      </Text>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.screenX, paddingTop: 8 },
  back: {
    width: 40,
    height: 40,
    borderRadius: radii.md - 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  header: { marginBottom: 28 },
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.terraDeep,
    marginBottom: 6,
  },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.mute, marginTop: 8, lineHeight: 20 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radii.sm + 2,
    backgroundColor: 'rgba(184,88,66,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(184,88,66,0.24)',
    marginBottom: 16,
  },
  errorText: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.danger, lineHeight: 17 },

  fieldGroup: { marginBottom: 16 },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.mute,
    marginBottom: 6,
  },
  input: {
    height: 52,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md - 2,
    paddingHorizontal: 16,
    fontFamily: fonts.sans,
    fontSize: 15.5,
    color: colors.ink,
  },
  hint: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.mute, marginTop: 6 },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: 'absolute',
    right: 4,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primary: {
    height: 54,
    borderRadius: radii.lg - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: fonts.sansBold, fontSize: 15.5 },

  footerLink: { alignItems: 'center', paddingVertical: 16 },
  footerText: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.mute },
  footerAction: { fontFamily: fonts.sansSemiBold, color: colors.terraDeep },
})
