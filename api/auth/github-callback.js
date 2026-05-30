const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shiori-v1.vercel.app'

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query

  if (oauthError) {
    return res.redirect(`${APP_URL}/login?error=github_denied`)
  }

  if (!code) {
    return res.redirect(`${APP_URL}/login?error=github_no_code`)
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.redirect(`${APP_URL}/login?error=github_not_configured`)
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${APP_URL}/api/auth/github-callback`,
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData)
      return res.redirect(`${APP_URL}/login?error=github_token_failed`)
    }

    // Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    const ghUser = await userRes.json()

    // Get primary email if not public
    let email = ghUser.email
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      const emails = await emailsRes.json()
      const primary = Array.isArray(emails) && emails.find(e => e.primary && e.verified)
      email = primary?.email || (Array.isArray(emails) && emails[0]?.email) || null
    }

    const payload = Buffer.from(JSON.stringify({
      user: {
        id: `github_${ghUser.id}`,
        name: ghUser.name || ghUser.login,
        email,
        picture: ghUser.avatar_url,
        username: ghUser.login,
        provider: 'github',
        isDemo: false,
      },
      tokens: {
        access_token: tokenData.access_token,
      },
    })).toString('base64url')

    res.redirect(`${APP_URL}/auth/callback?data=${payload}`)
  } catch (err) {
    console.error('GitHub OAuth callback error:', err.message)
    res.redirect(`${APP_URL}/login?error=github_failed`)
  }
}
