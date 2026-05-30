import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setUser, setToken } = useAuthStore()
  const [msg, setMsg] = useState('Signing you in…')

  useEffect(() => {
    const data = params.get('data')
    const error = params.get('error')

    if (error) {
      const messages = {
        github_denied: 'GitHub login cancelled.',
        github_token_failed: 'GitHub login failed — try again.',
        github_failed: 'GitHub login failed.',
        github_no_code: 'GitHub login failed — no code.',
      }
      navigate('/login?error=' + encodeURIComponent(messages[error] || error))
      return
    }

    if (!data) {
      navigate('/login?error=missing_data')
      return
    }

    try {
      const decoded = JSON.parse(atob(data))
      setUser(decoded.user)
      setToken(decoded.tokens?.access_token || 'oauth-token')

      if (decoded.tokens) {
        const key = decoded.user?.provider === 'github' ? 'shiori-github-tokens' : 'shiori-google-tokens'
        localStorage.setItem(key, JSON.stringify(decoded.tokens))
      }

      setMsg(`Welcome, ${decoded.user?.name?.split(' ')[0] || 'Student'}!`)
      setTimeout(() => navigate('/home', { replace: true }), 600)
    } catch {
      navigate('/login?error=decode_failed')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#10141a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #afc6ff, #528dff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={22} style={{ color: '#10141a' }} />
        </div>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#606080' }}>
          {msg}
        </p>
      </motion.div>
    </div>
  )
}

export default AuthCallback
