import express from 'express'
import { getAuthUrl, handleCallback, disconnect, isAuthenticated, initOAuth } from '../services/google.js'

const router = express.Router()

// Initiate Google OAuth flow
router.get('/google', async (req, res) => {
  try {
    initOAuth()
    const url = getAuthUrl()
    console.log('Google OAuth URL generated:', url)
    // Redirect directly to Google
    res.redirect(url)
  } catch (error) {
    console.error('OAuth initiation error:', error)
    res.status(500).json({ error: 'Failed to initiate Google OAuth' })
  }
})

// Handle OAuth callback
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    const result = await handleCallback(code)
    res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        picture: result.user.picture
      }
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    res.status(500).json({ error: 'Failed to complete OAuth flow' })
  }
})

// Check authentication status
router.get('/status', (req, res) => {
  try {
    const authenticated = isAuthenticated()
    res.json({
      authenticated,
      user: authenticated ? {
        id: 'user-1',
        name: 'Student User',
        email: 'student@school.edu',
        picture: null
      } : null
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to check auth status' })
  }
})

// Disconnect Google account
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
