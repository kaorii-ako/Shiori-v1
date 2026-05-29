import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shiori-auth')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const auth = {
  register: (userData) => api.post('/auth/local/register', userData),
  login: (email, password) => api.post('/auth/local/login', { email, password }),
  logout: () => api.post('/auth/local/logout'),
  verify: () => api.get('/auth/local/verify')
}

export const googleAuth = {
  initiate: () => api.get('/auth/google'),
  callback: (code) => api.post('/auth/google/callback', { code }),
  disconnect: () => api.post('/auth/disconnect'),
  status: () => api.get('/auth/status')
}

export const classroom = {
  getCourses: () => api.get('/classroom/courses'),
  getCourseWork: (courseId) => api.get(`/classroom/courses/${courseId}/course-work`),
  getSubmissions: (courseId, courseWorkId) => api.get(`/classroom/courses/${courseId}/course-work/${courseWorkId}/submissions`),
  getAllAssignments: () => api.get('/classroom/assignments')
}

export const gmail = {
  getMessages: (query = '') => api.get(`/gmail/messages${query ? `?q=${query}` : ''}`),
  getUnread: () => api.get('/gmail/unread')
}

export const calendar = {
  getEvents: (timeMin, timeMax) => api.get(`/calendar/events?timeMin=${timeMin}&timeMax=${timeMax}`),
  createEvent: (event) => api.post('/calendar/events', event),
  deleteEvent: (eventId) => api.delete(`/calendar/events/${eventId}`)
}

export const grades = {
  get: () => api.get('/grades'),
  save: (gradeData) => api.post('/grades', gradeData),
  calculate: (courseId, grades) => api.post('/grades/calculate', { courseId, grades })
}

export const ai = {
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  generateStudyPlan: (assignments, preferences) => api.post('/ai/study-plan', { assignments, preferences }),
  generateFlashcards: (content, title) => api.post('/ai/flashcards', { content, title })
}

// Appwrite sync endpoints
export const appwrite = {
  sync: (studentId) => api.get(`/appwrite/sync/${studentId}`),
  getAssignments: (studentId) => api.get(`/appwrite/assignments/${studentId}`),
  createAssignment: (data) => api.post('/appwrite/assignments', data),
  updateAssignment: (id, data) => api.put(`/appwrite/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/appwrite/assignments/${id}`),
  getCourses: (studentId) => api.get(`/appwrite/courses/${studentId}`),
  createCourse: (data) => api.post('/appwrite/courses', data),
  getGrades: (studentId, courseId) => api.get(`/appwrite/grades/${studentId}${courseId ? `?courseId=${courseId}` : ''}`),
  saveGrade: (data) => api.post('/appwrite/grades', data),
  getEvents: (studentId, timeMin, timeMax) => api.get(`/appwrite/events/${studentId}${timeMin ? `?timeMin=${timeMin}&timeMax=${timeMax}` : ''}`),
  createEvent: (data) => api.post('/appwrite/events', data),
  updateEvent: (id, data) => api.put(`/appwrite/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/appwrite/events/${id}`),
  saveStudyPlan: (studentId, planData) => api.post('/appwrite/study-plans', { studentId, ...planData }),
  getStudyPlans: (studentId) => api.get(`/appwrite/study-plans/${studentId}`)
}

export default api
