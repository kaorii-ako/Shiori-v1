import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth as authAPI } from '../lib/api'
import { account } from '../lib/appwrite'
import { DEMO_USER } from '../utils/demoData'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      googleConnected: false,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isDemo: false,

      setUser: (user) => set({ user, error: null, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setGoogleConnected: (connected) => set({ googleConnected: connected }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      enterDemoMode: () => {
        set({
          user: DEMO_USER,
          token: 'demo-token',
          isAuthenticated: true,
          isDemo: true,
          isLoading: false,
          error: null,
          googleConnected: false
        })
      },

      exitDemoMode: () => {
        set({ user: null, token: null, isAuthenticated: false, isDemo: false, error: null })
      },

      loginWithGitHub: () => {
        const origin = window.location.origin
        account.createOAuth2Session(
          'github',
          `${origin}/auth/callback?provider=github`,
          `${origin}/login?error=github_failed`
        )
      },

      loginWithAppwriteSession: async () => {
        try {
          const appwriteUser = await account.get()
          const user = {
            id: appwriteUser.$id,
            name: appwriteUser.name,
            email: appwriteUser.email,
            picture: null,
            provider: 'github',
          }
          set({ user, token: appwriteUser.$id, isAuthenticated: true, isDemo: false, isLoading: false, error: null })
          return user
        } catch {
          set({ isLoading: false, error: 'Session not found' })
          throw new Error('No active Appwrite session')
        }
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.login(email, password)
          const { user, token } = response.data
          set({ user, token, isAuthenticated: true, isLoading: false, error: null, isDemo: false })
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
          set({ user, token, isAuthenticated: true, isLoading: false, error: null, isDemo: false })
          return user
        } catch (error) {
          const message = error.response?.data?.error || 'Registration failed'
          set({ isLoading: false, error: message })
          throw error
        }
      },

      logout: () => {
        const { isDemo } = get()
        if (!isDemo) authAPI.logout().catch(() => {})
        set({ user: null, token: null, isAuthenticated: false, googleConnected: false, error: null, isDemo: false })
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

const LETTER_GRADE = (pct) => {
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  if (pct >= 70) return 'C-'
  if (pct >= 67) return 'D+'
  if (pct >= 63) return 'D'
  if (pct >= 60) return 'D-'
  return 'F'
}

export const useGradesStore = create(
  persist(
    (set, get) => ({
      courseGrades: {},
      courseWeights: {},
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

      removeGrade: (courseId, assignmentId) => set((state) => {
        const updated = { ...state.courseGrades[courseId] }
        delete updated[assignmentId]
        return { courseGrades: { ...state.courseGrades, [courseId]: updated } }
      }),

      setCourseWeights: (courseId, categories) => set((state) => ({
        courseWeights: { ...state.courseWeights, [courseId]: categories }
      })),

      calculateCourseGrade: (courseId) => {
        const { courseGrades, courseWeights } = get()
        const grades = courseGrades[courseId]
        if (!grades) return null

        const entries = Object.values(grades)
        if (entries.length === 0) return null

        const weights = courseWeights[courseId]

        if (weights && weights.length > 0) {
          const totalWeight = weights.reduce((s, w) => s + w.weight, 0)
          if (totalWeight === 0) return null

          let weightedSum = 0
          let weightedTotal = 0

          weights.forEach(cat => {
            const catGrades = entries.filter(g => g.categoryId === cat.id)
            if (catGrades.length === 0) return
            const earned = catGrades.reduce((s, g) => s + (g.pointsEarned || 0), 0)
            const possible = catGrades.reduce((s, g) => s + (g.pointsPossible || 0), 0)
            if (possible === 0) return
            const catPct = (earned / possible) * 100
            weightedSum += catPct * (cat.weight / totalWeight)
            weightedTotal += cat.weight / totalWeight
          })

          const uncategorized = entries.filter(g => !g.categoryId || !weights.find(w => w.id === g.categoryId))
          if (uncategorized.length > 0) {
            const earned = uncategorized.reduce((s, g) => s + (g.pointsEarned || 0), 0)
            const possible = uncategorized.reduce((s, g) => s + (g.pointsPossible || 0), 0)
            if (possible > 0) {
              weightedSum += (earned / possible) * 100 * (1 - weightedTotal)
              weightedTotal = 1
            }
          }

          if (weightedTotal === 0) return null
          const percentage = weightedSum / weightedTotal
          return {
            percentage: percentage.toFixed(1),
            letterGrade: LETTER_GRADE(percentage),
            isWeighted: true,
          }
        }

        const totalEarned = entries.reduce((sum, g) => sum + (g.pointsEarned || 0), 0)
        const totalPossible = entries.reduce((sum, g) => sum + (g.pointsPossible || 0), 0)
        if (totalPossible === 0) return null
        const percentage = (totalEarned / totalPossible) * 100
        return {
          percentage: percentage.toFixed(1),
          letterGrade: LETTER_GRADE(percentage),
          totalEarned,
          totalPossible,
          isWeighted: false,
        }
      },

      setLoading: (loading) => set({ isLoading: loading })
    }),
    { name: 'shiori-grades' }
  )
)

export const useFlashcardsStore = create(
  persist(
    (set) => ({
      decks: [],

      addDeck: (deck) => {
        const id = `deck-${Date.now()}`
        set((state) => ({
          decks: [...state.decks, { ...deck, id, cards: [], createdAt: Date.now() }]
        }))
        return id
      },

      loadDeck: (deck) => set((state) => ({
        decks: [...state.decks, deck]
      })),

      deleteDeck: (id) => set((state) => ({
        decks: state.decks.filter(d => d.id !== id)
      })),

      addCard: (deckId, card) => set((state) => ({
        decks: state.decks.map(d =>
          d.id === deckId
            ? { ...d, cards: [...d.cards, { ...card, id: `card-${Date.now()}`, streak: 0, nextReview: null }] }
            : d
        )
      })),

      removeCard: (deckId, cardId) => set((state) => ({
        decks: state.decks.map(d =>
          d.id === deckId
            ? { ...d, cards: d.cards.filter(c => c.id !== cardId) }
            : d
        )
      })),

      updateCard: (deckId, cardId, updates) => set((state) => ({
        decks: state.decks.map(d =>
          d.id === deckId
            ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, ...updates } : c) }
            : d
        )
      })),
    }),
    { name: 'shiori-flashcards' }
  )
)

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note) => {
        const id = `note-${Date.now()}`
        set((state) => ({
          notes: [...state.notes, {
            ...note,
            id,
            title: note.title || '',
            content: note.content || '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            pinned: false,
          }]
        }))
        return id
      },

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
        )
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),

      pinNote: (id) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
      })),
    }),
    { name: 'shiori-notes' }
  )
)

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

