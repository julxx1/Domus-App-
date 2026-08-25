import { useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { PressableScale, Title, Eyebrow } from '@/components/Shared'
import { Chip, PrimaryButton } from '@/components/Form'
import { ErrorBanner } from '@/components/auth/AuthChrome'
import { supabase } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth/errors'
import type { HouseholdInvitationRow, InvitationRole } from '@/lib/supabase/types'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

const ROLE_OPTIONS: { value: InvitationRole; label: string }[] = [
  { value: 'Miembro', label: 'Miembro' },
  { value: 'Mamá', label: 'Mamá' },
  { value: 'Papá', label: 'Papá' },
  { value: 'Hijo', label: 'Hijo' },
  { value: 'Hija', label: 'Hija' },
  { value: 'Abuelo', label: 'Abuelo' },
  { value: 'Abuela', label: 'Abuela' },
]

export default function InvitarScreen() {
  const router = useRouter()
  const [role, setRole] = useState<InvitationRole>('Miembro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase.rpc('create_household_invitation', {
      p_role: role,
      p_expires_in_hours: 72,
    })
    setLoading(false)
    if (rpcError) {
      setError(translateAuthError(rpcError))
      return
    }
    const invitation = data as HouseholdInvitationRow
    setCode(invitation.code)
    setExpiresAt(invitation.expires_at)
  }

  async function copy() {
    if (!code) return
    await Clipboard.setStringAsync(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
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
          <Eyebrow>Hogar</Eyebrow>
          <Title>Invitar miembro</Title>
        </View>
      </Stagger>

      {!code ? (
        <Stagger index={1} style={styles.block}>
          <ErrorBanner message={error} />
          <Text style={styles.label}>ROL</Text>
          <View style={styles.chips}>
            {ROLE_OPTIONS.map(opt => (
              <Chip key={opt.value} label={opt.label} active={role === opt.value} onPress={() => setRole(opt.value)} />
            ))}
          </View>
          <PrimaryButton label="Generar código" onPress={() => void generate()} disabled={loading} />
        </Stagger>
      ) : (
        <Stagger index={1} style={styles.block}>
          <Text style={styles.shareLabel}>Comparte este código</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{code}</Text>
          </View>
          <Text style={styles.expiresText}>
            Expira el {new Date(expiresAt!).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}
          </Text>
          <PrimaryButton label={copied ? 'Copiado ✓' : 'Copiar código'} onPress={() => void copy()} />
        </Stagger>
      )}
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
  block: { paddingHorizontal: spacing.screenX, gap: 12 },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.mute,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  shareLabel: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink, textAlign: 'center' },
  codeBox: {
    height: 84,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.lg - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: { fontFamily: fonts.sansBold, fontSize: 30, letterSpacing: 6, color: colors.ink },
  expiresText: { fontFamily: fonts.sans, fontSize: 12, color: colors.mute, textAlign: 'center' },
})
