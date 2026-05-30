import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load .env FIRST, before any other imports
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

import authRoutes from './routes/auth.js'
import authLocalRoutes from './routes/authLocal.js'
import classroomRoutes from './routes/classroom.js'
import gmailRoutes from './routes/gmail.js'
import calendarRoutes from './routes/calendar.js'
import gradesRoutes from './routes/grades.js'
import aiRoutes from './routes/ai.js'
import appwriteRoutes from './routes/appwrite.js'
import stripeRoutes from './routes/stripe.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/auth/local', authLocalRoutes)
app.use('/api/classroom', classroomRoutes)
app.use('/api/gmail', gmailRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/grades', gradesRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/appwrite', appwriteRoutes)
app.use('/api', stripeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Shiori server running on http://localhost:${PORT}`)
})
