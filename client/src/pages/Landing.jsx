import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores'

/* ─── Brand tokens ──────────────────────────────────────────────── */
const C = {
  bg: '#0a0d12',
  surface: '#131720',
  card: 'rgba(19,23,32,0.95)',
  border: 'rgba(60,65,80,0.35)',
  borderBright: 'rgba(90,100,120,0.5)',
  blue: '#afc6ff',
  blueVibrant: '#528dff',
  purple: '#e5b5ff',
  purpleVibrant: '#c44dff',
  green: '#4dff91',
  pink: '#ff6b9d',
  orange: '#ffd6a0',
  text: '#dfe2eb',
  muted: '#8c90a0',
  faint: '#424754',
}

/* ─── Nav ─────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 60,
      background: scrolled ? 'rgba(10,13,18,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
      transition: 'all 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>栞</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: 17, color: C.text, letterSpacing: '-0.01em',
        }}>Shiori</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <a
          href="https://github.com/kaorii-ako/Shiori-v1"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.border}`,
            color: C.muted, textDecoration: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13, fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderBright }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}
        >
          ⭐ Star
        </a>
        <Link
          to="/demo"
          style={{
            padding: '6px 18px', borderRadius: 8,
            background: `linear-gradient(135deg, ${C.purpleVibrant}, ${C.blueVibrant})`,
            color: '#fff', textDecoration: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13, fontWeight: 700,
          }}
        >
          Try Demo →
        </Link>
      </div>
    </nav>
  )
}

/* ─── Floating particle bg ────────────────────────────────────────── */
function StarField() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            borderRadius: '50%',
            background: i % 3 === 0 ? C.blue : i % 3 === 1 ? C.purple : C.green,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
      {/* Orbs */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,77,255,0.06) 0%, transparent 70%)',
        top: -200, right: -100, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(82,141,255,0.05) 0%, transparent 70%)',
        bottom: -150, left: -100, pointerEvents: 'none',
      }} />
    </div>
  )
}

