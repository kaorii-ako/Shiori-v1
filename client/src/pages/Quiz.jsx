import { useState } from 'react'
import { useNotesStore, useUIStore } from '../stores'
import { C } from '../utils/theme'

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
      const note = (notes||[]).find(n=>n.id===selectedNote)
      const content = note?.content || 'General knowledge about studying and learning.'
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Generate 5 multiple choice questions from this content. Return JSON array: [{q,opts:[4 options],ans:index}]\n\n${content}` }] }] })
      })
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
    return (
      <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:560,margin:'0 auto',textAlign:'center' }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:40 }}>
          <div style={{ fontSize:56,marginBottom:12 }}>{score === questions.length ? '🏆' : score >= questions.length/2 ? '👍' : '📚'}</div>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:28,fontWeight:800,color:C.text,marginBottom:8 }}>
            {score} / {questions.length}
          </h2>
          <p style={{ color:C.textMuted,fontSize:14,marginBottom:8 }}>
            {score === questions.length ? 'Perfect score!' : score >= questions.length/2 ? 'Good job!' : 'Keep studying!'}
          </p>
          <p style={{ color:C.green,fontSize:13,marginBottom:28 }}>+{score * 10} XP earned</p>
          <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
            <button onClick={()=>setPhase('setup')} style={{ padding:'10px 20px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.text,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13 }}>New Quiz</button>
            <button onClick={()=>{ setCurrent(0);setAnswers([]);setSelected(null);setPhase('quiz') }} style={{ padding:'10px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>Retry</button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'quiz') {
    const q = questions[current]
    return (
      <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:560,margin:'0 auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <span style={{ fontSize:13,color:C.textMuted }}>Question {current+1} of {questions.length}</span>
          <button onClick={()=>setPhase('setup')} style={{ background:'none',border:`1px solid ${C.border}`,borderRadius:6,padding:'5px 10px',color:C.textMuted,cursor:'pointer',fontSize:12 }}>✕ Quit</button>
        </div>
        <div style={{ height:4,background:C.border,borderRadius:2,overflow:'hidden',marginBottom:24 }}>
          <div style={{ height:'100%',width:`${((current+1)/questions.length)*100}%`,background:'linear-gradient(90deg,#afc6ff,#528dff)',borderRadius:2,transition:'width 0.3s' }} />
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'24px 28px',marginBottom:16 }}>
          <p style={{ fontSize:16,fontWeight:600,color:C.text,lineHeight:1.6 }}>{q?.q}</p>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {(q?.opts||[]).map((opt,i) => {
            let bg = C.card, border = C.border, color = C.text
            if (selected !== null) {
              if (i === q.ans) { bg='rgba(77,255,145,0.15)'; border=C.greenDark; color=C.green }
              else if (i === selected && selected !== q.ans) { bg='rgba(255,107,157,0.15)'; border=C.pink; color=C.pink }
            }
            return (
              <button key={i} onClick={()=>handleAnswer(i)} style={{
                padding:'13px 18px',borderRadius:10,border:`1px solid ${border}`,
                background:bg,color,cursor:selected!==null?'default':'pointer',
                textAlign:'left',fontSize:14,fontFamily:"'Manrope',sans-serif",
                transition:'all 0.2s',
              }}>{opt}</button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:560,margin:'0 auto' }}>
      <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:700,marginBottom:24 }}>🧩 Quiz Generator</h1>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:28 }}>
        {!geminiApiKey && (
          <div style={{ background:'rgba(255,107,157,0.1)',border:`1px solid rgba(255,107,157,0.3)`,borderRadius:10,padding:'12px 16px',marginBottom:20 }}>
            <p style={{ fontSize:13,color:C.pink }}>
              ⚠️ No Gemini API key — demo quiz will be shown. Add your key in <strong>Settings</strong> for AI-generated quizzes.
            </p>
          </div>
        )}
        {geminiApiKey && (notes||[]).length > 0 && (
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block',fontSize:12,color:C.textMuted,marginBottom:8,fontWeight:600 }}>Generate from note (optional)</label>
            <select value={selectedNote} onChange={e=>setSelectedNote(e.target.value)}
              style={{ width:'100%',padding:'9px 12px',borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:13,fontFamily:"'Manrope',sans-serif" }}>
              <option value=''>— General knowledge —</option>
              {(notes||[]).map(n=>(<option key={n.id} value={n.id}>{n.title||'Untitled'}</option>))}
            </select>
          </div>
        )}
        <button onClick={startQuiz} disabled={loading} style={{
          width:'100%',padding:'13px',borderRadius:10,border:'none',
          background: loading ? C.border : 'linear-gradient(135deg,#afc6ff,#528dff)',
          color: loading ? C.textMuted : '#10141a',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,
        }}>{loading ? 'Generating...' : 'Start Quiz →'}</button>
      </div>
    </div>
  )
}
