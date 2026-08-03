import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import Icon from '../components/Icon'

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { createHousehold, joinHousehold, profile } = useAuth()
  const [step, setStep] = useState('choice') // 'choice' | 'create' | 'join' | 'done'
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const hh = await createHousehold(householdName)
      setCreated(hh)
      setStep('done')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await joinHousehold(inviteCode)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100dvh', maxWidth: 420, margin: '0 auto',
      background: 'var(--d-cream)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, padding: '56px 28px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--d-terra)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5EFE6" strokeWidth="2" strokeLinejoin="round">
              <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-8.5z"/>
              <circle cx="12" cy="14" r="1.5" fill="#F5EFE6"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, fontStyle: 'italic' }}>Domus</span>
        </div>

        {step === 'choice' && (
          <>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Configura tu hogar</div>
            <h2 className="serif" style={{ fontSize: 30, marginBottom: 10 }}>
              Hola{profile?.name ? `, ${profile.name}` : ''} 👋
            </h2>
            <p className="muted" style={{ fontSize: 15, marginBottom: 40 }}>
              ¿Eres el primero de tu familia en usar Domus, o alguien ya creó el hogar?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setStep('create')} style={optionBtn}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--d-terra-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="home" size={20} color="var(--d-terra-deep)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Crear mi hogar</div>
                  <div style={{ fontSize: 12, color: 'var(--d-mute)', marginTop: 2 }}>Soy el primero · creo el hogar familiar</div>
                </div>
                <Icon name="chev-r" size={18} color="var(--d-mute)" style={{ marginLeft: 'auto' }} />
              </button>
              <button onClick={() => setStep('join')} style={optionBtn}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--d-sage-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="plus" size={20} color="var(--d-sage-deep)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Unirme a un hogar</div>
                  <div style={{ fontSize: 12, color: 'var(--d-mute)', marginTop: 2 }}>Tengo un código de invitación</div>
                </div>
                <Icon name="chev-r" size={18} color="var(--d-mute)" style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </>
        )}

        {step === 'create' && (
          <>
            <button onClick={() => setStep('choice')} style={backBtn}>
              <Icon name="chev-l" size={16} /> Atrás
            </button>
            <h2 className="serif" style={{ fontSize: 28, marginBottom: 8 }}>Crear mi hogar</h2>
            <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>Elige un nombre para tu familia. Después invitas a los demás.</p>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Nombre del hogar</label>
                <input value={householdName} onChange={e => setHouseholdName(e.target.value)}
                  placeholder="Familia Hernández" required style={inputStyle} />
              </div>
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? 'Creando…' : 'Crear hogar'}
                {!loading && <Icon name="arrow-r" size={18} color="var(--d-cream)" />}
              </button>
            </form>
          </>
        )}

        {step === 'join' && (
          <>
            <button onClick={() => setStep('choice')} style={backBtn}>
              <Icon name="chev-l" size={16} /> Atrás
            </button>
            <h2 className="serif" style={{ fontSize: 28, marginBottom: 8 }}>Unirme al hogar</h2>
            <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>Pide el código de invitación a quien creó el hogar.</p>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Código de invitación</label>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="AB12CD" maxLength={6} required
                  style={{ ...inputStyle, textAlign: 'center', fontSize: 22, letterSpacing: 6, fontWeight: 700 }} />
              </div>
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? 'Buscando…' : 'Unirme'}
                {!loading && <Icon name="arrow-r" size={18} color="var(--d-cream)" />}
              </button>
            </form>
          </>
        )}

        {step === 'done' && created && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
            <h2 className="serif" style={{ fontSize: 28, marginBottom: 8 }}>¡Hogar creado!</h2>
            <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>
              Comparte este código con tu familia para que se unan:
            </p>
            <div style={{
              background: 'var(--d-card)', border: '2px dashed var(--d-terra)',
              borderRadius: 18, padding: 20, textAlign: 'center', marginBottom: 28,
            }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Código de invitación</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 8, color: 'var(--d-terra-deep)', fontFamily: 'var(--font-serif)' }}>
                {created.invite_code}
              </div>
            </div>
            <button onClick={() => navigate('/')} style={primaryBtn}>
              Ir al hogar <Icon name="arrow-r" size={18} color="var(--d-cream)" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{ background: 'rgba(184,88,66,0.1)', border: '1px solid var(--d-clay)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--d-clay)' }}>
      {msg}
    </div>
  )
}

const inputStyle = {
  height: 48, width: '100%',
  background: 'var(--d-paper)', border: '1px solid var(--d-line)',
  borderRadius: 14, padding: '0 16px', fontSize: 15,
  color: 'var(--d-ink)', outline: 'none', boxSizing: 'border-box',
}
const primaryBtn = {
  height: 56, borderRadius: 18, background: 'var(--d-ink)',
  color: 'var(--d-cream)', border: 'none', fontWeight: 700, fontSize: 15,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
}
const optionBtn = {
  display: 'flex', alignItems: 'center', gap: 14,
  background: 'var(--d-card)', border: '1px solid var(--d-line)',
  borderRadius: 18, padding: '16px 18px', cursor: 'pointer', width: '100%', textAlign: 'left',
}
const backBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6,
  color: 'var(--d-mute)', fontSize: 14, marginBottom: 28, padding: 0,
}
