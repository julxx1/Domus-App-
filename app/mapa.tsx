import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'
import * as Location from 'expo-location'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated'

import Icon from '@/components/Icon'
import { PressableScale } from '@/components/Shared'
import { PrimaryButton } from '@/components/Form'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import { colors, fonts, motion, radii, spacing } from '@/theme/tokens'

type PermState =
  | 'checking'
  | 'undetermined'
  | 'denied'
  | 'locating'
  | 'ready'
  | 'error'

/**
 * Mapa familiar — a secondary screen reached from Seguridad, not a tab.
 *
 * The map renders immediately; the location layer arrives when (and only when)
 * the user grants permission. A fabricated fallback position is never used —
 * denial is shown as denial.
 */
export default function MapaScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [perm, setPerm] = useState<PermState>('checking')
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const profile = useAsyncData(() => repositories.profile.get(), [])

  const locate = useCallback(async () => {
    setPerm('locating')
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      setPerm('ready')
    } catch {
      setPerm('error')
    }
  }, [])

  const request = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      void locate()
    } else {
      setPerm('denied')
    }
  }, [locate])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { status } = await Location.getForegroundPermissionsAsync()
      if (cancelled) return
      if (status === 'granted') void locate()
      else if (status === 'denied') setPerm('denied')
      else setPerm('undetermined')
    })()
    return () => {
      cancelled = true
    }
  }, [locate])

  return (
    <View style={styles.root}>
      {/* The map is always mounted so the screen is never a blank beige panel. */}
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={perm === 'ready'}
        showsMyLocationButton={false}
        region={
          coords
            ? { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : undefined
        }
      >
        {coords ? (
          <Marker coordinate={coords} title={profile.data?.name || 'Tú'} pinColor={colors.terra} />
        ) : null}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
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

      {/* Status card */}
      <Animated.View
        entering={FadeIn.duration(motion.duration.base)}
        style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.grabber} />
        {perm === 'checking' || perm === 'locating' ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={colors.terra} />
            <Text style={styles.statusText}>
              {perm === 'checking' ? 'Comprobando permisos…' : 'Obteniendo tu ubicación…'}
            </Text>
          </View>
        ) : perm === 'ready' ? (
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: colors.sage }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Ubicación activa</Text>
              <Text style={styles.statusSub}>
                Solo tú ves esto por ahora. Al conectar tu familia podrás compartirla.
              </Text>
            </View>
          </View>
        ) : perm === 'denied' ? (
          <View>
            <Text style={styles.statusTitle}>No tenemos acceso a tu ubicación</Text>
            <Text style={styles.statusSub}>
              Domus no inventa una posición. Si quieres verte en el mapa, concede
              el permiso de ubicación.
            </Text>
            <View style={{ height: 12 }} />
            <PrimaryButton label="Permitir ubicación" onPress={() => void request()} />
          </View>
        ) : perm === 'error' ? (
          <View>
            <Text style={styles.statusTitle}>No pudimos obtener tu posición</Text>
            <Text style={styles.statusSub}>
              Verifica que el GPS esté activo o inténtalo de nuevo.
            </Text>
            <View style={{ height: 12 }} />
            <PrimaryButton label="Intentar de nuevo" onPress={() => void locate()} />
          </View>
        ) : (
          <View>
            <Text style={styles.statusTitle}>Comparte tu ubicación</Text>
            <Text style={styles.statusSub}>
              Verás dónde está cada miembro de tu hogar. Tu ubicación solo la ve
              tu familia.
            </Text>
            <View style={{ height: 12 }} />
            <PrimaryButton label="Permitir ubicación" onPress={() => void request()} />
          </View>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screenX,
    paddingBottom: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radii.md - 2,
    backgroundColor: 'rgba(251,246,236,0.94)',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.serif, fontSize: 19, color: colors.ink },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.screenX,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: 14,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.inkSoft },
  statusTitle: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.ink },
  statusSub: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.mute, marginTop: 4, lineHeight: 18 },
  dot: { width: 10, height: 10, borderRadius: 5 },
})
