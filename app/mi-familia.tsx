import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { PressableScale, SectionTitle, Title, Eyebrow } from '@/components/Shared'
import { PrimaryButton } from '@/components/Form'
import { useAuth } from '@/lib/auth/AuthProvider'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import { canInvite, type Member } from '@/lib/domain/types'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

export default function MiFamiliaScreen() {
  const router = useRouter()
  const { profile, household } = useAuth()
  const members = useAsyncData(() => repositories.profile.listMembers(), [profile?.household_id])

  const self: Member | null = profile
    ? { id: profile.id, name: profile.name, role: profile.role, color: profile.color }
    : null
  const everyone = self ? [self, ...(members.data ?? [])] : members.data ?? []
  const showInvite = canInvite(profile?.role)

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
          <Eyebrow>{household?.name ?? 'Tu hogar'}</Eyebrow>
          <Title>Mi familia</Title>
        </View>
      </Stagger>

      <Stagger index={1} style={styles.block}>
        <SectionTitle>Miembros</SectionTitle>
        <View style={styles.list}>
          {everyone.map(m => (
            <View key={m.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: m.color }]}>
                <Text style={styles.avatarText}>{m.name.trim()[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{m.name}{m.id === self?.id ? ' (tú)' : ''}</Text>
                <Text style={styles.role}>{m.role}</Text>
              </View>
            </View>
          ))}
        </View>
      </Stagger>

      {showInvite ? (
        <Stagger index={2} style={styles.block}>
          <PrimaryButton label="Invitar miembro" onPress={() => router.push('/invitar')} />
        </Stagger>
      ) : null}
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
  block: { marginTop: 8, paddingHorizontal: spacing.screenX },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.serif, fontSize: 16, color: '#fff' },
  name: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink },
  role: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.mute, marginTop: 2 },
})
