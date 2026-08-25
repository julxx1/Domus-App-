import { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Keyboard, StyleSheet, TextInput, View } from 'react-native'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { PressableScale, Title, Eyebrow } from '@/components/Shared'
import { AuthPrimaryButton, ErrorBanner, PasswordField } from '@/components/auth/AuthChrome'
import { useAuth } from '@/lib/auth/AuthProvider'
import { isValidPassword, MIN_PASSWORD_LENGTH } from '@/lib/auth/validate'
import { colors, radii, spacing } from '@/theme/tokens'

export default function CambiarPasswordScreen() {
  const router = useRouter()
  const { updatePasswordFromRecovery } = useAuth()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const confirmRef = useRef<TextInput>(null)

  const passwordsMatch = password.length > 0 && password === confirm
  const canSubmit = isValidPassword(password) && passwordsMatch && !loading

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const result = await updatePasswordFromRecovery(password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSaved(true)
    setPassword('')
    setConfirm('')
    setTimeout(() => router.back(), 1400)
  }

  return (
    <Screen hideTabs>
      <Stagger index={0} style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          scaleTo={0.93}
          accessibilityLabel="Volver"
          style={styles.back}
        >
          <Icon name="chev-l" size={20} color={colors.ink} strokeWidth={2.2} />
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Eyebrow>Seguridad</Eyebrow>
          <Title>Cambiar contraseña</Title>
        </View>
      </Stagger>

      <Stagger index={1} style={styles.body}>
        <ErrorBanner message={error} />
        <PasswordField
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
          label={saved ? 'Guardado ✓' : 'Guardar contraseña'}
          onPress={() => void submit()}
          loading={loading}
          disabled={!canSubmit}
        />
      </Stagger>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    paddingBottom: 22,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radii.md - 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.screenX },
})
