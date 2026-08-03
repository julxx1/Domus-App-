import { useNavigate } from 'react-router-dom'
import { useChannels } from '../lib/hooks'
import { useAuth } from '../lib/auth.jsx'
import Screen from '../components/Screen'
import Icon from '../components/Icon'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return 'ayer'
}

export default function ChatScreen() {
  const navigate = useNavigate()
  const channels = useChannels()
  const { profile } = useAuth()

  // If no channels from DB yet, show a "create channel" hint
  const hasChannels = channels.length > 0

  return (
    <Screen tab="chat" onTab={tab => {
      if (tab === 'home') navigate('/')
      if (tab === 'cams') navigate('/security')
      if (tab === 'cal') navigate('/calendar')
      if (tab === 'market') navigate('/mercado')
    }}>
      <div style={{ padding: '16px 22px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow">Conversaciones</div>
          <h1 className="serif" style={{ fontSize: 30 }}>Chat</h1>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 14,
          background: 'var(--d-terra)', color: '#fff',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="pencil" size={18} color="#fff" strokeWidth={2} />
        </button>
      </div>

      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={16} color="var(--d-mute)" style={{ position: 'absolute', left: 14, top: 14 }} />
          <input placeholder="Buscar mensajes…" style={{
            width: '100%', height: 44, borderRadius: 14,
            background: 'var(--d-card)', border: '1px solid var(--d-line)',
            paddingLeft: 40, fontSize: 14, color: 'var(--d-ink)', outline: 'none',
          }} />
        </div>
      </div>

      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!hasChannels ? (
          /* No channels yet — show main family channel shortcut */
          <div
            onClick={() => navigate('/chat/familia')}
            style={{
              background: 'var(--d-card)', borderRadius: 18,
              border: '1px solid var(--d-line)', padding: '16px',
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'var(--d-terra-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="home" size={22} color="var(--d-terra-deep)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Chat familiar</div>
              <div style={{ fontSize: 12, color: 'var(--d-mute)', marginTop: 2 }}>Abre el chat del hogar</div>
            </div>
            <Icon name="chev-r" size={18} color="var(--d-mute)" />
          </div>
        ) : (
          channels.map(ch => {
            const lastMsg = ch.messages?.[0]
            const senderName = lastMsg?.profiles?.name || ''
            const lastText = lastMsg ? `${senderName}: ${lastMsg.text}` : 'Sin mensajes'
            const lastTime = lastMsg ? timeAgo(lastMsg.created_at) : ''
            return (
              <div key={ch.id}
                onClick={() => navigate(`/chat/${ch.id}`)}
                style={{
                  background: 'var(--d-card)', borderRadius: 18,
                  border: '1px solid var(--d-line)', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: ch.pinned ? 'var(--d-ink)' : 'var(--d-card-warm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name="chat" size={20} color={ch.pinned ? 'var(--d-cream)' : 'var(--d-terra-deep)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ch.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--d-mute)' }}>{lastTime}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--d-mute)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ch.tag && <span style={{ color: 'var(--d-terra-deep)', fontWeight: 600, marginRight: 4 }}>{ch.tag} ·</span>}
                    {lastText}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Always show quick access to family chat */}
        {hasChannels && (
          <div
            onClick={() => navigate('/chat/familia')}
            style={{
              background: 'var(--d-card-warm)', borderRadius: 14, border: '1px dashed var(--d-line-strong)',
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
            <Icon name="plus" size={16} color="var(--d-mute)" />
            <span style={{ fontSize: 13, color: 'var(--d-mute)', fontWeight: 500 }}>Nuevo chat</span>
          </div>
        )}
      </div>

      <div style={{ height: 20 }} />
    </Screen>
  )
}
