// Shiori design tokens — single source of truth for the inline-style system.
// Every page/component imports `C` (colors) and the style helpers below.

export const C = {
  // Surfaces
  bg: '#0b0e14',
  bgSoft: '#10141c',
  card: '#12161f',
  cardSoft: '#161b26',
  cardHover: '#1a2030',
  border: '#222a3a',
  borderSoft: '#1a2130',

  // Ink
  text: '#e8ebf4',
  textMuted: '#9aa1b5',
  textFaint: '#5c6478',

  // Accents
  blue: '#9db8ff',
  blueDark: '#5a8bff',
  purple: '#d9a9ff',
  purpleDark: '#b55cff',
  green: '#a6f0a0',
  greenDark: '#3ddc84',
  pink: '#ff7aa8',
  orange: '#ffc88a',
  yellow: '#ffe08a',
  red: '#ff8a80',
}

// Translucent tint for accent chips / icon boxes
export const tint = (hex, a = 0.12) => {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r},${g},${b},${a})`
}

export const fonts = {
  heading: "'Space Grotesk', sans-serif",
  body: "'Manrope', sans-serif",
}

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 }

export const shadow = {
  card: '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
  lift: '0 12px 32px rgba(0,0,0,0.45)',
  glowBlue: '0 8px 32px rgba(90,139,255,0.25)',
  modal: '0 24px 64px rgba(0,0,0,0.6)',
}

// ---- Reusable style objects ----

export const card = {
  background: `linear-gradient(180deg, ${C.cardSoft} 0%, ${C.card} 100%)`,
  border: `1px solid ${C.border}`,
  borderRadius: radius.lg,
  padding: 20,
  boxShadow: shadow.card,
}

export const cardFlat = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: radius.md,
  padding: 16,
}

export const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: radius.sm + 2,
  background: C.bg,
  border: `1px solid ${C.border}`,
  color: C.text,
  fontSize: 14,
  fontFamily: fonts.body,
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
}

export const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 20px',
  borderRadius: radius.sm + 2,
  border: 'none',
  background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
  color: '#0b0e14',
  cursor: 'pointer',
  fontFamily: fonts.heading,
  fontSize: 14, fontWeight: 700,
  boxShadow: shadow.glowBlue,
  transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
}

export const btnGhost = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 18px',
  borderRadius: radius.sm + 2,
  border: `1px solid ${C.border}`,
  background: 'transparent',
  color: C.text,
  cursor: 'pointer',
  fontFamily: fonts.heading,
  fontSize: 13, fontWeight: 600,
  transition: 'border-color 0.15s ease, background 0.15s ease',
}

export const btnAccent = (color) => ({
  ...btnGhost,
  color,
  border: `1px solid ${tint(color, 0.35)}`,
  background: tint(color, 0.08),
})

export const chip = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '3px 10px',
  borderRadius: radius.pill,
  background: tint(color, 0.12),
  border: `1px solid ${tint(color, 0.25)}`,
  color,
  fontFamily: fonts.heading,
  fontSize: 11, fontWeight: 600,
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
})

export const iconBox = (color, size = 40) => ({
  width: size, height: size,
  borderRadius: Math.round(size * 0.3),
  flexShrink: 0,
  background: `linear-gradient(135deg, ${tint(color, 0.22)} 0%, ${tint(color, 0.08)} 100%)`,
  border: `1px solid ${tint(color, 0.25)}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color,
})
