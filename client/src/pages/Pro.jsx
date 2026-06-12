import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { motion, useInView } from 'framer-motion'
import {
  Sparkles, CheckCircle2, Zap, Shield, Star, ArrowLeft,
  Brain, Calendar, Mail, BarChart3, FileText, Bell, TrendingUp,
  Users, Crown, Rocket,
} from 'lucide-react'

const PRO_FEATURES = [
  { icon: Brain, title: 'Unlimited AI Study Plans', desc: 'Generate as many plans as you need, recalculated every time your deadlines change.' },
  { icon: Sparkles, title: 'Unlimited AI Chat', desc: 'No daily message cap. Ask Shiori anything, anytime.' },
  { icon: Zap, title: 'Smart Priority Scoring', desc: 'AI ranks your tasks by weight, deadline, and difficulty — not just due date.' },
  { icon: FileText, title: 'PDF & iCal Export', desc: 'Export your study plans to PDF or sync to any calendar app via .ics.' },
  { icon: Bell, title: 'Email Deadline Reminders', desc: '24h and 2h reminders sent to your inbox. Never miss a submission again.' },
  { icon: TrendingUp, title: 'Grade Predictions', desc: 'AI estimates your final grade based on current scores and remaining assignments.' },
  { icon: Calendar, title: 'Smart Calendar Blocking', desc: 'Shiori blocks study time in Google Calendar automatically, respecting your existing events.' },
  { icon: BarChart3, title: 'Progress Analytics', desc: 'Track your study consistency, assignment completion rate, and grade trends over time.' },
]

