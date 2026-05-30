const getAppUrl = (req) => {
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return host ? `${proto}://${host}` : 'http://localhost:5173'
}

export default function handler(req, res) {
  const appUrl = getAppUrl(req)
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return res.status(500).json({
      error: 'GitHub OAuth not configured.',
      setup: 'Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET. Create a GitHub OAuth App at https://github.com/settings/developers with callback URL: ' + appUrl + '/api/auth/github-callback'
    })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/github-callback`,
    scope: 'user:email read:user',
    state: Math.random().toString(36).slice(2),
  })

  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`)
}
