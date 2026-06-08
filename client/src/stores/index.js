import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  loadAllUserData,
  saveCourse, deleteCourse as dbDeleteCourse,
  saveAssignment, deleteAssignment as dbDeleteAssignment,
  saveNote, deleteNote as dbDeleteNote,
  saveDeck, deleteDeck as dbDeleteDeck,
  saveEvent, deleteEvent as dbDeleteEvent,
  saveHabit, deleteHabit as dbDeleteHabit,
  saveStudyPlan, deleteStudyPlan as dbDeleteStudyPlan,
} from '../lib/db'
import { DEMO_USER } from '../utils/demoData'
import { fetchClassroomData, ClassroomAuthError } from '../lib/classroom'

// Google access tokens last ~1h; store a slightly conservative expiry so we
// prompt a reconnect a little early rather than fire a request that 401s.
export const GOOGLE_TOKEN_TTL = 55 * 60 * 1000

// Collision-resistant id (timestamp + randomness) so two tabs/devices creating
// items in the same millisecond don't generate the same id and overwrite in sync.
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

// Google Classroom STUDENT scopes — view my courses, my coursework, my grades.
const GOOGLE_CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
].join(' ')

function supabaseUserToShiori(sbUser) {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Student',
    email: sbUser.email,
    picture: sbUser.user_metadata?.avatar_url || null,
    provider: sbUser.app_metadata?.provider || 'email',
  }
}

// ── Local account auth (no-backend fallback) ──────────────────

const LOCAL_ACCOUNTS_KEY = 'shiori-local-accounts'

function getLocalAccounts() {
  try { return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '{}') } catch { return {} }
}

function saveLocalAccounts(accounts) {
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts))
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password + 'shiori-local-2024')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const getUid = () => useAuthStore.getState().user?.id
const isDemoMode = () => useAuthStore.getState().isDemo

