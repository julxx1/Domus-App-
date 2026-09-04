import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import Check from '@/components/Check'
import Sheet from '@/components/Sheet'
import { ProgressBar } from '@/components/Form'
import { EmptyState, Eyebrow, PressableScale, Title } from '@/components/Shared'
import { DutyForm } from '@/components/agenda/DutyForm'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import { todayKey } from '@/lib/utils/date'
import { canInvite, type Duty } from '@/lib/domain/types'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

/**
 * Deberes diarios — a secondary screen reached from Agenda's filter sheet,
 * not part of Agenda's main composition (that screen is events-only, per the
 * reference design).
 */
export default function DeberesScreen() {
  const router = useRouter()
  const today = todayKey()
  const [dutySheet, setDutySheet] = useState<{ open: boolean; editing: Duty | null }>({
    open: false,
    editing: null,
  })

  const duties = useAsyncData(() => repositories.duties.listForDate(today), [today])
  const completions = useAsyncData(() => repositories.duties.listCompletions(today), [today])
  const profile = useAsyncData(() => repositories.profile.get(), [])

  // Crear/editar/eliminar deberes está restringido a padres/admin en la DB
  // (mismo modelo que Invitar miembro) — la UI oculta los controles, la RLS
  // sigue siendo la que realmente decide.
  const canManage = canInvite(profile.data?.role)

  const dutyList = duties.data ?? []
  const doneIds = useMemo(
    () => new Set((completions.data ?? []).map(c => c.dutyId)),
    [completions.data]
  )
  const doneCount = dutyList.filter(d => doneIds.has(d.id)).length
  const progress = dutyList.length > 0 ? doneCount / dutyList.length : 0

  const toggleDuty = useCallback(
    async (dutyId: string) => {
      const memberId = profile.data?.id ?? 'me'
      completions.set(prev => {
        const list = prev ?? []
        const exists = list.some(c => c.dutyId === dutyId && c.memberId === memberId)
        return exists
          ? list.filter(c => !(c.dutyId === dutyId && c.memberId === memberId))
          : [...list, { dutyId, memberId, date: today, completedAt: new Date().toISOString() }]
      })
      await repositories.duties.toggleCompletion(dutyId, memberId, today)
      await completions.reload()
    },
    [completions, profile.data?.id, today]
  )

  const removeDuty = useCallback(
    async (id: string) => {
      await repositories.duties.remove(id)
      await Promise.all([duties.reload(), completions.reload()])
    },
    [duties, completions]
  )

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
          <Eyebrow>Responsabilidades</Eyebrow>
          <Title>Deberes diarios</Title>
        </View>
        {canManage ? (
          <PressableScale
            onPress={() => setDutySheet({ open: true, editing: null })}
            accessibilityLabel="Nuevo deber"
            style={styles.addBtn}
          >
            <Icon name="plus" size={18} color="#fff" strokeWidth={2.2} />
          </PressableScale>
        ) : null}
      </Stagger>

      {dutyList.length > 0 ? (
        <Stagger index={1} style={styles.block}>
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>{doneCount} de {dutyList.length} completados</Text>
              <Text style={[styles.progressPct, { color: progress >= 1 ? colors.sage : colors.terra }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <ProgressBar value={progress} />
          </View>

          {progress >= 1 ? (
            <Animated.View entering={FadeIn.duration(240)} style={styles.allDone}>
              <View style={styles.allDoneIcon}>
                <Icon name="check" size={15} color="#fff" strokeWidth={2.6} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.allDoneTitle}>¡Deberes del día completados!</Text>
                <Text style={styles.allDoneSub}>Excelente trabajo hoy</Text>
              </View>
            </Animated.View>
          ) : null}

          <View style={styles.list}>
            {dutyList.map(duty => (
              <DutyRow
                key={duty.id}
                duty={duty}
                checked={doneIds.has(duty.id)}
                canManage={canManage}
                onToggle={() => void toggleDuty(duty.id)}
                onEdit={() => setDutySheet({ open: true, editing: duty })}
                onDelete={() => void removeDuty(duty.id)}
              />
            ))}
          </View>
        </Stagger>
      ) : (
        <Stagger index={1} style={{ paddingHorizontal: spacing.screenX }}>
          <EmptyState
            title="No tienes deberes pendientes"
            description="Crea un deber y aparecerá los días que elijas."
          />
        </Stagger>
      )}

      <Sheet visible={dutySheet.open} onClose={() => setDutySheet({ open: false, editing: null })}>
        <DutyForm
          editing={dutySheet.editing}
          onClose={() => setDutySheet({ open: false, editing: null })}
          onSaved={() => void duties.reload()}
        />
      </Sheet>
    </Screen>
  )
}

function DutyRow({
  duty,
  checked,
  canManage,
  onToggle,
  onEdit,
  onDelete,
}: {
  duty: Duty
  checked: boolean
  canManage: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <View style={[styles.card, checked && styles.cardDone]}>
      <View style={[styles.cardIcon, checked && { backgroundColor: 'rgba(122,139,111,0.14)' }]}>
        <Icon name={duty.icon} size={17} color={checked ? colors.sage : colors.terra} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.cardTitle, checked && { color: colors.mute, textDecorationLine: 'line-through' }]}>
          {duty.title}
        </Text>
        <Text style={styles.cardMeta}>
          {duty.time ? `${duty.time} · ` : ''}
          {duty.repeat === 'daily' ? 'Todos los días' : duty.repeat === 'weekdays' ? 'Lunes a viernes' : 'Días específicos'}
        </Text>
      </View>
      <Check checked={checked} onToggle={onToggle} accessibilityLabel={duty.title} />
      {canManage ? (
        <>
          <PressableScale onPress={onEdit} scaleTo={0.93} accessibilityLabel="Editar" style={styles.iconBtn}>
            <Icon name="pencil" size={14} color={colors.mute} />
          </PressableScale>
          <PressableScale onPress={onDelete} scaleTo={0.93} accessibilityLabel="Eliminar" style={styles.iconBtn}>
            <Icon name="trash" size={14} color={colors.clay} />
          </PressableScale>
        </>
      ) : null}
    </View>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md - 2,
    backgroundColor: colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: { paddingHorizontal: spacing.screenX },
  progressCard: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontFamily: fonts.sansSemiBold, fontSize: 12.5, color: colors.inkSoft },
  progressPct: { fontFamily: fonts.sansBold, fontSize: 13 },
  allDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(122,139,111,0.10)',
    borderColor: 'rgba(122,139,111,0.28)',
    borderWidth: 1,
    borderRadius: radii.sm + 4,
    padding: 12,
    marginBottom: 10,
  },
  allDoneIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  allDoneTitle: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.sageDeep },
  allDoneSub: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.mute, marginTop: 1 },
  list: { gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 11,
  },
  cardDone: { opacity: 0.7 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.cardWarm, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.ink },
  cardMeta: { fontFamily: fonts.sans, fontSize: 11, color: colors.mute, marginTop: 2 },
  iconBtn: { padding: 5 },
})
