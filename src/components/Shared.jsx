import Icon from './Icon';

export function Pill({ active, children, icon, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 28, padding: '0 12px',
        borderRadius: 999,
        background: active ? 'var(--d-ink)' : 'var(--d-card-warm)',
        color: active ? 'var(--d-cream)' : 'var(--d-ink-soft)',
        border: active ? 'none' : '1px solid var(--d-line)',
        fontSize: 12, fontWeight: 500, cursor: 'pointer',
      }}>
      {icon && <Icon name={icon} size={13} strokeWidth={2} />}
      {children}
    </button>
  );
}

export function SectionTitle({ children, action, eyebrow, onAction }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 22px', marginBottom: 12,
    }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 2 }}>{eyebrow}</div>}
        <h3 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 600,
          fontSize: 19, letterSpacing: '-0.01em', margin: 0,
        }}>{children}</h3>
      </div>
      {action && (
        <button onClick={onAction} style={{
          fontSize: 13, color: 'var(--d-terra-deep)', fontWeight: 600,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>{action}</button>
      )}
    </div>
  );
}

export function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange && onChange(!on)}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: on ? 'var(--d-sage)' : 'var(--d-line-strong)',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.2s', cursor: 'pointer',
      }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 22, height: 22, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

export function AvatarStack({ children }) {
  return (
    <div style={{ display: 'inline-flex' }}>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} style={{ marginLeft: i > 0 ? -8 : 0 }}>
          {child}
        </div>
      )) : children}
    </div>
  );
}
