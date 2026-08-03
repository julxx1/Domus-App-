import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import Icon from '../components/Icon'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('Miembro')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function pwStrength(pw) {
    if (!pw) return 0
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return Math.min(4, score)
  }

  const strength = mode === 'register' ? pwStrength(password) : 0
  const strengthLabels = ['', 'Muy débil', 'Débil', 'Buena', 'Fuerte']
  const strengthColors = ['', '#C94A4A', '#C9874A', '#C9A74A', '#4A8B6F']

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/')
      } else {
        await signUp(email, password, name, role)
        navigate('/onboarding')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100dvh', maxWidth: 420, margin: '0 auto',
      background: 'linear-gradient(180deg, var(--d-cream) 0%, var(--d-cream-deep) 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 28px 40px', overflowY: 'auto' }}>

        {/* Brand */}
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: 'var(--d-terra)', color: 'var(--d-cream)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 22px rgba(201,123,74,0.35)', marginBottom: 22,
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-8.5z"
                stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Bienvenido a casa</div>
          <h1 className="serif" style={{ fontSize: 44, lineHeight: 1, fontWeight: 600 }}>
            <span className="serif-italic">Domus</span>
          </h1>
          <p className="muted" style={{ fontSize: 15, marginTop: 10 }}>
            {mode === 'login' ? 'Ingresa a tu hogar familiar.' : 'Crea tu cuenta para empezar.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginTop: 32, background: 'var(--d-card)', borderRadius: 14, padding: 4, border: '1px solid var(--d-line)' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null) }} style={{
              flex: 1, height: 36, borderRadius: 10, border: 'none',
              background: mode === m ? 'var(--d-terra)' : 'transparent',
              color: mode === m ? 'var(--d-cream)' : 'var(--d-mute)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
            }}>
              {m === 'login' ? 'Entrar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Tu nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="María García"
                  required style={inputStyle} />
              </div>
              <div>
                <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Rol en la familia</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  {['Mamá','Papá','Hijo','Hija','Abuelo','Abuela','Miembro'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <Icon name="mail" size={18} color="var(--d-mute)" style={{ position: 'absolute', left: 14, top: 15 }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="maria@familia.com" required
                style={{ ...inputStyle, paddingLeft: 44 }} />
            </div>
          </div>

          <div>
            <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Icon name="lock" size={18} color="var(--d-mute)" style={{ position: 'absolute', left: 14, top: 15 }} />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6}
                style={{ ...inputStyle, paddingLeft: 44, paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              }}>
                <Icon name="eye" size={18} color="var(--d-mute)" />
              </button>
            </div>
            {mode === 'register' && password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: n <= strength ? strengthColors[strength] : 'var(--d-line)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: strengthColors[strength] || 'var(--d-mute)', fontWeight: 600 }}>
                  {strengthLabels[strength]}
                  {strength < 3 && ' — usa mayúsculas, números y símbolos'}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: 'rgba(184,88,66,0.1)', border: '1px solid var(--d-clay)',
              borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--d-clay)',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 8, height: 56, borderRadius: 18,
            background: loading ? 'var(--d-mute)' : 'var(--d-ink)',
            color: 'var(--d-cream)', border: 'none',
            fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            {loading ? 'Entrando…' : mode === 'login' ? 'Entrar al hogar' : 'Crear cuenta'}
            {!loading && <Icon name="arrow-r" size={18} color="var(--d-cream)" strokeWidth={2.2} />}
          </button>
        </form>

        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--d-mute)', marginTop: 32 }}>
          Domus · Tu hogar, conectado
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  height: 48, width: '100%',
  background: 'var(--d-paper)', border: '1px solid var(--d-line)',
  borderRadius: 14, padding: '0 16px', fontSize: 15,
  color: 'var(--d-ink)', outline: 'none', boxSizing: 'border-box',
}
