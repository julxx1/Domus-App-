import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAT_ICONS } from '../data'
import { useCalendarEvents, useFamilyMembers, useDeberes } from '../lib/hooks'
import { useAuth } from '../lib/auth'
import Screen from '../components/Screen'
import Icon from '../components/Icon'
import { Pill, SectionTitle } from '../components/Shared'

const CAT_COLORS = {
  salud: 'var(--m-lucia)', deporte: 'var(--m-diego)', trabajo: 'var(--m-papa)',
  familia: 'var(--d-sage)', escuela: 'var(--m-sofia)', bienestar: 'var(--m-mama)',
}
const CATEGORIES = ['familia','salud','deporte','trabajo','escuela','bienestar']
const PARENT_ROLES = ['Mamá', 'Papá', 'Abuelo', 'Abuela', 'Admin']
const DEBER_ICONS = ['paw','flame','pencil','sparkles','heart','star','bell','clock','check','shield','leaf','box']
const REPEAT_LABELS = { daily: 'Todos los días', weekdays: 'Lunes a viernes', custom: 'Días específicos' }
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function CalendarScreen() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isParent = PARENT_ROLES.includes(profile?.role)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const { events, addEvent } = useCalendarEvents(selectedDate)
  const members = useFamilyMembers()
  const [addOpen, setAddOpen] = useState(false)

  const weekDays = []
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    weekDays.push({
      d: ['L','M','X','J','V','S','D'][i], n: d.getDate(),
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
      <style>{`
        @keyframes deberCheck { 0%{transform:scale(1)} 35%{transform:scale(0.78)} 70%{transform:scale(1.18)} 100%{transform:scale(1)} }
        @keyframes allDone { 0%{transform:scale(0.9);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes toastIn { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes progressFill { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>

      {/* Header */}
      <div style={{ padding: '16px 22px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ textTransform: 'capitalize' }}>{monthName}</div>
          <h1 className="serif" style={{ fontSize: 30 }}>Agenda</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ width: 40, height: 40, borderRadius: 14, background: 'var(--d-card)', border: '1px solid var(--d-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="filter" size={18} color="var(--d-ink)" />
          </button>
          <button onClick={() => setAddOpen(true)} style={{ width: 40, height: 40, borderRadius: 14, background: 'var(--d-terra)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
              transition: 'background 0.18s, color 0.18s',
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, opacity: isSelected ? 0.7 : 0.5 }}>{day.d}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, lineHeight: 1 }}>{day.n}</span>
              {day.today && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--d-terra)', marginTop: 1 }} />}
            </button>
          )
        })}
      </div>

      {/* Member filter (for events) */}
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

      {/* ── Deberes diarios ── */}
      <DeberesSection
        dateStr={selectedDate}
        members={members}
        profile={profile}
        isParent={isParent}
      />

      {/* Events empty state */}
      {events.length === 0 && (
        <div style={{ padding: '0 22px 14px', animation: 'fadeIn 200ms ease both' }}>
          <div style={{ background: 'var(--d-card-warm)', border: '1px solid var(--d-line)', borderRadius: 20, padding: '28px 20px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--d-line)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="calendar" size={26} color="var(--d-mute)" strokeWidth={1.6} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Sin eventos</div>
            <div style={{ fontSize: 13, color: 'var(--d-mute)', marginBottom: 20, textTransform: 'capitalize' }}>{selectedDayLabel}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Comida familiar', 'Cita médica', 'Recordatorio'].map(s => (
                <button key={s} onClick={() => setAddOpen(true)} style={{ height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--d-cream)', border: '1px solid var(--d-line-strong)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', color: 'var(--d-ink-soft)' }}>+ {s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {events.length > 0 && (
        <div style={{ padding: '0 14px 0 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 0 10px 0' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em', margin: 0, textTransform: 'capitalize' }}>{selectedDayLabel}</h3>
            <span style={{ fontSize: 12, color: 'var(--d-terra-deep)', fontWeight: 600, paddingRight: 8 }}>{events.length} evento{events.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ position: 'relative', paddingLeft: 38 }}>
            <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 2, background: 'var(--d-line)', borderRadius: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map(ev => {
                const member = ev.profiles
                const catIcon = CAT_ICONS[ev.category] || 'calendar'
                const evColor = member?.color || CAT_COLORS[ev.category] || 'var(--d-terra)'
                const timeStr = ev.start_time ? new Date(ev.start_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''
                const endStr = ev.end_time ? new Date(ev.end_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''
                const isPast = ev.end_time && new Date(ev.end_time) < new Date()
                return (
                  <div key={ev.id} style={{ position: 'relative', opacity: isPast ? 0.6 : 1 }}>
                    <div style={{ position: 'absolute', left: -32, top: 16, width: 10, height: 10, borderRadius: '50%', background: isPast ? 'var(--d-mute-light)' : evColor, border: '2px solid var(--d-cream)' }} />
                    <div style={{ background: 'var(--d-card)', border: '1px solid var(--d-line)', borderRadius: 18, padding: '14px 14px 12px', borderLeft: `3px solid ${evColor}`, display: 'flex', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: 'var(--d-card-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={catIcon} size={18} color={evColor} strokeWidth={1.8} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25, textDecoration: isPast ? 'line-through' : 'none' }}>{ev.title}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--d-mute)', whiteSpace: 'nowrap', marginLeft: 8 }}>{timeStr}</div>
                        </div>
                        {endStr && <div style={{ fontSize: 12, color: 'var(--d-ink-soft)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={12} color="var(--d-mute)" />{timeStr} – {endStr}</div>}
                        {ev.note && <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 4, fontStyle: 'italic' }}>{ev.note}</div>}
                        {member && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: member.color || 'var(--d-terra-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{member.initial}</div>
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

      <div style={{ height: 24 }} />

      {addOpen && (
        <AddEventModal selectedDate={selectedDate} members={members} onClose={() => setAddOpen(false)} onAdd={addEvent} />
      )}
    </Screen>
  )
}

// ── Deberes Section ────────────────────────────────────────────────────────────
function DeberesSection({ dateStr, members, profile, isParent }) {
  const { deberes, checks, toggleCheck, addDeber, deleteDeber, getWeekHistory } = useDeberes(dateStr)
  const [memberFilter, setMemberFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const children = members.filter(m => ['Hijo', 'Hija'].includes(m.role))

  // Deberes visible for current filter
  const visibleDeberes = isParent
    ? (memberFilter === 'all' ? deberes : deberes.filter(d => d.assignee_ids.length === 0 || d.assignee_ids.includes(memberFilter)))
    : deberes.filter(d => d.assignee_ids.length === 0 || d.assignee_ids.includes(profile?.id))

  // Progress for current user (or filtered child for parents)
  const progressUserId = (isParent && memberFilter !== 'all') ? memberFilter : profile?.id
  const progressDeberes = isParent
    ? (memberFilter === 'all' ? deberes : deberes.filter(d => d.assignee_ids.length === 0 || d.assignee_ids.includes(memberFilter)))
    : deberes.filter(d => d.assignee_ids.length === 0 || d.assignee_ids.includes(profile?.id))
  const completed = progressDeberes.filter(d => checks[`${d.id}_${progressUserId}`]).length
  const total = progressDeberes.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = total > 0 && completed === total

  function showToast(msg) {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  function handleToggle(deber, userId) {
    const wasChecked = !!checks[`${deber.id}_${userId}`]
    toggleCheck(deber.id, userId)
    if (!wasChecked) {
      if (navigator.vibrate) navigator.vibrate(40)
      const willAllDone = completed + 1 === total
      showToast(willAllDone ? '¡Todos los deberes completados!' : 'Deber completado ✓')
    }
  }

  if (deberes.length === 0 && !isParent) return null

  return (
    <div style={{ padding: '0 22px 16px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 2 }}>Responsabilidades</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em', margin: 0 }}>Deberes diarios</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setHistoryOpen(true)} style={{ fontSize: 12, color: 'var(--d-terra-deep)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Ver semana</button>
          {isParent && (
            <button onClick={() => setAddOpen(true)} style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--d-terra)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="plus" size={16} color="#fff" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--d-card)', border: '1px solid var(--d-line)', borderRadius: 16, padding: '12px 14px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--d-ink-soft)' }}>
            {completed} de {total} completados
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: allDone ? 'var(--d-sage)' : 'var(--d-terra)', transition: 'color 0.3s' }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--d-line)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: allDone ? 'var(--d-sage)' : 'var(--d-terra)',
            width: `${pct}%`,
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.3s',
          }} />
        </div>
      </div>

      {/* All done banner */}
      {allDone && (
        <div style={{
          background: 'rgba(74,139,111,0.08)', border: '1px solid rgba(74,139,111,0.25)',
          borderRadius: 14, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
          animation: 'allDone 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--d-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="check" size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--d-sage)' }}>¡Deberes del día completados!</div>
            <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 1 }}>Excelente trabajo hoy</div>
          </div>
        </div>
      )}

      {/* Parent member filter */}
      {isParent && children.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}>
          <Pill active={memberFilter === 'all'} onClick={() => setMemberFilter('all')}>Todos</Pill>
          {children.map(m => (
            <Pill key={m.id} active={memberFilter === m.id} onClick={() => setMemberFilter(m.id)}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, display: 'inline-block', marginRight: 2 }} />
              {m.name.split(' ')[0]}
            </Pill>
          ))}
        </div>
      )}

      {/* Deber cards */}
      {visibleDeberes.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--d-mute)' }}>
          No hay deberes para este día
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleDeberes.map(deber => {
            const assignees = deber.assignee_ids.length > 0
              ? members.filter(m => deber.assignee_ids.includes(m.id))
              : []

            // For parent filter or single assignee, show per-user check
            if (isParent && memberFilter !== 'all') {
              const targetMember = members.find(m => m.id === memberFilter)
              const isChecked = !!checks[`${deber.id}_${memberFilter}`]
              return (
                <DeberCard
                  key={deber.id}
                  deber={deber}
                  checked={isChecked}
                  canToggle={false}
                  member={targetMember}
                  isParent={isParent}
                  onToggle={() => {}}
                  onDelete={() => deleteDeber(deber.id)}
                />
              )
            }

            // For children or parent 'all' view: show current user's check state
            const myChecked = !!checks[`${deber.id}_${profile?.id}`]
            const canToggle = !isParent && (deber.assignee_ids.length === 0 || deber.assignee_ids.includes(profile?.id))

            return (
              <DeberCard
                key={deber.id}
                deber={deber}
                checked={myChecked}
                canToggle={canToggle}
                member={assignees.length === 1 ? assignees[0] : null}
                assignees={assignees}
                allChecks={checks}
                members={members}
                isParent={isParent}
                onToggle={() => handleToggle(deber, profile?.id)}
                onDelete={() => deleteDeber(deber.id)}
              />
            )
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--d-ink)', color: 'var(--d-cream)',
          padding: '10px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
          zIndex: 200, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'toastIn 0.25s ease both',
        }}>{toast}</div>
      )}

      {addOpen && (
        <AddDeberModal members={members} onClose={() => setAddOpen(false)} onAdd={addDeber} />
      )}

      {historyOpen && (
        <HistoryModal profile={profile} getWeekHistory={getWeekHistory} onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  )
}

// ── Deber Card ─────────────────────────────────────────────────────────────────
function DeberCard({ deber, checked, canToggle, member, assignees = [], allChecks = {}, members = [], isParent, onToggle, onDelete }) {
  const [anim, setAnim] = useState(false)

  function handleCheck() {
    if (!canToggle) return
    setAnim(true)
    onToggle()
  }

  const otherChecked = isParent && members.filter(m => allChecks[`${deber.id}_${m.id}`])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 12px',
      background: 'var(--d-card)', border: '1px solid var(--d-line)', borderRadius: 16,
      opacity: checked ? 0.65 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
        background: checked ? 'rgba(74,139,111,0.12)' : 'var(--d-card-warm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.3s',
      }}>
        <Icon name={deber.icon} size={17} color={checked ? 'var(--d-sage)' : 'var(--d-terra)'} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 13.5, lineHeight: 1.3,
          textDecoration: checked ? 'line-through' : 'none',
          color: checked ? 'var(--d-mute)' : 'var(--d-ink)',
          transition: 'color 0.3s',
        }}>{deber.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
          {member && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: member.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--d-mute)', fontWeight: 500 }}>{member.name.split(' ')[0]}</span>
            </div>
          )}
          {isParent && otherChecked.length > 0 && (
            <div style={{ display: 'flex', gap: 2 }}>
              {otherChecked.map(m => (
                <div key={m.id} style={{ width: 14, height: 14, borderRadius: '50%', background: m.color, border: '1px solid var(--d-cream)' }} />
              ))}
              <span style={{ fontSize: 10, color: 'var(--d-sage)', fontWeight: 600, marginLeft: 3 }}>{otherChecked.length} ✓</span>
            </div>
          )}
          {deber.time && <span style={{ fontSize: 11, color: 'var(--d-mute)' }}>· {deber.time}</span>}
          <span style={{ fontSize: 10.5, color: 'var(--d-mute)', opacity: 0.7 }}>{REPEAT_LABELS[deber.repeat] || ''}</span>
        </div>
      </div>

      {/* Check button */}
      <button
        onAnimationEnd={() => setAnim(false)}
        onClick={handleCheck}
        style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${checked ? 'var(--d-sage)' : canToggle ? 'var(--d-line-strong)' : 'var(--d-line)'}`,
          background: checked ? 'var(--d-sage)' : 'transparent',
          cursor: canToggle ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          animation: anim ? 'deberCheck 0.35s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        }}>
        {checked && <Icon name="check" size={15} color="#fff" strokeWidth={2.8} />}
      </button>

      {/* Delete (parents only) */}
      {isParent && (
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.35, flexShrink: 0 }}>
          <Icon name="trash" size={14} color="var(--d-ink)" />
        </button>
      )}
    </div>
  )
}

