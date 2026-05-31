const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shiorii.tech'

export default async function handler(req, res) {
  const { code, error } = req.query

  if (error || !code) {
    return res.redirect(`${APP_URL}/login?error=oauth_cancelled`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return res.redirect(`${APP_URL}/login?error=oauth_not_configured`)
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${APP_URL}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()
    if (tokens.error) throw new Error(tokens.error_description || tokens.error)

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userRes.json()

    const payload = Buffer.from(JSON.stringify({
      user: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        isDemo: false,
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: Date.now() + (tokens.expires_in || 3600) * 1000,
      },
    })).toString('base64url')

    res.redirect(`${APP_URL}/auth/callback?data=${payload}`)
  } catch (err) {
    console.error('OAuth callback error:', err.message)
    res.redirect(`${APP_URL}/login?error=oauth_failed`)
  }
}
