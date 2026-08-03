import { useState } from 'react'
import { usePantry } from '../lib/hooks'
import { useAuth } from '../lib/auth.jsx'
import Screen from '../components/Screen'
import Icon from '../components/Icon'
import { Pill, SectionTitle } from '../components/Shared'

const NOTE_COLORS = ['#FFF4B8','#FFD6B8','#FFB8B8','#FFD0E4','#D8E8C8','#D0E8F0']
const NOTE_ICONS = ['box','milk','bread','egg','tomato','apple','leaf','heart','star','cart']

function StickyNote({ item, onToggle, onDelete }) {
  const initials = item.profiles?.initial || '?'
  const color = item.profiles?.color || 'var(--d-terra-soft)'
  return (
    <div
      onClick={() => onToggle(item.id, item.done)}
      style={{
        width: 100, height: 100,
        background: item.color || '#FFF4B8',
        transform: `rotate(${item.rot || 0}deg)`,
        borderRadius: 4,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.08)',
        padding: '10px 10px 8px',
        position: 'relative', display: 'flex', flexDirection: 'column',
        opacity: item.done ? 0.55 : 1, cursor: 'pointer',
      }}>
      <div style={{
        position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%) rotate(2deg)',
        width: 28, height: 12,
        background: 'rgba(255,255,255,0.7)',
        border: '0.5px solid rgba(0,0,0,0.05)',
      }} />
      <div style={{ marginBottom: 4 }}>
        <Icon name={item.icon || 'box'} size={18} color="rgba(61,58,54,0.55)" strokeWidth={1.6} />
      </div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 13,
        color: 'var(--d-ink)', lineHeight: 1.15,
        textDecoration: item.done ? 'line-through' : 'none',
      }}>{item.name}</div>
      {item.note && (
        <div style={{
          fontSize: 9.5, color: 'rgba(61,58,54,0.55)', marginTop: 2,
          fontStyle: 'italic', lineHeight: 1.2,
          textDecoration: item.done ? 'line-through' : 'none',
        }}>{item.note}</div>
      )}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 700, color: '#fff',
        }}>{initials}</div>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          border: `1.5px solid ${item.done ? 'var(--d-ok)' : 'rgba(61,58,54,0.3)'}`,
          background: item.done ? 'var(--d-ok)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {item.done && <Icon name="check" size={10} color="#fff" strokeWidth={3} />}
        </div>
      </div>
    </div>
  )
}

function AddModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [icon, setIcon] = useState('box')
  const [color, setColor] = useState(NOTE_COLORS[0])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd(name, note, icon, color)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--d-cream)', borderRadius: '24px 24px 0 0',
        padding: '24px 24px 40px', width: '100%', maxWidth: 420,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 className="serif" style={{ fontSize: 22 }}>Agregar al mercado</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={20} color="var(--d-mute)" />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="¿Qué necesitas?" required
            style={inputStyle} autoFocus />
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Nota opcional (cantidad, marca…)"
            style={inputStyle} />
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Ícono</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {NOTE_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: icon === ic ? 'var(--d-terra-soft)' : 'var(--d-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={ic} size={16} color={icon === ic ? 'var(--d-terra-deep)' : 'var(--d-ink)'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Color nota</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {NOTE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  boxShadow: color === c ? '0 0 0 2px var(--d-terra)' : 'none',
                }} />
              ))}
            </div>
          </div>
          <button type="submit" style={{
            height: 50, borderRadius: 16, background: 'var(--d-ink)',
            color: 'var(--d-cream)', border: 'none', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', marginTop: 4,
          }}>
            Agregar
          </button>
        </form>
      </div>
    </div>
  )
}

export default function MercadoScreen() {
  const { items, addItem, toggleItem, deleteItem } = usePantry()
  const [showAdd, setShowAdd] = useState(false)

  const pending = items.filter(i => !i.done).length
  const total = items.length

  async function handleAdd(name, note, icon, color) {
    const rot = Math.floor(Math.random() * 7) - 3
    await addItem(name, note, icon, color, rot)
  }

  return (
    <Screen tab="market">
      <div style={{ padding: '16px 22px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow">Despensa del hogar</div>
          <h1 className="serif" style={{ fontSize: 30 }}>Mercado</h1>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          width: 40, height: 40, borderRadius: 14,
          background: 'var(--d-terra)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="plus" size={18} color="#fff" strokeWidth={2.2} />
        </button>
      </div>

      <div style={{ padding: '0 22px 18px' }}>
        <div style={{
          background: 'var(--d-card)', borderRadius: 18,
          border: '1px solid var(--d-line)', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, lineHeight: 1 }}>
              <span style={{ color: 'var(--d-terra-deep)' }}>{pending}</span>
              <span style={{ fontSize: 14, color: 'var(--d-mute)' }}> / {total}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 4 }}>por comprar</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, lineHeight: 1, color: 'var(--d-sage-deep)' }}>
              {total > 0 ? Math.round((total - pending) / total * 100) : 0}%
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--d-mute)', marginTop: 4 }}>completado</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 14px' }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #FBF6EC 0%, #F2E9D5 100%)',
          borderRadius: 24, border: '1px solid var(--d-line-strong)',
          padding: '16px 10px 18px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 0 rgba(61,58,54,0.06)',
          minHeight: 160,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' }}>
            {items.map(item => (
              <StickyNote key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
            ))}
            <div
              onClick={() => setShowAdd(true)}
              style={{
                width: 100, height: 100, borderRadius: 8,
                border: '2px dashed var(--d-mute-light)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--d-mute)', transform: 'rotate(-1deg)',
                background: 'rgba(255,255,255,0.3)', cursor: 'pointer',
              }}>
              <Icon name="plus" size={22} strokeWidth={1.8} />
              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>Agregar</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 20 }} />

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}
    </Screen>
  )
}

const inputStyle = {
  height: 48, width: '100%',
  background: 'var(--d-paper)', border: '1px solid var(--d-line)',
  borderRadius: 14, padding: '0 16px', fontSize: 15,
  color: 'var(--d-ink)', outline: 'none', boxSizing: 'border-box',
}
