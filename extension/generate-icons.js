#!/usr/bin/env node
// Generates PNG icons for the Shiori Chrome extension — zero dependencies
// Usage: node generate-icons.js (run from inside extension/)

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcBuf])
}

function makePNG(size) {
  // IHDR: RGBA (color type 6)
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // RGBA
  ihdr[10] = ihdr[11] = ihdr[12] = 0

  const rows = []
  const half = size / 2
  const r = half * 0.9  // circle radius

  for (let y = 0; y < size; y++) {
    const row = Buffer.allocUnsafe(1 + size * 4)
    row[0] = 0  // filter none
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 4
      const dx = x - half, dy = y - half
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > r) {
        // Transparent
        row[i] = row[i+1] = row[i+2] = row[i+3] = 0
        continue
      }

      // Background circle: dark navy → purple gradient
      const t = 1 - dist / r
      const bg_r = Math.round(0x10 + t * 0x18)
      const bg_g = Math.round(0x14 + t * 0x0c)
      const bg_b = Math.round(0x1a + t * 0x20)

      // Draw a bookmark shape (like 栞)
      // Vertical bar: centered, full height
      const cx = Math.round(half)
      const barW = Math.max(2, Math.round(size * 0.15))
      const barH = Math.round(size * 0.65)
      const barTop = Math.round(half - barH / 2)
      const barBot = barTop + barH
      const barL = cx - Math.round(barW / 2)
      const barR = barL + barW

      // Notch (V shape at bottom of bookmark)
      const notchDepth = Math.round(barW * 1.2)
      const onBar = x >= barL && x < barR && y >= barTop && y < barBot
      const atNotch = x >= barL && x < barR && y >= barBot && y < barBot + notchDepth
      const notchCut = atNotch && Math.abs(x - cx) < (y - barBot) * (barW / 2) / notchDepth + 0.5

      // Horizontal cross line
      const crossH = Math.round(size * 0.1)
      const crossY = Math.round(half - barH * 0.1)
      const crossW = Math.round(size * 0.45)
      const crossL = cx - Math.round(crossW / 2)
      const crossR = crossL + crossW
      const onCross = x >= crossL && x < crossR && y >= crossY && y < crossY + crossH

      const isMark = (onBar || onCross) && !notchCut

      if (isMark) {
        // White/lavender mark color
        const brightness = 0.85 + t * 0.15
        row[i]   = Math.round(0xc4 * brightness)  // R
        row[i+1] = Math.round(0xd0 * brightness)  // G
        row[i+2] = Math.round(0xff * brightness)  // B
        row[i+3] = 255
      } else {
        // Purple background circle
        const glow = t > 0.6 ? (t - 0.6) / 0.4 : 0
        row[i]   = Math.round(bg_r + glow * 0x80)  // R
        row[i+1] = Math.round(bg_g + glow * 0x20)  // G
        row[i+2] = Math.round(bg_b + glow * 0x60)  // B
        row[i+3] = 255
      }
    }
    rows.push(row)
  }

  const raw = Buffer.concat(rows)
  const compressed = zlib.deflateSync(raw, { level: 9 })
  const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

const dir = path.join(__dirname, 'icons')
if (!fs.existsSync(dir)) fs.mkdirSync(dir)

for (const size of [16, 32, 48, 128]) {
  const file = path.join(dir, `icon${size}.png`)
  fs.writeFileSync(file, makePNG(size))
  console.log(`✓ icons/icon${size}.png (${size}×${size})`)
}
console.log('\nShiori icons generated! Ready for Chrome Web Store submission.')
