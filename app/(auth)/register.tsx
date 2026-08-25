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
import { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from '@/lib/auth/validate'

export default function RegisterScreen() {
  const router = useRouter()
  const { signUp } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastNameRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)

  const passwordsMatch = password.length > 0 && password === confirm
  const canSubmit =
    firstName.trim().length > 0 &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordsMatch &&
    !loading

  function clearError() {
    if (error) setError(null)
  }

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const result = await signUp({ firstName, lastName, email, password })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      router.replace({ pathname: '/(auth)/verify-email', params: { email: email.trim() } })
      return
    }
    // Session arrived immediately — AuthProvider's status change redirects.
  }

  return (
    <AuthScreen>
      <Stagger index={0}>
        <AuthBack />
        <AuthHeader eyebrow="Domus" title="Crear cuenta" />
      </Stagger>

      <Stagger index={1}>
        <ErrorBanner message={error} />
        <AuthField
          label="Nombre"
          value={firstName}
          onChangeText={t => { setFirstName(t); clearError() }}
          placeholder="Renata"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthField
          ref={lastNameRef}
          label="Apellido"
          value={lastName}
          onChangeText={t => { setLastName(t); clearError() }}
          placeholder="Duarte"
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthField
          ref={emailRef}
          label="Correo electrónico"
          value={email}
          onChangeText={t => { setEmail(t); clearError() }}
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
          onChangeText={t => { setPassword(t); clearError() }}
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          autoComplete="new-password"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <PasswordField
          ref={confirmRef}
          label="Confirmar contraseña"
          value={confirm}
          onChangeText={t => { setConfirm(t); clearError() }}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={() => {
            Keyboard.dismiss()
          }}
        />

        <AuthPrimaryButton
          label="Crear mi cuenta"
          onPress={() => void submit()}
          loading={loading}
          disabled={!canSubmit}
        />

        <AuthFooterLink
          prompt="¿Ya tienes cuenta?"
          action="Iniciar sesión"
          onPress={() => router.replace('/(auth)/login')}
        />
      </Stagger>
    </AuthScreen>
  )
}
