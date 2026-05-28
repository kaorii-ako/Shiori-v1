import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useAuthStore } from '../stores'
import {
  Sparkles, BookOpen, Mail, Calendar, BarChart3, MessageCircle,
  ArrowRight, Star, Github, Zap, Shield, Clock, CheckCircle2,
  GraduationCap, TrendingUp, Brain, Rocket, Users, ChevronDown,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Study Plans',
    desc: 'Gemini builds a real day-by-day schedule from your actual deadlines — not generic advice.',
    color: '#afc6ff',
    glow: 'rgba(82,141,255,0.15)',
  },
  {
    icon: BookOpen,
    title: 'Classroom Sync',
    desc: 'Assignments, rubrics, and due dates pulled the moment your teacher posts them.',
    color: '#d7ffc5',
    glow: 'rgba(74,215,120,0.15)',
  },
  {
    icon: Mail,
    title: 'Gmail Intelligence',
    desc: 'Surfaces every deadline buried in your inbox. Never miss a last-minute email.',
    color: '#e5b5ff',
    glow: 'rgba(196,77,255,0.15)',
  },
  {
    icon: Calendar,
    title: 'Calendar Integration',
    desc: 'Slots study blocks automatically around your existing events. Zero manual scheduling.',
    color: '#ffd6a0',
    glow: 'rgba(255,170,77,0.15)',
  },
  {
    icon: BarChart3,
    title: 'Grade Calculator',
    desc: 'Track grades per course with weighted category support. Know exactly where you stand.',
    color: '#ff6b9d',
    glow: 'rgba(255,107,157,0.15)',
  },
  {
    icon: MessageCircle,
    title: 'AI Chat',
    desc: 'Ask Shiori anything about your schedule. It knows your actual data, not hypotheticals.',
    color: '#80ffd4',
    glow: 'rgba(77,255,200,0.15)',
  },
]

