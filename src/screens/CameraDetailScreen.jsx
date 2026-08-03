import { useRef, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCameras } from '../lib/hooks'
import Icon from '../components/Icon'
import Hls from 'hls.js'

const GO2RTC = import.meta.env.VITE_GO2RTC_URL || 'http://192.168.1.10:1984'

const FALLBACK_CAMS = {
  sala:    { id: 'sala',    name: 'Sala',    location: 'Planta baja', rtsp_url: 'rtsp://192.168.1.21:554/live', tone: '#3D4A5C' },
  cocina:  { id: 'cocina',  name: 'Cocina',  location: 'Planta baja', rtsp_url: 'rtsp://192.168.1.22:554/live', tone: '#5C4A3D' },
  entrada: { id: 'entrada', name: 'Entrada', location: 'Exterior',    rtsp_url: 'rtsp://192.168.1.23:554/live', tone: '#4A5C3D' },
  patio:   { id: 'patio',   name: 'Patio',   location: 'Exterior',    rtsp_url: 'rtsp://192.168.1.24:554/live', tone: '#5C3D4A' },
}

function HLSPlayer({ camName, rtspUrl }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const hlsSrc = `${GO2RTC}/api/stream.m3u8?src=${encodeURIComponent(camName)}`

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Native HLS (Safari/iOS) or fallback to hls.js
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSrc
      video.play().catch(() => setError('Toca para reproducir'))
      return
    }
    if (!Hls.isSupported()) { setError('HLS no soportado en este navegador'); return }
    const hls = new Hls()
    hls.loadSource(hlsSrc)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}))
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setError('No se pudo conectar a la cámara')
    })
    return () => hls.destroy()
  }, [hlsSrc])

  if (error) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: 'rgba(0,0,0,0.5)',
      }}>
        <Icon name="wifi" size={28} color="rgba(255,255,255,0.4)" />
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', padding: '0 20px' }}>{error}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{hlsSrc}</div>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      autoPlay muted playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}

export default function CameraDetailScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { cameras } = useCameras()

  const cam = cameras.find(c => c.id === id) || FALLBACK_CAMS[id] || FALLBACK_CAMS.sala
  const now = new Date().toLocaleString('es-MX')

  return (
    <div style={{
      height: '100dvh', maxWidth: 420, margin: '0 auto',
      background: '#1A1614', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 30 }}>

        {/* Video player */}
        <div style={{ position: 'relative', height: 320, background: cam.tone || '#3D4A5C', overflow: 'hidden' }}>
          <HLSPlayer camName={cam.name} rtspUrl={cam.rtsp_url} />

          {/* Top controls */}
          <div style={{ position: 'absolute', top: 44, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => navigate('/security')} style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Icon name="chev-l" size={20} color="#fff" strokeWidth={2.2} />
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(184,88,66,0.92)', padding: '6px 10px',
              borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
              EN VIVO
            </div>
            <button style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Icon name="expand" size={18} color="#fff" />
            </button>
          </div>

          {/* Timestamp */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            fontSize: 10, color: '#fff', fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 6,
          }}>{now}</div>

          {/* Audio controls */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
            {['volume','mic'].map(icon => (
              <button key={icon} style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Icon name={icon} size={18} color="#fff" />
              </button>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div style={{
          background: 'var(--d-cream)', padding: '20px 22px 30px',
          borderRadius: '24px 24px 0 0', marginTop: -16, position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="eyebrow">{cam.location}</div>
              <h1 className="serif" style={{ fontSize: 28, marginTop: 2 }}>{cam.name}</h1>
            </div>
          </div>

          {/* RTSP URL */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--d-card)', borderRadius: 14, border: '1px solid var(--d-line)' }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>Fuente RTSP</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--d-ink-soft)', wordBreak: 'break-all' }}>
              {cam.rtsp_url}
            </div>
          </div>

          {/* go2rtc proxy note */}
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--d-card-warm)', borderRadius: 14, border: '1px solid var(--d-line)' }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>Proxy HLS</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--d-ink-soft)', wordBreak: 'break-all' }}>
              {GO2RTC}/api/stream.m3u8?src={encodeURIComponent(cam.name)}
            </div>
          </div>

          {/* Events placeholder */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 600, margin: '0 0 10px' }}>Eventos de hoy</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { t: '—', text: 'Los eventos de movimiento aparecerán aquí', icon: 'circle-dot' },
              ].map((e, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px', background: 'var(--d-card)', border: '1px solid var(--d-line)', borderRadius: 14,
                }}>
                  <Icon name={e.icon} size={16} color="var(--d-mute)" />
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--d-mute)' }}>{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
