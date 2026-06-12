import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores'
import { C, fonts, tint, inputStyle, btnPrimary } from '../utils/theme'
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
      fontFamily: fonts.body, padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(600px 450px at 50% -10%, rgba(90,139,255,0.1), transparent 70%),
          radial-gradient(400px 350px at 90% 100%, rgba(181,92,255,0.06), transparent 70%)
        `,
      }} />

      <div className="page-enter" style={{
        width: '100%', maxWidth: 410, position: 'relative',
        background: `linear-gradient(180deg, ${C.cardSoft} 0%, ${C.card} 100%)`,
        border: `1px solid ${C.border}`,
        borderRadius: 20, padding: '38px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, color: '#0b0e14',
            boxShadow: '0 8px 28px rgba(90,139,255,0.4)',
          }}>栞</div>
          <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 19, color: C.text }}>Welcome back</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 5 }}>Sign in to your study space</div>
        </div>

        {displayErr && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: tint(C.pink, 0.08), border: `1px solid ${tint(C.pink, 0.3)}`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.pink,
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {displayErr}
          </div>
        )}

        {/* Primary: Google */}
        <GoogleButton onClick={handleGoogle} loading={isLoading} label="Sign in with Google" />
        <p style={{ textAlign: 'center', fontSize: 12, color: C.textFaint, margin: '12px 0 4px' }}>
          Use your school Google account to sync Classroom automatically.
        </p>

        {/* Secondary: email */}
        {!showEmail ? (
          <button onClick={() => setShowEmail(true)} style={{
            width: '100%', marginTop: 16, padding: '11px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: 'transparent',
            color: C.textMuted, cursor: 'pointer',
            fontFamily: fonts.heading, fontSize: 13, fontWeight: 600,
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = '#2e3850' }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border }}
          >Use email and password instead</button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.textFaint }}>or</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <form onSubmit={handleEmail}>
              {[
                { label: 'Email', val: email, set: setEmail, type: 'email', placeholder: 'you@school.edu', autoComplete: 'email' },
                { label: 'Password', val: password, set: setPassword, type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>{f.label}</label>
                  <input
                    type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder} autoComplete={f.autoComplete}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = C.blueDark }}
                    onBlur={e => { e.target.style.borderColor = C.border }}
                  />
                </div>
              ))}
              <button type="submit" disabled={isLoading} style={{
                ...btnPrimary, width: '100%', marginTop: 4, marginBottom: 8,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}>
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 20 }}>
          New here?{' '}
          <Link to="/signup" style={{ color: C.blue, textDecoration: 'none', fontWeight: 700 }}>Create an account</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
          <button onClick={() => navigate('/demo')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12.5, color: C.textMuted, fontFamily: fonts.body,
          }}><Sparkles size={13} color={C.purple} /> Just looking? Explore the demo →</button>
        </div>
      </div>
    </div>
  )
}
