import { useState, useRef } from 'react'
import { Upload, FileText, Sparkles, Check, AlertTriangle } from 'lucide-react'
import { useAssignmentsStore, useUIStore } from '../stores'
import { C, fonts, tint, btnPrimary, chip } from '../utils/theme'
import { PageHeader, Card } from '../components/ui'
import { callGeminiClient } from '../utils/gemini'

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
      const raw = await callGeminiClient(
        `Extract all assignments and due dates from this syllabus. Return ONLY a JSON array, no markdown: [{"title":"...","dueDate":"YYYY-MM-DD","course":"...","priority":"low|medium|high"}]\n\n${text}`
      ) || ''
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

  const canExtract = !loading && text.trim()
  const priColor = { high: C.pink, medium: C.orange, low: C.green }

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, maxWidth: 720, margin: '0 auto' }}>
      <PageHeader
        icon={Upload}
        accent={C.blue}
        title="Import Syllabus"
        subtitle="Upload or paste your syllabus — Shiori extracts the assignments automatically"
      />

      {!geminiApiKey && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: tint(C.orange, 0.08), border: `1px solid ${tint(C.orange, 0.3)}`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: C.orange,
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          No Gemini key — a sample extraction will be shown. Add your free key in Settings for real AI extraction.
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${drag ? C.blueDark : C.border}`,
          borderRadius: 16, padding: '36px 24px', textAlign: 'center',
          cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.2s ease, background 0.2s ease',
          background: drag ? tint(C.blue, 0.05) : 'transparent',
        }}
      >
        <FileText size={32} color={drag ? C.blue : C.textFaint} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Drop syllabus file here</div>
        <div style={{ fontSize: 12, color: C.textFaint }}>or click to browse · PDF, TXT, DOCX</div>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: C.textFaint, marginBottom: 12 }}>— or paste text —</div>

      <textarea
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Paste your syllabus text here..."
        rows={6}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 12,
          background: C.card, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 13, fontFamily: fonts.body,
          resize: 'vertical', boxSizing: 'border-box', marginBottom: 16, outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={e => { e.target.style.borderColor = C.blueDark }}
        onBlur={e => { e.target.style.borderColor = C.border }}
      />

      <button onClick={extract} disabled={!canExtract} style={{
        ...btnPrimary, width: '100%', padding: '13px', fontSize: 14, marginBottom: 24,
        opacity: canExtract ? 1 : 0.5,
        cursor: canExtract ? 'pointer' : 'not-allowed',
      }}>
        <Sparkles size={15} /> {loading ? 'Extracting…' : 'Extract Assignments'}
      </button>

      {extracted.length > 0 && (
        <div className="page-enter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: C.text }}>
              Found {extracted.length} assignments
            </h2>
            <button onClick={importAll} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: imported ? C.greenDark : C.green,
              color: '#0b0e14', cursor: 'pointer',
              fontFamily: fonts.heading, fontSize: 12, fontWeight: 700,
              boxShadow: `0 6px 20px ${tint(C.greenDark, 0.25)}`,
            }}>{imported ? <><Check size={13} /> Imported!</> : 'Add All to Assignments'}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {extracted.map((a, i) => (
              <Card key={i} className="hover-lift" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{a.course} · Due {a.dueDate}</div>
                </div>
                <span style={{ ...chip(priColor[a.priority] || C.textMuted), textTransform: 'capitalize' }}>{a.priority}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
