import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocations, useFamilyMembers } from '../lib/hooks'
import Screen from '../components/Screen'
import Icon from '../components/Icon'

// Fix Leaflet default icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl

function memberDivIcon(member) {
  const color = member.color || '#C97B4A'
  const initial = member.initial || member.name?.[0]?.toUpperCase() || '?'
  const html = `
    <div style="
      position:relative;
      display:inline-flex;
      flex-direction:column;
      align-items:center;
    ">
      <div style="
        background:${color};
        padding:4px 4px 4px 8px;
        border-radius:999px;
        display:flex;
        align-items:center;
        gap:6px;
        box-shadow:0 4px 14px rgba(0,0,0,0.22),0 0 0 2.5px #fff;
        white-space:nowrap;
      ">
        <span style="color:#fff;font-weight:700;font-size:12px;line-height:1;">${initial}</span>
        <div style="
          width:24px;height:24px;border-radius:50%;
          background:#fff;color:${color};
          display:flex;align-items:center;justify-content:center;
          font-weight:700;font-size:12px;line-height:1;
        ">${initial}</div>
      </div>
      <div style="
        width:0;height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:9px solid ${color};
        margin-top:-1px;
        filter:drop-shadow(0 2px 2px rgba(0,0,0,0.15));
      "></div>
    </div>
  `
  return L.divIcon({ html, className: '', iconAnchor: [20, 42], iconSize: [40, 42] })
}

function homeIcon() {
  const html = `
    <div style="
      width:42px;height:42px;border-radius:50%;
      background:rgba(122,139,111,0.22);
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="
        width:28px;height:28px;border-radius:50%;
        background:#7A8B6F;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 12px rgba(0,0,0,0.2);
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1v-8.5z"/>
        </svg>
      </div>
    </div>
  `
  return L.divIcon({ html, className: '', iconAnchor: [21, 21], iconSize: [42, 42] })
}

export default function MapScreen() {
  const navigate = useNavigate()
  const members = useFamilyMembers()
  const locations = useLocations()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const homeMarkerRef = useRef(null)

  const locArray = Object.values(locations)
  const hasGPS = locArray.some(l => l.lat && l.lng)

  // Initialize Leaflet map
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([19.4326, -99.1332], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    // Home marker at center
    homeMarkerRef.current = L.marker([19.4326, -99.1332], { icon: homeIcon() }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
    }
  }, [])

  // Update member markers when locations change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const locs = Object.values(locations)
    if (locs.length === 0) return

    // Center on average of known positions
    const avgLat = locs.reduce((s, l) => s + l.lat, 0) / locs.length
    const avgLng = locs.reduce((s, l) => s + l.lng, 0) / locs.length

    // Move home marker to center of family
    if (homeMarkerRef.current) {
      homeMarkerRef.current.setLatLng([avgLat, avgLng])
    }
    map.setView([avgLat, avgLng], 15, { animate: true })

    // Add/update member markers
    members.forEach(m => {
      const loc = locations[m.id]
      if (!loc?.lat || !loc?.lng) return
      const latlng = [loc.lat, loc.lng]
      if (markersRef.current[m.id]) {
        markersRef.current[m.id].setLatLng(latlng)
      } else {
        markersRef.current[m.id] = L.marker(latlng, { icon: memberDivIcon(m) }).addTo(map)
      }
    })
  }, [locations, members])

  function timeAgo(iso) {
    if (!iso) return 'desconocido'
    const s = (Date.now() - new Date(iso).getTime()) / 1000
    if (s < 60) return 'ahora'
    if (s < 3600) return `hace ${Math.floor(s / 60)}m`
    return `hace ${Math.floor(s / 3600)}h`
  }

  return (
    <Screen tab="home" scroll={false} onTab={tab => {
      if (tab === 'home') navigate('/')
      if (tab === 'cams') navigate('/security')
      if (tab === 'cal') navigate('/calendar')
      if (tab === 'chat') navigate('/chat')
      if (tab === 'market') navigate('/mercado')
    }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Map */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {/* Top overlay */}
          <div style={{
            position: 'absolute', top: 12, left: 14, zIndex: 500,
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(251,246,236,0.92)', backdropFilter: 'blur(12px)',
              borderRadius: 18, padding: '10px 14px',
              border: '1px solid rgba(224,212,196,0.8)',
              boxShadow: '0 4px 14px rgba(61,58,54,0.08)',
              pointerEvents: 'all',
            }}>
              <div className="eyebrow" style={{ fontSize: 10 }}>Familia</div>
              <div className="serif" style={{ fontSize: 19, fontWeight: 600, marginTop: 1 }}>
                {members.length} en el radar
              </div>
            </div>
          </div>
        </div>

        {/* Bottom sheet */}
        <div style={{
          background: 'var(--d-cream)', borderRadius: '24px 24px 0 0',
          marginTop: -22, position: 'relative', zIndex: 10,
          padding: '10px 0 0', paddingBottom: 110,
          boxShadow: '0 -8px 24px rgba(61,58,54,0.08)', maxHeight: 280,
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--d-line-strong)' }} />
          </div>
          <div style={{ padding: '12px 22px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 600, margin: 0 }}>En tiempo real</h3>
              <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 2 }}>
                {hasGPS ? 'GPS activo · actualizando' : 'Esperando permisos de ubicación…'}
              </div>
            </div>
          </div>
          <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {members.map(m => {
              const loc = locations[m.id]
              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 10px', borderRadius: 14,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: m.color || 'var(--d-terra-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-serif)',
                  }}>{m.initial || m.name?.[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--d-ink-soft)', marginTop: 1 }}>
                      <span style={{ color: m.color || 'var(--d-terra)', fontWeight: 600 }}>
                        {loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : 'Sin ubicación'}
                      </span>
                      {loc && (
                        <span className="muted"> · {timeAgo(loc.updated_at)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: loc ? '#4A8B6F' : 'var(--d-mute-light)',
                  }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Screen>
  )
}