export const usePomodoroStore = create(
  persist(
    (set, get) => ({
      isRunning: false,
      isBreak: false,
      secondsLeft: 25 * 60,
      workSeconds: 25 * 60,
      breakSeconds: 5 * 60,
      sessionCount: 0,
      activeAssignment: null,
      totalFocusMinutes: 0,

      setActiveAssignment: (assignment) => set({ activeAssignment: assignment }),

      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),

      reset: () => {
        const { isBreak, workSeconds, breakSeconds } = get()
        set({ secondsLeft: isBreak ? breakSeconds : workSeconds, isRunning: false })
      },

      tick: () => {
        const { secondsLeft, isBreak, workSeconds, breakSeconds, sessionCount, totalFocusMinutes } = get()
        if (secondsLeft <= 1) {
          if (!isBreak) {
            set({
              isBreak: true,
              secondsLeft: breakSeconds,
              isRunning: true,
              sessionCount: sessionCount + 1,
              totalFocusMinutes: totalFocusMinutes + Math.round(workSeconds / 60),
            })
          } else {
            set({ isBreak: false, secondsLeft: workSeconds, isRunning: false })
          }
        } else {
          set({ secondsLeft: secondsLeft - 1 })
        }
      },

      close: () => set({ isRunning: false, secondsLeft: 25 * 60, isBreak: false, activeAssignment: null }),
    }),
    { name: 'shiori-pomodoro' }
  )
)

export const useUIStore = create(
  persist(
    (set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  aiChatOpen: false,
  activeModal: null,
  toasts: [],
  geminiApiKey: '',
  theme: 'dark',
  pomodoroSound: true,
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setPomodoroSound: (val) => set({ pomodoroSound: val }),
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    return { theme: next }
  }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleSidebarMobile: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
  closeSidebarMobile: () => set({ sidebarMobileOpen: false }),
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
}),
    { name: 'shiori-ui' }
  )
)
