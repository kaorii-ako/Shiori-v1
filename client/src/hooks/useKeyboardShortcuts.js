import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../stores'

const SHORTCUTS = [
  { key: 'gh', label: 'Go to Home', path: '/home' },
  { key: 'ga', label: 'Go to Assignments', path: '/assignments' },
  { key: 'gc', label: 'Go to Calendar', path: '/calendar' },
  { key: 'gg', label: 'Go to Grades', path: '/grades' },
  { key: 'gs', label: 'Go to Study Plans', path: '/study' },
  { key: 'gn', label: 'Go to Notes', path: '/notes' },
  { key: 'gf', label: 'Go to Flashcards', path: '/flashcards' },
  { key: 'gr', label: 'Go to Analytics', path: '/analytics' },
  { key: 'gb', label: 'Go to Habits', path: '/habits' },
  { key: 'gq', label: 'Go to AI Quiz', path: '/quiz' },
  { key: 'gl', label: 'Go to Leaderboard', path: '/leaderboard' },
  { key: 'gi', label: 'Import Syllabus', path: '/import' },
]

export const SHORTCUT_HELP = SHORTCUTS

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate()
  const { toggleAIChat } = useUIStore()
  const sequenceRef = useRef('')
  const timerRef = useRef(null)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k') { e.preventDefault(); toggleAIChat() }
        return
      }

      const key = e.key.toLowerCase()
      if (!/^[a-z]$/.test(key)) return

      sequenceRef.current += key
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => { sequenceRef.current = '' }, 600)

      const match = SHORTCUTS.find(s => s.key === sequenceRef.current)
      if (match) {
        sequenceRef.current = ''
        clearTimeout(timerRef.current)
        navigate(match.path)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      clearTimeout(timerRef.current)
    }
  }, [navigate, toggleAIChat])
}
