import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore, loadUserDataIntoStores, clearAllStores } from '../stores'

function supabaseUserToShiori(sbUser) {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Student',
    email: sbUser.email,
    picture: sbUser.user_metadata?.avatar_url || null,
    provider: sbUser.app_metadata?.provider || 'email',
  }
}

// Google access tokens last ~1h; store a slightly conservative expiry.
const GOOGLE_TOKEN_TTL = 55 * 60 * 1000

function decodeBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(decodeURIComponent(escape(atob(b64))))
}

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // ── Path B: serverless Google OAuth returns ?data=<base64 user+tokens> ──
    const params = new URLSearchParams(window.location.search)
    const data = params.get('data')
    if (data) {
      try {
        const { user, tokens } = decodeBase64Url(data)
        useAuthStore.setState({
          user: { id: user.id, name: user.name, email: user.email, picture: user.picture, provider: 'google' },
          token: tokens?.access_token || `google-${user.id}`,
          googleAccessToken: tokens?.access_token || null,
          googleTokenExpiry: tokens?.expiry_date || (Date.now() + GOOGLE_TOKEN_TTL),
          googleConnected: !!tokens?.access_token,
          isAuthenticated: true, isLoading: false, isDemo: false, error: null,
        })
        // Clear any previous user's / demo data before loading this account's.
        clearAllStores()
        loadUserDataIntoStores(user.id)
        navigate('/home', { replace: true })
        return
      } catch {
        navigate('/login?error=auth_failed')
        return
      }
    }

    // ── Path A: Supabase Google OAuth (provider_token on the session) ──
    if (!isSupabaseConfigured() || !supabase) {
      navigate('/login')
      return
    }
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session) {
        navigate('/login?error=auth_failed')
        return
      }
      const user = supabaseUserToShiori(session.user)
      const patch = {
        user, token: session.access_token,
        isAuthenticated: true, isLoading: false, isDemo: false, error: null,
      }
      if (session.provider_token) {
        patch.googleAccessToken = session.provider_token
        patch.googleTokenExpiry = Date.now() + GOOGLE_TOKEN_TTL
        patch.googleConnected = true
      }
      useAuthStore.setState(patch)
      // Clear any previous user's / demo data before loading this account's.
      clearAllStores()
      await loadUserDataIntoStores(user.id)
      navigate('/home', { replace: true })
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#10141a', color: '#dfe2eb', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>栞</div>
        <div>Signing you in…</div>
      </div>
    </div>
  )
}
