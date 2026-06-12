import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles, BookOpen, BarChart3, Brain, Zap, Github } from 'lucide-react'

const STEPS = [
  {
    icon: Sparkles,
    color: '#c44dff',
    title: 'Welcome to Shiori',
    subtitle: 'AI Study Companion',
    body: 'You\'re exploring a fully-loaded demo with sample courses, assignments, grades, and flashcards. Everything here is pre-filled — no account or setup needed.',
    hint: 'All your real data stays 100% local. No tracking.',
  },
  {
    icon: Brain,
    color: '#afc6ff',
    title: 'AI Study Plans',
    subtitle: 'Gemini AI inside',
    body: 'Add your Gemini API key (free at aistudio.google.com) in Settings → and Shiori will build a personalized day-by-day study schedule from your deadlines.',
    hint: 'Or use Google Classroom sync to auto-import assignments.',
  },
  {
    icon: BookOpen,
    color: '#4dff91',
    title: 'SRS Flashcards',
    subtitle: 'Spaced repetition',
    body: 'The flashcard system uses Anki-style spaced repetition. Import from Quizlet CSV, generate AI cards from your notes, or create them manually.',
    hint: 'Cards you know well appear less often. You\'ll retain 80%+ long-term.',
  },
  {
    icon: BarChart3,
    color: '#ffd6a0',
    title: 'GPA Predictor',
    subtitle: 'Real-time calculation',
    body: 'Enter grades with weighted categories and Shiori calculates your GPA in real time. Ask "what score do I need on the final to keep a B+" and get an exact answer.',
    hint: 'Supports 4.0 scale, percentage grades, and letter grades.',
  },
  {
    icon: Zap,
    color: '#ff6b9d',
    title: 'Claude Code MCP',
    subtitle: 'AI-native integration',
    body: 'Shiori has a built-in MCP server — add it to Claude Code and ask things like "what\'s due this week?" or "summarize my Calculus notes" without leaving your editor.',
    hint: 'See mcp/ folder for setup instructions.',
  },
  {
    icon: Github,
    color: '#e5b5ff',
    title: 'Open Source',
    subtitle: 'MIT licensed',
    body: 'Shiori is fully open-source on GitHub. Self-host it, contribute features, or fork it for your school. 100% free forever for personal use.',
    hint: '⭐ Star the repo if you find it useful — it helps others discover it!',
    cta: {
      label: 'Star on GitHub',
      href: 'https://github.com/kaorii-ako/Shiori-v1',
    },
  },
]

const TOUR_KEY = 'shiori-demo-tour-seen'

const DemoTour = () => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (sessionStorage.getItem(TOUR_KEY)) return
    const t = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(t)
  }, [])

  const close = () => {
    sessionStorage.setItem(TOUR_KEY, '1')
    setOpen(false)
  }

  const next = () => step < STEPS.length - 1 ? setStep(s => s + 1) : close()
  const prev = () => setStep(s => Math.max(0, s - 1))

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 301,
              width: 'min(440px, 90vw)',
              background: 'rgba(16,20,26,0.97)',
              border: `1px solid ${current.color}40`,
              borderRadius: 18,
              padding: '32px 28px 24px',
              boxShadow: `0 0 60px ${current.color}20, 0 24px 64px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Close */}
            <button
              onClick={close}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#424754', padding: 4,
              }}
            >
              <X size={16} />
            </button>

            {/* Step dots */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  style={{
                    height: 4, flex: i === step ? 2 : 1,
                    borderRadius: 2, border: 'none', cursor: 'pointer',
                    background: i === step ? current.color : 'rgba(255,255,255,0.12)',
                    transition: 'all 0.25s',
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, marginBottom: 20,
              background: `${current.color}18`,
              border: `1px solid ${current.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={26} style={{ color: current.color }} />
            </div>

            {/* Content */}
            <p style={{ fontFamily: 'VT323', fontSize: 13, color: current.color, letterSpacing: '0.08em', marginBottom: 4 }}>
              {current.subtitle.toUpperCase()}
            </p>
            <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 13, color: '#dfe2eb', marginBottom: 16, lineHeight: 1.5 }}>
              {current.title}
            </h2>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#8c90a0', lineHeight: 1.7, marginBottom: 16 }}>
              {current.body}
            </p>
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 24,
            }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080' }}>
                {current.hint}
              </p>
            </div>

            {/* CTA if last step */}
            {current.cta && (
              <a
                href={current.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 9,
                  background: `linear-gradient(135deg, ${current.color}, ${current.color}bb)`,
                  color: '#0b0e14', textDecoration: 'none',
                  fontFamily: '"Press Start 2P"', fontSize: 9,
                  marginBottom: 12,
                }}
              >
                <Github size={14} />
                {current.cta.label}
              </a>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={prev}
                disabled={step === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: step === 0 ? 'not-allowed' : 'pointer',
                  color: step === 0 ? '#2a2e38' : '#606080',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
                  padding: '8px 0',
                }}
              >
                <ChevronLeft size={15} /> Back
              </button>
              <button
                onClick={next}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: current.color,
                  color: '#0b0e14',
                  fontFamily: '"Press Start 2P"', fontSize: 9,
                }}
              >
                {step === STEPS.length - 1 ? 'START EXPLORING' : 'NEXT'}
                {step < STEPS.length - 1 && <ChevronRight size={13} />}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DemoTour