// ── Auth ──────────────────────────────────────────────────────

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      googleConnected: false,
      googleAccessToken: null,   // Google OAuth access token (for Classroom REST)
      googleTokenExpiry: null,   // epoch ms when the Google token stops working
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isDemo: false,
      _hasHydrated: false,

      setUser: (user) => set({ user, error: null, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setGoogleConnected: (connected) => set({ googleConnected: connected }),

      // Store/clear the Google access token used for Classroom sync.
      setGoogleAuth: ({ accessToken, expiry }) => set({
        googleAccessToken: accessToken,
        googleTokenExpiry: expiry,
        googleConnected: !!accessToken,
      }),
      clearGoogleAuth: () => set({ googleAccessToken: null, googleTokenExpiry: null, googleConnected: false }),
      isGoogleConnected: () => {
        const { googleAccessToken, googleTokenExpiry } = get()
        return !!googleAccessToken && (!googleTokenExpiry || Date.now() < googleTokenExpiry)
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setHasHydrated: (state) => { set({ _hasHydrated: state }) },

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

      loginWithGitHub: async () => {
        if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
          })
          if (error) { set({ error: error.message }); throw new Error(error.message) }
        } else {
          const msg = 'GitHub sign-in isn’t set up. Add your Supabase keys (see SETUP.md) to enable it.'
          set({ error: msg }); throw new Error(msg)
        }
      },

      loginWithGoogle: async () => {
        if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              scopes: GOOGLE_CLASSROOM_SCOPES,
              // offline + consent so Google returns a usable provider_token.
              queryParams: { access_type: 'offline', prompt: 'consent' },
            },
          })
          if (error) { set({ error: error.message }); throw new Error(error.message) }
        } else {
          // Not configured yet — surface a clear, actionable error instead of
          // silently redirecting to a dead endpoint.
          const msg = 'Google sign-in needs a quick one-time setup. Add your Supabase keys (see SETUP.md) to enable Google + Classroom.'
          set({ error: msg }); throw new Error(msg)
        }
      },

      restoreSession: async () => {
        if (!isSupabaseConfigured() || !supabase) return null
        set({ isLoading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const user = supabaseUserToShiori(session.user)
            const patch = { user, token: session.access_token, isAuthenticated: true, isLoading: false, isDemo: false }
            // provider_token is usually only present right after OAuth; if it's
            // here, refresh our stored Google token. Otherwise keep the persisted one.
            if (session.provider_token) {
              patch.googleAccessToken = session.provider_token
              patch.googleTokenExpiry = Date.now() + GOOGLE_TOKEN_TTL
              patch.googleConnected = true
            }
            set(patch)
            loadUserDataIntoStores(user.id)
            return user
          }
          // No valid Supabase session. If we were showing a real (non-demo) user
          // from stale persisted state, clear it so guarded routes redirect to login.
          if (!get().isDemo) {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
        return null
      },

      loadData: async (userId) => {
        return loadUserDataIntoStores(userId)
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            const user = supabaseUserToShiori(data.user)
            set({ user, token: data.session.access_token, isAuthenticated: true, isLoading: false, error: null, isDemo: false })
            clearAllStores()
            loadUserDataIntoStores(user.id)
            return user
          }
          // Local account fallback
          const accounts = getLocalAccounts()
          const account = accounts[email.toLowerCase()]
          if (!account) throw new Error('No account found with this email. Please sign up first.')
          const hash = await hashPassword(password)
          if (hash !== account.passwordHash) throw new Error('Incorrect password.')
          const { isDemo } = get()
          if (isDemo) clearAllStores()
          const user = { id: account.id, name: account.name, email: account.email, provider: 'local' }
          set({ user, token: `local-${account.id}`, isAuthenticated: true, isLoading: false, error: null, isDemo: false })
          return user
        } catch (err) {
          const message = err?.message || 'Login failed. Check your email and password.'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      signupWithEmail: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.auth.signUp({
              email, password,
              options: { data: { full_name: name } }
            })
            if (error) throw error
            if (data.user && data.session) {
              const user = supabaseUserToShiori(data.user)
              set({ user, token: data.session.access_token, isAuthenticated: true, isLoading: false, error: null, isDemo: false })
              return user
            }
            set({ isLoading: false, error: 'Check your email to confirm your account.' })
            return null
          }
          // Local account fallback
          const accounts = getLocalAccounts()
          if (accounts[email.toLowerCase()]) throw new Error('An account with this email already exists.')
          const id = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
          const passwordHash = await hashPassword(password)
          accounts[email.toLowerCase()] = { id, name, email: email.toLowerCase(), passwordHash }
          saveLocalAccounts(accounts)
          const { isDemo } = get()
          if (isDemo) clearAllStores()
          const user = { id, name, email, provider: 'local' }
          set({ user, token: `local-${id}`, isAuthenticated: true, isLoading: false, error: null, isDemo: false })
          return user
        } catch (err) {
          const message = err?.message || 'Sign up failed. Email may already be in use.'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      logout: async () => {
        const { isDemo, googleAccessToken } = get()
        if (!isDemo && isSupabaseConfigured() && supabase) {
          try { await supabase.auth.signOut() } catch {}
          // Best-effort revoke of the Google token so it can't be reused after
          // signing out on a shared device. Failures (already expired) are fine.
          if (googleAccessToken) {
            try {
              await fetch('https://oauth2.googleapis.com/revoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ token: googleAccessToken }).toString(),
              })
            } catch {}
          }
        }
        set({
          user: null, token: null, isAuthenticated: false, googleConnected: false,
          googleAccessToken: null, googleTokenExpiry: null, error: null, isDemo: false,
        })
        clearAllStores()
      },
    }),
    {
      name: 'shiori-auth',
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true) },
    }
  )
)

