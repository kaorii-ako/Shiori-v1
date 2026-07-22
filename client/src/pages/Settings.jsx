import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, RefreshCw, Eye, EyeOff, Check, LogOut, Trash2, ExternalLink } from 'lucide-react'
import { useAuthStore, useUIStore, useAssignmentsStore } from '../stores'
import { C, fonts, tint, inputStyle, btnPrimary, btnGhost } from '../utils/theme'
import { PageHeader, Card } from '../components/ui'
import { GoogleLogo } from '../components/GoogleButton'

function Section({ title, children }) {
  return (
    <Card style={{ padding: '20px 24px', marginBottom: 16 }}>
      <h2 style={{
        fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: C.textFaint,
        letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase',
      }}>{title}</h2>
      {children}
    </Card>
  )
}

function timeAgo(ts) {
  if (!ts) return null
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout, loginWithGoogle, clearGoogleAuth, isGoogleConnected } = useAuthStore()
  const { geminiApiKey, setGeminiApiKey, addToast } = useUIStore()
  const { syncClassroom, syncing, lastSynced } = useAssignmentsStore()
  const [keyInput, setKeyInput] = useState(geminiApiKey || '')
  const [keySaved, setKeySaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const connected = isGoogleConnected()

  const handleSync = async () => {
    try {
      const r = await syncClassroom()
      addToast({ type: 'success', message: `Synced ${r.courses} courses · ${r.assignments} assignments from Classroom` })
    } catch (e) {
      if (e?.name === 'ClassroomAuthError') {
        addToast({ type: 'error', message: 'Google session expired — reconnecting…' })
        loginWithGoogle().catch(() => {})
      } else {
        addToast({ type: 'error', message: e?.message || 'Classroom sync failed' })
      }
    }
  }

  const saveKey = () => {
    setGeminiApiKey(keyInput.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || 'Student'
  const userInitial = userName[0]?.toUpperCase() || 'S'

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 640, margin: '0 auto' }}>
      <PageHeader
        icon={SettingsIcon}
        accent={C.blue}
        title="Settings"
        subtitle="Account, integrations and preferences"
      />

      {/* Profile */}
      <Section title="Profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: C.blueDark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.heading, fontWeight: 700, fontSize: 22, color: '#0b0e14',
            boxShadow: `0 6px 20px ${tint(C.blueDark, 0.3)}`,
          }}>
            {userInitial}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{userName}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{user?.email || ''}</div>
          </div>
        </div>
      </Section>

      {/* Integrations */}
      <Section title="Integrations">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GoogleLogo size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Google Classroom</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
              {connected
                ? `Connected${lastSynced ? ` · synced ${timeAgo(lastSynced)}` : ''}`
                : 'Import your courses, assignments and grades automatically.'}
            </div>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            fontFamily: fonts.heading, flexShrink: 0,
            color: connected ? C.green : C.textMuted,
            background: connected ? tint(C.greenDark, 0.1) : 'rgba(255,255,255,0.04)',
            border: `1px solid ${connected ? tint(C.greenDark, 0.4) : C.border}`,
          }}>{connected ? '● Connected' : '○ Not connected'}</span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {connected ? (
            <>
              <button onClick={handleSync} disabled={syncing} style={{
                ...btnPrimary,
                cursor: syncing ? 'not-allowed' : 'pointer',
                opacity: syncing ? 0.7 : 1,
              }}>
                <RefreshCw size={14} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing…' : 'Sync now'}
              </button>
              <button onClick={() => { clearGoogleAuth(); addToast({ type: 'info', message: 'Disconnected from Google Classroom' }) }} style={{ ...btnGhost, color: C.textMuted }}>
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={() => loginWithGoogle().catch(() => {})} style={{
              padding: '9px 16px', borderRadius: 10, border: 'none',
              background: '#fff', color: '#1f1f1f', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: fonts.heading, fontSize: 13, fontWeight: 600,
            }}><GoogleLogo size={16} /> Connect Google Classroom</button>
          )}
        </div>
      </Section>

      {/* API Keys */}
      <Section title="API Keys">
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13, color: C.text, marginBottom: 8, fontWeight: 700 }}>
            Gemini API Key
          </label>
          <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, lineHeight: 1.6 }}>
            Powers AI features (flashcard generation, quiz, study plans). Stored only on this device.{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: C.blue, textDecoration: 'none' }}>
              Get a free key <ExternalLink size={10} style={{ display: 'inline', verticalAlign: '-1px' }} />
            </a>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="AIza..."
              style={{ ...inputStyle, flex: 1, width: 'auto' }}
              onFocus={e => { e.target.style.borderColor = C.blueDark }}
              onBlur={e => { e.target.style.borderColor = C.border }}
            />
            <button onClick={() => setShowKey(s => !s)} aria-label={showKey ? 'Hide key' : 'Show key'} style={{
              padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: 'transparent', color: C.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button onClick={saveKey} style={{
              ...btnPrimary,
              background: keySaved ? C.greenDark : btnPrimary.background,
            }}>{keySaved ? <><Check size={14} /> Saved</> : 'Save'}</button>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Theme</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Dark mode only (more themes coming soon)</div>
          </div>
          <div style={{
            padding: '6px 16px', borderRadius: 999, background: tint(C.blue, 0.1),
            border: `1px solid ${tint(C.blue, 0.4)}`, fontSize: 12, color: C.blue,
            fontFamily: fonts.heading, fontWeight: 600,
          }}>Dark</div>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>Version</span>
            <span style={{ color: C.text }}>2.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>License</span>
            <span style={{ color: C.text }}>MIT — free & open source</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>Source</span>
            <a href="https://github.com/kaorii-ako/Shiori-v1" target="_blank" rel="noopener noreferrer" style={{ color: C.blue, textDecoration: 'none' }}>GitHub ↗</a>
          </div>
        </div>
      </Section>

      {/* Account */}
      <Section title="Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { Promise.resolve(logout?.()).finally(() => navigate('/login')) }} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '11px 16px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: 'transparent',
            color: C.text, cursor: 'pointer', textAlign: 'left',
            fontFamily: fonts.heading, fontSize: 13, fontWeight: 600,
            transition: 'border-color 0.15s ease',
          }}><LogOut size={14} /> Sign Out</button>
          <button onClick={() => addToast({ type: 'info', message: 'To delete your account and data, email the address on our GitHub page.' })} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '11px 16px', borderRadius: 10,
            border: `1px solid ${tint(C.pink, 0.4)}`, background: tint(C.pink, 0.07),
            color: C.pink, cursor: 'pointer', textAlign: 'left',
            fontFamily: fonts.heading, fontSize: 13, fontWeight: 600,
          }}><Trash2 size={14} /> Delete Account</button>
        </div>
      </Section>
    </div>
  )
}