const FAQ = [
  {
    q: 'Is the free tier really free forever?',
    a: 'Yes. Shiori is MIT-licensed open source. Self-host it forever at zero cost. Shiori Pro/Cloud is a hosted version that handles setup and adds premium AI features.',
  },
  {
    q: 'What happens when my trial ends?',
    a: 'You drop back to the free tier — your data stays safe. Nothing is deleted.',
  },
  {
    q: 'Do you store my Google data?',
    a: 'On the self-hosted version: never. On Shiori Cloud, assignment metadata is stored encrypted to power AI features, and you can delete it anytime.',
  },
  {
    q: 'Can I use Shiori without Google Classroom?',
    a: 'Yes. You can add assignments manually and still use all AI features including study plans and chat.',
  },
  {
    q: 'Is there a student discount?',
    a: 'We\'re a student-built app. The Pro tier is already priced for students at ฿199/month (~$5.50). Email us with your student ID for an extra 30% off.',
  },
]

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const Pro = () => {
  const [billingAnnual, setBillingAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const { user } = useAuthStore()

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billing: billingAnnual ? 'annual' : 'monthly',
          email: user?.email || undefined,
          supabaseUserId: user?.id || undefined,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setCheckoutError('Could not connect to payment server. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const monthlyPrice = 199
  const annualPrice = Math.round(monthlyPrice * 12 * 0.75)
  const annualMonthly = Math.round(annualPrice / 12)

  return (
    <div
      style={{ minHeight: '100vh', background: '#0b0e14', color: '#dfe2eb', overflowX: 'hidden' }}
    >
      {/* Ambient bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,77,255,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82,141,255,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
      </div>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid rgba(66,71,84,0.30)',
        background: 'rgba(16,20,26,0.85)',
        backdropFilter: 'blur(16px)',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', color: '#8c90a0',
          }}>
            <ArrowLeft size={15} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>Back</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>栞</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#dfe2eb' }}>Shiori Pro</span>
            <Crown size={14} style={{ color: '#e5b5ff' }} />
          </div>
          <Link to="/login" style={{
            padding: '6px 16px', borderRadius: 6,
            background: 'linear-gradient(45deg, #afc6ff 0%, #528dff 100%)',
            color: '#0b0e14', textDecoration: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12, fontWeight: 700,
          }}>
            TRY FREE FIRST
          </Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 100,
              border: '1px solid rgba(196,77,255,0.35)',
              background: 'rgba(196,77,255,0.08)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11, fontWeight: 600, color: '#e5b5ff',
              letterSpacing: '0.08em', marginBottom: 24,
            }}>
              <Crown size={11} /> SHIORI PRO
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(18px, 3.5vw, 36px)',
              color: '#dfe2eb', marginBottom: 8, lineHeight: 1.3,
            }}>
              Study smarter.
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(18px, 3.5vw, 36px)',
              background: 'linear-gradient(135deg, #e5b5ff 0%, #c44dff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', marginBottom: 20, lineHeight: 1.3,
            }}>
              Not harder.
            </div>
            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: 16, color: '#8c90a0',
              maxWidth: 480, margin: '0 auto', lineHeight: 1.7,
            }}>
              Shiori Pro gives you unlimited AI, automatic scheduling, grade predictions,
              and everything else you need to actually ace your exams.
            </p>
          </motion.div>
        </section>

        {/* Pricing card */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <FadeIn>
              {/* Billing toggle */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <div style={{
                  display: 'flex', gap: 0, padding: 4, borderRadius: 8,
                  background: 'rgba(24,28,34,0.8)',
                  border: '1px solid rgba(66,71,84,0.30)',
                }}>
                  {[
                    { label: 'Monthly', val: false },
                    { label: 'Annual · Save 25%', val: true },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setBillingAnnual(opt.val)}
                      style={{
                        padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        background: billingAnnual === opt.val
                          ? 'linear-gradient(45deg, rgba(196,77,255,0.25), rgba(82,141,255,0.15))'
                          : 'transparent',
                        color: billingAnnual === opt.val ? '#e5b5ff' : '#606080',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 12, fontWeight: 600,
                        letterSpacing: '0.03em',
                        transition: 'all 0.2s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price card */}
              <div style={{
                borderRadius: 16, padding: '40px 36px',
                border: '1px solid rgba(196,77,255,0.35)',
                background: 'rgba(196,77,255,0.06)',
                boxShadow: '0 0 60px rgba(196,77,255,0.12)',
                position: 'relative', overflow: 'hidden',
                textAlign: 'center',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(196,77,255,0.6), transparent)',
                }} />

                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 13, color: '#e5b5ff', marginBottom: 20,
                }}>PRO</div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 48, color: '#dfe2eb',
                  }}>฿{billingAnnual ? annualMonthly : monthlyPrice}</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#606080' }}>/ month</span>
                </div>

                {billingAnnual && (
                  <div style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#d7ffc5',
                    marginBottom: 8,
                  }}>
                    Billed ฿{annualPrice}/year · Save ฿{monthlyPrice * 12 - annualPrice}
                  </div>
                )}

                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#606080', marginBottom: 28 }}>
                  7-day free trial · Cancel anytime
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  style={{
                    width: '100%', padding: '14px 24px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #c44dff 0%, #7b3fa8 100%)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
                    boxShadow: '0 4px 24px rgba(196,77,255,0.3)',
                    marginBottom: 16,
                  }}
                >
                  {checkoutLoading ? 'REDIRECTING...' : 'START FREE TRIAL'}
                </motion.button>

                {checkoutError && (
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#ffb4ab', marginTop: 8, textAlign: 'center' }}>
                    {checkoutError}
                  </p>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#606080',
                }}>
                  <Shield size={12} />
                  No credit card required for trial
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Pro features */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <FadeIn style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(14px, 2vw, 20px)',
                color: '#dfe2eb',
              }}>WHAT YOU GET</div>
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {PRO_FEATURES.map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.06}>
                  <div style={{
                    display: 'flex', gap: 14, padding: 20, borderRadius: 10,
                    border: '1px solid rgba(66,71,84,0.25)',
                    background: 'rgba(24,28,34,0.40)',
                  }}>
                    <div style={{
                      width: 36, height: 36, flexShrink: 0, borderRadius: 8,
                      background: 'rgba(196,77,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <f.icon size={17} style={{ color: '#e5b5ff' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#dfe2eb', marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#8c90a0', lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Free vs Pro comparison */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <FadeIn style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(13px, 1.8vw, 18px)',
                color: '#dfe2eb',
              }}>FREE VS PRO</div>
            </FadeIn>
            <FadeIn>
              <div style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid rgba(66,71,84,0.30)',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '12px 20px',
                  background: 'rgba(10,14,20,0.8)',
                  borderBottom: '1px solid rgba(66,71,84,0.30)',
                }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#606080' }}>FEATURE</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#8c90a0', textAlign: 'center' }}>FREE</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#e5b5ff', textAlign: 'center' }}>PRO</div>
                </div>
                {[
                  ['Google Classroom Sync', '✓', '✓'],
                  ['Gmail Intelligence', '✓', '✓'],
                  ['Calendar Integration', '✓', '✓'],
                  ['Grade Calculator', '✓', '✓'],
                  ['AI Study Plans', '5/month', 'Unlimited'],
                  ['AI Chat', '10/day', 'Unlimited'],
                  ['Priority Scoring', '—', '✓'],
                  ['PDF Export', '—', '✓'],
                  ['Email Reminders', '—', '✓'],
                  ['Grade Predictions', '—', '✓'],
                  ['Analytics Dashboard', '—', '✓'],
                  ['Smart Calendar Blocking', '—', '✓'],
                ].map(([feat, free, pro], idx) => (
                  <div key={feat} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '12px 20px', alignItems: 'center',
                    borderBottom: idx < 11 ? '1px solid rgba(66,71,84,0.15)' : 'none',
                    background: idx % 2 === 0 ? 'rgba(24,28,34,0.3)' : 'transparent',
                  }}>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0' }}>{feat}</div>
                    <div style={{
                      textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 12, color: free === '✓' ? '#d7ffc5' : free === '—' ? '#424754' : '#afc6ff',
                    }}>{free}</div>
                    <div style={{
                      textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 12, fontWeight: pro !== '—' ? 600 : 400,
                      color: pro === '✓' || pro === 'Unlimited' ? '#e5b5ff' : pro === '—' ? '#424754' : '#e5b5ff',
                    }}>{pro}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <FadeIn style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(13px, 1.8vw, 18px)',
                color: '#dfe2eb',
              }}>FAQ</div>
            </FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQ.map((item, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div style={{
                    borderRadius: 10,
                    border: '1px solid rgba(66,71,84,0.30)',
                    background: 'rgba(24,28,34,0.40)',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%', padding: '16px 20px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#dfe2eb' }}>
                        {item.q}
                      </span>
                      <span style={{ color: '#606080', fontSize: 18, lineHeight: 1, flexShrink: 0, marginLeft: 12 }}>
                        {openFaq === i ? '−' : '+'}
                      </span>
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 20px 16px' }}>
                        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: '#8c90a0', lineHeight: 1.6 }}>
                          {item.a}
                        </div>
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ padding: '0 24px 80px', textAlign: 'center' }}>
          <FadeIn>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#606080', marginBottom: 16 }}>
              Not ready to commit? Try the free demo first.
            </p>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 8,
              border: '1px solid rgba(175,198,255,0.25)',
              background: 'rgba(175,198,255,0.05)',
              color: '#afc6ff', textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600,
            }}>
              <Sparkles size={14} /> Try Demo — No Login Needed
            </Link>
          </FadeIn>
        </section>

      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(66,71,84,0.25)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: '#424754' }}>
          栞 Shiori · Made with care for students
        </div>
      </footer>
    </div>
  )
}

export default Pro
