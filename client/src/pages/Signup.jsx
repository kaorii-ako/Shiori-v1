import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { C } from '../utils/theme'

export default function Signup() {
  const navigate = useNavigate()
  const { signupWithEmail, loginWithGoogle, isLoading, error } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [localErr, setLocalErr] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalErr('')
    if (!form.name || !form.email || !form.password) { setLocalErr('All fields required'); return }
    if (form.password.length < 6) { setLocalErr('Password must be at least 6 characters'); return }
    try {
      await signupWithEmail?.(form.email, form.password, form.name)
      navigate('/home')
    } catch (err) {
      setLocalErr(err.message || 'Sign up failed')
    }
  }

  const handleGoogle = async () => {
    try { await loginWithGoogle?.() } catch (err) { setLocalErr(err.message || 'Google sign up failed') }
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>栞</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.blue }}>SHIORI</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Create your account</div>
        </div>

        {displayErr && (
          <div style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.pink }}>
            {displayErr}
          </div>
        )}

        {/* Google */}
        <button onClick={handleGoogle} disabled={isLoading} style={{
          width: '100%', padding: '11px', borderRadius: 10,
          border: `1px solid ${C.border}`, background: C.bg,
          color: C.text, cursor: isLoading ? 'not-allowed' : 'pointer',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 16 }}>G</span> Sign up with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 12, color: C.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Name', key: 'name', type: 'text', placeholder: 'Your name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
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
            marginTop: 4, marginBottom: 16,
          }}>
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: C.textMuted }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.blue, textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
