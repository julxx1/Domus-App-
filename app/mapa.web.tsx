import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Icon from '@/components/Icon'
import { PressableScale } from '@/components/Shared'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

/**
 * Web build of Mapa familiar. `react-native-maps` is native-only — it
 * imports RN internals (`codegenNativeCommands`) that break web bundling
 * outright, so this route can't share `mapa.tsx`'s implementation. Metro/
 * Expo Router pick this `.web.tsx` file over `mapa.tsx` automatically for
 * web builds; the native app is untouched.
 *
 * No fabricated map here — an honest "not available in the web version yet"
 * card, matching Domus's visual language, rather than a broken or empty map.
 */
export default function MapaWebScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          scaleTo={0.93}
          accessibilityLabel="Volver"
          style={styles.back}
        >
          <Icon name="chev-l" size={20} color={colors.ink} strokeWidth={2.2} />
        </PressableScale>
        <Text style={styles.title}>Mapa familiar</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.icon}>
          <Icon name="map-pin" size={24} color={colors.terra} strokeWidth={1.6} />
        </View>
        <Text style={styles.cardTitle}>El mapa está disponible en la app</Text>
        <Text style={styles.cardText}>
          Descarga Domus en tu teléfono para ver dónde está cada miembro de tu hogar.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.screenX },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
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
  title: { fontFamily: fonts.serif, fontSize: 19, color: colors.ink },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.xl - 6,
    padding: 32,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink, textAlign: 'center' },
  cardText: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: colors.mute,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
})
