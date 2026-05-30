import express from 'express'
import { getAuthUrl, handleCallback, disconnect, isAuthenticated, initOAuth } from '../services/google.js'

const router = express.Router()

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google', async (req, res) => {
  try {
    initOAuth()
    const url = getAuthUrl()
    res.redirect(url)
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    res.status(500).json({ error: 'Failed to initiate Google OAuth' })
  }
})

router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ error: 'Authorization code required' })
    const result = await handleCallback(code)
    res.json({
      success: true,
      user: { id: result.user.id, email: result.user.email, name: result.user.name, picture: result.user.picture }
    })
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    res.status(500).json({ error: 'Failed to complete Google OAuth flow' })
  }
})

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────

router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) return res.status(500).json({ error: 'GitHub OAuth not configured. Add GITHUB_CLIENT_ID to environment.' })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: process.env.GITHUB_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/github/callback`,
    scope: 'user:email read:user',
    state: Math.random().toString(36).slice(2),
  })

  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

router.get('/github/callback', async (req, res) => {
  const { code, error: oauthError } = req.query
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  if (oauthError) {
    return res.redirect(`${clientUrl}/login?error=github_denied`)
  }

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=github_no_code`)
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/github/callback`,
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData)
      return res.redirect(`${clientUrl}/login?error=github_token_failed`)
    }

    // Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json' },
    })
    const ghUser = await userRes.json()

    // Fetch primary email if not public
    let email = ghUser.email
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json' },
      })
      const emails = await emailsRes.json()
      const primary = emails.find(e => e.primary && e.verified)
      email = primary?.email || emails[0]?.email || null
    }

    const user = {
      id: `github_${ghUser.id}`,
      name: ghUser.name || ghUser.login,
      email,
      picture: ghUser.avatar_url,
      username: ghUser.login,
      provider: 'github',
    }

    // Encode user + token in base64 for client callback
    const payload = Buffer.from(JSON.stringify({ user, tokens: { access_token: tokenData.access_token } })).toString('base64url')
    res.redirect(`${clientUrl}/auth/callback?data=${payload}`)
  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    res.redirect(`${clientUrl}/login?error=github_failed`)
  }
})

// ─── Status / Disconnect ──────────────────────────────────────────────────────

router.get('/status', (req, res) => {
  try {
    const authenticated = isAuthenticated()
    res.json({ authenticated, user: authenticated ? { id: 'user-1', name: 'Student User', email: 'student@school.edu', picture: null } : null })
  } catch (error) {
    res.status(500).json({ error: 'Failed to check auth status' })
  }
})

router.post('/disconnect', (req, res) => {
  try {
    disconnect()
    res.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    res.status(500).json({ error: 'Failed to disconnect' })
  }
})

export default router
