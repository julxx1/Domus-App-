import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import { PressableScale, SectionTitle } from '@/components/Shared'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import { greeting, todayKey } from '@/lib/utils/date'
import type { Member } from '@/lib/domain/types'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

const TAB_BAR_CLEARANCE = 80

/**
 * Inicio (tab 0) — 1:1 with `domus-app/src/screens/DashboardScreen.jsx`.
 *
 * The web version conditionally renders the Agenda and Mercado previews only
 * when there is real content (`upcomingEvents.length > 0`,
 * `pendingPantry > 0`) — they are absent from Home otherwise, not shown as
 * empty states. This screen keeps that behaviour exactly; Deberes has no
 * presence on Home at all (it lives in Agenda).
 */
export default function InicioScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const today = todayKey()

  const profile = useAsyncData(() => repositories.profile.get(), [])
  const members = useAsyncData(() => repositories.profile.listMembers(), [])
  const events = useAsyncData(() => repositories.events.listByDate(today), [today])
  const market = useAsyncData(() => repositories.market.list(), [])
  const cameras = useAsyncData(() => repositories.cameras.list(), [])

  // Owner + added household members, unified for the status card and row.
  const household: Member[] = useMemo(() => {
    const owner: Member | null = profile.data
      ? { id: profile.data.id, name: profile.data.name, role: profile.data.role, color: profile.data.color, atHome: true }
      : null
    const rest = members.data ?? []
    return owner ? [owner, ...rest] : rest
  }, [profile.data, members.data])

  const homeCount = household.filter(m => m.atHome !== false).length
  const totalCount = household.length
  const allHome = totalCount > 0 && homeCount === totalCount

  const upcomingEvents = (events.data ?? []).slice(0, 3)
  const pendingMarket = (market.data ?? []).filter(i => !i.done)
  const cameraList = cameras.data ?? []

  const displayName = profile.data?.name?.trim() || 'Hogar'
  const familyLabel = (profile.data?.familyName?.trim() || 'Mi hogar').toUpperCase()
  const initial = profile.data?.name?.trim() ? profile.data.name.trim()[0]!.toUpperCase() : '?'

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Stagger index={0} style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <View style={styles.headerActions}>
          <PressableScale
            onPress={() => router.push('/notificaciones')}
            accessibilityLabel="Notificaciones"
            style={styles.iconButton}
          >
            <Icon name="bell" size={20} color={colors.ink} strokeWidth={1.8} />
          </PressableScale>
          <PressableScale
            onPress={() => router.push('/perfil')}
            accessibilityLabel="Abrir perfil"
            style={[styles.iconButton, { backgroundColor: profile.data?.color || colors.terraSoft, borderWidth: 0 }]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </PressableScale>
        </View>
      </Stagger>

      {/* Status hero */}
      <Stagger index={1} style={styles.heroWrap}>
        <View style={styles.hero}>
          <Svg viewBox="0 0 100 100" style={styles.heroDecoration}>
            <Path d="M50 10 L90 50 L90 90 L10 90 L10 50 Z" fill={colors.cream} opacity={0.06} />
          </Svg>

          <View style={styles.heroStatusRow}>
            <View style={styles.heroDot} />
            <Text style={styles.heroStatusText}>{familyLabel} · TODO TRANQUILO</Text>
          </View>

          <View style={styles.heroMainRow}>
            <View>
              <Text style={styles.heroCount}>
                {homeCount}
                <Text style={styles.heroCountTotal}>/{totalCount}</Text>
              </Text>
              <Text style={styles.heroSub}>{allHome ? 'Todos en casa' : 'miembros en casa'}</Text>
            </View>
            {cameraList.length > 0 ? (
              <View style={styles.heroCams}>
                <Icon name="cam" size={18} color={colors.cream} />
                <Text style={styles.heroCamsText}>{cameraList.length} cam{cameraList.length !== 1 ? 's' : ''}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Stagger>

      {/* Familia ahora */}
      {household.length > 0 ? (
        <Stagger index={2} style={styles.block}>
          <SectionTitle action="Ver mapa →" onAction={() => router.push('/mapa')}>
            Familia ahora
          </SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.familyRow}
          >
            {household.map(m => (
              <View key={m.id} style={styles.memberCard}>
                <View style={[styles.memberAvatar, { backgroundColor: m.color }]}>
                  <Text style={styles.memberInitial}>{m.name.trim()[0]?.toUpperCase() ?? '?'}</Text>
                  {m.atHome !== false ? <View style={styles.onlineDot} /> : null}
                </View>
                <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                <Text style={styles.memberMeta} numberOfLines={1}>{m.role}</Text>
              </View>
            ))}
          </ScrollView>
        </Stagger>
      ) : null}

      {/* Vigilancia */}
      <Stagger index={3} style={styles.block}>
        <SectionTitle
          action={cameraList.length > 0 ? 'Ver todas' : undefined}
          onAction={() => router.push('/seguridad')}
        >
          Vigilancia
        </SectionTitle>

        {cameraList.length === 0 ? (
          <View style={styles.cameraEmpty}>
            <View style={styles.cameraEmptyIcon}>
              <Icon name="cam" size={22} color={colors.mute} strokeWidth={1.5} />
            </View>
            <Text style={styles.cameraEmptyTitle}>Aún no has conectado cámaras</Text>
            <Text style={styles.cameraEmptyText}>
              Conecta una cámara compatible mediante búsqueda en la red o configuración RTSP manual.
            </Text>
            <PressableScale
              onPress={() => router.push('/seguridad')}
              accessibilityLabel="Conectar primera cámara"
              style={styles.cameraEmptyBtn}
            >
              <Text style={styles.cameraEmptyBtnText}>Conectar primera cámara</Text>
            </PressableScale>
          </View>
        ) : (
          <View style={styles.cameraGrid}>
            {cameraList.slice(0, 4).map(cam => (
              <PressableScale
                key={cam.id}
                onPress={() => router.push('/seguridad')}
                accessibilityLabel={cam.name}
                style={styles.cameraTile}
              >
                <Icon name="cam" size={20} color="#fff" strokeWidth={1.6} />
                <Text style={styles.cameraTileName} numberOfLines={1}>{cam.name}</Text>
              </PressableScale>
            ))}
          </View>
        )}
      </Stagger>

      {/* Agenda preview — only when there is something to show */}
      {upcomingEvents.length > 0 ? (
        <Stagger index={4} style={styles.block}>
          <SectionTitle action="Ver agenda →" onAction={() => router.push('/agenda')}>
            Hoy en la agenda
          </SectionTitle>
          <View style={styles.list}>
            {upcomingEvents.map(event => (
              <PressableScale
                key={event.id}
                onPress={() => router.push('/agenda')}
                accessibilityLabel={event.title}
                style={styles.eventRow}
              >
                <View style={[styles.eventBar, { backgroundColor: colors.terra }]} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.startTime}</Text>
                </View>
              </PressableScale>
            ))}
          </View>
        </Stagger>
      ) : null}

      {/* Mercado preview — only when there are pending items */}
      {pendingMarket.length > 0 ? (
        <Stagger index={4} style={styles.block}>
          <SectionTitle action="Ver despensa" onAction={() => router.push('/mercado')}>
            En el Mercado
          </SectionTitle>
          <View style={styles.marketCard}>
            <View style={styles.marketCountRow}>
              <Text style={styles.marketCount}>{pendingMarket.length}</Text>
              <Text style={styles.marketCountLabel}>cosas por comprar</Text>
            </View>
            <View style={styles.marketChips}>
              {pendingMarket.slice(0, 5).map(item => (
                <View key={item.id} style={styles.marketChip}>
                  <Text style={styles.marketChipText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </Stagger>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    paddingBottom: 4,
  },
  greeting: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.mute },
  name: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md - 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.serif, fontSize: 16, color: '#fff' },

  heroWrap: { paddingHorizontal: spacing.screenX, paddingTop: 12 },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl - 6,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecoration: { position: 'absolute', right: -20, top: -20, width: 140, height: 140 },
  heroStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ok },
  heroStatusText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.cream, opacity: 0.7 },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  heroCount: { fontFamily: fonts.serifMedium, fontSize: 36, color: colors.cream },
  heroCountTotal: { fontSize: 18, opacity: 0.6 },
  heroSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.cream, opacity: 0.6, marginTop: 2 },
  heroCams: { alignItems: 'center', opacity: 0.85 },
  heroCamsText: { fontFamily: fonts.sans, fontSize: 11, color: colors.cream, marginTop: 3 },

  block: { marginTop: 22 },
  familyRow: { paddingHorizontal: spacing.screenX, gap: 10, paddingBottom: 4 },
  memberCard: {
    minWidth: 96,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg - 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: { fontFamily: fonts.serif, fontSize: 16, color: '#fff' },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.ok,
    borderWidth: 2,
    borderColor: colors.card,
  },
  memberName: { fontFamily: fonts.sansSemiBold, fontSize: 12.5, color: colors.ink, marginTop: 8, maxWidth: 88 },
  memberMeta: { fontFamily: fonts.sans, fontSize: 10.5, color: colors.mute, marginTop: 1 },

  cameraEmpty: {
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg - 4,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 10,
  },
  cameraEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md - 2,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraEmptyTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink },
  cameraEmptyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mute,
    textAlign: 'center',
    lineHeight: 18,
  },
  cameraEmptyBtn: {
    marginTop: 4,
    height: 42,
    paddingHorizontal: 20,
    borderRadius: radii.sm + 2,
    backgroundColor: colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraEmptyBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: '#fff' },
  cameraGrid: {
    paddingHorizontal: spacing.screenX,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cameraTile: {
    width: '47%',
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    backgroundColor: '#3D4A5C',
    padding: 10,
    justifyContent: 'flex-end',
  },
  cameraTileName: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: '#fff' },

  list: { paddingHorizontal: spacing.screenX, gap: 8 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.sm + 4,
    padding: 12,
  },
  eventBar: { width: 4, height: 30, borderRadius: 2 },
  eventTitle: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.ink },
  eventTime: { fontFamily: fonts.sans, fontSize: 11, color: colors.mute, marginTop: 1 },

  marketCard: {
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.xl - 6,
    padding: 14,
  },
  marketCountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  marketCount: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink },
  marketCountLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.mute },
  marketChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  marketChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  marketChipText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.inkSoft },
})
