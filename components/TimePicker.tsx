import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { PressableScale } from './Shared'
import Icon from './Icon'
import { formatTime } from '@/lib/utils/date'
import { colors, fonts, radii } from '@/theme/tokens'

interface Props {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  clearable?: boolean
}

/**
 * Time field backed by the OS picker.
 *
 * The stored value is always "HH:MM" in 24h so it sorts and compares as a
 * plain string; only the display is localised to 12h with am/pm.
 */
export default function TimePicker({ label, value, onChange, clearable = false }: Props) {
  const [open, setOpen] = useState(false)

  const asDate = (() => {
    const [h, m] = (value ?? '09:00').split(':').map(Number)
    return new Date(2000, 0, 1, h ?? 9, m ?? 0)
  })()

  function handleChange(event: DateTimePickerEvent, picked?: Date) {
    // Android fires a single event and closes itself; iOS streams updates
    // while the spinner moves, so it stays open until the user taps Listo.
    if (Platform.OS === 'android') setOpen(false)
    if (event.type === 'dismissed' || !picked) return
    const hh = String(picked.getHours()).padStart(2, '0')
    const mm = String(picked.getMinutes()).padStart(2, '0')
    onChange(`${hh}:${mm}`)
  }

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>

      <View style={styles.row}>
        <PressableScale
          onPress={() => setOpen(o => !o)}
          accessibilityLabel={label}
          style={[styles.field, !value && styles.fieldEmpty]}
        >
          <Icon name="clock" size={15} color={value ? colors.terra : colors.mute} />
          <Text style={[styles.value, !value && { color: colors.mute }]}>
            {value ? formatTime(value) : 'Agregar hora'}
          </Text>
        </PressableScale>

        {clearable && value ? (
          <PressableScale
            onPress={() => {
              onChange(null)
              setOpen(false)
            }}
            scaleTo={0.93}
            accessibilityLabel="Quitar hora"
            style={styles.clear}
          >
            <Icon name="x" size={14} color={colors.mute} />
          </PressableScale>
        ) : null}
      </View>

      {open ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={asDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            themeVariant="light"
          />
          {Platform.OS === 'ios' ? (
            <PressableScale
              onPress={() => {
                // Committing an untouched picker still needs a value stored.
                if (!value) onChange('09:00')
                setOpen(false)
              }}
              accessibilityLabel="Listo"
              style={styles.done}
            >
              <Text style={styles.doneText}>Listo</Text>
            </PressableScale>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.mute,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md - 2,
  },
  fieldEmpty: {
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: 'transparent',
  },
  value: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink },
  clear: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrap: { marginTop: 4 },
  done: {
    alignSelf: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.terra,
  },
  doneText: { fontFamily: fonts.sansBold, fontSize: 13, color: '#fff' },
})
