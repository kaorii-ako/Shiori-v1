import { useNavigate, Link } from 'react-router-dom'
import {
  GraduationCap, ClipboardList, BarChart3, Layers, Target, Flame,
  ShieldCheck, Github, Sparkles, ArrowRight,
} from 'lucide-react'
import { C, fonts, tint, btnPrimary, btnGhost, iconBox } from '../utils/theme'
import { GoogleLogo } from '../components/GoogleButton'

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

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: fonts.body, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(700px 500px at 50% -10%, rgba(90,139,255,0.12), transparent 70%),
          radial-gradient(500px 400px at 90% 30%, rgba(181,92,255,0.07), transparent 70%),
          radial-gradient(500px 400px at 5% 60%, rgba(61,220,132,0.05), transparent 70%)
        `,
      }} />

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px clamp(20px, 5vw, 40px)',
        borderBottom: `1px solid ${C.borderSoft}`,
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,14,20,0.8)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: '#0b0e14',
            boxShadow: '0 4px 16px rgba(90,139,255,0.35)',
          }}>栞</div>
          <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, letterSpacing: '0.05em' }}>SHIORI</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a
            href="https://github.com/kaorii-ako/Shiori-v1" target="_blank" rel="noopener noreferrer"
            aria-label="GitHub"
            style={{ display: 'flex', padding: 8, color: C.textMuted }}
          ><Github size={17} /></a>
          <button onClick={() => navigate('/login')} style={{ ...btnGhost, padding: '8px 16px' }}>Sign in</button>
          <button onClick={() => navigate('/signup')} style={{ ...btnPrimary, padding: '8px 18px' }}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="page-enter" style={{ textAlign: 'center', padding: 'clamp(60px, 10vh, 110px) 24px 60px', maxWidth: 820, margin: '0 auto', position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999,
          border: `1px solid ${tint(C.blue, 0.3)}`,
          background: tint(C.blue, 0.07),
          fontFamily: fonts.heading, fontSize: 12.5, color: C.blue,
          marginBottom: 28,
        }}><GoogleLogo size={13} /> Syncs with Google Classroom · Free for students</div>

        <h1 style={{
          fontSize: 'clamp(38px, 6.5vw, 66px)',
          fontFamily: fonts.heading,
          fontWeight: 700, lineHeight: 1.08, marginBottom: 22, letterSpacing: '-0.02em',
        }}>
          Everything for school,<br />
          <span style={{
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purple} 60%, ${C.pink} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>in one place</span>
        </h1>

        <p style={{
          fontSize: 17, color: C.textMuted, lineHeight: 1.7,
          maxWidth: 540, margin: '0 auto 38px',
        }}>
          Shiori pulls your assignments and grades straight from Google Classroom,
          then helps you study smarter with AI flashcards, focus timers, and grade tracking.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 28px', borderRadius: 12, border: 'none',
              background: '#fff', color: '#1f1f1f', cursor: 'pointer',
              fontFamily: fonts.heading, fontSize: 15, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(255,255,255,0.12)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
          ><GoogleLogo size={18} /> Continue with Google</button>
          <button
            onClick={() => navigate('/demo')}
            style={{ ...btnGhost, padding: '14px 26px', fontSize: 15 }}
          ><Sparkles size={16} /> Try the demo</button>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: C.textFaint }}>
          No credit card · No ads · Open source ·{' '}
          <Link to="/signup" style={{ color: C.blue, textDecoration: 'none' }}>or sign up with email</Link>
        </p>
      </section>

      {/* How it works */}
      <section style={{ padding: '40px 24px', maxWidth: 980, margin: '0 auto', position: 'relative' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16,
        }}>
          {steps.map((s) => (
            <div key={s.n} style={{
              background: `linear-gradient(180deg, ${C.cardSoft} 0%, ${C.card} 100%)`,
              border: `1px solid ${C.border}`, borderRadius: 16, padding: 24,
              display: 'flex', gap: 16, alignItems: 'flex-start',
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
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
        <h2 style={{
          fontFamily: fonts.heading, fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 700,
          textAlign: 'center', marginBottom: 12,
        }}>Everything you need to stay on top of school</h2>
        <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 15, marginBottom: 44 }}>
          One app instead of six tabs, a paper planner, and a prayer.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="hover-lift" style={{
                background: `linear-gradient(180deg, ${C.cardSoft} 0%, ${C.card} 100%)`,
                border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 24,
              }}>
                <div style={{ ...iconBox(f.color, 44), marginBottom: 16 }}>
                  <Icon size={21} strokeWidth={2.2} />
                </div>
                <h3 style={{
                  fontFamily: fonts.heading, fontWeight: 700,
                  fontSize: 16, marginBottom: 6,
                }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* For schools */}
      <section style={{
        padding: '50px 24px', maxWidth: 860, margin: '0 auto 20px', position: 'relative',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${tint(C.greenDark, 0.07)} 0%, ${tint(C.blueDark, 0.06)} 100%)`,
          border: `1px solid ${tint(C.greenDark, 0.25)}`,
          borderRadius: 20, padding: 'clamp(24px, 5vw, 40px)',
          display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
        }}>
          <div style={iconBox(C.greenDark, 52)}>
            <ShieldCheck size={25} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Built with schools in mind
            </h2>
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
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '70px 24px',
        borderTop: `1px solid ${C.borderSoft}`, position: 'relative',
      }}>
        <h2 style={{
          fontFamily: fonts.heading, fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 700, marginBottom: 12,
        }}>Ready to get organized?</h2>
        <p style={{ color: C.textMuted, fontSize: 15, marginBottom: 30 }}>
          Sign in with your school Google account — it takes about 30 seconds.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 30px', borderRadius: 12, border: 'none',
            background: '#fff', color: '#1f1f1f', cursor: 'pointer',
            fontFamily: fonts.heading, fontSize: 15, fontWeight: 600,
            boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
          }}
        ><GoogleLogo size={18} /> Continue with Google</button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px clamp(20px, 5vw, 40px)',
        borderTop: `1px solid ${C.borderSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13 }}>栞 Shiori</span>
          <span style={{ fontSize: 12, color: C.textFaint }}>· MIT License · Open source · Made by a student</span>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <button onClick={() => navigate('/demo')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted, fontFamily: fonts.body }}>Demo</button>
          <a
            href="https://github.com/kaorii-ako/Shiori-v1"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}
          >GitHub ↗</a>
        </div>
      </footer>
    </div>
  )
}
