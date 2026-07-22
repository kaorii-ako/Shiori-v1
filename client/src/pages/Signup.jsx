import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, MailCheck } from 'lucide-react'
import { useAuthStore } from '../stores'
import { C, fonts, tint, inputStyle, btnPrimary } from '../utils/theme'
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
      fontFamily: fonts.body, padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div className="page-enter" style={{
        width: '100%', maxWidth: 410, position: 'relative',
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 20, padding: '38px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 6, margin: '0 auto 14px',
            background: C.purpleDark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, color: '#0b0e14',
          }}>栞</div>
          <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 19, color: C.text }}>Create your study space</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 5 }}>Free for students — takes 30 seconds</div>
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

        {emailSent ? (
          <div style={{
            background: tint(C.greenDark, 0.08), border: `1px solid ${tint(C.greenDark, 0.3)}`,
            borderRadius: 12, padding: 20, textAlign: 'center',
          }}>
            <MailCheck size={28} color={C.green} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: C.green, marginBottom: 6, fontFamily: fonts.heading }}>Check your email!</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
              We sent a confirmation link to <strong style={{ color: C.text }}>{form.email}</strong>.
              Click it to activate your account, then sign in.
            </div>
          </div>
        ) : (
          <>
            {/* Primary: Google */}
            <GoogleButton onClick={handleGoogle} loading={isLoading} label="Sign up with Google" />
            <p style={{ textAlign: 'center', fontSize: 12, color: C.textFaint, margin: '12px 0 4px' }}>
              Use your school Google account to auto-import Classroom assignments.
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
              >Sign up with email instead</button>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 12, color: C.textFaint }}>or</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <form onSubmit={handleSubmit}>
                  {[
                    { label: 'Name', key: 'name', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
                    { label: 'Email', key: 'email', type: 'email', placeholder: 'you@school.edu', autoComplete: 'email' },
                    { label: 'Password', key: 'password', type: 'password', placeholder: '6+ characters', autoComplete: 'new-password' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 700 }}>{f.label}</label>
                      <input
                        type={f.type} value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
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
                    {isLoading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>
              </>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: 13, color: C.textMuted, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.blue, textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
          <span style={{ fontSize: 11.5, color: C.textFaint }}>Free for students · Your data stays private to your account.</span>
        </div>
      </div>
    </div>
  )
}
