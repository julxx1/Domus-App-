import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

const TABS = [
  { id: 'home',   icon: 'home',   label: 'Inicio',    path: '/' },
  { id: 'cams',   icon: 'shield',   label: 'Seguridad',  path: '/security' },
  { id: 'cal',    icon: 'calendar', label: 'Agenda',     path: '/calendar' },
  { id: 'chat',   icon: 'chat',     label: 'Chat',       path: '/chat' },
  { id: 'market', icon: 'cart',   label: 'Mercado',    path: '/mercado' },
];

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = TABS.find(t => t.path === location.pathname)?.id || 'home';

  return (
    <nav style={{
      position: 'fixed', left: 12, right: 12, bottom: 20,
      height: 60,
      background: 'rgba(251, 246, 236, 0.88)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid var(--d-line)',
      borderRadius: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 10px',
      boxShadow: '0 8px 24px rgba(61,58,54,0.08), 0 2px 6px rgba(61,58,54,0.05)',
      zIndex: 50,
      maxWidth: 420, margin: '0 auto',
    }}>
      {TABS.map(t => (
        <button key={t.id}
          onClick={() => navigate(t.path)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, padding: '6px 10px', cursor: 'pointer',
            color: active === t.id ? 'var(--d-terra-deep)' : 'var(--d-mute)',
            flex: 1, borderRadius: 12, position: 'relative',
            border: 'none', background: 'transparent',
          }}>
          {active === t.id && (
            <span style={{
              position: 'absolute', top: -2,
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--d-terra)',
            }} />
          )}
          <Icon name={t.icon} size={22} strokeWidth={active === t.id ? 2 : 1.6} />
          <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.02em' }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
