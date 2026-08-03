import { useNavigate } from 'react-router-dom'
import { useCameras } from '../lib/hooks'
import Screen from '../components/Screen'
import Icon from '../components/Icon'
import { Pill, SectionTitle } from '../components/Shared'
import HabitsCard from './HabitsCard'

const GO2RTC = import.meta.env.VITE_GO2RTC_URL || 'http://192.168.1.10:1984'

function hlsUrl(camName) {
  return `${GO2RTC}/api/stream.m3u8?src=${encodeURIComponent(camName)}`
}

function CameraCard({ cam, onPress }) {
  return (
    <div onClick={onPress} style={{
      background: cam.tone || '#3D4A5C', borderRadius: 18, overflow: 'hidden',
      position: 'relative', cursor: 'pointer', aspectRatio: '16/10',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }} />
      {/* LIVE badge */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        background: 'rgba(184,88,66,0.95)', color: '#fff',
        fontSize: 9.5, fontWeight: 700, padding: '3px 7px', borderRadius: 6,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
        LIVE
      </div>
      {cam.has_motion && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(215,165,60,0.95)', color: '#fff',
          fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 6,
        }}>
          MOVIMIENTO
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{cam.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{cam.location}</div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="expand" size={14} color="#fff" />
        </div>
      </div>
    </div>
  )
}

export default function SecurityScreen() {
  const navigate = useNavigate()
  const { cameras } = useCameras()

  const tones = ['#3D4A5C','#5C4A3D','#4A5C3D','#5C3D4A']

  const displayCams = cameras.length > 0
    ? cameras.map((c, i) => ({ ...c, tone: tones[i % tones.length] }))
    : [
        { id: 'sala',    name: 'Sala',    location: 'Planta baja', tone: tones[0], has_motion: true  },
        { id: 'cocina',  name: 'Cocina',  location: 'Planta baja', tone: tones[1], has_motion: false },
        { id: 'entrada', name: 'Entrada', location: 'Exterior',    tone: tones[2], has_motion: false },
        { id: 'patio',   name: 'Patio',   location: 'Exterior',    tone: tones[3], has_motion: false },
      ]

  return (
    <Screen tab="cams" onTab={tab => {
      if (tab === 'home') navigate('/')
      if (tab === 'cal') navigate('/calendar')
      if (tab === 'chat') navigate('/chat')
      if (tab === 'market') navigate('/mercado')
    }}>
      <div style={{ padding: '16px 22px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow">Hogar protegido</div>
          <h1 className="serif" style={{ fontSize: 30 }}>Vigilancia</h1>
        </div>
        <button onClick={() => navigate('/settings')} style={{
          width: 40, height: 40, borderRadius: 14,
          background: 'var(--d-terra)', color: '#fff',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="plus" size={20} color="#fff" strokeWidth={2.2} />
        </button>
      </div>

      <div style={{ padding: '0 22px', display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto' }}>
        <Pill active icon="check">{displayCams.length} en línea</Pill>
        <Pill icon="circle-dot">Movimiento ({displayCams.filter(c => c.has_motion).length})</Pill>
        <Pill icon="bell">Alertas</Pill>
      </div>

      {/* Camera grid */}
      <div style={{ padding: '0 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {displayCams.map((cam) => (
          <CameraCard
            key={cam.id}
            cam={cam}
            onPress={() => navigate(`/security/detail/${cam.id}`)}
          />
        ))}
      </div>

      {/* go2rtc setup hint if no cameras in DB */}
      {cameras.length === 0 && (
        <div style={{ margin: '18px 22px 0' }}>
          <div style={{
            background: 'var(--d-card-warm)', border: '1px solid var(--d-line)',
            borderRadius: 18, padding: '16px',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Icon name="wifi" size={20} color="var(--d-terra-deep)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>Conecta tus cámaras IP</div>
                <div style={{ fontSize: 12, color: 'var(--d-mute)', lineHeight: 1.5 }}>
                  Instala <strong>go2rtc</strong> en tu red local y configura tus cámaras RTSP. Las tarjetas de arriba son de demostración.
                </div>
                <div style={{
                  marginTop: 10, fontFamily: 'monospace', fontSize: 11,
                  background: 'var(--d-ink)', color: 'var(--d-cream)',
                  padding: '8px 12px', borderRadius: 8,
                }}>
                  go2rtc -config go2rtc.yaml
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <SectionTitle eyebrow="Análisis de hábitos">Horas pico en casa</SectionTitle>
        <div style={{ padding: '0 22px' }}>
          <HabitsCard />
        </div>
      </div>

      <div style={{ height: 20 }} />
    </Screen>
  )
}
