/**
 * Supabase data sync helpers.
 * All functions are no-ops when Supabase is not configured (demo mode / no .env).
 * The app always works with Zustand local state — Supabase is the sync layer.
 */
import { supabase, isSupabaseConfigured } from './supabase'

const guard = (fn) => async (...args) => {
  if (!isSupabaseConfigured()) return null
  try { return await fn(...args) } catch (e) { console.warn('[db]', e.message); return null }
}

// ── Courses ──────────────────────────────────────────────────

export const saveCourse = guard(async (userId, course) => {
  const { error } = await supabase.from('courses').upsert({
    id: course.id, user_id: userId,
    name: course.name, code: course.code,
    color: course.color, instructor: course.instructor,
    credits: course.credits,
  })
  if (error) throw error
})

export const deleteCourse = guard(async (courseId) => {
  await supabase.from('courses').delete().eq('id', courseId)
})

export const loadCourses = guard(async (userId) => {
  const { data } = await supabase.from('courses').select('*').eq('user_id', userId).order('created_at')
  return data?.map(r => ({
    id: r.id, name: r.name, code: r.code,
    color: r.color, instructor: r.instructor, credits: r.credits,
  })) || []
})

// ── Assignments ───────────────────────────────────────────────

export const saveAssignment = guard(async (userId, a) => {
  const { error } = await supabase.from('assignments').upsert({
    id: a.id, user_id: userId,
    course_id: a.courseId, course_name: a.courseName,
    title: a.title, description: a.description,
    due_date: a.dueDate, status: a.status,
    priority: a.priority, estimated_hours: a.estimatedHours,
    grade: a.grade,
  })
  if (error) throw error
})

export const deleteAssignment = guard(async (id) => {
  await supabase.from('assignments').delete().eq('id', id)
})

export const loadAssignments = guard(async (userId) => {
  const { data } = await supabase.from('assignments').select('*').eq('user_id', userId).order('due_date')
  return data?.map(r => ({
    id: r.id, courseId: r.course_id, courseName: r.course_name,
    title: r.title, description: r.description,
    dueDate: r.due_date, status: r.status,
    priority: r.priority, estimatedHours: r.estimated_hours,
    grade: r.grade,
  })) || []
})

// ── Notes ─────────────────────────────────────────────────────

export const saveNote = guard(async (userId, n) => {
  const { error } = await supabase.from('notes').upsert({
    id: n.id, user_id: userId,
    course_id: n.courseId, title: n.title,
    content: n.content, tags: n.tags,
    pinned: n.pinned, color: n.color,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
})

export const deleteNote = guard(async (id) => {
  await supabase.from('notes').delete().eq('id', id)
})

export const loadNotes = guard(async (userId) => {
  const { data } = await supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  return data?.map(r => ({
    id: r.id, courseId: r.course_id, title: r.title,
    content: r.content, tags: r.tags,
    pinned: r.pinned, color: r.color,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  })) || []
})

// ── Flashcard Decks ───────────────────────────────────────────

export const saveDeck = guard(async (userId, deck) => {
  const { error: deckErr } = await supabase.from('flashcard_decks').upsert({
    id: deck.id, user_id: userId,
    course_id: deck.courseId, name: deck.name,
    description: deck.description, color: deck.color,
  })
  if (deckErr) throw deckErr

  if (deck.cards?.length) {
    const cards = deck.cards.map(c => ({
      id: c.id, deck_id: deck.id, user_id: userId,
      front: c.front, back: c.back,
      streak: c.streak || 0,
      next_review: c.nextReview,
    }))
    const { error: cardErr } = await supabase.from('flashcards').upsert(cards)
    if (cardErr) throw cardErr
  }
})

export const deleteDeck = guard(async (id) => {
  await supabase.from('flashcard_decks').delete().eq('id', id)
})

export const loadDecks = guard(async (userId) => {
  const { data: decks } = await supabase.from('flashcard_decks').select('*').eq('user_id', userId)
  const { data: cards } = await supabase.from('flashcards').select('*').eq('user_id', userId)
  return decks?.map(d => ({
    id: d.id, courseId: d.course_id, name: d.name,
    description: d.description, color: d.color,
    createdAt: new Date(d.created_at).getTime(),
    cards: (cards || []).filter(c => c.deck_id === d.id).map(c => ({
      id: c.id, front: c.front, back: c.back,
      streak: c.streak, nextReview: c.next_review,
    })),
  })) || []
})

// ── Events ────────────────────────────────────────────────────

export const saveEvent = guard(async (userId, e) => {
  const { error } = await supabase.from('events').upsert({
    id: e.id, user_id: userId,
    course_id: e.courseId, title: e.title,
    type: e.type, start_at: e.start || e.date,
    end_at: e.end, description: e.description,
    color: e.color,
  })
  if (error) throw error
})

export const deleteEvent = guard(async (id) => {
  await supabase.from('events').delete().eq('id', id)
})

export const loadEvents = guard(async (userId) => {
  const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('start_at')
  return data?.map(r => ({
    id: r.id, courseId: r.course_id, title: r.title,
    type: r.type, start: r.start_at, end: r.end_at,
    description: r.description, color: r.color,
  })) || []
})

// ── Bulk load all user data (on login) ────────────────────────

export const loadAllUserData = async (userId) => {
  const [courses, assignments, notes, decks, events] = await Promise.all([
    loadCourses(userId),
    loadAssignments(userId),
    loadNotes(userId),
    loadDecks(userId),
    loadEvents(userId),
  ])
  return { courses, assignments, notes, decks, events }
}
