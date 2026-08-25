import { useState } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Chip, Field, PrimaryButton, SheetHeader } from '@/components/Form'
import TimePicker from '@/components/TimePicker'
import { repositories } from '@/lib/repositories'
import { EVENT_CATEGORIES, type CalendarEvent, type EventCategory } from '@/lib/domain/types'
import { formatDayLabel } from '@/lib/utils/date'
import { colors, fonts } from '@/theme/tokens'

interface Props {
  date: string
  editing: CalendarEvent | null
  /** Prefills the title from a quick-add shortcut (Comida familiar, etc). */
  initialTitle?: string
  onClose: () => void
  onSaved: () => void
}

export function EventForm({ date, editing, initialTitle, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(editing?.title ?? initialTitle ?? '')
  const [note, setNote] = useState(editing?.note ?? '')
  const [start, setStart] = useState(editing?.startTime ?? '09:00')
  const [end, setEnd] = useState<string | null>(editing?.endTime ?? null)
  const [category, setCategory] = useState<EventCategory>(editing?.category ?? 'familia')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = title.trim().length > 0 && !saving

  async function save() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: title.trim(),
        note: note.trim() || null,
        date: editing?.date ?? date,
        startTime: start,
        endTime: end,
        category,
        memberId: null,
      }
      if (editing) {
        await repositories.events.update(editing.id, payload)
      } else {
        await repositories.events.create(payload)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el evento.')
      setSaving(false)
    }
  }

  return (
    <View>
      <SheetHeader
        eyebrow={formatDayLabel(editing?.date ?? date)}
        title={editing ? 'Editar evento' : 'Nuevo evento'}
        onClose={onClose}
      />

      <Field
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Comida familiar, cita médica…"
        autoFocus={!editing}
        returnKeyType="next"
      />

      {/* Start time is required, so a null can only arrive if `clearable` is
          ever enabled here; keep the previous value rather than storing null. */}
      <TimePicker label="Hora inicio" value={start} onChange={v => setStart(v ?? start)} />
      <TimePicker label="Hora fin (opcional)" value={end} onChange={setEnd} clearable />

      <Text style={styles.label}>CATEGORÍA</Text>
      <View style={styles.chips}>
        {EVENT_CATEGORIES.map(c => (
          <Chip
            key={c}
            label={c.charAt(0).toUpperCase() + c.slice(1)}
            active={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>

      <Field
        label="Nota (opcional)"
        value={note}
        onChangeText={setNote}
        placeholder="Detalles adicionales…"
        multiline
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar evento'}
        onPress={() => void save()}
        disabled={!canSave}
      />
      <View style={{ height: 12 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.mute,
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.clay,
    marginBottom: 12,
  },
})
