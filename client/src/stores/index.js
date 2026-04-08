import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth as authAPI } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      googleConnected: false,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, error: null, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setGoogleConnected: (connected) => set({ googleConnected: connected }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.login(email, password)
          const { user, token } = response.data
          set({ user, token, isAuthenticated: true, isLoading: false, error: null })
          return user
        } catch (error) {
          const message = error.response?.data?.error || 'Login failed'
          set({ isLoading: false, error: message })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.register(userData)
          const { user, token } = response.data
          set({ user, token, isAuthenticated: true, isLoading: false, error: null })
          return user
        } catch (error) {
          const message = error.response?.data?.error || 'Registration failed'
          set({ isLoading: false, error: message })
          throw error
        }
      },

      logout: () => {
        authAPI.logout().catch(() => {})
        set({ user: null, token: null, isAuthenticated: false, googleConnected: false, error: null })
      }
    }),
    {
      name: 'shiori-auth'
    }
  )
)

export const useEventStore = create((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),

  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: Date.now().toString() }]
  })),

  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e))
  })),

  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),

  getUpcomingEvents: () => {
    const { events } = get()
    const now = new Date()

    return events
      .map((event) => {
        const eventDate = new Date(event.date)
        const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24))
        return { ...event, daysUntil }
      })
      .filter((event) => event.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5)
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))

export const useAssignmentsStore = create((set, get) => ({
  assignments: [],
  courses: [],
  isLoading: false,
  error: null,
  filter: {
    course: 'all',
    status: 'all',
    search: ''
  },

  setAssignments: (assignments) => set({ assignments }),
  setCourses: (courses) => set({ courses }),

  addAssignment: (assignment) => set((state) => ({
    assignments: [...state.assignments, assignment]
  })),

  updateAssignment: (id, updates) => set((state) => ({
    assignments: state.assignments.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    )
  })),

  setGrade: (assignmentId, grade) => set((state) => ({
    assignments: state.assignments.map((a) =>
      a.id === assignmentId ? { ...a, grade, status: 'graded' } : a
    )
  })),

  setFilter: (filterUpdates) => set((state) => ({
    filter: { ...state.filter, ...filterUpdates }
  })),

  getFilteredAssignments: () => {
    const { assignments, filter } = get()
    return assignments.filter((a) => {
      if (filter.course !== 'all' && a.courseId !== filter.course) return false
      if (filter.status !== 'all' && a.status !== filter.status) return false
      if (filter.search && !a.title.toLowerCase().includes(filter.search.toLowerCase())) return false
      return true
    })
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))

export const useGradesStore = create((set, get) => ({
  courseGrades: {},
  isLoading: false,

  setCourseGrades: (courseId, grades) => set((state) => ({
    courseGrades: { ...state.courseGrades, [courseId]: grades }
  })),

  addGrade: (courseId, assignmentId, grade) => set((state) => ({
    courseGrades: {
      ...state.courseGrades,
      [courseId]: {
        ...state.courseGrades[courseId],
        [assignmentId]: grade
      }
    }
  })),

  calculateCourseGrade: (courseId) => {
    const { courseGrades } = get()
    const grades = courseGrades[courseId]
    if (!grades) return null

    const entries = Object.values(grades)
    if (entries.length === 0) return null

    const totalEarned = entries.reduce((sum, g) => sum + (g.pointsEarned || 0), 0)
    const totalPossible = entries.reduce((sum, g) => sum + (g.pointsPossible || 0), 0)

    if (totalPossible === 0) return null

    const percentage = (totalEarned / totalPossible) * 100
    let letterGrade = 'F'
    if (percentage >= 93) letterGrade = 'A'
    else if (percentage >= 90) letterGrade = 'A-'
    else if (percentage >= 87) letterGrade = 'B+'
    else if (percentage >= 83) letterGrade = 'B'
    else if (percentage >= 80) letterGrade = 'B-'
    else if (percentage >= 77) letterGrade = 'C+'
    else if (percentage >= 73) letterGrade = 'C'
    else if (percentage >= 70) letterGrade = 'C-'
    else if (percentage >= 67) letterGrade = 'D+'
    else if (percentage >= 63) letterGrade = 'D'
    else if (percentage >= 60) letterGrade = 'D-'

    return {
      percentage: percentage.toFixed(1),
      letterGrade,
      totalEarned,
      totalPossible
    }
  },

  setLoading: (loading) => set({ isLoading: loading })
}))

export const useCalendarStore = create((set, get) => ({
  events: [],
  isLoading: false,

  setEvents: (events) => set({ events }),

  addEvent: (event) => set((state) => ({
    events: [...state.events, event]
  })),

  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e))
  })),

  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),

  setLoading: (loading) => set({ isLoading: loading })
}))

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  aiChatOpen: false,
  activeModal: null,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleAIChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),
  setActiveModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, 5000)
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}))
