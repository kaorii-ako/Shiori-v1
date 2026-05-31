import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores'
import { validateLoginForm } from '../utils/authValidation'

const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.97)',
  border: 'rgba(50,55,70,0.4)',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
  blue: '#afc6ff',
  blueVibrant: '#528dff',
  purpleVibrant: '#c44dff',
  pink: '#ff6b9d',
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(50,55,70,0.4)',
  color: T.text,
  outline: 'none',
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  boxSizing: 'border-box',
}

const inputErrorStyle = {
  ...inputStyle,
  border: '1px solid rgba(255,107,157,0.5)',
}

const Login = () => {
  const navigate = useNavigate()
  const { loginWithEmail, loginWithGitHub, loginWithGoogle, isLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      await loginWithEmail(formData.email, formData.password)
      navigate('/home')
    } catch (err) {
      // Error is handled by the store
    }
  }

  const handleGoogleLogin = () => {
    loginWithGoogle()
  }

  const handleDemoClick = () => {
    navigate('/demo')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: T.bg,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(92,61,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: 40,
          maxWidth: 400,
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }}>栞</div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            color: T.text,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}>SHIORI</h1>
          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 14,
            color: T.muted,
            margin: 0,
          }}>Sign in to your account</p>
        </div>

        {/* Server error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,107,157,0.08)',
              border: '1px solid rgba(255,107,157,0.25)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              color: T.pink,
              fontSize: 13,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={errors.email ? inputErrorStyle : inputStyle}
              autoComplete="email"
            />
            {errors.email && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.pink, fontFamily: "'Manrope', sans-serif" }}>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={errors.password ? inputErrorStyle : inputStyle}
              autoComplete="current-password"
            />
            {errors.password && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.pink, fontFamily: "'Manrope', sans-serif" }}>
                {errors.password}
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: isLoading
                ? 'rgba(92,61,255,0.4)'
                : 'linear-gradient(135deg, #c44dff, #528dff)',
              color: '#fff',
              border: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </motion.button>
        </form>

        {/* OR divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '22px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.08em',
            color: T.faint,
            textTransform: 'uppercase',
          }}>or</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(50,55,70,0.4)',
              color: T.text,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>🌐</span>
            Continue with Google
          </motion.button>

          <motion.button
            type="button"
            onClick={() => loginWithGitHub()}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(50,55,70,0.4)',
              color: T.text,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>🐙</span>
            Continue with GitHub
          </motion.button>
        </div>

        {/* Footer links */}
        <div style={{
          marginTop: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}>
          <p style={{
            margin: 0,
            fontSize: 13,
            fontFamily: "'Manrope', sans-serif",
            color: T.muted,
          }}>
            No account?{' '}
            <Link
              to="/signup"
              style={{
                color: T.blue,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </p>
          <button
            type="button"
            onClick={handleDemoClick}
            style={{
              background: 'none',
              border: 'none',
              color: T.faint,
              fontSize: 12,
              fontFamily: "'Manrope', sans-serif",
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Try Demo
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
