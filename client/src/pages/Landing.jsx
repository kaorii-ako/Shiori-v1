import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { animate, stagger } from 'animejs'
import {
  GraduationCap, ClipboardList, BarChart3, Layers, Target, Flame,
  ShieldCheck, Github, Sparkles, ArrowRight,
} from 'lucide-react'
import { C, fonts, tint, btnGhost, iconBox } from '../utils/theme'
import { GoogleLogo } from '../components/GoogleButton'
import Reveal from '../components/Reveal'

const HeroScene = lazy(() => import('../components/HeroScene'))

const features = [
  { icon: GraduationCap, color: C.blue, title: 'Google Classroom Sync', desc: 'Import your courses, assignments and grades in one click — always up to date.' },
  { icon: ClipboardList, color: C.pink, title: 'Assignment Tracker', desc: 'See everything due across every class, sorted by what matters right now.' },
  { icon: BarChart3, color: C.green, title: 'Grade & GPA Tracker', desc: 'Know your grade in every class and predict your final mark before exams.' },
  { icon: Layers, color: C.purple, title: 'AI Flashcards & Quiz', desc: 'Turn your notes into flashcards and practice quizzes with AI in seconds.' },
  { icon: Target, color: C.orange, title: 'Focus Timer', desc: 'Pomodoro sessions that keep you off your phone and on task.' },
  { icon: Flame, color: C.yellow, title: 'Habits & Streaks', desc: 'Build a daily study habit and keep your streak alive with friends.' },
]

const steps = [
  { n: '1', title: 'Sign in with Google', desc: 'Use your school Google account — no new passwords to remember.' },
  { n: '2', title: 'Sync Classroom', desc: 'Your courses, assignments and due dates import automatically.' },
  { n: '3', title: 'Study smarter', desc: 'AI flashcards, quizzes, focus timers and grade predictions — all in one place.' },
]

const stats = [
  { value: 15, suffix: '', label: 'study tools in one app' },
  { value: 100, suffix: '%', label: 'free & open source' },
  { value: 0, suffix: '', label: 'ads, ever' },
]

// Pointer-following "magnetic" button.
function MagneticButton({ children, onClick, style, primary }) {
  const ref = useRef(null)
  const [t, setT] = useState({ x: 0, y: 0 })
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    setT({ x: (e.clientX - (r.left + r.width / 2)) * 0.25, y: (e.clientY - (r.top + r.height / 2)) * 0.35 })
  }
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      animate={{ x: t.x, y: t.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 18 }}
      whileTap={{ scale: 0.96 }}
      style={style}
    >{children}</motion.button>
  )
}

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const started = useRef(false)
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const obj = { v: 0 }
        animate(obj, { v: value, duration: 1500, ease: 'out(4)', onUpdate: () => setDisplay(Math.round(obj.v)) })
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value])
  return <span ref={ref}>{display}{suffix}</span>
}

