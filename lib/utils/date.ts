/**
 * Date helpers.
 *
 * Everything here works on LOCAL calendar days as `YYYY-MM-DD` strings.
 * `toISOString()` is deliberately avoided for day keys: it converts to UTC and
 * silently shifts the date by one for anyone west of Greenwich in the evening.
 */

/** Local YYYY-MM-DD for a Date. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

/** Parses YYYY-MM-DD at local noon, which is immune to DST edge cases. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0)
}

/** 0 = Monday … 6 = Sunday (ISO order, unlike JS's Sunday-first getDay). */
export function weekdayIndex(key: string): number {
  return (fromDateKey(key).getDay() + 6) % 7
}

export function addDays(key: string, n: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + n)
  return toDateKey(d)
}

/** Monday-based week containing `key`. */
export function weekOf(key: string): string[] {
  const start = addDays(key, -weekdayIndex(key))
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const DAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const
export const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

/** "HH:MM" (24h) → "9:30 a.m." */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, h ?? 0, m ?? 0)
    .toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
}

export function formatTimeRange(start: string, end: string | null): string {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start)
}

/** "miércoles 5" */
export function formatDayLabel(key: string): string {
  return fromDateKey(key).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' })
}

/** "agosto de 2026" */
export function formatMonthLabel(key: string): string {
  return fromDateKey(key).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
