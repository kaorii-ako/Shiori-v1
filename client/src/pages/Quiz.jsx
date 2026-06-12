import { useState } from 'react'
import { Puzzle, X, Trophy, ThumbsUp, BookOpen, Sparkles, AlertTriangle } from 'lucide-react'
import { useNotesStore, useUIStore } from '../stores'
import { C, fonts, tint, inputStyle, btnPrimary, btnGhost } from '../utils/theme'
import { PageHeader, Card } from '../components/ui'
import { callGeminiClient } from '../utils/gemini'

const DEMO_QUIZ = [
  { q: 'What is photosynthesis?', opts: ['Making food from sunlight', 'Breaking down glucose', 'Cell division', 'DNA replication'], ans: 0 },
  { q: 'What is the powerhouse of the cell?', opts: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], ans: 2 },
  { q: 'What does DNA stand for?', opts: ['Deoxyribonucleic Acid', 'Dynamic Nucleic Acid', 'Digital Nucleotide Array', 'Dextro Nucleic Acid'], ans: 0 },
]

export default function Quiz() {
  const { notes } = useNotesStore()
  const { geminiApiKey } = useUIStore()
  const [phase, setPhase] = useState('setup') // setup | quiz | results
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedNote, setSelectedNote] = useState('')

  const startQuiz = async () => {
    if (!geminiApiKey) {
      setQuestions(DEMO_QUIZ)
      setPhase('quiz')
      setCurrent(0); setAnswers([]); setSelected(null)
      return
    }
    setLoading(true)
    try {
      const note = (notes || []).find(n => n.id === selectedNote)
      const content = note?.content || 'General knowledge about studying and learning.'
      const text = await callGeminiClient(
        `Generate 5 multiple choice questions from this content. Return ONLY a JSON array, no markdown: [{"q":"...","opts":["a","b","c","d"],"ans":0}]\n\n${content}`
      ) || ''
      const match = text.match(/\[[\s\S]*\]/)
      const parsed = match ? JSON.parse(match[0]) : DEMO_QUIZ
      setQuestions(parsed)
    } catch {
      setQuestions(DEMO_QUIZ)
    }
    setLoading(false)
    setPhase('quiz')
    setCurrent(0); setAnswers([]); setSelected(null)
  }

  const handleAnswer = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => {
      setAnswers(a => [...a, { q: current, selected: idx, correct: idx === questions[current].ans }])
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1)
        setSelected(null)
      } else {
        setPhase('results')
      }
    }, 900)
  }

  const score = answers.filter(a => a.correct).length

  if (phase === 'results') {
    const perfect = score === questions.length
    const good = score >= questions.length / 2
    const ResultIcon = perfect ? Trophy : good ? ThumbsUp : BookOpen
    const resultColor = perfect ? C.yellow : good ? C.green : C.blue
    return (
      <div className="page-enter" style={{ fontFamily: fonts.body, color: C.text, maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <Card style={{ padding: 44 }}>
          <div style={{
            width: 76, height: 76, borderRadius: 22, margin: '0 auto 18px',
            background: tint(resultColor, 0.12), border: `1px solid ${tint(resultColor, 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: resultColor,
            boxShadow: `0 0 40px ${tint(resultColor, 0.2)}`,
          }}>
            <ResultIcon size={34} strokeWidth={1.8} />
          </div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            {score} / {questions.length}
          </h2>
          <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 8 }}>
            {perfect ? 'Perfect score!' : good ? 'Good job!' : 'Keep studying!'}
          </p>
          <p style={{ color: C.green, fontSize: 13, marginBottom: 28, fontWeight: 700 }}>+{score * 10} XP earned</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setPhase('setup')} style={btnGhost}>New Quiz</button>
            <button onClick={() => { setCurrent(0); setAnswers([]); setSelected(null); setPhase('quiz') }} style={btnPrimary}>Retry</button>
          </div>
        </Card>
      </div>
    )
  }

  if (phase === 'quiz') {
    const q = questions[current]
    return (
      <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: fonts.heading, fontWeight: 600 }}>
            Question {current + 1} of {questions.length}
          </span>
          <button onClick={() => setPhase('setup')} style={{ ...btnGhost, padding: '5px 12px', fontSize: 12, color: C.textMuted }}>
            <X size={12} /> Quit
          </button>
        </div>
        <div style={{ height: 5, background: tint(C.blue, 0.1), borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{
            height: '100%', width: `${((current + 1) / questions.length) * 100}%`,
            background: `linear-gradient(90deg, ${C.blue}, ${C.blueDark})`,
            borderRadius: 3, transition: 'width 0.3s',
          }} />
        </div>
        <Card style={{ padding: '24px 28px', marginBottom: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.6 }}>{q?.q}</p>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(q?.opts || []).map((opt, i) => {
            let bg = C.card, border = C.border, color = C.text
            if (selected !== null) {
              if (i === q.ans) { bg = tint(C.greenDark, 0.12); border = tint(C.greenDark, 0.5); color = C.green }
              else if (i === selected && selected !== q.ans) { bg = tint(C.pink, 0.12); border = tint(C.pink, 0.5); color = C.pink }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} className={selected === null ? 'hover-lift' : ''} style={{
                padding: '14px 18px', borderRadius: 12, border: `1px solid ${border}`,
                background: bg, color, cursor: selected !== null ? 'default' : 'pointer',
                textAlign: 'left', fontSize: 14, fontFamily: fonts.body, fontWeight: 500,
                transition: 'all 0.2s',
              }}>{opt}</button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 560, margin: '0 auto' }}>
      <PageHeader
        icon={Puzzle}
        accent={C.purple}
        title="Quiz Generator"
        subtitle="Test yourself with AI-generated questions"
      />
      <Card style={{ padding: 28 }}>
        {!geminiApiKey && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: tint(C.orange, 0.08), border: `1px solid ${tint(C.orange, 0.3)}`,
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          }}>
            <AlertTriangle size={15} color={C.orange} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: C.orange, lineHeight: 1.5 }}>
              No Gemini API key — a sample quiz will be shown. Add your free key in <strong>Settings</strong> for AI quizzes from your own notes.
            </p>
          </div>
        )}
        {geminiApiKey && (notes || []).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: C.textMuted, marginBottom: 8, fontWeight: 700 }}>Generate from note (optional)</label>
            <select value={selectedNote} onChange={e => setSelectedNote(e.target.value)} style={inputStyle}>
              <option value=''>— General knowledge —</option>
              {(notes || []).map(n => (<option key={n.id} value={n.id}>{n.title || 'Untitled'}</option>))}
            </select>
          </div>
        )}
        <button onClick={startQuiz} disabled={loading} style={{
          ...btnPrimary, width: '100%', padding: '13px', fontSize: 15,
          opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          <Sparkles size={16} /> {loading ? 'Generating…' : 'Start Quiz'}
        </button>
      </Card>
    </div>
  )
}
