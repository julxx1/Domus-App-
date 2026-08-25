import { useRef, useState } from 'react'
import { Keyboard, TextInput } from 'react-native'
import { useRouter } from 'expo-router'

import Stagger from '@/components/Stagger'
import {
  AuthBack,
  AuthField,
  AuthFooterLink,
  AuthHeader,
  AuthPrimaryButton,
  AuthScreen,
  ErrorBanner,
  PasswordField,
} from '@/components/auth/AuthChrome'
import { useAuth } from '@/lib/auth/AuthProvider'
import { isValidEmail } from '@/lib/auth/validate'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordRef = useRef<TextInput>(null)

  const canSubmit = isValidEmail(email) && password.length > 0 && !loading

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) {
      setError(signInError)
      return
    }
    // AuthProvider's status change drives the redirect to (tabs) or (onboarding).
  }

  return (
    <AuthScreen>
      <Stagger index={0}>
        <AuthBack />
        <AuthHeader eyebrow="Domus" title="Iniciar sesión" />
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
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
        <PasswordField
          ref={passwordRef}
          label="Contraseña"
          value={password}
          onChangeText={t => { setPassword(t); if (error) setError(null) }}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <AuthFooterLink
          prompt=""
          action="¿Olvidaste tu contraseña?"
          onPress={() => router.push('/(auth)/forgot-password')}
        />

        <AuthPrimaryButton
          label="Iniciar sesión"
          onPress={() => void submit()}
          loading={loading}
          disabled={!canSubmit}
        />

        <AuthFooterLink
          prompt="¿No tienes cuenta?"
          action="Crear cuenta"
          onPress={() => router.replace('/(auth)/register')}
        />
      </Stagger>
    </AuthScreen>
  )
}
