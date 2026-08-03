import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useFamilyMembers } from '../lib/hooks'
import Icon from '../components/Icon'
import { SectionTitle, Toggle } from '../components/Shared'

export default function SettingsScreen() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const members = useFamilyMembers()
  const [toggles, setToggles] = useState([true, true, false, true])
  const [showCode, setShowCode] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const flip = (i) => setToggles(prev => prev.map((v, j) => j === i ? !v : v))

  const householdName = profile?.households?.name || 'Mi hogar'
  const inviteCode = profile?.households?.invite_code || '------'

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{
      height: '100%', maxWidth: 420, margin: '0 auto',
      display: 'flex', flexDirection: 'column', background: 'var(--d-cream)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 22px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--d-line)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
          <Icon name="chev-l" size={20} color="var(--d-ink)" strokeWidth={2.2} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Ajustes del hogar</h1>
          <div style={{ fontSize: 11.5, color: 'var(--d-mute)' }}>{householdName}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 30px' }}>
        {/* Household card */}
        <div style={{
          background: 'var(--d-ink)', color: 'var(--d-cream)',
          borderRadius: 22, padding: '18px 18px 16px', marginBottom: 22,
        }}>
          <div className="eyebrow" style={{ color: 'rgba(245,239,230,0.55)' }}>HOGAR</div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>{householdName}</div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                {members.length} miembro{members.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button onClick={() => setShowCode(v => !v)} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '8px 12px', cursor: 'pointer', color: 'var(--d-cream)',
              fontSize: 12, fontWeight: 600,
            }}>
              {showCode ? 'Ocultar' : 'Código'}
            </button>
          </div>
          {showCode && (
            <div style={{
              marginTop: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 12,
              padding: '12px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, letterSpacing: 0.08 }}>CÓDIGO DE INVITACIÓN</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 28, fontWeight: 700, letterSpacing: 6,
                color: 'var(--d-terra)',
              }}>{inviteCode}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>Comparte con tu familia para que se unan</div>
            </div>
          )}
        </div>

        {/* Members */}
        <SectionTitle>Miembros</SectionTitle>
        <div style={{ background: 'var(--d-card)', borderRadius: 18, border: '1px solid var(--d-line)', overflow: 'hidden', marginBottom: 22 }}>
          {members.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderBottom: i < members.length - 1 ? '1px solid var(--d-line)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: m.color || 'var(--d-terra)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-serif)',
              }}>{m.initial || m.name?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--d-mute)' }}>{m.role}</div>
              </div>
              {m.id === profile?.id && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.08,
                  padding: '3px 8px', borderRadius: 999,
                  background: 'var(--d-terra)', color: '#fff',
                }}>TÚ</span>
              )}
              {profile?.households?.owner_id === m.id && m.id !== profile?.id && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.08,
                  padding: '3px 8px', borderRadius: 999,
                  background: 'var(--d-sage)', color: '#fff',
                }}>ADMIN</span>
              )}
            </div>
          ))}
          {/* Invite row */}
          <div
            onClick={() => setShowCode(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderTop: '1px solid var(--d-line)',
              color: 'var(--d-terra-deep)', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--d-card-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="plus" size={18} color="var(--d-terra-deep)" strokeWidth={2} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Invitar a alguien</span>
            <Icon name="chev-r" size={14} color="var(--d-mute)" style={{ marginLeft: 'auto' }} />
          </div>
        </div>

        {/* Preferences */}
        <SectionTitle>Preferencias</SectionTitle>
        <div style={{ background: 'var(--d-card)', borderRadius: 18, border: '1px solid var(--d-line)', overflow: 'hidden', marginBottom: 22 }}>
          {[
            { label: 'Modo silencioso por la noche', sub: '22:00 – 7:00' },
            { label: 'Mostrar análisis de hábitos', sub: 'Procesado en tu dispositivo' },
            { label: 'Compartir ubicación con menores', sub: 'Solo para padres' },
            { label: 'Avisos de movimiento', sub: 'Cámaras exteriores' },
          ].map((row, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--d-line)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{row.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 1 }}>{row.sub}</div>
              </div>
              <Toggle on={toggles[i]} onChange={() => flip(i)} />
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} disabled={signingOut} style={{
          width: '100%', height: 50,
          background: 'transparent', border: '1px solid var(--d-clay)',
          borderRadius: 16, fontWeight: 600, color: 'var(--d-clay)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="arrow-l" size={16} color="var(--d-clay)" />
          {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}
