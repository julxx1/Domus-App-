import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import Screen from '../components/Screen'
import Icon from '../components/Icon'
import { SectionTitle } from '../components/Shared'

const MEMBER_COLORS = [
  '#C97B4A', '#7A8B6F', '#5B7BA5', '#7B5B9A',
  '#C97B8A', '#C9A74A', '#4A8B6F', '#9B5A4A',
]

const ROLES = ['Mamá','Papá','Hijo','Hija','Abuelo','Abuela','Miembro','Admin']

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { profile, signOut, updateProfile } = useAuth()

  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editColor, setEditColor] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  function openEdit() {
    setEditName(profile?.name || '')
    setEditRole(profile?.role || 'Miembro')
    setEditColor(profile?.color || MEMBER_COLORS[0])
    setSaveError(null)
    setEditOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!editName.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateProfile({ name: editName.trim(), role: editRole, color: editColor })
      setEditOpen(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const memberColor = profile?.color || 'var(--d-terra)'
  const initial = profile?.initial || profile?.name?.[0]?.toUpperCase() || '?'
  const householdName = profile?.households?.name || 'Sin hogar'
  const inviteCode = profile?.households?.invite_code

  return (
    <Screen>
      <div style={{ padding: '16px 22px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
            <Icon name="chev-l" size={20} color="var(--d-ink)" strokeWidth={2.2} />
          </button>
          <button onClick={openEdit} style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'var(--d-card)', border: '1px solid var(--d-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Icon name="pen" size={17} color="var(--d-ink)" />
          </button>
        </div>

        {/* Profile card */}
        <div style={{
          background: 'var(--d-card)', borderRadius: 24,
          border: '1px solid var(--d-line)',
          padding: '22px 18px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <svg width="100%" height="120" viewBox="0 0 320 120" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.5 }}>
            <path d="M0 60 Q 80 20 160 60 T 320 60 V0 H0 Z" fill="var(--d-card-warm)" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 84, height: 84, borderRadius: '50%',
              background: memberColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              boxShadow: `0 0 0 3.5px #fff, 0 0 0 5.5px ${memberColor}40`,
              fontSize: 32, fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#fff',
            }}>{initial}</div>
            <h2 className="serif" style={{ fontSize: 26, fontWeight: 600, marginTop: 12 }}>
              {profile?.name || 'Sin nombre'}
            </h2>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {profile?.role || 'Miembro'} · {householdName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              <span style={{
                padding: '5px 12px', borderRadius: 999,
                background: memberColor + '20', border: `1px solid ${memberColor}40`,
                fontSize: 11, fontWeight: 600, color: memberColor,
              }}>
                ● Color del perfil
              </span>
              {inviteCode && (
                <span style={{
                  padding: '5px 12px', borderRadius: 999,
                  background: 'var(--d-paper)', border: '1px solid var(--d-line)',
                  fontSize: 11, fontWeight: 600, color: 'var(--d-ink-soft)',
                  fontFamily: 'monospace', letterSpacing: 2,
                }}>
                  {inviteCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Household section */}
      <div style={{ padding: '22px 22px 0' }}>
        <SectionTitle>Mi hogar</SectionTitle>
        <div style={{
          background: 'var(--d-card)', borderRadius: 18,
          border: '1px solid var(--d-line)', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--d-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="home" size={20} color="#fff" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{householdName}</div>
            {inviteCode && (
              <div style={{ fontSize: 12, color: 'var(--d-mute)', marginTop: 2 }}>
                Código de invitación: <span style={{ fontFamily: 'monospace', letterSpacing: 2, color: 'var(--d-terra)' }}>{inviteCode}</span>
              </div>
            )}
          </div>
          <button onClick={() => navigate('/settings')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <Icon name="chev-r" size={16} color="var(--d-mute)" />
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '22px 22px 0' }}>
        <button onClick={handleSignOut} style={{
          width: '100%', height: 50,
          background: 'transparent', border: '1px solid var(--d-clay)',
          borderRadius: 16, fontWeight: 600, color: 'var(--d-clay)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
        }}>
          <Icon name="arrow-l" size={18} color="var(--d-clay)" />
          Cerrar sesión
        </button>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && setEditOpen(false)}>
          <div style={{
            background: 'var(--d-cream)', borderRadius: '24px 24px 0 0',
            padding: '0 0 40px', width: '100%', maxWidth: 420,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4,
            }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--d-line-strong)' }} />
            </div>
            <div style={{ padding: '8px 22px 0' }}>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Editar perfil</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Tu nombre</label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Rol en la familia</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} style={inputStyle}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: 10 }}>Color de perfil</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {MEMBER_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        style={{
                          width: 36, height: 36, borderRadius: '50%', background: c,
                          border: editColor === c ? `3px solid var(--d-ink)` : '3px solid transparent',
                          cursor: 'pointer', padding: 0,
                          boxShadow: editColor === c ? '0 0 0 1px #fff inset' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                {saveError && (
                  <div style={{
                    background: 'rgba(184,88,66,0.1)', border: '1px solid var(--d-clay)',
                    borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--d-clay)',
                  }}>{saveError}</div>
                )}
                <button type="submit" disabled={saving} style={{
                  marginTop: 4, height: 54, borderRadius: 18,
                  background: saving ? 'var(--d-mute)' : 'var(--d-ink)',
                  color: 'var(--d-cream)', border: 'none',
                  fontWeight: 700, fontSize: 15, cursor: saving ? 'default' : 'pointer',
                }}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}

const inputStyle = {
  height: 48, width: '100%',
  background: 'var(--d-paper)', border: '1px solid var(--d-line)',
  borderRadius: 14, padding: '0 16px', fontSize: 15,
  color: 'var(--d-ink)', outline: 'none', boxSizing: 'border-box',
}
