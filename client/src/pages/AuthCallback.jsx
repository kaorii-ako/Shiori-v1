import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const decodeOAuthPayload = (payload) => {
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=')
  return JSON.parse(atob(padded))
}

function supabaseUserToShiori(sbUser) {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Student',
    email: sbUser.email,
    picture: sbUser.user_metadata?.avatar_url || null,
    provider: sbUser.app_metadata?.provider || 'oauth',
  }
}

const AuthCallback = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setUser, setToken } = useAuthStore()
  const [msg, setMsg] = useState('Signing you in…')

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase OAuth callback — hash fragment contains the session
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          if (data.session?.user) {
            const user = supabaseUserToShiori(data.session.user)
            setUser(user)
            setToken(data.session.access_token)
            setMsg(`Welcome, ${user.name.split(' ')[0]}!`)
            setTimeout(() => navigate('/home', { replace: true }), 600)
            return
          }
          // Session not ready yet — listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              const user = supabaseUserToShiori(session.user)
              setUser(user)
              setToken(session.access_token)
              setMsg(`Welcome, ${user.name.split(' ')[0]}!`)
              subscription.unsubscribe()
              setTimeout(() => navigate('/home', { replace: true }), 600)
            }
          })
          return
        } catch {
          navigate('/login?error=auth_failed')
          return
        }
      }

      // Legacy: GitHub OAuth via Express serverless (data= payload)
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
        const decoded = decodeOAuthPayload(data)
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
    }

    handleCallback()
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
