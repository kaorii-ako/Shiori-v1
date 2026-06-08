import { useNavigate } from 'react-router-dom'
import { C } from '../utils/theme'
import { GoogleLogo } from '../components/GoogleButton'

const features = [
  { icon: '🎓', title: 'Google Classroom Sync', desc: 'Import your courses, assignments and grades in one click — always up to date' },
  { icon: '📋', title: 'Assignment Tracker', desc: 'See everything due across every class, sorted by what matters now' },
  { icon: '📊', title: 'Grade & GPA Tracker', desc: 'Know your grade in every class and predict your final mark' },
  { icon: '🃏', title: 'AI Flashcards & Quiz', desc: 'Turn your notes into flashcards and practice quizzes with AI' },
  { icon: '🎯', title: 'Focus Timer', desc: 'Pomodoro sessions that keep you off your phone and on task' },
  { icon: '🔥', title: 'Habits & Streaks', desc: 'Build a daily study habit and keep your streak alive' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: "'Manrope', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px',
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 10,
        background: C.bg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#10141a',
          }}>栞</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.blue }}>SHIORI</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: 'transparent', color: C.text, cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
            }}
          >Sign In</button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
              color: '#10141a', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700,
            }}
          >Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 40px 60px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20,
          border: '1px solid rgba(175,198,255,0.3)',
          background: 'rgba(175,198,255,0.08)',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: C.blue,
          marginBottom: 24,
        }}><GoogleLogo size={13} /> Syncs with Google Classroom · Free for students</div>

        <div style={{
          fontSize: 64, lineHeight: 1, marginBottom: 8,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>栞</div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 60px)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800, lineHeight: 1.15, marginBottom: 20,
          background: 'linear-gradient(135deg, #afc6ff 0%, #e5b5ff 60%, #ff6b9d 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Everything for school,<br />in one place</h1>

        <p style={{
          fontSize: 17, color: C.textMuted, lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto 36px',
        }}>
          Shiori pulls your assignments and grades straight from Google Classroom,
          then helps you study smarter with AI flashcards, focus timers, and grade tracking.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 26px', borderRadius: 10, border: 'none',
              background: '#fff', color: '#1f1f1f', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          ><GoogleLogo size={18} /> Continue with Google</button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '14px 26px', borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.text, cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600,
            }}
          >Sign up with email</button>
        </div>

        <p style={{ marginTop: 18, fontSize: 13, color: C.textMuted }}>
          No credit card · Free for students ·{' '}
          <button onClick={() => navigate('/demo')} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>
            explore the demo first
          </button>
        </p>
      </section>

      {/* Classroom callout */}
      <div style={{
        textAlign: 'center', padding: '26px 40px',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <GoogleLogo size={22} />
        <span style={{ fontSize: 15, color: C.text }}>
          Connect once — your <span style={{ color: C.blue, fontWeight: 700 }}>Google Classroom</span> assignments and grades stay in sync automatically.
        </span>
      </div>

      {/* Features */}
      <section style={{ padding: '60px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700,
          textAlign: 'center', marginBottom: 40, color: C.text,
        }}>Everything you need to stay on top of school</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 24,
              transition: 'border-color 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: 16, color: C.text, marginBottom: 6,
              }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '60px 40px',
        background: C.card,
        borderTop: `1px solid ${C.border}`,
      }}>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700,
          color: C.text, marginBottom: 12,
        }}>Ready to get organized?</h2>
        <p style={{ color: C.textMuted, fontSize: 15, marginBottom: 28 }}>
          Sign in with your school Google account — it takes about 30 seconds.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 28px', borderRadius: 10, border: 'none',
            background: '#fff', color: '#1f1f1f', cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600,
          }}
        ><GoogleLogo size={18} /> Continue with Google</button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: C.blue }}>栞 Shiori</span>
          <span style={{ fontSize: 12, color: C.textMuted }}>· MIT License · Open Source</span>
        </div>
        <a
          href="https://github.com/kaorii-ako/Shiori-v1"
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}
        >GitHub ↗</a>
      </footer>
    </div>
  )
}