export default function Landing() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const heroRef = useRef(null)
  const heroContentRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.25])

  // anime.js staggered entrance for the hero copy
  useEffect(() => {
    if (reduceMotion) return
    const els = heroContentRef.current?.querySelectorAll('[data-hero]')
    if (!els?.length) return
    animate(els, {
      opacity: [0, 1],
      translateY: [28, 0],
      filter: ['blur(8px)', 'blur(0px)'],
      delay: stagger(120, { start: 150 }),
      duration: 900,
      ease: 'out(3)',
    })
  }, [reduceMotion])

  const primaryCta = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '15px 30px', borderRadius: 14, border: 'none',
    background: '#fff', color: '#161616', cursor: 'pointer',
    fontFamily: fonts.heading, fontSize: 15, fontWeight: 600,
    boxShadow: '0 10px 40px rgba(255,255,255,0.14)',
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: fonts.body, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(700px 500px at 50% -10%, rgba(90,139,255,0.14), transparent 70%),
          radial-gradient(500px 400px at 90% 30%, rgba(181,92,255,0.08), transparent 70%),
          radial-gradient(500px 400px at 5% 60%, rgba(61,220,132,0.05), transparent 70%)
        `,
      }} />

      {/* Nav */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px clamp(20px, 5vw, 40px)',
          borderBottom: `1px solid ${C.borderSoft}`,
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(11,14,20,0.7)', backdropFilter: 'blur(14px)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 12, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: '#0b0e14',
              boxShadow: '0 4px 16px rgba(90,139,255,0.35)',
            }}>栞</motion.div>
          <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, letterSpacing: '0.05em' }}>SHIORI</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a
            href="https://github.com/kaorii-ako/Shiori-v1" target="_blank" rel="noopener noreferrer"
            aria-label="GitHub"
            style={{ display: 'flex', padding: 8, color: C.textMuted }}
          ><Github size={17} /></a>
          <button onClick={() => navigate('/login')} style={{ ...btnGhost, padding: '8px 16px' }}>Sign in</button>
          <MagneticButton onClick={() => navigate('/signup')} style={{
            ...primaryCta, padding: '9px 18px', fontSize: 14, boxShadow: '0 6px 20px rgba(255,255,255,0.12)',
          }}>Get started</MagneticButton>
        </div>
      </motion.nav>

      {/* Hero with 3D backdrop */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: 'clamp(560px, 88vh, 820px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* 3D scene */}
        <motion.div style={{
          position: 'absolute', inset: 0, zIndex: 0, scale: sceneScale,
          maskImage: 'radial-gradient(120% 90% at 50% 40%, #000 55%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 40%, #000 55%, transparent 85%)',
        }}>
          {!reduceMotion && (
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          )}
        </motion.div>

        {/* Hero copy */}
        <motion.div
          ref={heroContentRef}
          style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '40px 24px', maxWidth: 820, margin: '0 auto', y: contentY, opacity: contentOpacity, pointerEvents: 'none' }}
        >
          <div data-hero style={{ pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999,
            border: `1px solid ${tint(C.blue, 0.3)}`, background: 'rgba(11,14,20,0.5)', backdropFilter: 'blur(6px)',
            fontFamily: fonts.heading, fontSize: 12.5, color: C.blue, marginBottom: 28,
          }}><GoogleLogo size={13} /> Syncs with Google Classroom · Free for students</div>

          <h1 data-hero style={{
            fontSize: 'clamp(40px, 7vw, 72px)', fontFamily: fonts.heading,
            fontWeight: 700, lineHeight: 1.05, marginBottom: 22, letterSpacing: '-0.02em',
          }}>
            Everything for school,<br />
            <span style={{
              background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purple} 55%, ${C.pink} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>in one place</span>
          </h1>

          <p data-hero style={{ fontSize: 17, color: C.textMuted, lineHeight: 1.7, maxWidth: 540, margin: '0 auto 38px' }}>
            Shiori pulls your assignments and grades straight from Google Classroom,
            then helps you study smarter with AI flashcards, focus timers, and grade tracking.
          </p>

          <div data-hero style={{ pointerEvents: 'auto', display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticButton primary onClick={() => navigate('/login')} style={primaryCta}>
              <GoogleLogo size={18} /> Continue with Google
            </MagneticButton>
            <MagneticButton onClick={() => navigate('/demo')} style={{ ...btnGhost, padding: '15px 26px', fontSize: 15, background: 'rgba(11,14,20,0.5)', backdropFilter: 'blur(6px)' }}>
              <Sparkles size={16} /> Try the demo
            </MagneticButton>
          </div>

          <p data-hero style={{ pointerEvents: 'auto', marginTop: 20, fontSize: 13, color: C.textFaint }}>
            No credit card · No ads · Open source ·{' '}
            <Link to="/signup" style={{ color: C.blue, textDecoration: 'none' }}>or sign up with email</Link>
          </p>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2, fontSize: 12, color: C.textFaint, fontFamily: fonts.heading }}
        >scroll ↓</motion.div>
      </section>

      {/* Stats strip */}
      <section style={{ padding: '10px 24px 40px', maxWidth: 880, margin: '0 auto', position: 'relative' }}>
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: fonts.heading, fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 700, background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section style={{ padding: '40px 24px', maxWidth: 980, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <motion.div whileHover={{ y: -4 }} style={{
                background: `linear-gradient(180deg, ${C.cardSoft} 0%, ${C.card} 100%)`,
                border: `1px solid ${C.border}`, borderRadius: 16, padding: 24,
                display: 'flex', gap: 16, alignItems: 'flex-start', height: '100%',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: tint(C.blueDark, 0.15), border: `1px solid ${tint(C.blueDark, 0.3)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: C.blue,
                }}>{s.n}</div>
                <div>
                  <h3 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
        <Reveal>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            Everything you need to stay on top of school
          </h2>
          <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 15, marginBottom: 44 }}>
            One app instead of six tabs, a paper planner, and a prayer.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <motion.div
                  whileHover={{ y: -6, borderColor: tint(f.color, 0.5) }}
                  style={{
                    background: `linear-gradient(180deg, ${C.cardSoft} 0%, ${C.card} 100%)`,
                    border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, height: '100%',
                  }}>
                  <div style={{ ...iconBox(f.color, 44), marginBottom: 16 }}>
                    <Icon size={21} strokeWidth={2.2} />
                  </div>
                  <h3 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.65 }}>{f.desc}</p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* For schools */}
      <section style={{ padding: '50px 24px', maxWidth: 860, margin: '0 auto 20px', position: 'relative' }}>
        <Reveal>
          <div style={{
            background: `linear-gradient(135deg, ${tint(C.greenDark, 0.08)} 0%, ${tint(C.blueDark, 0.06)} 100%)`,
            border: `1px solid ${tint(C.greenDark, 0.25)}`,
            borderRadius: 20, padding: 'clamp(24px, 5vw, 40px)',
            display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
          }}>
            <div style={iconBox(C.greenDark, 52)}>
              <ShieldCheck size={25} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Built with schools in mind</h2>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
                Shiori is open source (MIT), free for students, and uses Google sign-in — so it works with
                the school accounts students already have. Your data stays in your own Google account and
                the app only requests read access to Classroom. Schools can also self-host the whole thing.
              </p>
              <a
                href="https://github.com/kaorii-ako/Shiori-v1" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.green, fontSize: 13.5, fontWeight: 700, textDecoration: 'none', fontFamily: fonts.heading }}
              >View the source on GitHub <ArrowRight size={14} /></a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '70px 24px', borderTop: `1px solid ${C.borderSoft}`, position: 'relative' }}>
        <Reveal>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 700, marginBottom: 12 }}>Ready to get organized?</h2>
          <p style={{ color: C.textMuted, fontSize: 15, marginBottom: 30 }}>
            Sign in with your school Google account — it takes about 30 seconds.
          </p>
          <MagneticButton onClick={() => navigate('/login')} style={{ ...primaryCta, display: 'inline-flex', margin: '0 auto' }}>
            <GoogleLogo size={18} /> Continue with Google
          </MagneticButton>
        </Reveal>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px clamp(20px, 5vw, 40px)', borderTop: `1px solid ${C.borderSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13 }}>栞 Shiori</span>
          <span style={{ fontSize: 12, color: C.textFaint }}>· MIT License · Open source · Made by a student</span>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <button onClick={() => navigate('/demo')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted, fontFamily: fonts.body }}>Demo</button>
          <a href="https://github.com/kaorii-ako/Shiori-v1" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}>GitHub ↗</a>
        </div>
      </footer>
    </div>
  )
}
