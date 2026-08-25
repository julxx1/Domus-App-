import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { EmptyState, Eyebrow, PressableScale, Title } from '@/components/Shared'
import { colors, radii, spacing } from '@/theme/tokens'

/** Notificaciones — reached from the bell on Inicio. No backend yet, so honestly empty. */
export default function NotificacionesScreen() {
  const router = useRouter()

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
          <Title>Notificaciones</Title>
        </View>
      </Stagger>

      <Stagger index={1}>
        <EmptyState
          title="Aún no tienes notificaciones"
          description="Cuando algo pase en tu hogar, aparecerá aquí."
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
})
