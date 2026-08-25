import { useState } from 'react'
import { Keyboard, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import {
  AuthBack,
  AuthField,
  AuthFooterLink,
  AuthHeader,
  AuthPrimaryButton,
  AuthScreen,
  ErrorBanner,
} from '@/components/auth/AuthChrome'
import { useAuth } from '@/lib/auth/AuthProvider'
import { isValidEmail } from '@/lib/auth/validate'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const canSubmit = isValidEmail(email) && !loading

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const result = await resetPassword(email)
    setLoading(false)
    // A generic email doesn't reveal whether the account exists — show the
    // same "revisa tu correo" state either way, unless it's a hard error
    // (bad request, rate limit) worth surfacing.
    if (result.error) {
      setError(result.error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthScreen>
        <Stagger index={0}>
          <AuthBack />
        </Stagger>
        <Stagger index={1} style={styles.doneBlock}>
          <View style={styles.doneIcon}>
            <Icon name="mail" size={24} color={colors.terra} strokeWidth={1.6} />
          </View>
          <Text style={styles.doneTitle}>Revisa tu correo</Text>
          <Text style={styles.doneText}>
            Si {email.trim()} tiene una cuenta en Domus, te enviamos instrucciones para restablecer tu contraseña.
          </Text>
          <AuthPrimaryButton label="Volver a iniciar sesión" onPress={() => router.replace('/(auth)/login')} />
        </Stagger>
      </AuthScreen>
    )
  }

  return (
    <AuthScreen>
      <Stagger index={0}>
        <AuthBack />
        <AuthHeader
          eyebrow="Domus"
          title="Recuperar contraseña"
          subtitle="Te enviaremos un correo con instrucciones."
        />
      </Stagger>

      <Stagger index={1}>
        <ErrorBanner message={error} />
        <AuthField
          label="Correo electrónico"
          value={email}
          onChangeText={t => { setEmail(t); if (error) setError(null) }}
          placeholder="tú@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <AuthPrimaryButton
          label="Enviar instrucciones"
          onPress={() => void submit()}
          loading={loading}
          disabled={!canSubmit}
        />

        <AuthFooterLink prompt="" action="Volver a iniciar sesión" onPress={() => router.back()} />
      </Stagger>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  doneBlock: { alignItems: 'center', paddingTop: 24, paddingHorizontal: spacing.gap },
  doneIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  doneTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginBottom: 8 },
  doneText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.mute,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
})
