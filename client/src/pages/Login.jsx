import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { isSupabaseConfigured } from '../lib/supabase'
import { C } from '../utils/theme'
import GoogleButton from '../components/GoogleButton'

export default function Login() {
  const navigate = useNavigate()
  const { loginWithGoogle, loginWithEmail, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localErr, setLocalErr] = useState('')
  const [showEmail, setShowEmail] = useState(false)

  const handleEmail = async (e) => {
    e.preventDefault()
    setLocalErr('')
    if (!email || !password) { setLocalErr('Email and password required'); return }
    try {
      await loginWithEmail(email, password)
      navigate('/home')
    } catch (err) {
      setLocalErr(err.message || 'Sign in failed')
    }
  }

  const handleGoogle = async () => {
    setLocalErr('')
    try {
      await loginWithGoogle()
    } catch (err) {
      setLocalErr(err.message || 'Google sign in failed')
    }
  }

  const displayErr = localErr || error

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Manrope', sans-serif", padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '36px 32px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>栞</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.blue }}>SHIORI</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Sign in to your study space</div>
        </div>

        {displayErr && (
          <div style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.pink }}>
            {displayErr}
          </div>
        )}

        {/* Primary: Google */}
        <GoogleButton onClick={handleGoogle} loading={isLoading} label="Sign in with Google" />
        <p style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, margin: '12px 0 4px' }}>
          Sign in with your school Google account to sync Classroom.
        </p>

        {/* Secondary: email */}
        {!showEmail ? (
          <button onClick={() => setShowEmail(true)} style={{
            width: '100%', marginTop: 16, padding: '11px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: 'transparent',
            color: C.textMuted, cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
          }}>Use email and password instead</button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.textMuted }}>or</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <form onSubmit={handleEmail}>
              {[
                { label: 'Email', val: email, set: setEmail, type: 'email', placeholder: 'you@school.edu' },
                { label: 'Password', val: password, set: setPassword, type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>{f.label}</label>
                  <input
                    type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      background: C.bg, border: `1px solid ${C.border}`,
                      color: C.text, fontSize: 13, fontFamily: "'Manrope', sans-serif",
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#afc6ff,#528dff)',
                color: '#10141a', cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700,
                marginTop: 4, marginBottom: 8,
              }}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 20 }}>
          New here?{' '}
          <Link to="/signup" style={{ color: C.blue, textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => navigate('/demo')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: C.textMuted, fontFamily: "'Manrope', sans-serif",
          }}>Just looking? Explore the demo →</button>
        </div>
      </div>
    </div>
  )
}