// ── Auth sync ─────────────────────────────────────────────────
// Validate the persisted session against Supabase on load and keep zustand in
// sync with real-time auth events (token refresh, cross-tab sign-out). Called
// once from App. Without this, a reload trusts only localStorage — so a session
// revoked elsewhere would still look "logged in" until an API call failed.
let _authSyncStarted = false
export function initAuthSync() {
  if (_authSyncStarted) return
  _authSyncStarted = true
  if (!isSupabaseConfigured() || !supabase) return
  useAuthStore.getState().restoreSession()
  supabase.auth.onAuthStateChange((event, session) => {
    if (useAuthStore.getState().isDemo) return
    if (event === 'SIGNED_OUT') {
      useAuthStore.setState({
        user: null, token: null, isAuthenticated: false,
        googleConnected: false, googleAccessToken: null, googleTokenExpiry: null,
      })
      clearAllStores()
      return
    }
    if (session?.user) {
      const user = supabaseUserToShiori(session.user)
      const patch = { user, token: session.access_token, isAuthenticated: true, isDemo: false }
      // Only refresh the Google token when a fresh provider_token is present;
      // otherwise keep the one we already persisted.
      if (session.provider_token) {
        patch.googleAccessToken = session.provider_token
        patch.googleTokenExpiry = Date.now() + GOOGLE_TOKEN_TTL
        patch.googleConnected = true
      }
      useAuthStore.setState(patch)
    }
  })
}

// ── Events ────────────────────────────────────────────────────

export const useEventStore = create(
  persist(
    (set, get) => ({
      events: [],
      isLoading: false,
      error: null,

      setEvents: (events) => set({ events }),
      clearEvents: () => set({ events: [] }),

      addEvent: (event) => {
        const newEvent = { ...event, id: event.id || newId('evt') }
        set((state) => ({ events: [...state.events, newEvent] }))
        const uid = getUid()
        if (uid && !isDemoMode()) saveEvent(uid, newEvent)
      },

      updateEvent: (id, updates) => {
        set((state) => ({ events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)) }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const event = get().events.find(e => e.id === id)
          if (event) saveEvent(uid, event)
        }
      },

      deleteEvent: (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }))
        if (!isDemoMode()) dbDeleteEvent(id)
      },

      getUpcomingEvents: () => {
        const { events } = get()
        const now = new Date()
        return events
          .map((event) => {
            const eventDate = new Date(event.date || event.start)
            const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24))
            return { ...event, daysUntil }
          })
          .filter((event) => event.daysUntil >= 0)
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 5)
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error })
    }),
    { name: 'shiori-events' }
  )
)

// ── Assignments ───────────────────────────────────────────────