/* ─── App preview mockup ──────────────────────────────────────────── */
function AppPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
    >
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${C.borderBright}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.8), 0 0 80px rgba(196,77,255,0.08)`,
        background: '#131720',
        maxWidth: 580,
      }}>
        {/* Browser chrome */}
        <div style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(10,13,18,0.9)',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, marginLeft: 8, borderRadius: 6, background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${C.border}`, padding: '4px 12px',
            fontFamily: "'Manrope', sans-serif", fontSize: 12, color: C.faint,
          }}>
            shiorii.tech/home
          </div>
        </div>
        {/* Mock app content */}
        <div style={{ padding: 20, display: 'flex', gap: 16, minHeight: 320 }}>
          {/* Sidebar mock */}
          <div style={{ width: 48, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
            {['🏠','📋','📅','📊','📝','🃏','🎯'].map((icon, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 8,
                background: i === 0 ? 'rgba(196,77,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === 0 ? 'rgba(196,77,255,0.4)' : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>{icon}</div>
            ))}
          </div>
          {/* Main content mock */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Greeting */}
            <div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700,
                color: C.blue, letterSpacing: '0.1em', marginBottom: 4,
              }}>WELCOME BACK, ALEX</div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: C.faint }}>
                Sunday, June 1
              </div>
            </div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'DUE TODAY', value: '3', color: C.pink },
                { label: 'AVG GRADE', value: '87.4%', color: C.green },
                { label: 'STREAK', value: '7d', color: C.orange },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: '0.06em' }}>{s.label}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            {/* Assignment items */}
            {[
              { title: 'BST Implementation', course: 'Data Structures', days: '2d', color: C.purpleVibrant, urgent: true },
              { title: 'Research Paper Draft', course: 'English Comp', days: '5d', color: C.orange, urgent: false },
              { title: 'Lab Report #3', course: 'Physics I', days: '6d', color: C.green, urgent: false },
            ].map((a, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 8,
                background: a.urgent ? 'rgba(196,77,255,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${a.urgent ? 'rgba(196,77,255,0.3)' : C.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 3, height: 32, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 600, color: C.text }}>{a.title}</div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: C.faint }}>{a.course}</div>
                </div>
                <div style={{
                  padding: '2px 8px', borderRadius: 4,
                  background: a.urgent ? 'rgba(196,77,255,0.15)' : 'rgba(255,255,255,0.06)',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 700,
                  color: a.urgent ? C.purple : C.muted,
                }}>{a.days}</div>
              </div>
            ))}
            {/* AI Briefing mock */}
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(196,77,255,0.07) 0%, rgba(82,141,255,0.05) 100%)',
              border: `1px solid rgba(196,77,255,0.2)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 12 }}>✨</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, fontWeight: 700, color: C.purple, letterSpacing: '0.08em' }}>AI DAILY BRIEFING</span>
              </div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                Start with <span style={{ color: C.blue }}>BST Implementation</span> — due in 2 days. Your Physics exam is in 8 days, start reviewing chapter 4 tonight.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Hero ────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px 60px', position: 'relative',
    }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: 24, textAlign: 'center' }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 100,
          background: 'rgba(196,77,255,0.1)',
          border: `1px solid rgba(196,77,255,0.25)`,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12, fontWeight: 600, color: C.purple,
          letterSpacing: '0.04em',
        }}>
          ✨ Free & open source · No account needed
        </span>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 48, alignItems: 'center', maxWidth: 1100, width: '100%' }}>
        {/* Left: Copy */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(36px, 5vw, 58px)',
              fontWeight: 800, lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: C.text, marginBottom: 20,
            }}
          >
            The AI study<br />
            <span style={{
              background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purpleVibrant} 50%, ${C.pink} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              companion
            </span>{' '}
            students actually use.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 17, lineHeight: 1.65, color: C.muted,
              marginBottom: 36, maxWidth: 420,
            }}
          >
            Syncs Google Classroom, tracks grades with GPA predictor, generates day-by-day AI study plans, and runs SRS flashcards — all in one dark, beautiful interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
          >
            <Link to="/demo" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 10,
              background: `linear-gradient(135deg, ${C.purpleVibrant} 0%, ${C.blueVibrant} 100%)`,
              color: '#fff', textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 15, fontWeight: 700,
              boxShadow: `0 0 40px rgba(196,77,255,0.25)`,
            }}>
              Try Demo — 1 click, no signup
            </Link>
            <a
              href="https://github.com/kaorii-ako/Shiori-v1"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${C.border}`,
                color: C.muted, textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 15, fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderBright }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}
            >
              ⭐ Star on GitHub
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 28, flexWrap: 'wrap' }}
          >
            {[
              { val: '15+', label: 'pages' },
              { val: 'MIT', label: 'licensed' },
              { val: '100%', label: 'free core' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 800, color: C.blue }}>{s.val}</span>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: C.faint }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: App preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AppPreview />
        </div>
      </div>
    </section>
  )
}

/* ─── Feature grid ────────────────────────────────────────────────── */
const FEATURES = [
  {
    emoji: '🤖',
    title: 'AI Study Plans',
    desc: 'Gemini builds a real day-by-day schedule from your actual deadlines. No generic templates.',
    color: C.blue,
  },
  {
    emoji: '📊',
    title: 'GPA Predictor',
    desc: '"What score do I need on the final to keep my A?" — answered instantly with weighted categories.',
    color: C.green,
  },
  {
    emoji: '🃏',
    title: 'SRS Flashcards',
    desc: 'Anki-style spaced repetition. CSV import, AI card generation from notes, 3D flip animation.',
    color: C.purple,
  },
  {
    emoji: '📋',
    title: 'Classroom Sync',
    desc: 'Assignments and due dates pulled from Google Classroom the moment your teacher posts them.',
    color: C.orange,
  },
  {
    emoji: '🧠',
    title: 'AI Quiz Generator',
    desc: 'Open any note → click Generate → Gemini creates MCQs with explanations. Study smarter.',
    color: C.pink,
  },
  {
    emoji: '⏱️',
    title: 'Focus Mode',
    desc: 'Fullscreen Pomodoro tied to specific assignments. Sound notifications, session history.',
    color: '#4daaff',
  },
]

