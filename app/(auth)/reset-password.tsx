import { useEffect, useRef, useState } from 'react'
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'

import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { AuthHeader, AuthPrimaryButton, AuthScreen, ErrorBanner, PasswordField } from '@/components/auth/AuthChrome'
import { supabase } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth/errors'
import { isValidPassword, MIN_PASSWORD_LENGTH } from '@/lib/auth/validate'
import { colors, fonts, radii } from '@/theme/tokens'

/**
 * Reached via the deep link in the recovery email
 * (`Linking.createURL('reset-password')`, see AuthProvider.resetPassword).
 *
 * Expo Go caveat (documented in docs/SUPABASE_AUTH_IMPLEMENTATION.md): that
 * link only resolves back into the app while the SAME dev server session
 * that generated it is still running — Expo Go has no stable install-level
 * URL scheme the way a real build does. It works for same-session testing;
 * a link clicked after the dev server restarted will fail to open Domus at
 * all, which is why this screen still needs to fail loudly and clearly
 * rather than hang, and why "Enviar instrucciones" always explains that in
 * the surrounding copy is out of scope for a first pass.
 */
export default function ResetPasswordScreen() {
  const router = useRouter()
  const url = Linking.useURL()

  const [status, setStatus] = useState<'resolving' | 'ready' | 'invalid'>('resolving')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const passwordRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)

  useEffect(() => {
    if (!url) return
    let mounted = true
    const tokens = parseRecoveryTokens(url)

    if (!tokens) {
      setStatus('invalid')
      return
    }

    void supabase.auth
      .setSession({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken })
      .then(({ error: sessionError }) => {
        if (!mounted) return
        setStatus(sessionError ? 'invalid' : 'ready')
      })

    return () => {
      mounted = false
    }
  }, [url])

  const passwordsMatch = password.length > 0 && password === confirm
  const canSubmit = isValidPassword(password) && passwordsMatch && !loading

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(translateAuthError(updateError))
      return
    }
    setDone(true)
  }

  if (status === 'resolving') {
    return (
      <AuthScreen>
        <Stagger index={0} style={styles.center}>
          <Text style={styles.centerText}>Confirmando tu enlace…</Text>
        </Stagger>
      </AuthScreen>
    )
  }

  if (status === 'invalid') {
    return (
      <AuthScreen>
        <Stagger index={0} style={styles.center}>
          <View style={styles.icon}>
            <Icon name="x" size={22} color={colors.danger} strokeWidth={2.2} />
          </View>
          <Text style={styles.centerTitle}>Enlace no válido</Text>
          <Text style={styles.centerText}>
            Este enlace ya expiró o no es válido. Pide uno nuevo desde “¿Olvidaste tu contraseña?”.
          </Text>
          <AuthPrimaryButton label="Volver a iniciar sesión" onPress={() => router.replace('/(auth)/login')} />
        </Stagger>
      </AuthScreen>
    )
  }

  if (done) {
    return (
      <AuthScreen>
        <Stagger index={0} style={styles.center}>
          <View style={styles.icon}>
            <Icon name="check" size={22} color={colors.ok} strokeWidth={2.2} />
          </View>
          <Text style={styles.centerTitle}>Contraseña actualizada</Text>
          <Text style={styles.centerText}>Ya puedes iniciar sesión con tu nueva contraseña.</Text>
          <AuthPrimaryButton
            label="Iniciar sesión"
            onPress={() => {
              void supabase.auth.signOut()
              router.replace('/(auth)/login')
            }}
          />
        </Stagger>
      </AuthScreen>
    )
  }

  return (
    <AuthScreen>
      <Stagger index={0}>
        <AuthHeader eyebrow="Domus" title="Nueva contraseña" />
      </Stagger>
      <Stagger index={1}>
        <ErrorBanner message={error} />
        <PasswordField
          ref={passwordRef}
          label="Nueva contraseña"
          value={password}
          onChangeText={t => { setPassword(t); if (error) setError(null) }}
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          autoComplete="new-password"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <PasswordField
          ref={confirmRef}
          label="Confirmar contraseña"
          value={confirm}
          onChangeText={t => { setConfirm(t); if (error) setError(null) }}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <AuthPrimaryButton
          label="Guardar contraseña"
          onPress={() => void submit()}
          loading={loading}
          disabled={!canSubmit}
        />
      </Stagger>
    </AuthScreen>
  )
}

function parseRecoveryTokens(url: string): { accessToken: string; refreshToken: string } | null {
  const fragment = url.includes('#') ? url.slice(url.indexOf('#') + 1) : ''
  const query = url.includes('?') ? url.split('#')[0]!.slice(url.indexOf('?') + 1) : ''
  const params = new URLSearchParams(fragment || query)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken }
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 60, gap: 4 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  centerTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, marginBottom: 6 },
  centerText: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: colors.mute,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
})
