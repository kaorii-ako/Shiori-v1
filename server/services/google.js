import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CREDENTIALS_PATH = path.join(__dirname, '../../.env')

// Load credentials from .env or use OAuth2 flow
let oauth2Client = null
let tokens = null

// Initialize OAuth2 client with credentials from env (lazy initialization)
export const initOAuth = () => {
  if (oauth2Client) return oauth2Client

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

  if (!clientId || !clientSecret) {
    console.warn('Google OAuth credentials not found in environment variables')
    return null
  }

  oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  // Try to load stored tokens
  const tokensPath = path.join(__dirname, '../../tokens.json')
  if (fs.existsSync(tokensPath)) {
    try {
      tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'))
      oauth2Client.setCredentials(tokens)
    } catch (e) {
      console.warn('Failed to load stored tokens')
    }
  }

  return oauth2Client
}

export const getAuthUrl = () => {
  if (!oauth2Client) {
    initOAuth()
  }

  const scopes = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.course-work.readonly',
    'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })
}

export const handleCallback = async (code) => {
  if (!oauth2Client) {
    initOAuth()
  }

  const { tokens: newTokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(newTokens)

  // Save tokens
  tokens = newTokens
  const tokensPath = path.join(__dirname, '../../tokens.json')
  fs.writeFileSync(tokensPath, JSON.stringify(tokens))

  // Get user info
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data: userInfo } = await oauth2.userinfo.get()

  return {
    tokens: newTokens,
    user: userInfo
  }
}

export const isAuthenticated = () => {
  return oauth2Client && tokens && !tokens.expiry_date || tokens.expiry_date > Date.now()
}

export const disconnect = () => {
  oauth2Client = null
  tokens = null
  const tokensPath = path.join(__dirname, '../../tokens.json')
  if (fs.existsSync(tokensPath)) {
    fs.unlinkSync(tokensPath)
  }
}

export const getClassroom = () => {
  if (!oauth2Client || !tokens) {
    throw new Error('Not authenticated with Google')
  }
  return google.classroom({ version: 'v1', auth: oauth2Client })
}

export const getGmail = () => {
  if (!oauth2Client || !tokens) {
    throw new Error('Not authenticated with Google')
  }
  return google.gmail({ version: 'v1', auth: oauth2Client })
}

export const getCalendar = () => {
  if (!oauth2Client || !tokens) {
    throw new Error('Not authenticated with Google')
  }
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Don't auto-initialize - let lazy init handle it when needed
