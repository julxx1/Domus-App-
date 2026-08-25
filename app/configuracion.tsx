import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Alert, StyleSheet, Text, View } from 'react-native'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import Sheet from '@/components/Sheet'
import { PrimaryButton, SheetHeader } from '@/components/Form'
import { Eyebrow, PressableScale, SectionTitle, Title } from '@/components/Shared'
import { clearAll } from '@/lib/storage/kv'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

/** Configuración — reached from Perfil. */
export default function ConfiguracionScreen() {
  const router = useRouter()
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function reset() {
    setResetting(true)
    await clearAll()
    setResetting(false)
    setConfirmReset(false)
    Alert.alert('Datos restablecidos', 'Domus volvió a su estado inicial.', [
      { text: 'Entendido', onPress: () => router.replace('/') },
    ])
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
          <Eyebrow>Domus</Eyebrow>
          <Title>Configuración</Title>
        </View>
      </Stagger>

      <Stagger index={1}>
        <SectionTitle eyebrow="Almacenamiento">Tus datos</SectionTitle>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.rowIcon}>
              <Icon name="box" size={17} color={colors.terra} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Guardado en este dispositivo</Text>
              <Text style={styles.rowMeta}>
                Tus deberes, eventos, mercado y perfil se guardan en el iPhone y
                siguen ahí al cerrar Domus.
              </Text>
            </View>
          </View>
        </View>
      </Stagger>

      <Stagger index={2} style={styles.block}>
        <SectionTitle eyebrow="Próximamente">Cuenta y familia</SectionTitle>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.rowIcon}>
              <Icon name="shield" size={17} color={colors.sage} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Sincronización con tu familia</Text>
              <Text style={styles.rowMeta}>
                Aún no disponible. Cuando llegue, tus datos locales podrán
                subirse a tu hogar compartido.
              </Text>
            </View>
          </View>
        </View>
      </Stagger>

      <Stagger index={3} style={styles.block}>
        <SectionTitle eyebrow="Zona sensible">Restablecer</SectionTitle>
        <PressableScale
          onPress={() => setConfirmReset(true)}
          accessibilityLabel="Borrar todos los datos"
          style={styles.danger}
        >
          <Icon name="trash" size={16} color={colors.clay} strokeWidth={2} />
          <Text style={styles.dangerText}>Borrar todos los datos de Domus</Text>
        </PressableScale>
      </Stagger>

      <Sheet visible={confirmReset} onClose={() => setConfirmReset(false)} maxHeightRatio={0.5}>
        <SheetHeader
          eyebrow="Confirmar"
          title="¿Borrar todos los datos?"
          onClose={() => setConfirmReset(false)}
        />
        <Text style={styles.confirmText}>
          Se eliminarán tus deberes, eventos, lista del mercado, mensajes locales,
          cámaras y tu perfil de este dispositivo. Esta acción no se puede deshacer.
        </Text>
        <View style={{ height: 16 }} />
        <PrimaryButton
          label={resetting ? 'Borrando…' : 'Sí, borrar todo'}
          onPress={() => void reset()}
          disabled={resetting}
          tone={colors.clay}
        />
        <View style={{ height: 10 }} />
        <PressableScale
          onPress={() => setConfirmReset(false)}
          accessibilityLabel="Cancelar"
          style={styles.cancel}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </PressableScale>
        <View style={{ height: 12 }} />
      </Sheet>
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
  block: { marginTop: 26 },
  card: {
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink },
  rowMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.mute, marginTop: 3, lineHeight: 17 },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.screenX,
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(184,88,66,0.35)',
    backgroundColor: 'rgba(184,88,66,0.07)',
  },
  dangerText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.clay },
  confirmText: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkSoft, lineHeight: 20 },
  cancel: { height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.mute },
})
