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

export const radius = { sm: 4, md: 6, lg: 8, xl: 10, pill: 999 }

export const shadow = {
  card: '0 1px 0 rgba(0,0,0,0.35)',
  lift: '0 4px 0 rgba(0,0,0,0.3)',
  modal: '0 24px 64px rgba(0,0,0,0.6)',
}

// ---- Reusable style objects ----
// Flat surfaces, hairline borders, no gradients/glow — the accent lives in a
// left rule, not a soft-glow icon chip.

export const card = {
  background: C.card,
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

// Card with a colored left rule instead of a gradient icon chip — the
// signature accent motif used on stat/emphasis cards.
export const cardAccent = (color) => ({
  ...card,
  borderLeft: `3px solid ${color}`,
})

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
  borderRadius: radius.md,
  border: 'none',
  background: C.blueDark,
  color: '#0b0e14',
  cursor: 'pointer',
  fontFamily: fonts.heading,
  fontSize: 14, fontWeight: 700,
  letterSpacing: '0.01em',
  transition: 'transform 0.12s ease, background 0.12s ease',
}

export const btnGhost = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 18px',
  borderRadius: radius.md,
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
  border: `1px solid ${tint(color, 0.4)}`,
  background: tint(color, 0.1),
})

// Squared-off tag, flat fill — deliberately not a pill, not a soft glass chip.
export const chip = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '3px 9px',
  borderRadius: radius.sm,
  background: tint(color, 0.16),
  border: `1px solid ${tint(color, 0.3)}`,
  color,
  fontFamily: fonts.heading,
  fontSize: 11, fontWeight: 700,
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
})

// Flat tint square, hairline border — no gradient fill, no soft rounding.
export const iconBox = (color, size = 40) => ({
  width: size, height: size,
  borderRadius: radius.sm,
  flexShrink: 0,
  background: tint(color, 0.14),
  border: `1px solid ${tint(color, 0.3)}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color,
})
