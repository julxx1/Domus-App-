import Icon from '../components/Icon';

const REST_DATA = [
  { d: 'L', h: 22.5 },
  { d: 'M', h: 23.0 },
  { d: 'X', h: 22.7 },
  { d: 'J', h: 23.3 },
  { d: 'V', h: 24.5 },
  { d: 'S', h: 25.5 },
  { d: 'D', h: 22.0 },
];

const MIN = 21, MAX = 26;
const barH = (h) => Math.max(8, ((h - MIN) / (MAX - MIN)) * 86);
const fmt = (h) => {
  let n = h % 24;
  const hh = Math.floor(n);
  const mm = Math.round((n - hh) * 60);
  return `${hh}:${String(mm).padStart(2, '0')}`;
};

export default function HabitsCard() {
  const todayIdx = 3;

  return (
    <div style={{
      background: 'var(--d-card)', border: '1px solid var(--d-line)',
      borderRadius: 22, padding: '18px 18px 16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--d-line)',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: 'var(--d-sage)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="heart" size={20} color="#fff" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>Hora pico familiar</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.25, fontWeight: 500 }}>
            Suelen estar todos juntos entre las{' '}
            <span style={{ color: 'var(--d-terra-deep)', fontWeight: 600 }}>7:30 y 8:45 PM</span>
            {' '}fuera de sus habitaciones.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600 }}>
            La casa entra en reposo
          </div>
          <div style={{ fontSize: 12, color: 'var(--d-mute)', marginTop: 2 }}>
            Hora promedio · esta semana
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600,
          color: 'var(--d-terra-deep)', letterSpacing: -0.02,
        }}>23:18</div>
      </div>

      <div style={{
        height: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 8, padding: '0 4px', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: 130 - (((23 - MIN) / (MAX - MIN)) * 86) - 26,
          height: 1, borderTop: '1px dashed var(--d-line-strong)', pointerEvents: 'none',
        }}>
          <span style={{
            position: 'absolute', right: 0, top: -16,
            fontSize: 10, color: 'var(--d-mute)', background: 'var(--d-card)',
            padding: '0 4px',
          }}>23:00</span>
        </div>
        {REST_DATA.map((r, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              fontSize: 10, fontWeight: i === todayIdx ? 600 : 500,
              color: i === todayIdx ? 'var(--d-ink)' : 'var(--d-mute)',
            }}>{fmt(r.h)}</div>
            <div style={{
              width: '70%', height: barH(r.h), borderRadius: 8,
              background: i === todayIdx ? 'var(--d-terra)' : 'var(--d-sage-soft)',
              opacity: i === todayIdx ? 1 : 0.55,
            }} />
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: i === todayIdx ? 'var(--d-terra-deep)' : 'var(--d-mute)',
            }}>{r.d}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--d-mute)', lineHeight: 1.4 }}>
        Detectado al analizar movimiento en las cámaras de zonas comunes.
      </div>
    </div>
  );
}
