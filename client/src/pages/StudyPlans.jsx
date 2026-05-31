import { useState } from 'react'
import { useUIStore } from '../stores'
import { C } from '../utils/theme'

const DEMO_PLAN = {
  subject: 'Biology Final',
  weeks: [
    { week: 1, topic: 'Cell Biology & Organelles', tasks: ['Read Ch 1-2', 'Make flashcards', 'Practice diagrams'] },
    { week: 2, topic: 'Genetics & DNA', tasks: ['Read Ch 3-4', 'Punnett square practice', 'Review lecture notes'] },
    { week: 3, topic: 'Evolution & Ecology', tasks: ['Read Ch 5-6', 'Watch videos', 'Past exam questions'] },
    { week: 4, topic: 'Review & Practice Exams', tasks: ['Full practice test', 'Review weak areas', 'Final revision'] },
  ]
}

export default function StudyPlans() {
  const { geminiApiKey } = useUIStore()
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState({ subject: '', examDate: '' })
  const [loading, setLoading] = useState(false)
  const [activePlan, setActivePlan] = useState(null)

  const generate = async () => {
    if (!form.subject.trim()) return
    setLoading(true)
    if (!geminiApiKey) {
      setTimeout(() => {
        const plan = { ...DEMO_PLAN, subject: form.subject, examDate: form.examDate, id: Date.now().toString() }
        setPlans(p => [plan, ...p])
        setActivePlan(plan.id)
        setLoading(false)
        setForm({ subject: '', examDate: '' })
      }, 800)
      return
    }
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Create a 4-week study plan for "${form.subject}" with exam on ${form.examDate||'TBD'}. Return JSON: {subject,weeks:[{week,topic,tasks:[3 tasks]}]}` }] }] })
      })
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      const parsed = match ? JSON.parse(match[0]) : DEMO_PLAN
      const plan = { ...parsed, id: Date.now().toString(), examDate: form.examDate }
      setPlans(p => [plan, ...p])
      setActivePlan(plan.id)
      setForm({ subject: '', examDate: '' })
    } catch {
      const plan = { ...DEMO_PLAN, subject: form.subject, id: Date.now().toString() }
      setPlans(p => [plan, ...p])
      setActivePlan(plan.id)
    }
    setLoading(false)
  }

  const shown = activePlan ? plans.find(p => p.id === activePlan) : null

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>📚 Study Plans</h1>

      {/* Generator */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>
          Generate AI Study Plan
        </h2>
        {!geminiApiKey && (
          <div style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.pink }}>
            No Gemini key — demo plan will be generated. Add key in Settings for AI plans.
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="Subject or topic (e.g. Calculus Final)"
            style={{ flex: 2, minWidth: 200, padding: '9px 12px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "'Manrope', sans-serif" }}
          />
          <input
            type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))}
            style={{ flex: 1, minWidth: 140, padding: '9px 12px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "'Manrope', sans-serif" }}
          />
          <button onClick={generate} disabled={loading || !form.subject.trim()} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: loading || !form.subject.trim() ? C.border : 'linear-gradient(135deg,#afc6ff,#528dff)',
            color: loading || !form.subject.trim() ? C.textMuted : '#10141a',
            cursor: loading || !form.subject.trim() ? 'not-allowed' : 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700,
          }}>{loading ? 'Generating…' : 'Generate →'}</button>
        </div>
      </div>

      {/* Saved plans list */}
      {plans.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {plans.map(p => (
            <button key={p.id} onClick={() => setActivePlan(p.id)} style={{
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${activePlan === p.id ? C.blue : C.border}`,
              background: activePlan === p.id ? 'rgba(175,198,255,0.15)' : 'transparent',
              color: activePlan === p.id ? C.blue : C.textMuted,
              cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
            }}>{p.subject}</button>
          ))}
        </div>
      )}

      {/* Active plan */}
      {shown ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.text }}>{shown.subject}</h2>
            <button onClick={() => { setPlans(p => p.filter(x => x.id !== shown.id)); setActivePlan(null) }}
              style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', color: C.textMuted, cursor: 'pointer', fontSize: 12 }}>Delete</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(shown.weeks || []).map(w => (
              <div key={w.week} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#afc6ff,#528dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#10141a', flexShrink: 0 }}>W{w.week}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: C.text }}>{w.topic}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(w.tasks || []).map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textMuted }}>
                      <span style={{ color: C.blue }}>•</span> {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : plans.length === 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <p style={{ color: C.textMuted, fontSize: 14 }}>No study plans yet. Generate one above!</p>
        </div>
      )}
    </div>
  )
}
