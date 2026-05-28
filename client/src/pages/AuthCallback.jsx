import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setUser, setToken } = useAuthStore()

  useEffect(() => {
    const data = params.get('data')
    const error = params.get('error')

    if (error || !data) {
      navigate('/login?error=' + (error || 'unknown'))
      return
    }

    try {
      const decoded = JSON.parse(atob(data))
      setUser(decoded.user)
      setToken(decoded.tokens?.access_token || 'google-token')

      if (typeof window !== 'undefined' && decoded.tokens) {
        localStorage.setItem('shiori-google-tokens', JSON.stringify(decoded.tokens))
      }

      navigate('/home', { replace: true })
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
          Signing you in…
        </p>
      </motion.div>
    </div>
  )
}

export default AuthCallback
