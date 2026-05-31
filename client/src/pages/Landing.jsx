import { useNavigate } from 'react-router-dom'
import { C } from '../utils/theme'

const features = [
  { icon: '🃏', title: 'AI Flashcards', desc: 'Generate decks from your notes instantly' },
  { icon: '🧩', title: 'Smart Quiz', desc: 'MCQ quizzes powered by Gemini AI' },
  { icon: '📊', title: 'Grade Tracker', desc: 'Track GPA and predict final grades' },
  { icon: '🎯', title: 'Pomodoro Focus', desc: 'Distraction-free deep work sessions' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Compete with friends on study streaks' },
  { icon: '📚', title: 'Study Plans', desc: 'AI-generated week-by-week study guides' },
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
          >Sign Up Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 40px 60px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 20,
          border: '1px solid rgba(175,198,255,0.3)',
          background: 'rgba(175,198,255,0.08)',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: C.blue,
          marginBottom: 24,
        }}>Open Source · Free Forever · No Account Needed for Demo</div>

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
        }}>Your AI-Powered<br />Study Companion</h1>

        <p style={{
          fontSize: 17, color: C.textMuted, lineHeight: 1.7,
          maxWidth: 500, margin: '0 auto 36px',
        }}>
          Shiori helps students manage assignments, generate AI flashcards, track grades,
          and build better study habits — all in one beautiful app.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/demo')}
            style={{
              padding: '14px 28px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
              color: '#10141a', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700,
              boxShadow: '0 8px 32px rgba(82,141,255,0.3)',
            }}
          >Try Demo →</button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '14px 28px', borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.text, cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600,
            }}
          >Sign Up Free</button>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: C.textMuted }}>
          No credit card required · Works in your browser
        </p>
      </section>

      {/* Social proof */}
      <div style={{
        textAlign: 'center', padding: '24px 40px',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800,
          color: C.green,
        }}>10,000+</span>
        <span style={{ fontSize: 15, color: C.textMuted, marginLeft: 10 }}>students already studying smarter</span>
      </div>

      {/* Features */}
      <section style={{ padding: '60px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700,
          textAlign: 'center', marginBottom: 40, color: C.text,
        }}>Everything you need to excel</h2>
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
        }}>Ready to study smarter?</h2>
        <p style={{ color: C.textMuted, fontSize: 15, marginBottom: 28 }}>
          Free forever. Open source. No account needed to try.
        </p>
        <button
          onClick={() => navigate('/demo')}
          style={{
            padding: '14px 32px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #afc6ff 0%, #528dff 100%)',
            color: '#10141a', cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700,
          }}
        >Try Demo Now →</button>
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
