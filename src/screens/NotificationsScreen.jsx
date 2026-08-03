import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';

const GROUPS = [
  {
    label: 'Hoy', items: [
      { text: 'Movimiento detectado en la entrada',  sub: 'Cámara entrada · 18:42', icon: 'cam',  tint: 'var(--d-terra)' },
      { text: 'Diego llegó a casa',                  sub: 'Hace 12 min',           icon: 'home', tint: 'var(--d-sage)',  who: 'diego' },
      { text: 'Sofía agregó "fresas" al Mercado',    sub: 'Hace 1 h',              icon: 'cart', tint: 'var(--d-ochre)', who: 'sofia' },
    ]
  },
  {
    label: 'Ayer', items: [
      { text: 'La casa entró en reposo a las 23:18', sub: 'Análisis de hábitos',   icon: 'moon', tint: 'var(--d-ink-soft)' },
      { text: 'Carlos salió de la oficina',           sub: '17:42',                 icon: 'pin',  tint: 'var(--d-blush)', who: 'papa' },
      { text: 'Recordatorio: pagar luz',              sub: 'Recados del hogar',     icon: 'bell', tint: 'var(--d-sage-deep)' },
    ]
  }
];

export default function NotificationsScreen() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100%', maxWidth: 420, margin: '0 auto',
      display: 'flex', flexDirection: 'column', background: 'var(--d-cream)',
    }}>
      <div style={{
        padding: '16px 22px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--d-line)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
          <Icon name="chev-l" size={20} color="var(--d-ink)" strokeWidth={2.2} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Notificaciones</h1>
          <div style={{ fontSize: 11.5, color: 'var(--d-mute)' }}>6 nuevas</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--d-terra-deep)' }}>Marcar todo</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 30px' }}>
        {GROUPS.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 10, padding: '0 4px' }}>{g.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map((it, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'var(--d-card)', borderRadius: 14,
                  border: '1px solid var(--d-line)', position: 'relative',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: it.tint, color: '#fff', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={it.icon} size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{it.text}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 2 }}>{it.sub}</div>
                  </div>
                  {it.who && <Avatar member={it.who} size={22} />}
                  {gi === 0 && <span style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 7, height: 7, borderRadius: '50%', background: 'var(--d-terra)',
                  }} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
