import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMessages } from '../lib/hooks'
import { useAuth } from '../lib/auth.jsx'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

export default function ChatDetailScreen() {
  const navigate = useNavigate()
  const { channelId } = useParams()
  const { profile } = useAuth()
  const { messages, sendMessage } = useMessages(channelId || 'familia')
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    await sendMessage(text)
    setText('')
  }

  function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  const myId = profile?.id

  return (
    <div style={{
      height: '100dvh', maxWidth: 420, margin: '0 auto',
      display: 'flex', flexDirection: 'column', background: 'var(--d-cream)',
    }}>
      {/* Header */}
      <div style={{
        padding: '48px 16px 12px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--d-line)', background: 'var(--d-cream)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate('/chat')} style={{
          background: 'none', border: 'none', padding: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="chev-l" size={22} color="var(--d-terra-deep)" />
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'var(--d-terra-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="chat" size={18} color="var(--d-terra-deep)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Familia</div>
          <div style={{ fontSize: 11, color: 'var(--d-mute)' }}>Grupo familiar · en tiempo real</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--d-mute)', fontSize: 14, marginTop: 40 }}>
            Sin mensajes aún. ¡Di hola! 👋
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === myId
          const sender = msg.profiles
          return (
            <div key={msg.id} style={{
              display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end', gap: 8,
            }}>
              {!isMe && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: sender?.color || 'var(--d-terra-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {sender?.initial || '?'}
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && sender && (
                  <div style={{ fontSize: 10, color: 'var(--d-mute)', marginBottom: 3, fontWeight: 600 }}>
                    {sender.name}
                  </div>
                )}
                <div style={{
                  background: isMe ? 'var(--d-ink)' : 'var(--d-card)',
                  color: isMe ? 'var(--d-cream)' : 'var(--d-ink)',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 14px', fontSize: 14, lineHeight: 1.45,
                  border: isMe ? 'none' : '1px solid var(--d-line)',
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: 'var(--d-mute)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        padding: '10px 16px 28px', borderTop: '1px solid var(--d-line)',
        background: 'var(--d-cream)', display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          style={{
            flex: 1, height: 44, borderRadius: 22,
            background: 'var(--d-paper)', border: '1px solid var(--d-line)',
            padding: '0 16px', fontSize: 14, color: 'var(--d-ink)', outline: 'none',
          }}
        />
        <button type="submit" disabled={!text.trim()} style={{
          width: 44, height: 44, borderRadius: '50%',
          background: text.trim() ? 'var(--d-terra)' : 'var(--d-line)',
          border: 'none', cursor: text.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background .15s',
        }}>
          <Icon name="send" size={18} color={text.trim() ? '#fff' : 'var(--d-mute)'} />
        </button>
      </form>
    </div>
  )
}
