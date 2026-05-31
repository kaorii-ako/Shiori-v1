import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores'
import { validateSignupForm } from '../utils/authValidation'
import { getTimezoneFromCountry } from '../components/CountrySelect'

const T = {
  bg: '#0a0d12',
  surface: 'rgba(13,17,24,0.97)',
  border: 'rgba(50,55,70,0.4)',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
  blue: '#afc6ff',
  green: '#4dff91',
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

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
}

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Cambodia', 'Canada', 'Chile', 'China',
  'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt',
  'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Hungary',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'South Korea', 'Kuwait',
  'Malaysia', 'Mexico', 'Morocco', 'Myanmar', 'Nepal', 'Netherlands',
  'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Senegal',
  'Singapore', 'South Africa', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Taiwan', 'Tanzania', 'Thailand', 'Turkey', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Venezuela', 'Vietnam', 'Yemen', 'Zimbabwe',
]

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: 'transparent' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  if (score <= 2) return { level: score, label: 'Weak', color: '#ff6b9d' }
  if (score <= 3) return { level: score, label: 'Fair', color: '#ffd6a0' }
  return { level: score, label: 'Strong', color: '#4dff91' }
}

const Signup = () => {
  const navigate = useNavigate()
  const { register, loginWithGitHub, isLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    country: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    if (error) clearError()
  }

  const handleCountryChange = (e) => {
    const country = e.target.value
    setFormData(prev => ({ ...prev, country }))
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: null }))
    }
  }

  const handleDemoClick = () => {
    navigate('/demo')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const validation = validateSignupForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      const timezone = getTimezoneFromCountry(formData.country)

      await register({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        timezone
      })
      setSuccess(true)
      setTimeout(() => navigate('/home'), 2000)
    } catch (err) {
      // Error is handled by the store
    }
  }

  const strength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.passwordConfirm && formData.password !== formData.passwordConfirm

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
        top: '15%',
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
          }}>Create your account</p>
        </div>

        {/* Success state */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(77,255,145,0.08)',
              border: '1px solid rgba(77,255,145,0.25)',
              borderRadius: 8,
              padding: '14px',
              marginBottom: 16,
              textAlign: 'center',
              color: T.green,
              fontSize: 14,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Account created! Redirecting…
          </motion.div>
        )}

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                style={errors.firstName ? inputErrorStyle : inputStyle}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.pink, fontFamily: "'Manrope', sans-serif" }}>
                  {errors.firstName}
                </p>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                style={errors.lastName ? inputErrorStyle : inputStyle}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.pink, fontFamily: "'Manrope', sans-serif" }}>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
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

          {/* Password + strength */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={errors.password ? inputErrorStyle : inputStyle}
              autoComplete="new-password"
            />
            {formData.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background: i <= strength.level ? strength.color : 'rgba(50,55,70,0.4)',
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p style={{
                    margin: 0,
                    fontSize: 11,
                    color: strength.color,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}>
                    {strength.label}
                  </p>
                )}
              </div>
            )}
            {errors.password && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.pink, fontFamily: "'Manrope', sans-serif" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Confirm password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              style={(errors.passwordConfirm || passwordsMatch) ? inputErrorStyle : inputStyle}
              autoComplete="new-password"
            />
            {(passwordsMatch || errors.passwordConfirm) && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.pink, fontFamily: "'Manrope', sans-serif" }}>
                {errors.passwordConfirm || 'Passwords must match'}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <select
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              style={errors.country ? { ...selectStyle, border: '1px solid rgba(255,107,157,0.5)' } : selectStyle}
            >
              <option value="" disabled style={{ background: '#0a0d12' }}>Select country</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c} style={{ background: '#0a0d12' }}>{c}</option>
              ))}
            </select>
            {errors.country && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.pink, fontFamily: "'Manrope', sans-serif" }}>
                {errors.country}
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || success}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: (isLoading || success)
                ? 'rgba(92,61,255,0.4)'
                : 'linear-gradient(135deg, #c44dff, #528dff)',
              color: '#fff',
              border: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: (isLoading || success) ? 'not-allowed' : 'pointer',
              marginTop: 4,
              opacity: (isLoading || success) ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Creating account…' : 'Sign up'}
          </motion.button>
        </form>

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
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: T.blue,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Sign in
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

export default Signup