export const useAssignmentsStore = create(
  persist(
    (set, get) => ({
      assignments: [],
      courses: [],
      isLoading: false,
      error: null,
      filter: { course: 'all', status: 'all', search: '' },
      syncing: false,
      syncError: null,
      lastSynced: null,

      // ── Google Classroom import ──────────────────────────────────────────
      // Pulls the signed-in student's courses, coursework and grades and merges
      // them in. Idempotent: re-running updates existing items (matched by id)
      // and never duplicates. Manual completions are preserved.
      syncClassroom: async () => {
        const auth = useAuthStore.getState()
        if (!auth.isGoogleConnected()) {
          set({ syncError: 'EXPIRED' })
          throw new ClassroomAuthError()
        }
        set({ syncing: true, syncError: null })
        try {
          const { courses, assignments } = await fetchClassroomData(auth.googleAccessToken)

          const state = get()
          const courseMap = new Map(state.courses.map(c => [c.id, c]))
          courses.forEach(c => courseMap.set(c.id, { ...courseMap.get(c.id), ...c }))

          const aMap = new Map(state.assignments.map(a => [a.id, a]))
          assignments.forEach(a => {
            const prev = aMap.get(a.id)
            // Keep a manual "done" check even if Classroom still shows it open.
            aMap.set(a.id, { ...prev, ...a, completed: prev?.completed || a.completed })
          })

          set({
            courses: Array.from(courseMap.values()),
            assignments: Array.from(aMap.values()),
            syncing: false,
            lastSynced: Date.now(),
          })

          // Persist to Supabase (no-op in demo / when not configured).
          const uid = auth.user?.id
          if (uid && !isDemoMode()) {
            courses.forEach(c => saveCourse(uid, c))
            assignments.forEach(a => saveAssignment(uid, a))
          }

          // Feed returned grades into the grades store so GPA reflects Classroom.
          // First drop any *stale* Classroom-sourced grades (ids start with 'gc-')
          // for the courses we just synced, so assignments deleted or ungraded in
          // Classroom don't leave phantom grades behind. Manually-entered grades
          // (non 'gc-' ids) are preserved.
          const grades = useGradesStore.getState()
          new Set(assignments.map(a => a.courseId)).forEach(cid => {
            const cur = grades.courseGrades[cid] || {}
            const kept = Object.fromEntries(Object.entries(cur).filter(([k]) => !k.startsWith('gc-')))
            grades.setCourseGrades(cid, kept)
          })
          assignments.forEach(a => {
            if (a.grade && a.grade.pointsPossible) {
              grades.addGrade(a.courseId, a.id, {
                pointsEarned: a.grade.pointsEarned,
                pointsPossible: a.grade.pointsPossible,
              })
            }
          })

          return { courses: courses.length, assignments: assignments.length }
        } catch (e) {
          // A 401/403 means the Google token is dead — clear it so the UI shows
          // "reconnect" instead of silently retrying the same expired token.
          if (e instanceof ClassroomAuthError) useAuthStore.getState().clearGoogleAuth()
          set({ syncing: false, syncError: e instanceof ClassroomAuthError ? 'EXPIRED' : (e.message || 'Sync failed') })
          throw e
        }
      },

      setAssignments: (assignments) => set({ assignments }),
      setCourses: (courses) => set({ courses }),
      clearAssignments: () => set({ assignments: [], courses: [] }),

      addCourse: (course) => {
        const newCourse = { ...course, id: course.id || newId('course') }
        set((state) => ({ courses: [...state.courses, newCourse] }))
        const uid = getUid()
        if (uid && !isDemoMode()) saveCourse(uid, newCourse)
        return newCourse.id
      },

      updateCourse: (id, updates) => {
        set((state) => ({ courses: state.courses.map(c => c.id === id ? { ...c, ...updates } : c) }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const course = get().courses.find(c => c.id === id)
          if (course) saveCourse(uid, course)
        }
      },

      deleteCourse: (id) => {
        // Cascade: remove the course AND its assignments/grades so nothing is
        // left orphaned with a dangling courseId.
        const orphaned = get().assignments.filter(a => a.courseId === id)
        set((state) => ({
          courses: state.courses.filter(c => c.id !== id),
          assignments: state.assignments.filter(a => a.courseId !== id),
        }))
        useGradesStore.getState().clearCourseGrades(id)
        if (!isDemoMode()) {
          dbDeleteCourse(id)
          orphaned.forEach(a => dbDeleteAssignment(a.id))
        }
      },

      addAssignment: (assignment) => {
        const newAssignment = { ...assignment, id: assignment.id || newId('assign') }
        set((state) => ({ assignments: [...state.assignments, newAssignment] }))
        const uid = getUid()
        if (uid && !isDemoMode()) saveAssignment(uid, newAssignment)
      },

      updateAssignment: (id, updates) => {
        set((state) => ({
          assignments: state.assignments.map((a) => a.id === id ? { ...a, ...updates } : a)
        }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const updated = get().assignments.find(a => a.id === id)
          if (updated) saveAssignment(uid, updated)
        }
      },

      deleteAssignment: (id) => {
        set((state) => ({ assignments: state.assignments.filter(a => a.id !== id) }))
        if (!isDemoMode()) dbDeleteAssignment(id)
      },

      setGrade: (assignmentId, grade) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId ? { ...a, grade, status: 'graded' } : a
          )
        }))
      },

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
    }),
    { name: 'shiori-assignments' }
  )
)

// ── Grades ────────────────────────────────────────────────────

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

