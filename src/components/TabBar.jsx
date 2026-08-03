import { useNavigate, useLocation } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import Icon from './Icon';

const TABS = [
  { id: 'home',   icon: 'home',     label: 'Inicio',    path: '/' },
  { id: 'cams',   icon: 'shield',   label: 'Seguridad', path: '/security' },
  { id: 'cal',    icon: 'calendar', label: 'Agenda',    path: '/calendar' },
  { id: 'chat',   icon: 'chat',     label: 'Chat',      path: '/chat' },
  { id: 'market', icon: 'cart',     label: 'Mercado',   path: '/mercado' },
];

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeIdx = TABS.findIndex(t =>
    t.path === '/'
      ? location.pathname === '/' || location.pathname === '/dashboard'
      : location.pathname.startsWith(t.path)
  );
  const active = activeIdx >= 0 ? activeIdx : 0;

  const navRef = useRef(null);
  const tabRefs = useRef([]);
  const [capsule, setCapsule] = useState({ left: 0, width: 0, ready: false });
  const [pressed, setPressed] = useState(null);

  useEffect(() => {
    const el = tabRefs.current[active];
    const nav = navRef.current;
    if (!el || !nav) return;
    const er = el.getBoundingClientRect();
    const nr = nav.getBoundingClientRect();
    setCapsule({ left: er.left - nr.left, width: er.width, ready: true });
  }, [active]);

  return (
    <nav ref={navRef} style={{
      position: 'fixed', left: 12, right: 12, bottom: 20,
      height: 64,
      background: 'rgba(251,246,236,0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid var(--d-line)',
      borderRadius: 999,
      display: 'flex', alignItems: 'center',
      padding: '0 6px',
      boxShadow: '0 8px 24px rgba(61,58,54,0.10), 0 2px 6px rgba(61,58,54,0.06)',
      zIndex: 50,
      maxWidth: 420, margin: '0 auto',
    }}>
      {capsule.ready && (
        <div style={{
          position: 'absolute',
          left: capsule.left,
          width: capsule.width,
          top: 8, bottom: 8,
          background: 'var(--d-ink)',
          borderRadius: 999,
          transition: 'left 200ms cubic-bezier(0.22,1,0.36,1), width 200ms cubic-bezier(0.22,1,0.36,1)',
          pointerEvents: 'none',
        }} />
      )}

      {TABS.map((t, i) => {
        const isActive = i === active;
        const isPressed = pressed === i;
        return (
          <button
            key={t.id}
            ref={el => { tabRefs.current[i] = el }}
            onPointerDown={() => setPressed(i)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            onClick={() => navigate(t.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, padding: '6px 0',
              cursor: 'pointer',
              color: isActive ? 'var(--d-cream)' : 'var(--d-mute)',
              flex: 1, minHeight: 44,
              borderRadius: 999,
              border: 'none', background: 'transparent',
              position: 'relative', zIndex: 1,
              transform: isPressed ? 'scale(0.90)' : isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 140ms cubic-bezier(0.22,1,0.36,1), color 200ms ease',
            }}
          >
            <Icon name={t.icon} size={20} strokeWidth={isActive ? 2.2 : 1.6} />
            <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 600, letterSpacing: '0.02em' }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
