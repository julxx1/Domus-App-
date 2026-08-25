import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Chip, Field, PrimaryButton, SheetHeader } from '@/components/Form'
import TimePicker from '@/components/TimePicker'
import Icon from '@/components/Icon'
import { PressableScale } from '@/components/Shared'
import { repositories } from '@/lib/repositories'
import type { Duty, RepeatMode } from '@/lib/domain/types'
import { DAY_SHORT } from '@/lib/utils/date'
import { colors, fonts, radii } from '@/theme/tokens'

const DUTY_ICONS = [
  'paw', 'flame', 'pencil', 'sparkles', 'heart', 'star',
  'bell', 'clock', 'check', 'shield', 'leaf', 'box',
]

const REPEAT_OPTIONS: { value: RepeatMode; label: string }[] = [
  { value: 'daily', label: 'Todos los días' },
  { value: 'weekdays', label: 'Lun a Vie' },
  { value: 'custom', label: 'Días específicos' },
]

interface Props {
  editing: Duty | null
  onClose: () => void
  onSaved: () => void
}

export function DutyForm({ editing, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(editing?.title ?? '')
  const [icon, setIcon] = useState(editing?.icon ?? 'check')
  const [repeat, setRepeat] = useState<RepeatMode>(editing?.repeat ?? 'daily')
  const [days, setDays] = useState<number[]>(editing?.repeatDays ?? [])
  const [time, setTime] = useState<string | null>(editing?.time ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // A custom repeat with no days selected would never show up anywhere.
  const daysValid = repeat !== 'custom' || days.length > 0
  const canSave = title.trim().length > 0 && daysValid && !saving

  function toggleDay(index: number) {
    setDays(prev => (prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index]))
  }

  async function save() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: title.trim(),
        icon,
        repeat,
        repeatDays:
          repeat === 'daily'
            ? [0, 1, 2, 3, 4, 5, 6]
            : repeat === 'weekdays'
              ? [0, 1, 2, 3, 4]
              : [...days].sort((a, b) => a - b),
        time,
        assigneeIds: editing?.assigneeIds ?? [],
      }
      if (editing) {
        await repositories.duties.update(editing.id, payload)
      } else {
        await repositories.duties.create(payload)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el deber.')
      setSaving(false)
    }
  }

  return (
    <View>
      <SheetHeader
        eyebrow="Responsabilidades"
        title={editing ? 'Editar deber' : 'Nuevo deber'}
        onClose={onClose}
      />

      <Field
        label="Nombre"
        value={title}
        onChangeText={setTitle}
        placeholder="Sacar al perro, tareas…"
        autoFocus={!editing}
      />

      <Text style={styles.label}>ÍCONO</Text>
      <View style={styles.icons}>
        {DUTY_ICONS.map(name => {
          const active = icon === name
          return (
            <PressableScale
              key={name}
              onPress={() => setIcon(name)}
              accessibilityLabel={name}
              style={[
                styles.iconBtn,
                {
                  borderColor: active ? colors.terra : colors.line,
                  backgroundColor: active ? 'rgba(201,123,74,0.10)' : colors.card,
                },
              ]}
            >
              <Icon name={name} size={18} color={active ? colors.terra : colors.mute} strokeWidth={1.8} />
            </PressableScale>
          )
        })}
      </View>

      <Text style={styles.label}>REPETICIÓN</Text>
      <View style={styles.chips}>
        {REPEAT_OPTIONS.map(opt => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={repeat === opt.value}
            onPress={() => setRepeat(opt.value)}
          />
        ))}
      </View>

      {repeat === 'custom' ? (
        <>
          <Text style={styles.label}>DÍAS</Text>
          <View style={styles.days}>
            {DAY_SHORT.map((label, index) => {
              const active = days.includes(index)
              return (
                <PressableScale
                  key={label}
                  onPress={() => toggleDay(index)}
                  accessibilityLabel={label}
                  style={[
                    styles.day,
                    {
                      borderColor: active ? colors.terra : colors.line,
                      backgroundColor: active ? 'rgba(201,123,74,0.10)' : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.dayText, { color: active ? colors.terra : colors.mute }]}>
                    {label}
                  </Text>
                </PressableScale>
              )
            })}
          </View>
          {!daysValid ? (
            <Text style={styles.hint}>Elige al menos un día.</Text>
          ) : null}
        </>
      ) : null}

      <TimePicker label="Hora (opcional)" value={time} onChange={setTime} clearable />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar deber'}
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
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.sm + 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  days: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  day: {
    flex: 1,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontFamily: fonts.sansSemiBold, fontSize: 11 },
  hint: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.clay, marginBottom: 12 },
  error: { fontFamily: fonts.sans, fontSize: 13, color: colors.clay, marginBottom: 12 },
})