const PRICING = [
  {
    name: 'FREE',
    subname: 'Self-Hosted',
    price: '0',
    unit: 'forever',
    color: '#afc6ff',
    features: [
      'Google Classroom sync',
      'Gmail deadline detection',
      'Calendar integration',
      'AI study plans (5/month)',
      'AI chat (10 msgs/day)',
      'Grade calculator',
      'Demo mode — no login needed',
    ],
    cta: 'Get Started Free',
    ctaLink: '/login',
    highlight: false,
  },
  {
    name: 'PRO',
    subname: 'Shiori Cloud',
    price: '199',
    unit: 'THB / month',
    color: '#e5b5ff',
    features: [
      'Everything in Free',
      'Unlimited AI study plans',
      'Unlimited AI chat',
      'Smart priority scoring',
      'PDF export + iCal sync',
      'Email deadline reminders',
      'Grade predictions',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/pro',
    highlight: true,
  },
  {
    name: 'SCHOOL',
    subname: 'For Institutions',
    price: '3,990',
    unit: 'THB / month',
    color: '#d7ffc5',
    features: [
      'Everything in Pro',
      'Multi-student dashboard',
      'Teacher analytics',
      'Classroom management',
      'Custom branding',
      'SSO / LMS integration',
      'Dedicated support',
    ],
    cta: 'Contact Us',
    ctaLink: 'mailto:79807@student.amnuaysilpa.ac.th',
    highlight: false,
  },
]

const STEPS = [
  { num: '01', title: 'Connect', desc: 'Link Google Classroom, Gmail, and Calendar with one OAuth click.', color: '#afc6ff' },
  { num: '02', title: 'Sync', desc: 'Shiori reads all your assignments, deadlines, and events automatically.', color: '#e5b5ff' },
  { num: '03', title: 'Study', desc: 'Get a personalized AI plan and let Shiori keep you on track.', color: '#d7ffc5' },
]

// Floating particle component
const Particle = ({ x, y, size, opacity, delay }) => (
  <motion.div
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(175,198,255,0.6)',
      pointerEvents: 'none',
    }}
    animate={{
      y: [0, -20, 0],
      opacity: [opacity * 0.3, opacity, opacity * 0.3],
    }}
    transition={{
      duration: 3 + Math.random() * 3,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
)

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const Landing = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) return <Navigate to="/home" replace />
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 4,
    }))
  )
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true })

  useEffect(() => {
    if (statsInView) setStatsVisible(true)
  }, [statsInView])

  const handleDemo = () => {
    navigate('/login')
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: '#10141a', color: '#dfe2eb' }}
    >
      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82,141,255,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,77,255,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,215,120,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid rgba(66,71,84,0.30)',
        background: 'rgba(16,20,26,0.85)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>栞</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#dfe2eb' }}>
                Shiori
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a
                href="https://github.com/kaorii-ako/Shiori-v1"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 6,
                  border: '1px solid rgba(66,71,84,0.50)',
                  color: '#8c90a0', textDecoration: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(175,198,255,0.4)'; e.currentTarget.style.color = '#afc6ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(66,71,84,0.50)'; e.currentTarget.style.color = '#8c90a0' }}
              >
                <Github size={15} />
                Star
              </a>
              <Link
                to="/login"
                style={{
                  padding: '6px 18px', borderRadius: 6,
                  background: 'linear-gradient(45deg, #afc6ff 0%, #528dff 100%)',
                  color: '#10141a', textDecoration: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                TRY DEMO
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 100, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 100,
              border: '1px solid rgba(196,77,255,0.35)',
              background: 'rgba(196,77,255,0.08)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12, fontWeight: 600,
              color: '#e5b5ff', letterSpacing: '0.08em',
            }}>
              <Sparkles size={13} />
              POWERED BY GOOGLE GEMINI AI
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(24px, 4vw, 48px)',
              lineHeight: 1.3,
              marginBottom: 12,
              color: '#dfe2eb',
            }}>
              Stop juggling tabs.
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(24px, 4vw, 48px)',
              lineHeight: 1.3,
              background: 'linear-gradient(135deg, #afc6ff 0%, #c44dff 50%, #ff6b9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Start actually studying.
            </div>
          </motion.div>

          {/* Japanese bookmark character ambient */}
          <div style={{
            position: 'absolute', top: 80, right: '5%',
            fontSize: 200, opacity: 0.03, pointerEvents: 'none',
            fontFamily: 'serif', color: '#afc6ff',
            lineHeight: 1,
          }}>
            栞
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 18, color: '#8c90a0',
              maxWidth: 560, margin: '24px auto 0',
              lineHeight: 1.7,
            }}
          >
            Shiori connects to your Google Classroom, Gmail, and Calendar —
            then builds a personalized AI study plan so you can stop organizing
            and start learning.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDemo}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 8,
                background: 'linear-gradient(135deg, #c44dff 0%, #8b63a5 100%)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 15, fontWeight: 700,
                letterSpacing: '0.05em',
                boxShadow: '0 0 40px rgba(196,77,255,0.25)',
              }}
            >
              <Sparkles size={17} />
              TRY DEMO — NO SETUP
            </motion.button>
            <a
              href="https://github.com/kaorii-ako/Shiori-v1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 8,
                border: '1px solid rgba(175,198,255,0.25)',
                background: 'rgba(175,198,255,0.05)',
                color: '#afc6ff', textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 15, fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              <Github size={17} />
              Star on GitHub
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              marginTop: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              color: '#606080', fontFamily: "'Manrope', sans-serif", fontSize: 13,
            }}
          >
            <Shield size={13} />
            Your credentials stay local. No subscriptions to start. MIT licensed.
          </motion.div>
        </div>
      </section>

      {/* App Preview — HTML mockup */}
      <section style={{ padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{
              borderRadius: 16,
              border: '1px solid rgba(66,71,84,0.40)',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(175,198,255,0.05)',
              background: 'rgba(16,20,26,0.9)',
            }}>
              {/* Window chrome */}
              <div style={{
                height: 40, display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 16px',
                borderBottom: '1px solid rgba(66,71,84,0.30)',
                background: 'rgba(10,14,20,0.8)',
              }}>
                {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
                <div style={{
                  flex: 1, height: 22, borderRadius: 4, margin: '0 auto',
                  maxWidth: 300, background: 'rgba(24,28,34,0.8)',
                  border: '1px solid rgba(66,71,84,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#606080', fontSize: 11, fontFamily: "'Manrope', sans-serif",
                }}>
                  shiori-v1.vercel.app
                </div>
              </div>

              {/* App layout */}
              <div style={{ display: 'flex', height: 480 }}>
                {/* Sidebar */}
                <div style={{
                  width: 220, borderRight: '1px solid rgba(66,71,84,0.25)',
                  background: 'rgba(10,14,20,0.6)', padding: 16,
                  display: 'flex', flexDirection: 'column', gap: 4,
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 16px' }}>
                    <span style={{ fontSize: 20 }}>栞</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: '#dfe2eb' }}>Shiori</span>
                  </div>
                  {[
                    { label: 'Home', icon: '⌂', active: true, color: '#afc6ff' },
                    { label: 'Assignments', icon: '📋', active: false },
                    { label: 'Calendar', icon: '📅', active: false },
                    { label: 'Grades', icon: '🎯', active: false },
                    { label: 'Study Plans', icon: '📊', active: false },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 6,
                      background: item.active ? 'rgba(82,141,255,0.15)' : 'transparent',
                      borderLeft: item.active ? '2px solid #528dff' : '2px solid transparent',
                      color: item.active ? '#afc6ff' : '#606080',
                      fontSize: 12, fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#dfe2eb', marginBottom: 4 }}>
                        GOOD EVENING, TAWIN
                      </div>
                      <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080' }}>
                        3 assignments due this week
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 6,
                      background: 'linear-gradient(135deg, rgba(196,77,255,0.15), rgba(82,141,255,0.10))',
                      border: '1px solid rgba(196,77,255,0.25)',
                      color: '#e5b5ff', fontSize: 11,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      <Sparkles size={11} /> SYNCED
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { label: 'DUE TODAY', value: '2', color: '#ffaa4d' },
                      { label: 'THIS WEEK', value: '5', color: '#c44dff' },
                      { label: 'COURSES', value: '4', color: '#4d9fff' },
                      { label: 'AVG GRADE', value: '87%', color: '#4dff91' },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        padding: '12px 10px', borderRadius: 8,
                        background: 'rgba(24,28,34,0.55)',
                        border: '1px solid rgba(66,71,84,0.25)',
                        backdropFilter: 'blur(8px)',
                      }}>
                        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: '#606080', marginBottom: 4 }}>{stat.label}</div>
                        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Two column */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, overflow: 'hidden' }}>
                    {/* Upcoming */}
                    <div style={{
                      padding: 14, borderRadius: 8,
                      background: 'rgba(24,28,34,0.55)',
                      border: '1px solid rgba(66,71,84,0.25)',
                    }}>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#8c90a0', marginBottom: 10 }}>UPCOMING</div>
                      {[
                        { title: 'Math Quiz Ch.5', due: 'Tomorrow', color: '#ff6b9d' },
                        { title: 'Physics Lab Report', due: 'Thu', color: '#ffaa4d' },
                        { title: 'English Essay', due: 'Fri', color: '#4dff91' },
                      ].map(item => (
                        <div key={item.title} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '6px 0', borderBottom: '1px solid rgba(66,71,84,0.15)',
                        }}>
                          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#dfe2eb' }}>{item.title}</div>
                          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: item.color }}>{item.due}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI Chat preview */}
                    <div style={{
                      padding: 14, borderRadius: 8,
                      background: 'rgba(24,28,34,0.55)',
                      border: '1px solid rgba(66,71,84,0.25)',
                      display: 'flex', flexDirection: 'column', gap: 8,
                    }}>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#8c90a0' }}>SHIORI AI</div>
                      <div style={{
                        padding: '8px 10px', borderRadius: 8,
                        background: 'rgba(82,141,255,0.12)',
                        border: '1px solid rgba(82,141,255,0.15)',
                        fontFamily: "'Manrope', sans-serif", fontSize: 11, color: '#afc6ff',
                        lineHeight: 1.5,
                      }}>
                        You have 2 tasks due tomorrow. I'd suggest tackling the Math Quiz first — it's worth 30% of your grade.
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 10px', borderRadius: 6,
                        background: 'linear-gradient(45deg, rgba(196,77,255,0.10), rgba(82,141,255,0.05))',
                        border: '1px solid rgba(196,77,255,0.15)',
                        color: '#e5b5ff', fontSize: 10,
                        fontFamily: "'Space Grotesk', sans-serif",
                        cursor: 'pointer',
                      }}>
                        <Zap size={10} /> Generate study plan for this week →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(16px, 2.5vw, 24px)',
              color: '#dfe2eb', marginBottom: 16,
            }}>
              HOW IT WORKS
            </div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, color: '#8c90a0', marginBottom: 60 }}>
              Three steps from chaos to a clear study plan.
            </p>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.15}>
                <div style={{
                  padding: 28, borderRadius: 12,
                  border: '1px solid rgba(66,71,84,0.30)',
                  background: 'rgba(24,28,34,0.45)',
                  backdropFilter: 'blur(12px)',
                  position: 'relative', textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 32, color: step.color, opacity: 0.3,
                    marginBottom: 16, lineHeight: 1,
                  }}>{step.num}</div>
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 18, fontWeight: 700, color: '#dfe2eb', marginBottom: 8,
                  }}>{step.title}</div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#8c90a0', lineHeight: 1.6 }}>
                    {step.desc}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(16px, 2.5vw, 24px)',
              color: '#dfe2eb', marginBottom: 16,
            }}>
              EVERY TOOL YOU NEED
            </div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, color: '#8c90a0' }}>
              Built for students who actually want to get things done.
            </p>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ translateY: -4 }}
                  style={{
                    padding: 24, borderRadius: 12,
                    border: '1px solid rgba(66,71,84,0.30)',
                    background: 'rgba(24,28,34,0.45)',
                    backdropFilter: 'blur(12px)',
                    position: 'relative', overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${f.glow}` }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{
                    position: 'absolute', top: -20, right: -20,
                    width: 80, height: 80, borderRadius: '50%',
                    background: `radial-gradient(circle, ${f.glow.replace('0.15', '0.4')} 0%, transparent 70%)`,
                    filter: 'blur(10px)',
                  }} />
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `rgba(${f.color === '#afc6ff' ? '82,141,255' : f.color === '#d7ffc5' ? '74,215,120' : f.color === '#e5b5ff' ? '196,77,255' : f.color === '#ffd6a0' ? '255,170,77' : f.color === '#ff6b9d' ? '255,107,157' : '77,255,200'},0.15)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <f.icon size={20} style={{ color: f.color }} />
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: '#dfe2eb', marginBottom: 8 }}>
                    {f.title}
                  </div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0', lineHeight: 1.6 }}>
                    {f.desc}
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{
            maxWidth: 800, margin: '0 auto',
            borderRadius: 16, padding: '48px 40px',
            border: '1px solid rgba(175,198,255,0.15)',
            background: 'linear-gradient(135deg, rgba(82,141,255,0.06) 0%, rgba(196,77,255,0.04) 100%)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(14px, 2vw, 20px)',
              color: '#dfe2eb', marginBottom: 40,
            }}>
              BUILT FOR REAL STUDENTS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32 }}>
              {[
                { value: '100%', label: 'Free & Open Source', color: '#d7ffc5' },
                { value: '< 5min', label: 'Setup time', color: '#afc6ff' },
                { value: 'MIT', label: 'License', color: '#e5b5ff' },
                { value: '∞', label: 'Self-hosted forever', color: '#ff6b9d' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 'clamp(20px, 3vw, 32px)',
                    color: stat.color, marginBottom: 8,
                  }}>{stat.value}</div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(16px, 2.5vw, 24px)',
              color: '#dfe2eb', marginBottom: 16,
            }}>
              PRICING
            </div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, color: '#8c90a0' }}>
              Free to self-host forever. Shiori Cloud handles the setup for you.
            </p>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
            {PRICING.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <div style={{
                  padding: 28, borderRadius: 12, position: 'relative', overflow: 'hidden',
                  border: plan.highlight
                    ? '1px solid rgba(196,77,255,0.45)'
                    : '1px solid rgba(66,71,84,0.30)',
                  background: plan.highlight
                    ? 'rgba(196,77,255,0.07)'
                    : 'rgba(24,28,34,0.45)',
                  boxShadow: plan.highlight ? '0 0 40px rgba(196,77,255,0.12)' : 'none',
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      padding: '3px 10px', borderRadius: 100,
                      background: 'linear-gradient(45deg, #c44dff, #8b63a5)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      letterSpacing: '0.06em',
                    }}>POPULAR</div>
                  )}
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 14, color: plan.color, marginBottom: 4,
                  }}>{plan.name}</div>
                  <div style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 12, color: '#606080', marginBottom: 20,
                  }}>{plan.subname}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                    <span style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 28, color: '#dfe2eb',
                    }}>฿{plan.price}</span>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080' }}>
                      {plan.unit}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <CheckCircle2 size={14} style={{ color: plan.color, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={plan.ctaLink}
                    style={{
                      display: 'block', textAlign: 'center',
                      padding: '10px 20px', borderRadius: 8,
                      background: plan.highlight
                        ? 'linear-gradient(135deg, #c44dff 0%, #8b63a5 100%)'
                        : `rgba(${plan.color === '#afc6ff' ? '82,141,255' : plan.color === '#d7ffc5' ? '74,215,120' : '196,77,255'},0.12)`,
                      border: plan.highlight ? 'none' : `1px solid rgba(${plan.color === '#afc6ff' ? '82,141,255' : plan.color === '#d7ffc5' ? '74,215,120' : '196,77,255'},0.25)`,
                      color: plan.highlight ? '#fff' : plan.color,
                      textDecoration: 'none',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13, fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 24px 120px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{
            maxWidth: 700, margin: '0 auto', textAlign: 'center',
            padding: '64px 40px', borderRadius: 20,
            border: '1px solid rgba(196,77,255,0.20)',
            background: 'linear-gradient(135deg, rgba(82,141,255,0.06) 0%, rgba(196,77,255,0.08) 50%, rgba(255,107,157,0.04) 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(196,77,255,0.5), transparent)',
            }} />
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(14px, 2.5vw, 22px)',
              color: '#dfe2eb', marginBottom: 16, lineHeight: 1.4,
            }}>
              Your next exam is waiting.
            </div>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 16, color: '#8c90a0', marginBottom: 36, lineHeight: 1.6,
            }}>
              Try Shiori's demo in 10 seconds — no account, no Google login, no setup.
              See exactly what it feels like to have an AI that knows your deadlines.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDemo}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '16px 40px', borderRadius: 10,
                background: 'linear-gradient(135deg, #c44dff 0%, #7b3fa8 50%, #4d6fff 100%)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 12, letterSpacing: '0.05em',
                boxShadow: '0 0 60px rgba(196,77,255,0.30), 0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <Sparkles size={16} /> TRY DEMO FREE <ArrowRight size={16} />
            </motion.button>
            <div style={{
              marginTop: 20, fontFamily: "'Manrope', sans-serif",
              fontSize: 12, color: '#606080',
            }}>
              Open source · MIT license · No account needed
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(66,71,84,0.25)',
        padding: '32px 24px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>栞</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: '#8c90a0' }}>
              Shiori — bookmark the things that matter.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'GitHub', href: 'https://github.com/kaorii-ako/Shiori-v1' },
              { label: 'Demo', href: '/login' },
              { label: 'Pro', href: '/pro' },
              { label: 'MIT License', href: 'https://github.com/kaorii-ako/Shiori-v1/blob/master/LICENSE' },
            ].map(link => (
              link.href.startsWith('/') ? (
                <Link key={link.label} to={link.href} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#606080', textDecoration: 'none' }}
                  onMouseEnter={e => { e.target.style.color = '#afc6ff' }}
                  onMouseLeave={e => { e.target.style.color = '#606080' }}
                >{link.label}</Link>
              ) : (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#606080', textDecoration: 'none' }}
                  onMouseEnter={e => { e.target.style.color = '#afc6ff' }}
                  onMouseLeave={e => { e.target.style.color = '#606080' }}
                >{link.label}</a>
              )
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