function FeatureCard({ emoji, title, desc, color, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      style={{
        padding: '24px 24px 28px',
        borderRadius: 12,
        background: C.card,
        border: `1px solid ${C.border}`,
        transition: 'border-color 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border }}
    >
      <div style={{ fontSize: 28, marginBottom: 14 }}>{emoji}</div>
      <h3 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 16, fontWeight: 700, color: C.text,
        marginBottom: 8, letterSpacing: '-0.01em',
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: 14, lineHeight: 1.6, color: C.muted,
        margin: 0,
      }}>{desc}</p>
    </motion.div>
  )
}

function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          color: C.purpleVibrant, marginBottom: 12, textTransform: 'uppercase',
        }}>Everything you need</p>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800,
          color: C.text, letterSpacing: '-0.02em', margin: 0,
        }}>Your entire study workflow,<br />in one place.</h2>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={i * 0.07} />
        ))}
      </div>
    </section>
  )
}

/* ─── How it works ────────────────────────────────────────────────── */
function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section style={{
      padding: '80px 24px', position: 'relative',
      borderTop: `1px solid ${C.border}`,
      background: 'rgba(255,255,255,0.015)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            color: C.green, marginBottom: 12, textTransform: 'uppercase',
          }}>Ready in 60 seconds</p>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800,
            color: C.text, letterSpacing: '-0.02em', margin: 0,
          }}>Set up in three steps.</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', top: 28, left: '16%', right: '16%', height: 1,
            background: `linear-gradient(90deg, ${C.purpleVibrant}, ${C.blueVibrant})`,
            opacity: 0.3,
          }} />
          {[
            { num: '01', title: 'Connect', desc: 'Link Google Classroom in one OAuth click. No API keys needed.', color: C.purple },
            { num: '02', title: 'Sync', desc: 'Shiori reads your assignments, deadlines, grades, and events automatically.', color: C.blue },
            { num: '03', title: 'Study', desc: 'Get a personalized AI plan every week, built from your real schedule.', color: C.green },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                background: C.card,
                border: `2px solid ${step.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13, fontWeight: 800, color: step.color,
                boxShadow: `0 0 20px ${step.color}25`,
              }}>{step.num}</div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8,
              }}>{step.title}</h3>
              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14, color: C.muted, lineHeight: 1.6, margin: 0,
              }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    text: "I had 4 exams in one week and had no idea where to start. Shiori pulled all my deadlines from Classroom and built me a day-by-day plan in 30 seconds. I passed everything.",
    name: "Ploy S.",
    role: "Year 12 · STEM",
    color: C.blue,
    initials: 'P',
  },
  {
    text: "The SRS flashcard system is insane. I imported my entire Quizlet deck via CSV and it just works. My retention went from 40% to 85% in two weeks.",
    name: "Nattapon K.",
    role: "University · Engineering",
    color: C.purple,
    initials: 'N',
  },
  {
    text: "Finally an app that doesn't spy on me. I bring my own Gemini key, everything stays local. The grade predictor told me exactly what I needed on the final to keep my A.",
    name: "Minh T.",
    role: "Grade 11 · International",
    color: C.green,
    initials: 'M',
  },
]

function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        style={{ textAlign: 'center', marginBottom: 52 }}
      >
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          color: C.pink, marginBottom: 12, textTransform: 'uppercase',
        }}>Student stories</p>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800,
          color: C.text, letterSpacing: '-0.02em', margin: 0,
        }}>Built by a student,<br />for students.</h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '28px', borderRadius: 14,
              background: C.card,
              border: `1px solid ${C.border}`,
            }}
          >
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 15, lineHeight: 1.7, color: C.text,
              marginBottom: 20, fontStyle: 'italic',
            }}>"{t.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: t.color + '22',
                border: `1px solid ${t.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14, fontWeight: 700, color: t.color,
              }}>{t.initials}</div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{t.name}</div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: C.faint }}>{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─── Pricing ─────────────────────────────────────────────────────── */
function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section style={{
      padding: '80px 24px',
      borderTop: `1px solid ${C.border}`,
      background: 'rgba(255,255,255,0.015)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            color: C.orange, marginBottom: 12, textTransform: 'uppercase',
          }}>Pricing</p>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800,
            color: C.text, letterSpacing: '-0.02em', margin: '0 0 12px',
          }}>Free forever. Pay for cloud.</h2>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, color: C.muted, margin: 0 }}>
            Self-host for free, or get the hosted version with unlimited AI.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            {
              name: 'Free',
              price: '฿0',
              period: 'forever',
              desc: 'Self-hosted on your own server',
              color: C.blue,
              cta: 'Try Demo',
              ctaLink: '/demo',
              features: ['Google Classroom sync', 'AI plans (5/month)', 'AI chat (10/day)', 'GPA calculator', 'SRS flashcards', 'All 15 pages'],
              highlight: false,
            },
            {
              name: 'Pro',
              price: '฿199',
              period: '/ month',
              desc: 'Hosted, zero setup, unlimited AI',
              color: C.purpleVibrant,
              cta: 'Get Pro',
              ctaLink: '/pro',
              features: ['Everything in Free', 'Unlimited AI plans', 'Unlimited AI chat', 'Email reminders', 'Grade predictions', 'Priority support'],
              highlight: true,
            },
            {
              name: 'School',
              price: '฿3,990',
              period: '/ month',
              desc: 'Multi-student dashboard for institutions',
              color: C.green,
              cta: 'Contact Us',
              ctaLink: 'mailto:79807@student.amnuaysilpa.ac.th',
              features: ['Everything in Pro', 'Teacher analytics', 'LMS integration', 'Custom branding', 'SSO/OAuth', 'Dedicated support'],
              highlight: false,
            },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '32px 28px',
                borderRadius: 16,
                background: plan.highlight
                  ? `linear-gradient(145deg, rgba(196,77,255,0.08), rgba(82,141,255,0.06))`
                  : C.card,
                border: `1px solid ${plan.highlight ? 'rgba(196,77,255,0.35)' : C.border}`,
                boxShadow: plan.highlight ? `0 0 40px rgba(196,77,255,0.12)` : 'none',
                position: 'relative',
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                  padding: '3px 14px',
                  background: `linear-gradient(90deg, ${C.purpleVibrant}, ${C.blueVibrant})`,
                  borderRadius: '0 0 8px 8px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.08em',
                }}>POPULAR</div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, color: C.text }}>{plan.price}</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: C.muted }}>{plan.period}</span>
                </div>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: C.muted, margin: 0 }}>{plan.desc}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, color: plan.color, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: C.text }}>{f}</span>
                  </div>
                ))}
              </div>
              {plan.ctaLink.startsWith('mailto') ? (
                <a
                  href={plan.ctaLink}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '11px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${C.border}`,
                    color: C.text, textDecoration: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14, fontWeight: 700,
                  }}
                >{plan.cta}</a>
              ) : (
                <Link
                  to={plan.ctaLink}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '11px', borderRadius: 9,
                    background: plan.highlight
                      ? `linear-gradient(135deg, ${C.purpleVibrant}, ${C.blueVibrant})`
                      : 'rgba(255,255,255,0.06)',
                    border: plan.highlight ? 'none' : `1px solid ${C.border}`,
                    color: plan.highlight ? '#fff' : C.text,
                    textDecoration: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14, fontWeight: 700,
                  }}
                >{plan.cta}</Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── MCP callout ─────────────────────────────────────────────────── */