export function pctToGPA(pct) {
  if (pct >= 93) return 4.0
  if (pct >= 90) return 3.7
  if (pct >= 87) return 3.3
  if (pct >= 83) return 3.0
  if (pct >= 80) return 2.7
  if (pct >= 77) return 2.3
  if (pct >= 73) return 2.0
  if (pct >= 70) return 1.7
  if (pct >= 67) return 1.3
  if (pct >= 63) return 1.0
  if (pct >= 60) return 0.7
  return 0.0
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

      clearCourseGrades: (courseId) => set((state) => {
        const { [courseId]: _, ...rest } = state.courseGrades
        return { courseGrades: rest }
      }),

      clearGrades: () => set({ courseGrades: {}, courseWeights: {} }),

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

// ── Flashcards ────────────────────────────────────────────────

export const useFlashcardsStore = create(
  persist(
    (set, get) => ({
      decks: [],

      addDeck: (deck) => {
        const id = newId('deck')
        const newDeck = { ...deck, id, cards: [], createdAt: Date.now() }
        set((state) => ({ decks: [...state.decks, newDeck] }))
        const uid = getUid()
        if (uid && !isDemoMode()) saveDeck(uid, newDeck)
        return id
      },

      loadDeck: (deck) => set((state) => ({ decks: [...state.decks, deck] })),
      replaceDecks: (decks) => set({ decks }),

      deleteDeck: (id) => {
        set((state) => ({ decks: state.decks.filter(d => d.id !== id) }))
        if (!isDemoMode()) dbDeleteDeck(id)
      },

      addCard: (deckId, card) => {
        set((state) => ({
          decks: state.decks.map(d =>
            d.id === deckId
              ? { ...d, cards: [...d.cards, { ...card, id: newId('card'), streak: 0, nextReview: null }] }
              : d
          )
        }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const deck = get().decks.find(d => d.id === deckId)
          if (deck) saveDeck(uid, deck)
        }
      },

      removeCard: (deckId, cardId) => {
        set((state) => ({
          decks: state.decks.map(d =>
            d.id === deckId ? { ...d, cards: d.cards.filter(c => c.id !== cardId) } : d
          )
        }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const deck = get().decks.find(d => d.id === deckId)
          if (deck) saveDeck(uid, deck)
        }
      },

      updateCard: (deckId, cardId, updates) => {
        set((state) => ({
          decks: state.decks.map(d =>
            d.id === deckId
              ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, ...updates } : c) }
              : d
          )
        }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const deck = get().decks.find(d => d.id === deckId)
          if (deck) saveDeck(uid, deck)
        }
      },
    }),
    { name: 'shiori-flashcards' }
  )
)

// ── Notes ─────────────────────────────────────────────────────

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note) => {
        const id = newId('note')
        const newNote = {
          ...note, id,
          title: note.title || '',
          content: note.content || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          pinned: false,
        }
        set((state) => ({ notes: [...state.notes, newNote] }))
        const uid = getUid()
        if (uid && !isDemoMode()) saveNote(uid, newNote)
        return id
      },

      replaceNotes: (notes) => set({ notes }),

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map(n =>
            n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
          )
        }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const note = get().notes.find(n => n.id === id)
          if (note) saveNote(uid, note)
        }
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter(n => n.id !== id) }))
        if (!isDemoMode()) dbDeleteNote(id)
      },

      pinNote: (id) => {
        set((state) => ({
          notes: state.notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
        }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const note = get().notes.find(n => n.id === id)
          if (note) saveNote(uid, note)
        }
      },
    }),
    { name: 'shiori-notes' }
  )
)

// ── Calendar (Google sync layer) ───────────────────────────────

export const useCalendarStore = create((set) => ({
  events: [],
  isLoading: false,

  setEvents: (events) => set({ events }),

  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),

  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e))
  })),

  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),

  setLoading: (loading) => set({ isLoading: loading })
}))

