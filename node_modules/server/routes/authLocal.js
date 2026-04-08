import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { validateSignupData, validateEmail, validatePassword } from '../services/authService.js'

const router = express.Router()

// In-memory user storage (replace with database in production)
const users = new Map()
const tokens = new Map()

// Pre-populate with demo user
const demoUserId = 'demo-user-123'
users.set(demoUserId, {
  id: demoUserId,
  username: 'demo-user',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.com',
  password: 'DemoPass123!', // In production: hash this with bcrypt
  country: 'Philippines',
  createdAt: new Date().toISOString(),
  picture: null,
  provider: 'email'
})

// Helper to generate JWT-like token
const generateToken = (userId) => {
  const token = `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  tokens.set(token, userId)
  return token
}

// Helper to verify token
const verifyToken = (token) => {
  return tokens.has(token) ? tokens.get(token) : null
}

// Register endpoint
router.post('/register', (req, res) => {
  try {
    const { username, firstName, lastName, country, email, password } = req.body

    console.log('Registration request received:', {
      username, firstName, lastName, country, email,
      password: password ? '***' : 'MISSING'
    })

    // Validate input
    const validation = validateSignupData({
      username,
      firstName,
      lastName,
      country,
      email,
      password
    })

    if (!validation.isValid) {
      console.log('Validation failed:', validation.message)
      return res.status(400).json({ error: validation.message })
    }

    // Check if username already exists
    for (const user of users.values()) {
      if (user.username === username) {
        return res.status(409).json({ error: 'Username already taken' })
      }
    }

    // Check if email already exists
    for (const user of users.values()) {
      if (user.email === email) {
        return res.status(409).json({ error: 'Email already registered' })
      }
    }

    // Create new user
    const userId = uuidv4()
    const newUser = {
      id: userId,
      username,
      firstName,
      lastName,
      email,
      password, // Store plaintext for demo (use bcrypt in production)
      country,
      createdAt: new Date().toISOString(),
      picture: null,
      provider: 'email'
    }

    users.set(userId, newUser)

    // Generate token
    const token = generateToken(userId)

    // Return user and token (excluding sensitive info)
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        country: newUser.country
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.message })
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Find user by email
    let user = null
    for (const u of users.values()) {
      if (u.email === email && u.provider === 'email') {
        user = u
        break
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password match (simple comparison for demo)
    // TODO: In production, use bcrypt.compare() for hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken(user.id)

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const userId = verifyToken(token)

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const user = users.get(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country
      }
    })
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (token) {
      tokens.delete(token)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

export default router
