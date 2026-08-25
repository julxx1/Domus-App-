import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { PressableScale } from '@/components/Shared'
import { useAuth } from '@/lib/auth/AuthProvider'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

export default function FamilyChoiceScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { profile, signOut } = useAuth()

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Stagger index={0} style={styles.header}>
        <Text style={styles.eyebrow}>
          {profile?.first_name ? `Hola, ${profile.first_name}` : 'Hola'}
        </Text>
        <Text style={styles.title}>Configura tu hogar</Text>
        <Text style={styles.subtitle}>
          Crea tu propia familia en Domus o únete a una con un código de invitación.
        </Text>
      </Stagger>

      <Stagger index={1} style={styles.options}>
        <PressableScale
          onPress={() => router.push('/(onboarding)/create-family')}
          accessibilityLabel="Crear una familia"
          style={styles.card}
        >
          <View style={[styles.cardIcon, { backgroundColor: colors.terraSoft }]}>
            <Icon name="home" size={22} color={colors.terraDeep} strokeWidth={1.7} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Crear una familia</Text>
            <Text style={styles.cardText}>Empieza un hogar nuevo en Domus.</Text>
          </View>
          <Icon name="chev-r" size={18} color={colors.mute} />
        </PressableScale>

        <PressableScale
          onPress={() => router.push('/(onboarding)/join-family')}
          accessibilityLabel="Unirme a una familia"
          style={styles.card}
        >
          <View style={[styles.cardIcon, { backgroundColor: colors.sageSoft }]}>
            <Icon name="chat" size={22} color={colors.sageDeep} strokeWidth={1.7} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Unirme a una familia</Text>
            <Text style={styles.cardText}>Ingresa el código que te compartieron.</Text>
          </View>
          <Icon name="chev-r" size={18} color={colors.mute} />
        </PressableScale>
      </Stagger>

      <View style={{ flex: 1 }} />

      <PressableScale
        onPress={() => void signOut()}
        accessibilityLabel="Cerrar sesión"
        style={styles.signOut}
      >
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.screenX },
  header: { marginBottom: 32 },
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.terraDeep,
    marginBottom: 8,
  },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.mute, marginTop: 10, lineHeight: 21 },
  options: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg - 4,
    padding: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink },
  cardText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.mute, marginTop: 2 },
  signOut: { alignItems: 'center', paddingVertical: 14 },
  signOutText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.mute },
})
