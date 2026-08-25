import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Stagger from '@/components/Stagger'
import { AuthPrimaryButton } from '@/components/auth/AuthChrome'
import { PressableScale } from '@/components/Shared'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

/**
 * DOMUS's own landing — never a generic Supabase auth screen. Doubles as the
 * unauthenticated entry point every session lands on before resolving.
 *
 * Layout: logo pinned near the top, the copy+actions block centred in the
 * remaining space via a `flex: 1, justifyContent: 'center'` wrapper (no fixed
 * margins tied to iPhone height), legal text pinned near the bottom. Safe
 * area handled by insets on the root padding, not hardcoded offsets.
 */
export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      <Stagger index={0} style={styles.brand}>
        <View style={styles.mark}>
          <Text style={styles.markText}>D</Text>
        </View>
      </Stagger>

      <View style={styles.centerArea}>
        <Stagger index={1} style={styles.copy}>
          <Text style={styles.title}>Tu hogar empieza aquí.</Text>
          <Text style={styles.subtitle}>
            Organiza, conecta y acompaña a tu familia desde un solo lugar.
          </Text>
        </Stagger>

        <Stagger index={2} style={styles.actions}>
          <AuthPrimaryButton label="Iniciar sesión" onPress={() => router.push('/(auth)/login')} />
          <PressableScale
            onPress={() => router.push('/(auth)/register')}
            accessibilityLabel="Crear cuenta"
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Crear cuenta</Text>
          </PressableScale>
        </Stagger>
      </View>

      <Text style={styles.legal}>
        Al continuar aceptas los términos y la política de privacidad.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.screenX },
  brand: { alignItems: 'flex-start' },
  mark: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontFamily: fonts.serif, fontSize: 24, color: colors.cream },

  centerArea: { flex: 1, justifyContent: 'center' },
  copy: { marginBottom: 32 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink, letterSpacing: -0.5, lineHeight: 44 },
  subtitle: { fontFamily: fonts.sans, fontSize: 15.5, color: colors.mute, marginTop: 12, lineHeight: 22 },

  actions: { gap: 12, width: '100%' },
  secondary: {
    height: 54,
    width: '100%',
    borderRadius: radii.lg - 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontFamily: fonts.sansBold, fontSize: 15.5, color: colors.ink },

  legal: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.muteLight,
    textAlign: 'center',
    lineHeight: 16,
  },
})
