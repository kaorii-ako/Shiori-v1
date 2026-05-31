import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from '../stores'

function supabaseUserToShiori(sbUser) {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Student',
    email: sbUser.email,
    picture: sbUser.user_metadata?.avatar_url || null,
    provider: sbUser.app_metadata?.provider || 'email',
  }
}

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      navigate('/login')
      return
    }
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        navigate('/login?error=auth_failed')
        return
      }
      const user = supabaseUserToShiori(session.user)
      useAuthStore.setState({
        user, token: session.access_token,
        isAuthenticated: true, isLoading: false, isDemo: false, error: null,
      })
      navigate('/home', { replace: true })
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#10141a', color: '#dfe2eb', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>栞</div>
        <div>Signing you in...</div>
      </div>
    </div>
  )
}
