import { useState, useMemo } from 'react'
import { useFlashcardsStore } from '../stores'
import { C } from '../utils/theme'

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:28,width:'min(480px,90vw)' }}>
        {children}
      </div>
    </div>
  )
}

export default function Flashcards() {
  const { decks, addDeck, deleteDeck } = useFlashcardsStore()
  const [studyDeck, setStudyDeck] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deckName, setDeckName] = useState('')

  const deck = studyDeck ? (decks || []).find(d => d.id === studyDeck) : null
  const cards = deck?.cards || []
  const card = cards[cardIndex]

  const handleAddDeck = () => {
    if (!deckName.trim()) return
    addDeck({ id: Date.now().toString(), name: deckName, cards: [], createdAt: new Date().toISOString() })
    setDeckName('')
    setShowModal(false)
  }

  if (deck) {
    return (
      <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:600,margin:'0 auto' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:28 }}>
          <button onClick={()=>{setStudyDeck(null);setCardIndex(0);setFlipped(false)}} style={{ background:'none',border:`1px solid ${C.border}`,borderRadius:8,padding:'7px 14px',color:C.textMuted,cursor:'pointer',fontSize:13 }}>← Back</button>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:C.text }}>{deck.name}</h2>
          <span style={{ marginLeft:'auto',fontSize:12,color:C.textMuted }}>{cardIndex+1} / {cards.length}</span>
        </div>

        {cards.length === 0 ? (
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'60px 20px',textAlign:'center' }}>
            <div style={{ fontSize:48,marginBottom:12 }}>🃏</div>
            <p style={{ color:C.textMuted,fontSize:14 }}>No cards in this deck yet.</p>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div style={{ height:4,background:C.border,borderRadius:2,overflow:'hidden',marginBottom:24 }}>
              <div style={{ height:'100%',width:`${((cardIndex+1)/cards.length)*100}%`,background:'linear-gradient(90deg,#afc6ff,#528dff)',borderRadius:2,transition:'width 0.3s ease' }} />
            </div>

            {/* Card */}
            <div onClick={()=>setFlipped(f=>!f)} style={{
              background:C.card,border:`1px solid ${flipped ? C.purple : C.border}`,
              borderRadius:16,padding:'48px 32px',textAlign:'center',cursor:'pointer',
              minHeight:200,display:'flex',alignItems:'center',justifyContent:'center',
              flexDirection:'column',gap:12,marginBottom:24,
              transition:'border-color 0.2s',
              boxShadow: flipped ? `0 0 32px rgba(196,77,255,0.15)` : 'none',
            }}>
              <div style={{ fontSize:11,color:C.textMuted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,letterSpacing:'0.1em',marginBottom:8 }}>
                {flipped ? 'BACK' : 'FRONT'} — click to flip
              </div>
              <div style={{ fontSize:18,fontWeight:600,color:flipped ? C.purple : C.text,lineHeight:1.5 }}>
                {flipped ? card.back : card.front}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
              <button onClick={()=>{setCardIndex(i=>Math.max(0,i-1));setFlipped(false)}} disabled={cardIndex===0} style={{ padding:'9px 20px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:cardIndex===0?C.textMuted:C.text,cursor:cardIndex===0?'not-allowed':'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13 }}>← Prev</button>
              <button onClick={()=>{setFlipped(false)}} style={{ padding:'9px 20px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13 }}>Flip Back</button>
              <button onClick={()=>{setCardIndex(i=>Math.min(cards.length-1,i+1));setFlipped(false)}} disabled={cardIndex===cards.length-1} style={{ padding:'9px 20px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:cardIndex===cards.length-1?C.textMuted:C.text,cursor:cardIndex===cards.length-1?'not-allowed':'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13 }}>Next →</button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ fontFamily:"'Manrope',sans-serif",color:C.text,maxWidth:900,margin:'0 auto' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:700 }}>🃏 Flashcards</h1>
        <button onClick={()=>setShowModal(true)} style={{ padding:'9px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>+ New Deck</button>
      </div>

      {(!decks || decks.length === 0) ? (
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'60px 20px',textAlign:'center' }}>
          <div style={{ fontSize:48,marginBottom:12 }}>🃏</div>
          <p style={{ color:C.textMuted,fontSize:14,marginBottom:16 }}>No flashcard decks yet.</p>
          <button onClick={()=>setShowModal(true)} style={{ padding:'9px 18px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>Create First Deck</button>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14 }}>
          {decks.map(d => (
            <div key={d.id} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,cursor:'pointer',transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
            >
              <div style={{ fontSize:32,marginBottom:10 }}>🃏</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:4 }}>{d.name}</div>
              <div style={{ fontSize:12,color:C.textMuted,marginBottom:14 }}>{(d.cards||[]).length} cards</div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>{setStudyDeck(d.id);setCardIndex(0);setFlipped(false)}} style={{ flex:1,padding:'7px 0',borderRadius:7,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700 }}>Study</button>
                <button onClick={e=>{e.stopPropagation();deleteDeck(d.id)}} style={{ padding:'7px 10px',borderRadius:7,border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,cursor:'pointer',fontSize:12 }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.pink}
                  onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}
                >🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={()=>setShowModal(false)}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:C.text,marginBottom:18 }}>New Deck</h2>
        <label style={{ display:'block',fontSize:12,color:C.textMuted,marginBottom:6,fontWeight:600 }}>Deck Name</label>
        <input value={deckName} onChange={e=>setDeckName(e.target.value)} placeholder="e.g. Biology Chapter 3" onKeyDown={e=>e.key==='Enter'&&handleAddDeck()}
          style={{ width:'100%',padding:'9px 12px',borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:13,fontFamily:"'Manrope',sans-serif",boxSizing:'border-box',marginBottom:20 }} />
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={()=>setShowModal(false)} style={{ padding:'9px 18px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.textMuted,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13 }}>Cancel</button>
          <button onClick={handleAddDeck} style={{ padding:'9px 18px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#afc6ff,#528dff)',color:'#10141a',cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700 }}>Create Deck</button>
        </div>
      </Modal>
    </div>
  )
}
