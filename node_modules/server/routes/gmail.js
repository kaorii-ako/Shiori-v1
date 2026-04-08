import express from 'express'
import { getGmail } from '../services/google.js'

const router = express.Router()

// Get messages (emails)
router.get('/messages', async (req, res) => {
  try {
    const { q } = req.query
    const gmail = getGmail()

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      q: q || 'from:teacher OR from:professor OR subject:classroom OR subject:assignment'
    })

    const messages = response.data.messages || []

    // Get full message details
    const detailedMessages = []
    for (const msg of messages.slice(0, 10)) {
      try {
        const msgResponse = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        })

        const headers = msgResponse.data.payload.headers
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value

        detailedMessages.push({
          id: msg.id,
          from: getHeader('from'),
          subject: getHeader('subject'),
          date: getHeader('date'),
          snippet: msgResponse.data.snippet
        })
      } catch (e) {
        console.error('Error fetching message details:', e.message)
      }
    }

    res.json(detailedMessages)
  } catch (error) {
    console.error('Error fetching emails:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json(getMockEmails())
    } else {
      res.status(500).json({ error: 'Failed to fetch emails' })
    }
  }
})

// Get unread count
router.get('/unread', async (req, res) => {
  try {
    const gmail = getGmail()

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      q: 'is:unread'
    })

    res.json({ count: response.data.resultSizeEstimate || 0 })
  } catch (error) {
    console.error('Error fetching unread count:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json({ count: 3 })
    } else {
      res.status(500).json({ error: 'Failed to fetch unread count' })
    }
  }
})

const getMockEmails = () => [
  {
    id: '1',
    from: 'Dr. Smith <drsmith@school.edu>',
    subject: 'Reminder: Biology Lab Tomorrow',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    snippet: 'Just a reminder that we have the cell biology lab tomorrow at 2pm...'
  },
  {
    id: '2',
    from: 'Google Classroom <noreply@classroom.google.com>',
    subject: 'New grade posted: Chemistry Quiz #3',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    snippet: 'Your teacher has posted a grade for Chemistry Quiz #3. You received 92/100...'
  },
  {
    id: '3',
    from: 'Prof. Johnson <pjohnson@school.edu>',
    subject: 'Office Hours Change',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    snippet: 'My office hours will be moved to Thursday this week due to a conference...'
  }
]

export default router
