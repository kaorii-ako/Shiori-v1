import express from 'express'
import { getCalendar } from '../services/google.js'

const router = express.Router()

// Get calendar events
router.get('/events', async (req, res) => {
  try {
    const { timeMin, timeMax } = req.query
    const calendar = getCalendar()

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100
    })

    const events = response.data.items || []

    const formatted = events.map(event => ({
      id: event.id,
      title: event.summary || 'No title',
      description: event.description || '',
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      type: categorizeEvent(event),
      source: 'calendar',
      location: event.location,
      link: event.htmlLink
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error fetching calendar events:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json(getMockEvents())
    } else {
      res.status(500).json({ error: 'Failed to fetch calendar events' })
    }
  }
})

// Create calendar event
router.post('/events', async (req, res) => {
  try {
    const calendar = getCalendar()
    const { title, description, start, end, type } = req.body

    const event = {
      summary: title,
      description,
      start: { dateTime: start },
      end: { dateTime: end || start },
      colorId: type === 'class' ? '1' : type === 'study' ? '2' : '7'
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    })

    res.json({
      id: response.data.id,
      title: response.data.summary,
      start: response.data.start.dateTime,
      end: response.data.end.dateTime,
      type,
      source: 'manual'
    })
  } catch (error) {
    console.error('Error creating calendar event:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json({
        id: Date.now().toString(),
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        type: req.body.type || 'personal',
        source: 'manual'
      })
    } else {
      res.status(500).json({ error: 'Failed to create event' })
    }
  }
})

// Delete calendar event
router.delete('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params
    const calendar = getCalendar()

    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar event:', error.message)

    if (error.message === 'Not authenticated with Google') {
      res.json({ success: true })
    } else {
      res.status(500).json({ error: 'Failed to delete event' })
    }
  }
})

const categorizeEvent = (event) => {
  const summary = (event.summary || '').toLowerCase()
  const description = (event.description || '').toLowerCase()

  if (summary.includes('class') || summary.includes('lecture') || summary.includes('period')) {
    return 'class'
  }
  if (summary.includes('study') || summary.includes('homework') || summary.includes('review')) {
    return 'study'
  }
  if (event.extendedProperties?.private?.type === 'study') {
    return 'study'
  }
  return 'personal'
}

const getMockEvents = () => {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  return [
    {
      id: '1',
      title: 'Biology 101',
      start: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      end: new Date(now + 3.5 * 60 * 60 * 1000).toISOString(),
      type: 'class',
      source: 'calendar'
    },
    {
      id: '2',
      title: 'Study: Chemistry',
      start: new Date(now + day + 4 * 60 * 60 * 1000).toISOString(),
      end: new Date(now + day + 5.5 * 60 * 60 * 1000).toISOString(),
      type: 'study',
      source: 'manual'
    },
    {
      id: '3',
      title: 'Math Homework Due',
      start: new Date(now + 2 * day).toISOString(),
      end: new Date(now + 2 * day).toISOString(),
      type: 'class',
      source: 'calendar'
    },
    {
      id: '4',
      title: 'Physics Lab',
      start: new Date(now + 3 * day + 2 * 60 * 60 * 1000).toISOString(),
      end: new Date(now + 3 * day + 4 * 60 * 60 * 1000).toISOString(),
      type: 'class',
      source: 'calendar'
    }
  ]
}

export default router
