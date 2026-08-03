import { byId } from '../data';

export default function Avatar({ member, size = 32, ring = false, online = false, style = {} }) {
  const m = typeof member === 'string' ? byId(member) : member;
  if (!m) return null;
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: m.color, color: '#fff',
        fontFamily: 'var(--font-serif)', fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, letterSpacing: 0, flexShrink: 0,
        boxShadow: ring ? `0 0 0 2px var(--d-cream), 0 0 0 ${ring === true ? 3 : ring}px ${m.color}` : 'none',
        ...style,
      }}>{m.initial}</div>
      {online && (
        <div style={{
          position: 'absolute', right: -1, bottom: -1,
          width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28),
          borderRadius: '50%',
          background: 'var(--d-ok)',
          border: '2px solid var(--d-cream)',
        }} />
      )}
    </div>
  );
}
