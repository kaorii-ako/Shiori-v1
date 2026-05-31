import { useState, useMemo } from 'react'
import { useNotesStore } from '../stores'
import { C } from '../utils/theme'

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (notes || []).filter(n =>
      (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
    )
  }, [notes, search])

  const active = selected ? (notes || []).find(n => n.id === selected) : null

  const handleNew = () => {
    const n = { id: Date.now().toString(), title: 'Untitled Note', content: '', createdAt: new Date().toISOString() }
    addNote(n)
    setSelected(n.id)
  }

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: C.text, display: 'flex', height: 'calc(100vh - 96px)', gap: 0 }}>
      {/* Left panel */}
      <div style={{
        width: 300, flexShrink: 0,
        background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        marginRight: 16,
      }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>📝 Notes</h2>
            <button onClick={handleNew} style={{
              padding: '5px 10px', borderRadius: 6, border: 'none',
              background: 'linear-gradient(135deg, #afc6ff, #528dff)',
              color: '#10141a', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700,
            }}>+ New</button>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 7,
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 12, fontFamily: "'Manrope', sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
              No notes yet
            </div>
          ) : filtered.map(n => (
            <div key={n.id} onClick={() => setSelected(n.id)} style={{
              padding: '12px 14px', cursor: 'pointer',
              borderBottom: `1px solid ${C.border}`,
              background: selected === n.id ? C.cardHover : 'transparent',
              borderLeft: selected === n.id ? `3px solid ${C.blue}` : '3px solid transparent',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                {n.title || 'Untitled'}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted }}>
                {(n.content || '').slice(0, 50)}{(n.content || '').length > 50 ? '…' : ''}
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor panel */}
      <div style={{
        flex: 1, background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {!active ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 48 }}>📝</div>
            <p style={{ color: C.textMuted, fontSize: 14 }}>Select a note or create a new one</p>
            <button onClick={handleNew} style={{
              padding: '9px 18px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #afc6ff, #528dff)',
              color: '#10141a', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700,
            }}>+ New Note</button>
          </div>
        ) : (
          <>
            {/* Editor toolbar */}
            <div style={{
              padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <input
                value={active.title || ''}
                onChange={e => updateNote(active.id, { title: e.target.value })}
                placeholder="Note title..."
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: C.text, fontSize: 16, fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                }}
              />
              <button onClick={() => setPreview(p => !p)} style={{
                padding: '5px 10px', borderRadius: 6,
                border: `1px solid ${preview ? C.blue : C.border}`,
                background: preview ? 'rgba(175,198,255,0.15)' : 'transparent',
                color: preview ? C.blue : C.textMuted,
                cursor: 'pointer', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
              }}>{preview ? 'Edit' : 'Preview'}</button>
              <button onClick={() => { deleteNote(active.id); setSelected(null) }} style={{
                padding: '5px 8px', borderRadius: 6, border: `1px solid ${C.border}`,
                background: 'transparent', color: C.textMuted, cursor: 'pointer', fontSize: 12,
              }}
                onMouseEnter={e => e.currentTarget.style.color = C.pink}
                onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
              >🗑</button>
            </div>

            {preview ? (
              <div style={{
                flex: 1, padding: '16px 20px', overflowY: 'auto',
                fontSize: 14, lineHeight: 1.8, color: C.text,
                whiteSpace: 'pre-wrap', fontFamily: "'Manrope', sans-serif",
              }}>
                {active.content || <span style={{ color: C.textMuted }}>Nothing to preview.</span>}
              </div>
            ) : (
              <textarea
                value={active.content || ''}
                onChange={e => updateNote(active.id, { content: e.target.value })}
                placeholder="Start writing... (Markdown supported)"
                style={{
                  flex: 1, padding: '16px 20px',
                  background: 'transparent', border: 'none',
                  color: C.text, fontSize: 14, lineHeight: 1.8,
                  fontFamily: "'Manrope', sans-serif",
                  resize: 'none', outline: 'none',
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
