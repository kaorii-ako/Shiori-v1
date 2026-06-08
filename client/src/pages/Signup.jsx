import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { C } from '../utils/theme'
import GoogleButton from '../components/GoogleButton'

export default function Signup() {
  const navigate = useNavigate()
  const { signupWithEmail, loginWithGoogle, isLoading, error } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [localErr, setLocalErr] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalErr('')
    if (!form.name || !form.email || !form.password) { setLocalErr('All fields required'); return }
    if (form.password.length < 6) { setLocalErr('Password must be at least 6 characters'); return }
    try {
      const user = await signupWithEmail(form.email, form.password, form.name)
      if (user) navigate('/home')
      else setEmailSent(true)
    } catch (err) {
      setLocalErr(err.message || 'Sign up failed')
    }
  }

  const handleGoogle = async () => {
    setLocalErr('')
    try { await loginWithGoogle() } catch (err) { setLocalErr(err.message || 'Google sign up failed') }
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
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Create your study space</div>
        </div>

        {displayErr && (
          <div style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.pink }}>
            {displayErr}
          </div>
        )}

        {/* Primary: Google */}
        <GoogleButton onClick={handleGoogle} loading={isLoading} label="Sign up with Google" />
        <p style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, margin: '12px 0 4px' }}>
          Use your school Google account to auto-import Classroom assignments.
        </p>

        {/* Secondary: email */}
        {!showEmail ? (
          <button onClick={() => setShowEmail(true)} style={{
            width: '100%', marginTop: 16, padding: '11px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: 'transparent',
            color: C.textMuted, cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
          }}>Sign up with email instead</button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.textMuted }}>or</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Name', key: 'name', type: 'text', placeholder: 'Your name' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'you@school.edu' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '6+ characters' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>{f.label}</label>
                  <input
                    type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
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
                {isLoading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        {emailSent && (
          <div style={{ background: 'rgba(77,255,145,0.1)', border: '1px solid rgba(77,255,145,0.3)', borderRadius: 8, padding: '14px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>✉️</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>Check your email!</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>We sent a confirmation link to <strong style={{ color: C.text }}>{form.email}</strong>. Click it to activate your account, then sign in.</div>
          </div>
        )}
        <div style={{ textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.blue, textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>Free for students · Your data stays private to your account.</span>
        </div>
      </div>
    </div>
  )
}
