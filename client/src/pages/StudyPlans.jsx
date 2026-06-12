import { useState } from 'react'
import { BookOpen, Sparkles, Trash2, AlertTriangle } from 'lucide-react'
import { useUIStore, useStudyPlansStore } from '../stores'
import { C, fonts, tint, inputStyle, btnPrimary, btnGhost } from '../utils/theme'
import { PageHeader, Card, SectionTitle, Empty } from '../components/ui'

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
  const { plans, addStudyPlan, deleteStudyPlan } = useStudyPlansStore()
  const [form, setForm] = useState({ subject: '', examDate: '' })
  const [loading, setLoading] = useState(false)
  const [activePlan, setActivePlan] = useState(null)

  const generate = async () => {
    if (!form.subject.trim()) return
    setLoading(true)
    if (!geminiApiKey) {
      setTimeout(() => {
        const plan = { ...DEMO_PLAN, subject: form.subject, examDate: form.examDate, id: Date.now().toString() }
        const id = addStudyPlan(plan)
        setActivePlan(id)
        setLoading(false)
        setForm({ subject: '', examDate: '' })
      }, 800)
      return
    }
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Create a 4-week study plan for "${form.subject}" with exam on ${form.examDate || 'TBD'}. Return JSON: {subject,weeks:[{week,topic,tasks:[3 tasks]}]}` }] }] })
      })
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      const parsed = match ? JSON.parse(match[0]) : DEMO_PLAN
      const plan = { ...parsed, id: Date.now().toString(), examDate: form.examDate }
      const id = addStudyPlan(plan)
      setActivePlan(id)
      setForm({ subject: '', examDate: '' })
    } catch {
      const plan = { ...DEMO_PLAN, subject: form.subject, id: Date.now().toString() }
      const id = addStudyPlan(plan)
      setActivePlan(id)
    }
    setLoading(false)
  }

  const shown = activePlan ? plans.find(p => p.id === activePlan) : (plans.length > 0 ? plans[0] : null)
  const canGenerate = !loading && form.subject.trim()

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 820, margin: '0 auto' }}>
      <PageHeader
        icon={BookOpen}
        accent={C.blue}
        title="Study Plans"
        subtitle="AI-built week-by-week plans for any exam"
      />

      {/* Generator */}
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionTitle icon={Sparkles} color={C.purple}>Generate AI Study Plan</SectionTitle>
        {!geminiApiKey && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: tint(C.orange, 0.08), border: `1px solid ${tint(C.orange, 0.3)}`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.orange,
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            No Gemini key — a sample plan will be generated. Add your free key in Settings for AI plans.
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="Subject or topic (e.g. Calculus Final)"
            style={{ ...inputStyle, flex: 2, minWidth: 200, width: 'auto' }}
            onFocus={e => { e.target.style.borderColor = C.blueDark }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
          <input
            type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))}
            style={{ ...inputStyle, flex: 1, minWidth: 140, width: 'auto' }}
            onFocus={e => { e.target.style.borderColor = C.blueDark }}
            onBlur={e => { e.target.style.borderColor = C.border }}
          />
          <button onClick={generate} disabled={!canGenerate} style={{
            ...btnPrimary,
            opacity: canGenerate ? 1 : 0.5,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
          }}>
            <Sparkles size={14} /> {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </Card>

      {/* Saved plans list */}
      {plans.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {plans.map(p => {
            const isActive = activePlan === p.id || (!activePlan && plans[0]?.id === p.id)
            return (
              <button key={p.id} onClick={() => setActivePlan(p.id)} style={{
                padding: '6px 16px', borderRadius: 999,
                border: `1px solid ${isActive ? tint(C.blue, 0.4) : C.border}`,
                background: isActive ? tint(C.blue, 0.12) : 'transparent',
                color: isActive ? C.blue : C.textMuted,
                cursor: 'pointer', fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s ease',
              }}>{p.subject || p.title}</button>
            )
          })}
        </div>
      )}

      {/* Active plan */}
      {shown ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: C.text }}>{shown.subject || shown.title}</h2>
            <button onClick={() => { deleteStudyPlan(shown.id); setActivePlan(null) }}
              style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, color: C.textMuted }}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(shown.weeks || []).map(w => (
              <Card key={w.week} className="hover-lift" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, color: '#0b0e14', flexShrink: 0,
                    boxShadow: `0 4px 12px ${tint(C.blueDark, 0.3)}`,
                  }}>W{w.week}</div>
                  <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: C.text }}>{w.topic}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {(w.tasks || []).map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: C.textMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.blue, flexShrink: 0 }} /> {t}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : plans.length === 0 && (
        <Card style={{ padding: 0 }}>
          <Empty
            icon={BookOpen}
            accent={C.blue}
            title="No study plans yet"
            description="Type a subject above and let AI build you a week-by-week plan."
          />
        </Card>
      )}
    </div>
  )
}