function McpCallout() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      style={{ maxWidth: 860, margin: '0 auto 0', padding: '0 24px 80px' }}
    >
      <div style={{
        borderRadius: 16, padding: '32px 36px',
        background: 'linear-gradient(135deg, rgba(82,141,255,0.07) 0%, rgba(196,77,255,0.05) 100%)',
        border: `1px solid rgba(82,141,255,0.2)`,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 40 }}>🤖</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.blue, marginBottom: 6 }}>MCP Server for Claude Code</div>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Use your study data directly inside Claude. Ask <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>"What's due this week?"</code> or <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>"Add assignment: essay due Friday"</code>
          </p>
        </div>
        <a
          href="https://github.com/kaorii-ako/Shiori-v1/tree/master/mcp"
          target="_blank" rel="noopener noreferrer"
          style={{
            padding: '10px 20px', borderRadius: 8,
            background: 'rgba(82,141,255,0.15)',
            border: `1px solid rgba(82,141,255,0.3)`,
            color: C.blue, textDecoration: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
          }}
        >View MCP Docs →</a>
      </div>
    </motion.div>
  )
}

/* ─── Final CTA ───────────────────────────────────────────────────── */
function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section style={{ padding: '80px 24px', textAlign: 'center' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 640, margin: '0 auto' }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>栞</div>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
          color: C.text, letterSpacing: '-0.02em', marginBottom: 16,
        }}>Stop surviving deadlines.<br />Start owning them.</h2>
        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 16, color: C.muted, lineHeight: 1.65, marginBottom: 36,
        }}>
          The full app — 15 pages, AI plans, SRS flashcards, grade predictor — available to try in 10 seconds. No account, no credit card.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/demo" style={{
            padding: '14px 32px', borderRadius: 10,
            background: `linear-gradient(135deg, ${C.purpleVibrant}, ${C.blueVibrant})`,
            color: '#fff', textDecoration: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 16, fontWeight: 700,
            boxShadow: `0 0 40px rgba(196,77,255,0.3)`,
          }}>Try Demo Free</Link>
          <a
            href="https://github.com/kaorii-ako/Shiori-v1"
            target="_blank" rel="noopener noreferrer"
            style={{
              padding: '14px 28px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border}`,
              color: C.muted, textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 16, fontWeight: 600,
            }}
          >⭐ Star on GitHub</a>
        </div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: C.faint, marginTop: 20 }}>
          MIT licensed · Self-host in 5 minutes · No data harvesting
        </p>
      </motion.div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${C.border}`,
      padding: '32px 24px',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>栞</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.muted }}>Shiori</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: C.faint }}>— MIT licensed</span>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'GitHub', href: 'https://github.com/kaorii-ako/Shiori-v1' },
            { label: 'Demo', href: '/demo', internal: true },
            { label: 'Pro', href: '/pro', internal: true },
            { label: 'MCP Server', href: 'https://github.com/kaorii-ako/Shiori-v1/tree/master/mcp' },
          ].map(link => (
            link.internal
              ? <Link key={link.label} to={link.href} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: C.faint, textDecoration: 'none' }}>{link.label}</Link>
              : <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: C.faint, textDecoration: 'none' }}>{link.label}</a>
          ))}
        </div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: C.faint, margin: 0 }}>
          © 2025 Shiori · Built by <a href="https://github.com/kaorii-ako" target="_blank" rel="noopener noreferrer" style={{ color: C.blue, textDecoration: 'none' }}>@kaorii-ako</a>
        </p>
      </div>
    </footer>
  )
}

/* ─── Root ────────────────────────────────────────────────────────── */
export default function Landing() {
  const { isAuthenticated, isDemo } = useAuthStore()

  if (isAuthenticated && !isDemo) {
    return <Navigate to="/home" replace />
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, position: 'relative' }}>
      <StarField />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <McpCallout />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  )
}