// ── Pomodoro ──────────────────────────────────────────────────

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
      dailyFocusLog: {},

      setActiveAssignment: (assignment) => set({ activeAssignment: assignment }),

      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),

      reset: () => {
        const { isBreak, workSeconds, breakSeconds } = get()
        set({ secondsLeft: isBreak ? breakSeconds : workSeconds, isRunning: false })
      },

      tick: () => {
        const { secondsLeft, isBreak, workSeconds, breakSeconds, sessionCount, totalFocusMinutes, dailyFocusLog } = get()
        if (secondsLeft <= 1) {
          if (!isBreak) {
            const today = new Date().toISOString().split('T')[0]
            const sessionMins = Math.round(workSeconds / 60)
            set({
              isBreak: true,
              secondsLeft: breakSeconds,
              isRunning: true,
              sessionCount: sessionCount + 1,
              totalFocusMinutes: totalFocusMinutes + sessionMins,
              dailyFocusLog: {
                ...dailyFocusLog,
                [today]: (dailyFocusLog[today] || 0) + sessionMins,
              },
            })
          } else {
            set({ isBreak: false, secondsLeft: workSeconds, isRunning: false })
          }
        } else {
          set({ secondsLeft: secondsLeft - 1 })
        }
      },

      close: () => set({ isRunning: false, secondsLeft: 25 * 60, isBreak: false, activeAssignment: null }),

      // Full reset including accumulated focus history — used when switching accounts.
      resetAll: () => set((s) => ({
        isRunning: false, isBreak: false, secondsLeft: s.workSeconds,
        sessionCount: 0, totalFocusMinutes: 0, dailyFocusLog: {}, activeAssignment: null,
      })),
    }),
    { name: 'shiori-pomodoro' }
  )
)

// ── UI ────────────────────────────────────────────────────────

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
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
        }, 5000)
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }),
    { name: 'shiori-ui' }
  )
)

// ── XP / Levels ───────────────────────────────────────────────

const XP_LEVELS = [
  { level: 1, title: 'Freshman',  min: 0,    color: '#8c90a0' },
  { level: 2, title: 'Sophomore', min: 200,  color: '#afc6ff' },
  { level: 3, title: 'Junior',    min: 500,  color: '#e5b5ff' },
  { level: 4, title: 'Senior',    min: 1000, color: '#4dff91' },
  { level: 5, title: 'Scholar',   min: 2500, color: '#ffd6a0' },
  { level: 6, title: 'Graduate',  min: 5000, color: '#ff6b9d' },
]

const getLevel = (xp) => {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].min) return XP_LEVELS[i]
  }
  return XP_LEVELS[0]
}

const getNextLevel = (xp) => {
  const cur = getLevel(xp)
  return XP_LEVELS.find(l => l.level === cur.level + 1) || null
}

export { XP_LEVELS, getLevel, getNextLevel }

export const useXPStore = create(
  persist(
    (set, get) => ({
      xp: 0,
      levelUpPending: null,
      setXP: (xp) => set({ xp, levelUpPending: null }),
      clearXP: () => set({ xp: 0, levelUpPending: null }),

      addXP: (amount) => {
        const { xp } = get()
        const oldLevel = getLevel(xp)
        const newXP = xp + amount
        const newLevel = getLevel(newXP)
        const leveled = newLevel.level > oldLevel.level
        set({
          xp: newXP,
          levelUpPending: leveled ? newLevel : get().levelUpPending,
        })
        return { newXP, leveled, newLevel: leveled ? newLevel : null }
      },

      clearLevelUp: () => set({ levelUpPending: null }),

      getProgress: () => {
        const { xp } = get()
        const cur = getLevel(xp)
        const next = getNextLevel(xp)
        if (!next) return { pct: 100, cur, next: null, xpInLevel: xp - cur.min, xpToNext: 0 }
        const xpInLevel = xp - cur.min
        const xpToNext = next.min - cur.min
        return { pct: Math.round((xpInLevel / xpToNext) * 100), cur, next, xpInLevel, xpToNext }
      },
    }),
    { name: 'shiori-xp' }
  )
)

// ── Habits ────────────────────────────────────────────────────

export function calcStreak(completions) {
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]
  const startOffset = completions[todayKey] ? 0 : 1
  let streak = 0
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (completions[key]) {
      streak++
    } else if (i === 0) {
      continue
    } else {
      break
    }
  }
  return streak
}