// ── Add Deber Modal ────────────────────────────────────────────────────────────
function AddDeberModal({ members, onClose, onAdd }) {
  const children = members.filter(m => ['Hijo', 'Hija'].includes(m.role))
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('check')
  const [repeat, setRepeat] = useState('daily')
  const [repeatDays, setRepeatDays] = useState([])
  const [time, setTime] = useState('')
  const [assigneeIds, setAssigneeIds] = useState([])

  function toggleDay(d) {
    setRepeatDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  function toggleAssignee(id) {
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), icon, assignee_ids: assigneeIds, repeat, repeat_days: repeat === 'daily' ? [0,1,2,3,4,5,6] : repeat === 'weekdays' ? [0,1,2,3,4] : repeatDays, time: time || null })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--d-cream)', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%', maxWidth: 420, maxHeight: '92dvh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--d-line-strong)' }} />
        </div>
        <div style={{ padding: '8px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Nuevo deber</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="x" size={20} color="var(--d-mute)" /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Nombre</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del deber…" required style={inputStyle} autoFocus />
            </div>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Ícono</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DEBER_ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setIcon(ic)} style={{ width: 40, height: 40, borderRadius: 12, border: `2px solid ${icon === ic ? 'var(--d-terra)' : 'var(--d-line)'}`, background: icon === ic ? 'rgba(201,123,74,0.1)' : 'var(--d-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    <Icon name={ic} size={18} color={icon === ic ? 'var(--d-terra)' : 'var(--d-mute)'} strokeWidth={1.8} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Repetición</label>
              <select value={repeat} onChange={e => setRepeat(e.target.value)} style={inputStyle}>
                <option value="daily">Todos los días</option>
                <option value="weekdays">Lunes a viernes</option>
                <option value="custom">Días específicos</option>
              </select>
            </div>
            {repeat === 'custom' && (
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Días</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {DAY_NAMES.map((n, i) => (
                    <button key={i} type="button" onClick={() => toggleDay(i)} style={{ flex: 1, height: 36, borderRadius: 10, border: `1.5px solid ${repeatDays.includes(i) ? 'var(--d-terra)' : 'var(--d-line)'}`, background: repeatDays.includes(i) ? 'rgba(201,123,74,0.1)' : 'transparent', fontSize: 11, fontWeight: 600, color: repeatDays.includes(i) ? 'var(--d-terra)' : 'var(--d-mute)', cursor: 'pointer', transition: 'all 0.15s' }}>{n}</button>
                  ))}
                </div>
              </div>
            )}
            {children.length > 0 && (
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Asignar a (opcional)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {children.map(m => (
                    <button key={m.id} type="button" onClick={() => toggleAssignee(m.id)} style={{ height: 34, padding: '0 12px', borderRadius: 999, border: `1.5px solid ${assigneeIds.includes(m.id) ? m.color : 'var(--d-line)'}`, background: assigneeIds.includes(m.id) ? m.color + '18' : 'transparent', fontSize: 12.5, fontWeight: 600, color: assigneeIds.includes(m.id) ? m.color : 'var(--d-mute)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                      {m.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
                {assigneeIds.length === 0 && <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 6 }}>Sin asignar = visible para todos</div>}
              </div>
            )}
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Hora (opcional)</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" disabled={!title.trim()} style={{ marginTop: 4, height: 54, borderRadius: 18, background: title.trim() ? 'var(--d-terra)' : 'var(--d-line-strong)', color: title.trim() ? '#fff' : 'var(--d-mute)', border: 'none', fontWeight: 700, fontSize: 15, cursor: title.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}>
              Agregar deber
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── History Modal ──────────────────────────────────────────────────────────────
function HistoryModal({ profile, getWeekHistory, onClose }) {
  const [history] = useState(() => getWeekHistory())
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--d-cream)', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--d-line-strong)' }} />
        </div>
        <div style={{ padding: '8px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Esta semana</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="x" size={20} color="var(--d-mute)" /></button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 20 }}>
            {history.map(h => (
              <div key={h.dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: h.pct === 100 ? 'var(--d-sage)' : 'var(--d-terra)' }}>{h.total > 0 ? `${h.pct}%` : '–'}</div>
                <div style={{ width: '100%', height: 60, background: 'var(--d-card)', borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${h.pct}%`, background: h.pct === 100 ? 'var(--d-sage)' : 'var(--d-terra)', borderRadius: 4, transition: 'height 0.6s ease', minHeight: h.pct > 0 ? 4 : 0 }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: h.dateStr === todayStr ? 'var(--d-terra)' : 'var(--d-mute)' }}>{h.day}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: 'var(--d-card)', border: '1px solid var(--d-line)', borderRadius: 14, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--d-ink)' }}>{history.filter(h => h.pct === 100).length}</div>
              <div style={{ fontSize: 11, color: 'var(--d-mute)', fontWeight: 500 }}>Días perfectos</div>
            </div>
            <div style={{ flex: 1, background: 'var(--d-card)', border: '1px solid var(--d-line)', borderRadius: 14, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--d-ink)' }}>{history.reduce((a, h) => a + h.myChecks, 0)}</div>
              <div style={{ fontSize: 11, color: 'var(--d-mute)', fontWeight: 500 }}>Completados</div>
            </div>
            <div style={{ flex: 1, background: 'var(--d-card)', border: '1px solid var(--d-line)', borderRadius: 14, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--d-ink)' }}>
                {(() => { let streak = 0; for (let i = history.length - 2; i >= 0; i--) { if (history[i].pct === 100) streak++; else break; } return streak })()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--d-mute)', fontWeight: 500 }}>Racha días</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Add Event Modal (unchanged) ────────────────────────────────────────────────
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
    setSaving(true); setError(null)
    try {
      await onAdd({ title: title.trim(), start_time: `${date}T${startTime}:00`, end_time: endTime ? `${date}T${endTime}:00` : null, note: note.trim() || null, category, member_id: memberId || null })
      onClose()
    } catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--d-cream)', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%', maxWidth: 420, maxHeight: '90dvh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--d-line-strong)' }} />
        </div>
        <div style={{ padding: '8px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Nuevo evento</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="x" size={20} color="var(--d-mute)" /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Título</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reunión familiar, cita médica…" required style={inputStyle} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Fecha</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Nota (opcional)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Detalles adicionales…" style={inputStyle} />
            </div>
            {error && <div style={{ background: 'rgba(184,88,66,0.1)', border: '1px solid var(--d-clay)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--d-clay)' }}>{error}</div>}
            <button type="submit" disabled={saving || !title.trim()} style={{ marginTop: 4, height: 54, borderRadius: 18, background: saving || !title.trim() ? 'var(--d-mute)' : 'var(--d-terra)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: saving ? 'default' : 'pointer' }}>
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
