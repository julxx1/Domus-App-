import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { AuthPrimaryButton, AuthScreen, ErrorBanner } from '@/components/auth/AuthChrome'
import { PressableScale } from '@/components/Shared'
import { useAuth } from '@/lib/auth/AuthProvider'
import { colors, fonts, radii } from '@/theme/tokens'

/**
 * Shown when `supabase.auth.signUp` returns no session — email confirmation
 * is on for this project. Never claims the account is verified; the app
 * doesn't gain a session until the user actually confirms and signs in.
 */
export default function VerifyEmailScreen() {
  const router = useRouter()
  const { resendConfirmation } = useAuth()
  const { email } = useLocalSearchParams<{ email?: string }>()

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  async function resend() {
    if (!email || sending) return
    setSending(true)
    setError(null)
    const result = await resendConfirmation(email)
    setSending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setResent(true)
    setTimeout(() => setResent(false), 2400)
  }

  return (
    <AuthScreen>
      <Stagger index={0} style={styles.block}>
        <View style={styles.icon}>
          <Icon name="mail" size={26} color={colors.terra} strokeWidth={1.6} />
        </View>
        <Text style={styles.title}>Revisa tu correo</Text>
        <Text style={styles.text}>Te enviamos un enlace para confirmar tu cuenta.</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
      </Stagger>

      <Stagger index={1} style={styles.actions}>
        <ErrorBanner message={error} />
        <AuthPrimaryButton
          label={resent ? 'Enviado ✓' : 'Reenviar correo'}
          onPress={() => void resend()}
          loading={sending}
          disabled={!email}
        />
        <PressableScale
          onPress={() => router.replace('/(auth)/login')}
          accessibilityLabel="Volver a iniciar sesión"
          style={styles.footerLink}
        >
          <Text style={styles.footerText}>Volver a iniciar sesión</Text>
        </PressableScale>
      </Stagger>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', paddingTop: 48 },
  icon: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, marginBottom: 8 },
  text: { fontFamily: fonts.sans, fontSize: 14, color: colors.mute, textAlign: 'center', lineHeight: 20 },
  email: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink, marginTop: 10 },
  actions: { marginTop: 40, gap: 4 },
  footerLink: { alignItems: 'center', paddingVertical: 16 },
  footerText: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.terraDeep },
})
