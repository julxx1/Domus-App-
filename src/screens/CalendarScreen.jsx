import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAT_ICONS } from '../data'
import { useCalendarEvents } from '../lib/hooks'
import { useFamilyMembers } from '../lib/hooks'
import Screen from '../components/Screen'
import Icon from '../components/Icon'
import { Pill, SectionTitle } from '../components/Shared'

const CAT_COLORS = {
  salud: 'var(--m-lucia)', deporte: 'var(--m-diego)', trabajo: 'var(--m-papa)',
  familia: 'var(--d-sage)', escuela: 'var(--m-sofia)', bienestar: 'var(--m-mama)',
}

const CATEGORIES = ['familia','salud','deporte','trabajo','escuela','bienestar']

export default function CalendarScreen() {
  const navigate = useNavigate()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const { events, addEvent } = useCalendarEvents(selectedDate)
  const members = useFamilyMembers()
  const [addOpen, setAddOpen] = useState(false)

  // Build 7-day week strip starting from Monday of this week
  const weekDays = []
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    weekDays.push({
      d: ['L','M','X','J','V','S','D'][i],
      n: d.getDate(),
      dateStr: d.toISOString().split('T')[0],
      today: d.toISOString().split('T')[0] === todayStr,
    })
  }

  const monthName = today.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  const selectedDayLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' })

  return (
    <Screen tab="cal" onTab={tab => {
      if (tab === 'home') navigate('/')
      if (tab === 'cams') navigate('/security')
      if (tab === 'chat') navigate('/chat')
      if (tab === 'market') navigate('/mercado')
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 22px 14px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div className="eyebrow" style={{ textTransform: 'capitalize' }}>{monthName}</div>
          <h1 className="serif" style={{ fontSize: 30 }}>Agenda</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'var(--d-card)', border: '1px solid var(--d-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Icon name="filter" size={18} color="var(--d-ink)" />
          </button>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              width: 40, height: 40, borderRadius: 14,
              background: 'var(--d-terra)', color: '#fff',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
            <Icon name="plus" size={20} color="#fff" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 6 }}>
        {weekDays.map(day => {
          const isSelected = day.dateStr === selectedDate
          return (
            <button key={day.n} onClick={() => setSelectedDate(day.dateStr)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '8px 4px 10px', borderRadius: 16, cursor: 'pointer',
              background: isSelected ? 'var(--d-ink)' : 'var(--d-card)',
              border: isSelected ? 'none' : '1px solid var(--d-line)',
              color: isSelected ? 'var(--d-cream)' : 'var(--d-ink)',
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.05, opacity: isSelected ? 0.7 : 0.5 }}>{day.d}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, lineHeight: 1 }}>{day.n}</span>
              {day.today && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--d-terra)', marginTop: 1 }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Member filter */}
      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          <Pill active>Todos</Pill>
          {members.map(m => (
            <Pill key={m.id}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block', marginRight: 2 }} />
              {m.name.split(' ')[0]}
            </Pill>
          ))}
        </div>
      </div>

      {events.length === 0 && (
        <div style={{ padding: '0 22px 14px', animation: 'fadeIn 200ms ease both' }}>
          <div style={{
            background: 'var(--d-card-warm)', border: '1px solid var(--d-line)',
            borderRadius: 20, padding: '28px 20px', textAlign: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'var(--d-line)', margin: '0 auto 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="calendar" size={26} color="var(--d-mute)" strokeWidth={1.6} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Sin eventos</div>
            <div style={{ fontSize: 13, color: 'var(--d-mute)', marginBottom: 20, textTransform: 'capitalize' }}>
              {selectedDayLabel}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Comida familiar', 'Cita médica', 'Recordatorio'].map(s => (
                <button key={s} onClick={() => setAddOpen(true)} style={{
                  height: 34, padding: '0 14px', borderRadius: 999,
                  background: 'var(--d-cream)', border: '1px solid var(--d-line-strong)',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', color: 'var(--d-ink-soft)',
                }}>+ {s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {events.length > 0 && (
        <div style={{ padding: '0 14px 0 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 0 10px 0' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em', margin: 0, textTransform: 'capitalize' }}>
              {selectedDayLabel}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--d-terra-deep)', fontWeight: 600, paddingRight: 8 }}>
              {events.length} evento{events.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ position: 'relative', paddingLeft: 38 }}>
            <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 2, background: 'var(--d-line)', borderRadius: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map((ev) => {
                const member = ev.profiles
                const catIcon = CAT_ICONS[ev.category] || 'calendar'
                const evColor = member?.color || CAT_COLORS[ev.category] || 'var(--d-terra)'
                const timeStr = ev.start_time ? new Date(ev.start_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''
                const endStr = ev.end_time ? new Date(ev.end_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''
                const isPast = ev.end_time && new Date(ev.end_time) < new Date()
                return (
                  <div key={ev.id} style={{ position: 'relative', opacity: isPast ? 0.6 : 1 }}>
                    <div style={{
                      position: 'absolute', left: -32, top: 16,
                      width: 10, height: 10, borderRadius: '50%',
                      background: isPast ? 'var(--d-mute-light)' : evColor,
                      border: '2px solid var(--d-cream)',
                    }} />
                    <div style={{
                      background: 'var(--d-card)', border: '1px solid var(--d-line)',
                      borderRadius: 18, padding: '14px 14px 12px',
                      borderLeft: `3px solid ${evColor}`,
                      display: 'flex', gap: 12,
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                        background: 'var(--d-card-warm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name={catIcon} size={18} color={evColor} strokeWidth={1.8} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25, textDecoration: isPast ? 'line-through' : 'none' }}>
                            {ev.title}
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--d-mute)', whiteSpace: 'nowrap', marginLeft: 8 }}>{timeStr}</div>
                        </div>
                        {endStr && (
                          <div style={{ fontSize: 12, color: 'var(--d-ink-soft)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="clock" size={12} color="var(--d-mute)" />
                            {timeStr} – {endStr}
                          </div>
                        )}
                        {ev.note && (
                          <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 4, fontStyle: 'italic' }}>{ev.note}</div>
                        )}
                        {member && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', background: member.color || 'var(--d-terra-soft)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff',
                            }}>{member.initial}</div>
                            <span style={{ fontSize: 11.5, fontWeight: 500, color: member.color }}>{member.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />

      {/* Add Event Modal */}
      {addOpen && (
        <AddEventModal
          selectedDate={selectedDate}
          members={members}
          onClose={() => setAddOpen(false)}
          onAdd={addEvent}
        />
      )}
    </Screen>
  )
}

function AddEventModal({ selectedDate, members, onClose, onAdd }) {
  const now = new Date()
  const roundedHour = new Date(now)
  roundedHour.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0)
  const toTimeStr = (d) => d.toTimeString().slice(0, 5)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(selectedDate)
  const [startTime, setStartTime] = useState(toTimeStr(roundedHour))
  const [endTime, setEndTime] = useState(toTimeStr(new Date(roundedHour.getTime() + 60 * 60 * 1000)))
  const [category, setCategory] = useState('familia')
  const [note, setNote] = useState('')
  const [memberId, setMemberId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onAdd({
        title: title.trim(),
        start_time: `${date}T${startTime}:00`,
        end_time: endTime ? `${date}T${endTime}:00` : null,
        note: note.trim() || null,
        category,
        member_id: memberId || null,
      })
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--d-cream)', borderRadius: '24px 24px 0 0',
        padding: '0 0 40px', width: '100%', maxWidth: 420,
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--d-line-strong)' }} />
        </div>
        <div style={{ padding: '8px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Nuevo evento</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Icon name="x" size={20} color="var(--d-mute)" />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Título</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Reunión familiar, cita médica…"
                required
                style={inputStyle}
                autoFocus
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Fecha</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Hora inicio</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Hora fin</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
              </div>
            </div>
            {members.length > 0 && (
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Miembro</label>
                <select value={memberId} onChange={e => setMemberId(e.target.value)} style={inputStyle}>
                  <option value="">Toda la familia</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Nota (opcional)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Detalles adicionales…"
                style={inputStyle}
              />
            </div>
            {error && (
              <div style={{
                background: 'rgba(184,88,66,0.1)', border: '1px solid var(--d-clay)',
                borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--d-clay)',
              }}>{error}</div>
            )}
            <button type="submit" disabled={saving || !title.trim()} style={{
              marginTop: 4, height: 54, borderRadius: 18,
              background: saving || !title.trim() ? 'var(--d-mute)' : 'var(--d-terra)',
              color: '#fff', border: 'none',
              fontWeight: 700, fontSize: 15, cursor: saving ? 'default' : 'pointer',
            }}>
              {saving ? 'Guardando…' : 'Agregar evento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  height: 46, width: '100%',
  background: 'var(--d-paper)', border: '1px solid var(--d-line)',
  borderRadius: 14, padding: '0 14px', fontSize: 14,
  color: 'var(--d-ink)', outline: 'none', boxSizing: 'border-box',
}
