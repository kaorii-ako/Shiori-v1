import { Client, ID, Databases, Query } from 'appwrite'
import { client } from '../lib/appwrite'

const databases = new Databases(client)

const DATABASE_ID = 'shiori_db'
const USERS_COLLECTION = 'users'
const EVENTS_COLLECTION = 'events'

class AppwriteService {
  // User operations
  async createUser(userData) {
    const { userId, username, firstName, lastName, country, timezone, email } = userData
    return databases.createDocument(DATABASE_ID, USERS_COLLECTION, userId, {
      userId,
      username,
      firstName,
      lastName,
      country,
      timezone,
      email,
      createdAt: new Date().toISOString()
    })
  }

  async getUser(userId) {
    return databases.getDocument(DATABASE_ID, USERS_COLLECTION, userId)
  }

  async getUserByEmail(email) {
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION, [
      Query.equal('email', email),
      Query.limit(1)
    ])
    return response.documents[0] || null
  }

  async updateUser(userId, userData) {
    return databases.updateDocument(DATABASE_ID, USERS_COLLECTION, userId, {
      ...userData,
      updatedAt: new Date().toISOString()
    })
  }

  // Event operations
  async createEvent(eventData) {
    const { userId, eventName, eventDate } = eventData
    return databases.createDocument(DATABASE_ID, EVENTS_COLLECTION, ID.unique(), {
      userId,
      eventName,
      eventDate,
      createdAt: new Date().toISOString()
    })
  }

  async getEvents(userId) {
    const response = await databases.listDocuments(DATABASE_ID, EVENTS_COLLECTION, [
      Query.equal('userId', userId),
      Query.orderDesc('eventDate')
    ])
    return response.documents
  }

  async updateEvent(eventId, eventData) {
    return databases.updateDocument(DATABASE_ID, EVENTS_COLLECTION, eventId, {
      ...eventData,
      updatedAt: new Date().toISOString()
    })
  }

  async deleteEvent(eventId) {
    return databases.deleteDocument(DATABASE_ID, EVENTS_COLLECTION, eventId)
  }

  async getUpcomingEvents(userId, limit = 5) {
    const now = new Date().toISOString()
    const response = await databases.listDocuments(DATABASE_ID, EVENTS_COLLECTION, [
      Query.equal('userId', userId),
      Query.greaterThanEqual('eventDate', now),
      Query.orderAsc('eventDate'),
      Query.limit(limit)
    ])
    return response.documents
  }
}

export const appwriteService = new AppwriteService()
export default appwriteService
