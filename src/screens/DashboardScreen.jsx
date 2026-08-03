import { useNavigate } from 'react-router-dom'
import { useFamilyMembers, usePantry, useCalendarEvents } from '../lib/hooks'
import { useAuth } from '../lib/auth.jsx'
import Screen from '../components/Screen'
import Icon from '../components/Icon'
import { SectionTitle, AvatarStack } from '../components/Shared'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días,'
  if (h < 19) return 'Buenas tardes,'
  return 'Buenas noches,'
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const members = useFamilyMembers()
  const { items: pantryItems } = usePantry()
  const { events } = useCalendarEvents(todayStr())

  const pendingPantry = pantryItems.filter(i => !i.done).length
  const upcomingEvents = events.slice(0, 3)

  return (
    <Screen tab="home" onTab={tab => {
      if (tab === 'cams') navigate('/security')
      if (tab === 'cal') navigate('/calendar')
      if (tab === 'chat') navigate('/chat')
      if (tab === 'market') navigate('/mercado')
    }}>
      {/* Header */}
      <div style={{ padding: '16px 22px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="muted" style={{ fontSize: 13, fontWeight: 500 }}>{greeting()}</div>
          <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, marginTop: 2 }}>
            {profile?.name || 'Hogar'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/notifications')} style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'var(--d-card)', border: '1px solid var(--d-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', cursor: 'pointer',
          }}>
            <Icon name="bell" size={20} color="var(--d-ink)" strokeWidth={1.8} />
          </button>
          <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: profile?.color || 'var(--d-terra-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-serif)',
            }}>
              {profile?.initial || '?'}
            </div>
          </div>
        </div>
      </div>

      {/* Status hero */}
      <div style={{ padding: '12px 22px 0' }}>
        <div style={{
          background: 'var(--d-ink)', color: 'var(--d-cream)',
          borderRadius: 22, padding: '18px 18px 16px',
          position: 'relative', overflow: 'hidden',
        }}>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, opacity: 0.06 }}>
            <path d="M50 10 L90 50 L90 90 L10 90 L10 50 Z" fill="var(--d-cream)"/>
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: 0.7, fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--d-ok)' }} />
            {profile?.households?.name?.toUpperCase() || 'MI HOGAR'} · TODO TRANQUILO
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 36, fontFamily: 'var(--font-serif)', fontWeight: 500 }}>
                {members.filter(m => m.status === 'En casa').length}
                <span style={{ fontSize: 18, opacity: 0.6 }}>/{members.length}</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {members.filter(m => m.status === 'En casa').length === members.length ? 'Todos en casa' : 'miembros en casa'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', opacity: 0.85 }}>
                <Icon name="door" size={18} color="var(--d-cream)" />
                <div style={{ marginTop: 3 }}>Cerrado</div>
              </div>
              <div style={{ textAlign: 'center', opacity: 0.85 }}>
                <Icon name="cam" size={18} color="var(--d-cream)" />
                <div style={{ marginTop: 3 }}>Activas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Family row */}
      {members.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <SectionTitle action="Ver mapa →" onAction={() => navigate('/map')}>Familia ahora</SectionTitle>
          <div style={{ overflowX: 'auto', display: 'flex', gap: 10, padding: '0 22px 4px', scrollbarWidth: 'none' }}>
            {members.map(m => (
              <div key={m.id} style={{
                minWidth: 96, background: 'var(--d-card)',
                border: '1px solid var(--d-line)', borderRadius: 18,
                padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                flexShrink: 0,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: m.color || 'var(--d-terra-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-serif)',
                  position: 'relative',
                }}>
                  {m.initial}
                  {m.online && (
                    <div style={{
                      position: 'absolute', right: -1, bottom: -1,
                      width: 11, height: 11, borderRadius: '50%',
                      background: 'var(--d-ok)', border: '2px solid var(--d-card)',
                    }} />
                  )}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>{m.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--d-mute)', marginTop: 1, textAlign: 'center', lineHeight: 1.25 }}>
                  {m.location_label || m.status || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cameras shortcut */}
      <div style={{ marginTop: 22 }}>
        <SectionTitle action="Ver todas" onAction={() => navigate('/security')}>Vigilancia</SectionTitle>
        <div style={{ padding: '0 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { name: 'Sala', tone: '#3D4A5C' },
            { name: 'Cocina', tone: '#5C4A3D' },
            { name: 'Entrada', tone: '#4A5C3D' },
            { name: 'Patio', tone: '#5C3D4A' },
          ].map((c, i) => (
            <div key={i} onClick={() => navigate('/security')} style={{
              aspectRatio: '4/3', borderRadius: 16,
              background: c.tone, position: 'relative', overflow: 'hidden', cursor: 'pointer',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${c.tone} 0%, rgba(0,0,0,0.5) 100%)` }}/>
              <div style={{
                position: 'absolute', top: 8, left: 8,
                fontSize: 10, fontWeight: 700, color: '#fff',
                background: 'rgba(184,88,66,0.95)', padding: '3px 7px', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                LIVE
              </div>
              <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 12, fontWeight: 600, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{c.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar preview */}
      {upcomingEvents.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <SectionTitle action="Ver agenda →" onAction={() => navigate('/calendar')}>Hoy en la agenda</SectionTitle>
          <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingEvents.map((ev, i) => {
              const timeStr = ev.start_time ? new Date(ev.start_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''
              const member = ev.profiles
              return (
                <div key={ev.id || i} onClick={() => navigate('/calendar')} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', cursor: 'pointer',
                  background: 'var(--d-card)', borderRadius: 14,
                  border: '1px solid var(--d-line)',
                }}>
                  <div style={{ width: 4, height: 30, borderRadius: 2, flexShrink: 0, background: member?.color || 'var(--d-terra)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--d-mute)', marginTop: 1 }}>{timeStr}</div>
                  </div>
                  {member && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: member.color || 'var(--d-terra-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                      {member.initial}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mercado preview */}
      {pendingPantry > 0 && (
        <div style={{ marginTop: 22 }}>
          <SectionTitle action="Ver despensa" onAction={() => navigate('/mercado')}>En el Mercado</SectionTitle>
          <div style={{ padding: '0 22px' }}>
            <div style={{ background: 'var(--d-card)', borderRadius: 22, padding: 14, border: '1px solid var(--d-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--d-ink)', fontWeight: 600 }}>{pendingPantry}</span>
                <span className="muted" style={{ fontSize: 13 }}>cosas por comprar</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pantryItems.filter(i => !i.done).slice(0, 5).map(item => (
                  <span key={item.id} style={{
                    fontSize: 12, fontWeight: 500, padding: '5px 10px', borderRadius: 999,
                    background: 'var(--d-paper)', border: '1px solid var(--d-line)', color: 'var(--d-ink-soft)',
                  }}>{item.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />
    </Screen>
  )
}
