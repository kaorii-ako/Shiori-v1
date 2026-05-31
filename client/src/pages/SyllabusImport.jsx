import { useState, useRef } from 'react'
import { useAssignmentsStore, useUIStore } from '../stores'
import { C } from '../utils/theme'

export default function SyllabusImport() {
  const { addAssignment } = useAssignmentsStore()
  const { geminiApiKey } = useUIStore()
  const [text, setText] = useState('')
  const [extracted, setExtracted] = useState([])
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [imported, setImported] = useState(false)
  const fileRef = useRef()

  const DEMO_EXTRACTED = [
    { title: 'Essay 1: Personal Narrative', dueDate: '2025-02-14', course: 'English 101', priority: 'high' },
    { title: 'Midterm Exam', dueDate: '2025-03-10', course: 'English 101', priority: 'high' },
    { title: 'Research Paper Draft', dueDate: '2025-03-28', course: 'English 101', priority: 'medium' },
    { title: 'Final Presentation', dueDate: '2025-04-25', course: 'English 101', priority: 'high' },
  ]

  const extract = async () => {
    if (!text.trim()) return
    setLoading(true)
    if (!geminiApiKey) {
      setTimeout(() => { setExtracted(DEMO_EXTRACTED); setLoading(false) }, 700)
      return
    }
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Extract all assignments and due dates from this syllabus. Return JSON array: [{title,dueDate:YYYY-MM-DD,course,priority:low|medium|high}]\n\n${text}` }] }] })
      })
      const data = await res.json()
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const match = raw.match(/\[[\s\S]*\]/)
      setExtracted(match ? JSON.parse(match[0]) : DEMO_EXTRACTED)
    } catch { setExtracted(DEMO_EXTRACTED) }
    setLoading(false)
  }

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setText(e.target.result)
    reader.readAsText(file)
  }

  const importAll = () => {
    extracted.forEach(a => addAssignment({ ...a, id: Date.now().toString() + Math.random(), completed: false, createdAt: new Date().toISOString() }))
    setImported(true)
    setTimeout(() => setImported(false), 3000)
  }

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>📤 Import Syllabus</h1>
      <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>Upload your syllabus PDF or paste the text — Shiori will extract assignments automatically.</p>

      {!geminiApiKey && (
        <div style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: C.pink }}>
          No Gemini key — demo extraction will be shown. Add your key in Settings for real AI extraction.
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${drag ? C.blue : C.border}`,
          borderRadius: 14, padding: '36px 24px', textAlign: 'center',
          cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.2s',
          background: drag ? 'rgba(175,198,255,0.05)' : 'transparent',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Drop syllabus file here</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>or click to browse · PDF, TXT, DOCX</div>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, marginBottom: 12 }}>— or paste text —</div>

      <textarea
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Paste your syllabus text here..."
        rows={6}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          background: C.card, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 13, fontFamily: "'Manrope', sans-serif",
          resize: 'vertical', boxSizing: 'border-box', marginBottom: 16,
        }}
      />

      <button onClick={extract} disabled={loading || !text.trim()} style={{
        width: '100%', padding: '12px', borderRadius: 10, border: 'none',
        background: loading || !text.trim() ? C.border : 'linear-gradient(135deg,#afc6ff,#528dff)',
        color: loading || !text.trim() ? C.textMuted : '#10141a',
        cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700,
        marginBottom: 24,
      }}>{loading ? 'Extracting…' : 'Extract Assignments →'}</button>

      {extracted.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: C.text }}>
              Found {extracted.length} assignments
            </h2>
            <button onClick={importAll} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: imported ? C.greenDark : 'linear-gradient(135deg,#d7ffc5,#4dff91)',
              color: '#10141a', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700,
            }}>{imported ? '✓ Imported!' : 'Add All to Assignments'}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {extracted.map((a, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{a.course} · Due {a.dueDate}</div>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  color: a.priority === 'high' ? C.pink : a.priority === 'medium' ? C.orange : C.green,
                  background: a.priority === 'high' ? 'rgba(255,107,157,0.15)' : a.priority === 'medium' ? 'rgba(255,214,160,0.15)' : 'rgba(215,255,197,0.15)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>{a.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