export const useHabitsStore = create(
  persist(
    (set, get) => ({
      habits: [],

      replaceHabits: (habits) => set({ habits }),

      addHabit: (habit) => {
        const id = newId('habit')
        const newHabit = { id, name: habit.name, color: habit.color, completions: {}, streak: 0, createdAt: Date.now() }
        set((state) => ({ habits: [...state.habits, newHabit] }))
        const uid = getUid()
        if (uid && !isDemoMode()) saveHabit(uid, newHabit)
        return id
      },

      deleteHabit: (id) => {
        set((state) => ({ habits: state.habits.filter(h => h.id !== id) }))
        if (!isDemoMode()) dbDeleteHabit(id)
      },

      toggleToday: (id) => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => ({
          habits: state.habits.map(h => {
            if (h.id !== id) return h
            const completions = { ...(h.completions || {}) }
            if (completions[today]) {
              delete completions[today]
            } else {
              completions[today] = true
            }
            return { ...h, completions, streak: calcStreak(completions) }
          })
        }))
        const uid = getUid()
        if (uid && !isDemoMode()) {
          const habit = get().habits.find(h => h.id === id)
          if (habit) saveHabit(uid, habit)
        }
      },
    }),
    { name: 'shiori-habits' }
  )
)

// ── Study Plans ───────────────────────────────────────────────

export const useStudyPlansStore = create(
  persist(
    (set, get) => ({
      plans: [],

      setStudyPlans: (plans) => set({ plans }),

      addStudyPlan: (plan) => {
        const id = plan.id || newId('plan')
        const newPlan = { ...plan, id, createdAt: plan.createdAt || Date.now() }
        set((s) => ({ plans: [newPlan, ...s.plans] }))
        const u = getUid()
        if (u && !isDemoMode()) {
          saveStudyPlan(u, {
            id, title: newPlan.subject || newPlan.title || 'Study Plan',
            courseId: newPlan.courseId || null,
            content: JSON.stringify(newPlan),
            generatedAt: new Date(newPlan.createdAt).toISOString(),
            status: 'active',
          })
        }
        return id
      },

      deleteStudyPlan: (id) => {
        set((s) => ({ plans: s.plans.filter(p => p.id !== id) }))
        if (!isDemoMode()) dbDeleteStudyPlan(id)
      },
    }),
    { name: 'shiori-study-plans' }
  )
)

// ── Data helpers ──────────────────────────────────────────────

function clearAllStores() {
  useAssignmentsStore.getState().clearAssignments()
  useEventStore.getState().clearEvents()
  useNotesStore.getState().replaceNotes([])
  useFlashcardsStore.getState().replaceDecks([])
  useHabitsStore.getState().replaceHabits([])
  useGradesStore.getState().clearGrades()
  useXPStore.getState().clearXP()
  usePomodoroStore.getState().resetAll()
  useStudyPlansStore.getState().setStudyPlans([])
  // These two are written to localStorage directly (not via a zustand store).
  try {
    localStorage.removeItem('shiori-quiz-history')
    localStorage.removeItem('shiori-leaderboard')
  } catch {}
}
export { clearAllStores }

export async function loadUserDataIntoStores(userId) {
  try {
    const data = await loadAllUserData(userId)
    if (!data) return
    if (data.courses?.length) useAssignmentsStore.getState().setCourses(data.courses)
    if (data.assignments?.length) useAssignmentsStore.getState().setAssignments(data.assignments)
    if (data.notes?.length) useNotesStore.getState().replaceNotes(data.notes)
    if (data.decks?.length) useFlashcardsStore.getState().replaceDecks(data.decks)
    if (data.events?.length) useEventStore.getState().setEvents(data.events)
    if (data.habits?.length) useHabitsStore.getState().replaceHabits(data.habits)
    if (data.studyPlans?.length) {
      const plans = data.studyPlans.map(p => {
        try {
          const parsed = JSON.parse(p.content)
          return { ...parsed, id: p.id, createdAt: p.createdAt }
        } catch {
          return { id: p.id, subject: p.title, weeks: [], createdAt: p.createdAt }
        }
      })
      useStudyPlansStore.getState().setStudyPlans(plans)
    }
  } catch (e) {
    console.warn('[loadUserDataIntoStores]', e)
  }
}
