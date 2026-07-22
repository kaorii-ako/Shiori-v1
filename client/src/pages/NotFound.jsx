import { useNavigate } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { C, fonts, tint, btnPrimary, btnGhost } from '../utils/theme'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: fonts.body, padding: 24, textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'transparent',
      }} />
      <div className="page-enter" style={{ position: 'relative' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 22px',
          background: tint(C.blue, 0.1), border: `1px solid ${tint(C.blue, 0.3)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue,
        }}>
          <Compass size={32} strokeWidth={1.8} />
        </div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 56, fontWeight: 700, lineHeight: 1, marginBottom: 10 }}>404</h1>
        <p style={{ fontSize: 15, color: C.textMuted, marginBottom: 28 }}>
          This page doesn't exist — maybe it got marked absent.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/home')} style={btnPrimary}><Home size={15} /> Go home</button>
          <button onClick={() => navigate(-1)} style={btnGhost}>Go back</button>
        </div>
      </div>
    </div>
  )
}
