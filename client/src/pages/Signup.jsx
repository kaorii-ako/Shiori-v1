import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Input from '../components/Input'
import CountrySelect from '../components/CountrySelect'
import { useAuthStore } from '../stores'
import { validateSignupForm } from '../utils/authValidation'
import { getTimezoneFromCountry } from '../components/CountrySelect'

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
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    // Clear server error
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

    // Validate form
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
      console.error('Registration error:', err)
      // Error is handled by the store
    }
  }

  // Password requirements checklist
  const passwordChecks = [
    { label: '8+ characters', valid: formData.password.length >= 8 },
    { label: '1 uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: '1 lowercase letter', valid: /[a-z]/.test(formData.password) },
    { label: '1 number', valid: /\d/.test(formData.password) },
    { label: '1 symbol (!@#$%...)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="starfield" />
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              boxShadow: '0 0 20px rgba(255,107,157,0.5)'
            }}
          >
            <span className="text-white font-bold text-2xl" style={{ fontFamily: 'serif' }}>栞</span>
          </div>
          <h1
            className="text-xl gradient-text mb-1"
            style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
          >
            JOIN SHIORI
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: '16px' }} className="text-text-secondary">
            Create your AI Study Buddy account
          </p>
        </div>

        <GlassCard>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: 'rgba(77,255,145,0.2)',
                  border: '3px solid #4dff91'
                }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: '#4dff91' }} />
              </div>
              <h3
                className="text-lg mb-2 text-accent-success"
                style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
              >
                ACCOUNT CREATED!
              </h3>
              <p style={{ fontFamily: 'VT323', fontSize: '18px' }} className="text-text-secondary">
                Redirecting you to home...
              </p>
            </motion.div>
          ) : (
            <>
              <h2
                className="text-xl text-center mb-6 gradient-text"
                style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
              >
                SIGN UP
              </h2>

              {/* Demo Button */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full mb-4"
                onClick={handleDemoClick}
                style={{
                  borderColor: '#4dff91',
                  color: '#4dff91'
                }}
              >
                📋 FILL DEMO DATA
              </Button>

              {/* OAuth — fastest signup */}
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mb-3"
                  onClick={loginWithGitHub}
                  style={{ borderColor: 'rgba(175,198,255,0.4)', color: '#dfe2eb' }}
                >
                  <span style={{ flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </span>
                  <span>SIGN UP WITH GITHUB</span>
                </Button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(196,77,255,0.2)' }} />
                  <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#424754' }}>or sign up with email</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(196,77,255,0.2)' }} />
                </div>
              </div>

              {error && (
                <div
                  className="mb-4 p-3 flex items-center gap-2"
                  style={{
                    background: 'rgba(255,77,106,0.1)',
                    border: '2px solid #ff4d6a'
                  }}
                >
                  <span className="flex-shrink-0" style={{ color: '#ff4d6a' }}>
                    <AlertCircle size={20} strokeWidth={2} style={{ display: 'block' }} />
                  </span>
                  <p style={{ fontFamily: 'VT323', fontSize: '16px', color: '#ff4d6a' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <Input
                  label="USERNAME"
                  type="text"
                  name="username"
                  placeholder="kaorii-ako"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  icon={User}
                  autoComplete="username"
                />
                <p style={{ fontFamily: 'VT323', fontSize: '12px' }} className="text-text-muted -mt-2 ml-1">
                  Lowercase letters, numbers, hyphens, periods
                </p>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="FIRST NAME"
                    type="text"
                    name="firstName"
                    placeholder="Kaori"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                  />
                  <Input
                    label="LAST NAME"
                    type="text"
                    name="lastName"
                    placeholder="Ako"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                  />
                </div>

                {/* Country */}
                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#a0a0b5' }}
                  >
                    COUNTRY
                  </label>
                  <CountrySelect
                    value={formData.country}
                    onChange={handleCountryChange}
                    error={errors.country}
                  />
                  {errors.country && (
                    <p style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff4d6a' }} className="mt-1 ml-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* Email */}
                <Input
                  label="EMAIL"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={Mail}
                  autoComplete="email"
                />

                {/* Password */}
                <Input
                  label="PASSWORD"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={Lock}
                  autoComplete="new-password"
                />

                {/* Password requirements */}
                {formData.password && (
                  <div className="grid grid-cols-2 gap-2 p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {passwordChecks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                          style={{
                            background: check.valid ? 'rgba(77,255,145,0.2)' : 'transparent',
                            border: `2px solid ${check.valid ? '#4dff91' : '#606080'}`
                          }}
                        >
                          {check.valid && <CheckCircle size={12} strokeWidth={2} style={{ color: '#4dff91', display: 'block' }} />}
                        </div>
                        <span
                          style={{
                            fontFamily: 'VT323',
                            fontSize: '12px',
                            color: check.valid ? '#4dff91' : '#606080'
                          }}
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirm Password */}
                <Input
                  label="CONFIRM PASSWORD"
                  type="password"
                  name="passwordConfirm"
                  placeholder="Repeat your password"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  error={errors.passwordConfirm}
                  icon={Lock}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  className="w-full mt-4"
                  loading={isLoading}
                >
                  CREATE ACCOUNT
                </Button>
              </form>

              {/* Login link */}
              <p
                className="text-center mt-6"
                style={{ fontFamily: 'VT323', fontSize: '16px' }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-accent-pink hover:underline"
                  style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
                >
                  LOGIN
                </Link>
              </p>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Signup
