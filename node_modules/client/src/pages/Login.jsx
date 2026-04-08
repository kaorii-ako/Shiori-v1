import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuthStore } from '../stores'
import { validateLoginForm } from '../utils/authValidation'

const Login = () => {
  const navigate = useNavigate()
  const { loginWithEmail, isLoading, error, clearError } = useAuthStore()

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
    window.location.href = '/api/auth/google'
  }

  const handleDemoClick = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'DemoPass123!'
    })
    setErrors({})
    if (error) clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="starfield" />
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44dff 100%)',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              boxShadow: '0 0 30px rgba(255,107,157,0.5)'
            }}
          >
            <span className="text-white font-bold text-3xl" style={{ fontFamily: 'serif' }}>栞</span>
          </div>
          <h1
            className="text-2xl gradient-text mb-2"
            style={{ fontFamily: '"Press Start 2P"', fontSize: '14px' }}
          >
            SHIORI
          </h1>
          <p style={{ fontFamily: 'VT323', fontSize: '18px' }} className="text-text-secondary">
            AI Study Buddy
          </p>
        </div>

        <GlassCard>
          <h2
            className="text-xl text-center mb-6 gradient-text"
            style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}
          >
            LOGIN
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

            <Input
              label="PASSWORD"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              LOGIN
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(196,77,255,0.3)' }} />
            <span style={{ fontFamily: 'VT323', fontSize: '14px', color: '#606080' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(196,77,255,0.3)' }} />
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <span className="flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </span>
            <span>CONTINUE WITH GOOGLE</span>
          </Button>

          {/* Sign up link */}
          <p
            className="text-center mt-6"
            style={{ fontFamily: 'VT323', fontSize: '16px' }}
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-accent-pink hover:underline"
              style={{ fontFamily: '"Press Start 2P"', fontSize: '10px' }}
            >
              SIGN UP
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Login
