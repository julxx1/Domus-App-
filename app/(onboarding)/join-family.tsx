import { useState } from 'react'
import { Keyboard, StyleSheet, TextInput } from 'react-native'
import { useRouter } from 'expo-router'

import Stagger from '@/components/Stagger'
import { AuthBack, AuthHeader, AuthPrimaryButton, AuthScreen, ErrorBanner } from '@/components/auth/AuthChrome'
import { useAuth } from '@/lib/auth/AuthProvider'
import { colors, fonts, radii } from '@/theme/tokens'

export default function JoinFamilyScreen() {
  const router = useRouter()
  const { joinHousehold } = useAuth()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = code.trim().length >= 4 && !loading

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const result = await joinHousehold(code)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.replace('/(tabs)')
  }

  return (
    <AuthScreen>
      <Stagger index={0}>
        <AuthBack />
        <AuthHeader
          eyebrow="Domus"
          title="Únete a tu familia"
          subtitle="Ingresa el código de invitación que te compartieron."
        />
      </Stagger>

      <Stagger index={1}>
        <ErrorBanner message={error} />
        <TextInput
          value={code}
          onChangeText={t => { setCode(t.toUpperCase()); if (error) setError(null) }}
          placeholder="CÓDIGO"
          placeholderTextColor={colors.muteLight}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={16}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          style={styles.codeInput}
        />

        <AuthPrimaryButton
          label="Unirme"
          onPress={() => void submit()}
          loading={loading}
          disabled={!canSubmit}
        />
      </Stagger>
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  codeInput: {
    height: 68,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.lg - 4,
    textAlign: 'center',
    fontFamily: fonts.sansBold,
    fontSize: 24,
    letterSpacing: 6,
    color: colors.ink,
    marginBottom: 20,
  },
})
