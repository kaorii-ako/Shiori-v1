# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.1.x   | ✅ Yes |
| 1.0.x   | ✅ Yes (security fixes only) |
| < 1.0   | ❌ No |

## Reporting a Vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Email: **79807@student.amnuaysilpa.ac.th**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix (if any)

**Response time**: We aim to acknowledge reports within 48 hours and resolve critical issues within 7 days.

## Security Notes

### Self-hosted deployments
- Credentials (Google OAuth tokens, Gemini API key) are stored in `.env` and never leave your server
- User data is stored in your own Appwrite instance — we have no access to it
- Refresh tokens are stored in Appwrite's encrypted database

### Shiori Cloud (coming in v2.0)
- All data encrypted at rest (AES-256)
- HTTPS enforced via Vercel
- OAuth tokens stored encrypted, never logged
- GDPR-compliant data deletion on request

## Known Scope

| Area | In Scope | Notes |
|------|----------|-------|
| Express API routes | ✅ | Authentication bypass, injection |
| Google OAuth flow | ✅ | Token leakage, redirect abuse |
| Appwrite integration | ✅ | Auth bypass |
| Client-side XSS | ✅ | React escapes by default, but report any bypasses |
| Demo mode data | ❌ | No real data, no security impact |
| Vercel infrastructure | ❌ | Report to Vercel directly |
