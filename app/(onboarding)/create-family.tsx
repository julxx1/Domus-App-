import { useState } from 'react'
import { Keyboard } from 'react-native'
import { useRouter } from 'expo-router'

import Stagger from '@/components/Stagger'
import {
  AuthBack,
  AuthField,
  AuthHeader,
  AuthPrimaryButton,
  AuthScreen,
  ErrorBanner,
} from '@/components/auth/AuthChrome'
import { useAuth } from '@/lib/auth/AuthProvider'

export default function CreateFamilyScreen() {
  const router = useRouter()
  const { createHousehold } = useAuth()

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length > 0 && !loading

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const result = await createHousehold(name)
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
          title="Crea tu hogar"
          subtitle="Puedes invitar a los demás miembros después."
        />
      </Stagger>

      <Stagger index={1}>
        <ErrorBanner message={error} />
        <AuthField
          label="Nombre de la familia"
          value={name}
          onChangeText={t => { setName(t); if (error) setError(null) }}
          placeholder="Familia Duarte"
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <AuthPrimaryButton
          label="Crear familia"
          onPress={() => void submit()}
          loading={loading}
          disabled={!canSubmit}
        />
      </Stagger>
    </AuthScreen>
  )
}
