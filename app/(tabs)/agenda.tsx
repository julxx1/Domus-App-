import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import Screen from '@/components/Screen'
import Stagger from '@/components/Stagger'
import Icon from '@/components/Icon'
import Sheet from '@/components/Sheet'
import { Chip, SheetHeader } from '@/components/Form'
import { Pill, PressableScale } from '@/components/Shared'
import { EventForm } from '@/components/agenda/EventForm'
import { repositories } from '@/lib/repositories'
import { useAsyncData } from '@/lib/hooks/useRepo'
import {
  DAY_INITIALS,
  formatDayLabel,
  formatMonthLabel,
  formatTimeRange,
  todayKey,
  weekOf,
  fromDateKey,
} from '@/lib/utils/date'
import { EVENT_CATEGORIES, type CalendarEvent, type EventCategory, type Member } from '@/lib/domain/types'
import { colors, fonts, radii, spacing } from '@/theme/tokens'

const QUICK_ADD = ['Comida familiar', 'Cita médica', 'Recordatorio']

/**
 * Agenda (tab 2) — events only. Deberes diarios is a separate screen, reached
 * from the filter sheet, so it never modifies this composition.
 */
export default function AgendaScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState(todayKey())
  const [eventSheet, setEventSheet] = useState<{ open: boolean; editing: CalendarEvent | null; initialTitle?: string }>({
    open: false,
    editing: null,
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [category, setCategory] = useState<EventCategory | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)

  const week = useMemo(() => weekOf(selected), [selected])
  const today = todayKey()

  const events = useAsyncData(() => repositories.events.listByDate(selected), [selected])
  const profile = useAsyncData(() => repositories.profile.get(), [])
  const membersData = useAsyncData(() => repositories.profile.listMembers(), [])

  const household: Member[] = useMemo(() => {
    const owner: Member | null = profile.data
      ? { id: profile.data.id, name: profile.data.name, role: profile.data.role, color: profile.data.color }
      : null
    const rest = membersData.data ?? []
    return owner ? [owner, ...rest] : rest
  }, [profile.data, membersData.data])

  const filtered = useMemo(() => {
    let list = events.data ?? []
    if (category) list = list.filter(e => e.category === category)
    if (memberId) list = list.filter(e => e.memberId === memberId)
    return list
  }, [events.data, category, memberId])

  const removeEvent = useCallback(
    async (id: string) => {
      await repositories.events.remove(id)
      await events.reload()
    },
    [events]
  )

  const activeFilters = (category ? 1 : 0) + (memberId ? 1 : 0)

  return (
    <Screen>
      <Stagger index={0} style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{formatMonthLabel(selected)}</Text>
          <Text style={styles.title}>Agenda</Text>
        </View>
        <View style={styles.headerActions}>
          <PressableScale
            onPress={() => setFilterOpen(true)}
            accessibilityLabel="Filtros"
            style={[
              styles.iconBtn,
              activeFilters > 0 && { backgroundColor: colors.terra, borderColor: colors.terra },
            ]}
          >
            <Icon name="filter" size={18} color={activeFilters > 0 ? '#fff' : colors.ink} />
          </PressableScale>
          <PressableScale
            onPress={() => setEventSheet({ open: true, editing: null })}
            accessibilityLabel="Nuevo evento"
            style={styles.addBtn}
          >
            <Icon name="plus" size={20} color="#fff" strokeWidth={2.2} />
          </PressableScale>
        </View>
      </Stagger>

      {/* Week strip */}
      <Stagger index={1} style={styles.week}>
        {week.map(day => {
          const isSelected = day === selected
          const isToday = day === today
          const dayNumber = fromDateKey(day).getDate()
          const initial = DAY_INITIALS[(fromDateKey(day).getDay() + 6) % 7]
          return (
            <PressableScale
              key={day}
              onPress={() => setSelected(day)}
              accessibilityLabel={formatDayLabel(day)}
              style={[
                styles.day,
                {
                  backgroundColor: isSelected ? colors.ink : colors.card,
                  borderColor: isSelected ? colors.ink : colors.line,
                },
              ]}
            >
              <Text style={[styles.dayInitial, { color: isSelected ? colors.cream : colors.mute }]}>{initial}</Text>
              <Text style={[styles.dayNumber, { color: isSelected ? colors.cream : colors.ink }]}>{dayNumber}</Text>
              {isToday ? <View style={styles.todayDot} /> : <View style={styles.dotSpacer} />}
            </PressableScale>
          )
        })}
      </Stagger>

      {/* Member filter pills */}
      <Stagger index={2} style={styles.pillsRow}>
        <Pill active={memberId === null} onPress={() => setMemberId(null)}>Todos</Pill>
        {household.map(m => (
          <Pill key={m.id} active={memberId === m.id} onPress={() => setMemberId(prev => (prev === m.id ? null : m.id))}>
            <View style={[styles.pillDot, { backgroundColor: m.color }]} />
            {m.name.split(' ')[0]}
          </Pill>
        ))}
      </Stagger>

      {/* ── Main day card ── */}
      <Stagger index={3} style={styles.block}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon name="calendar" size={26} color={colors.mute} strokeWidth={1.6} />
            </View>
            <Text style={styles.emptyTitle}>Sin eventos</Text>
            <Text style={styles.emptyDay}>{formatDayLabel(selected)}</Text>

            <View style={styles.quickRow}>
              {QUICK_ADD.map(label => (
                <PressableScale
                  key={label}
                  onPress={() => setEventSheet({ open: true, editing: null, initialTitle: label })}
                  accessibilityLabel={`Agregar ${label}`}
                  style={styles.quickBtn}
                >
                  <Text style={styles.quickBtnText}>+ {label}</Text>
                </PressableScale>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.dayCard}>
            <View style={styles.dayCardHeader}>
              <Text style={styles.dayCardTitle}>{formatDayLabel(selected)}</Text>
              <Text style={styles.dayCardCount}>
                {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.eventList}>
              {filtered.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  member={household.find(m => m.id === event.memberId) ?? null}
                  onEdit={() => setEventSheet({ open: true, editing: event })}
                  onDelete={() => void removeEvent(event.id)}
                />
              ))}
            </View>
          </View>
        )}
      </Stagger>

      <Sheet
        visible={eventSheet.open}
        onClose={() => setEventSheet({ open: false, editing: null })}
      >
        <EventForm
          date={selected}
          editing={eventSheet.editing}
          initialTitle={eventSheet.initialTitle}
          onClose={() => setEventSheet({ open: false, editing: null })}
          onSaved={() => void events.reload()}
        />
      </Sheet>

      <Sheet visible={filterOpen} onClose={() => setFilterOpen(false)} maxHeightRatio={0.6}>
        <SheetHeader title="Filtros" eyebrow="Agenda" onClose={() => setFilterOpen(false)} />

        <Text style={styles.filterLabel}>CATEGORÍA</Text>
        <View style={styles.filterChips}>
          <Chip label="Todas" active={category === null} onPress={() => setCategory(null)} />
          {EVENT_CATEGORIES.map(c => (
            <Chip
              key={c}
              label={c.charAt(0).toUpperCase() + c.slice(1)}
              active={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>

        <PressableScale
          onPress={() => {
            setFilterOpen(false)
            router.push('/deberes')
          }}
          accessibilityLabel="Ver deberes diarios"
          style={styles.dutiesLink}
        >
          <View style={styles.dutiesLinkIcon}>
            <Icon name="check" size={16} color={colors.sage} strokeWidth={2} />
          </View>
          <Text style={styles.dutiesLinkText}>Ver deberes diarios</Text>
          <Icon name="chev-r" size={16} color={colors.mute} />
        </PressableScale>
        <View style={{ height: 12 }} />
      </Sheet>
    </Screen>
  )
}

function EventRow({
  event,
  member,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  member: Member | null
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <PressableScale onPress={onEdit} accessibilityLabel={event.title} style={styles.eventRow}>
      <View style={[styles.eventBar, { backgroundColor: member?.color ?? colors.terra }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>{formatTimeRange(event.startTime, event.endTime)}</Text>
        {event.note ? <Text style={styles.eventNote} numberOfLines={1}>{event.note}</Text> : null}
      </View>
      {member ? (
        <View style={[styles.eventAvatar, { backgroundColor: member.color }]}>
          <Text style={styles.eventAvatarText}>{member.name[0]?.toUpperCase()}</Text>
        </View>
      ) : null}
      <PressableScale onPress={onDelete} scaleTo={0.93} accessibilityLabel="Eliminar" style={styles.eventDelete}>
        <Icon name="trash" size={13} color={colors.clay} />
      </PressableScale>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    paddingBottom: 22,
  },
  eyebrow: { fontFamily: fonts.sansSemiBold, fontSize: 11, letterSpacing: 1.4, color: colors.mute, textTransform: 'capitalize' },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
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

  week: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 16 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radii.md, borderWidth: 1, gap: 3 },
  dayInitial: { fontFamily: fonts.sansSemiBold, fontSize: 10 },
  dayNumber: { fontFamily: fonts.serif, fontSize: 19 },
  todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.terra },
  dotSpacer: { width: 5, height: 5 },

  pillsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.screenX, marginBottom: 18 },
  pillDot: { width: 8, height: 8, borderRadius: 4, marginRight: 2 },

  block: { paddingHorizontal: spacing.screenX },

  emptyCard: {
    backgroundColor: colors.cardWarm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg - 2,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink, marginBottom: 6 },
  emptyDay: { fontFamily: fonts.sans, fontSize: 13, color: colors.mute, marginBottom: 20, textTransform: 'capitalize' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  quickBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 12.5, color: colors.inkSoft },

  dayCard: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg - 2,
    padding: 14,
  },
  dayCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  dayCardTitle: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, textTransform: 'capitalize' },
  dayCardCount: { fontFamily: fonts.sansSemiBold, fontSize: 11.5, color: colors.terraDeep },
  eventList: { gap: 8 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.sm + 4,
    padding: 10,
  },
  eventBar: { width: 3, height: 30, borderRadius: 1.5 },
  eventTitle: { fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.ink },
  eventMeta: { fontFamily: fonts.sans, fontSize: 11, color: colors.mute, marginTop: 1 },
  eventNote: { fontFamily: fonts.sans, fontSize: 11, color: colors.mute, marginTop: 2, fontStyle: 'italic' },
  eventAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  eventAvatarText: { fontFamily: fonts.sansBold, fontSize: 9.5, color: '#fff' },
  eventDelete: { padding: 4 },

  filterLabel: { fontFamily: fonts.sansSemiBold, fontSize: 11, letterSpacing: 1.4, color: colors.mute, marginBottom: 8 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  dutiesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
  },
  dutiesLinkIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(122,139,111,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dutiesLinkText: { flex: 1, fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.ink },
})
