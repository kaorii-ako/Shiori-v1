import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useUIStore } from '../stores'
import { C } from '../utils/theme'

function Section({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { geminiApiKey, setGeminiApiKey } = useUIStore()
  const [keyInput, setKeyInput] = useState(geminiApiKey || '')
  const [keySaved, setKeySaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

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
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>⚙️ Settings</h1>

      {/* Profile */}
      <Section title="Profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,#afc6ff,#528dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#10141a' }}>
            {userInitial}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{userName}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{user?.email || 'Demo User'}</div>
          </div>
        </div>
      </Section>

      {/* API Keys */}
      <Section title="API Keys">
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13, color: C.text, marginBottom: 8, fontWeight: 600 }}>
            Gemini API Key
          </label>
          <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
            Required for AI features (flashcard generation, quiz, study plans).{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: C.blue }}>Get a free key →</a>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="AIza..."
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 8,
                background: C.bg, border: `1px solid ${C.border}`,
                color: C.text, fontSize: 13, fontFamily: "'Manrope', sans-serif",
              }}
            />
            <button onClick={() => setShowKey(s => !s)} style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', fontSize: 13 }}>
              {showKey ? '🙈' : '👁'}
            </button>
            <button onClick={saveKey} style={{
              padding: '9px 16px', borderRadius: 8, border: 'none',
              background: keySaved ? C.greenDark : 'linear-gradient(135deg,#afc6ff,#528dff)',
              color: '#10141a', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700,
            }}>{keySaved ? '✓ Saved' : 'Save'}</button>
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
          <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(175,198,255,0.12)', border: `1px solid ${C.blue}`, fontSize: 12, color: C.blue, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Dark</div>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>Version</span>
            <span style={{ color: C.text }}>1.0.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>License</span>
            <span style={{ color: C.text }}>MIT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>Source</span>
            <a href="https://github.com/kaorii-ako/Shiori-v1" target="_blank" rel="noopener noreferrer" style={{ color: C.blue }}>GitHub ↗</a>
          </div>
        </div>
      </Section>

      {/* Account */}
      <Section title="Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { logout?.(); navigate('/login') }} style={{
            padding: '10px 16px', borderRadius: 8,
            border: `1px solid ${C.border}`, background: 'transparent',
            color: C.text, cursor: 'pointer', textAlign: 'left',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
          }}>Sign Out</button>
          <button style={{
            padding: '10px 16px', borderRadius: 8,
            border: '1px solid rgba(255,107,157,0.4)', background: 'rgba(255,107,157,0.08)',
            color: C.pink, cursor: 'pointer', textAlign: 'left',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
          }}>Delete Account</button>
        </div>
      </Section>
    </div>
  )
}
