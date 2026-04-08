import { useCallback, useEffect } from 'react'
import { useEventStore } from '../stores'
import { appwriteService } from '../services/appwrite'
import { useAuthStore } from '../stores'

export const useEvents = () => {
  const {
    events,
    isLoading,
    error,
    setEvents,
    addEvent: storeAddEvent,
    updateEvent: storeUpdateEvent,
    deleteEvent: storeDeleteEvent,
    getUpcomingEvents,
    setLoading,
    setError
  } = useEventStore()

  const { user } = useAuthStore()

  // Load events from Appwrite on mount or user change
  useEffect(() => {
    if (user?.id) {
      loadEvents()
    }
  }, [user?.id])

  const loadEvents = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const appwriteEvents = await appwriteService.getEvents(user.id)
      // Transform Appwrite events to store format
      const transformedEvents = appwriteEvents.map(event => ({
        id: event.$id,
        title: event.eventName,
        date: event.eventDate,
        userId: event.userId
      }))
      setEvents(transformedEvents)
    } catch (err) {
      console.error('Failed to load events from Appwrite:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, setEvents, setLoading, setError])

  const addEvent = useCallback(async (eventData) => {
    if (!user?.id) {
      // Use local-only if not authenticated
      storeAddEvent({
        ...eventData,
        id: crypto.randomUUID()
      })
      return
    }

    setLoading(true)
    try {
      const appwriteEvent = await appwriteService.createEvent({
        userId: user.id,
        eventName: eventData.title,
        eventDate: eventData.date
      })

      // Add to local store with the Appwrite ID
      storeAddEvent({
        ...eventData,
        id: appwriteEvent.$id,
        userId: user.id
      })
    } catch (err) {
      console.error('Failed to create event in Appwrite:', err)
      // Still add locally even if Appwrite fails
      storeAddEvent({
        ...eventData,
        id: crypto.randomUUID()
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, storeAddEvent, setLoading])

  const updateEvent = useCallback(async (eventId, eventData) => {
    if (!user?.id) return

    try {
      await appwriteService.updateEvent(eventId, {
        eventName: eventData.title,
        eventDate: eventData.date
      })
      storeUpdateEvent(eventId, eventData)
    } catch (err) {
      console.error('Failed to update event in Appwrite:', err)
      storeUpdateEvent(eventId, eventData)
    }
  }, [user?.id, storeUpdateEvent])

  const deleteEvent = useCallback(async (eventId) => {
    if (!user?.id) return

    try {
      await appwriteService.deleteEvent(eventId)
    } catch (err) {
      console.error('Failed to delete event from Appwrite:', err)
    }
    // Always delete from local store
    storeDeleteEvent(eventId)
  }, [user?.id, storeDeleteEvent])

  return {
    events,
    isLoading,
    error,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents
  }
}

export default useEvents
