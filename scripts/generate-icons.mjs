/**
 * Generates PWA icons using pure Node.js (no external deps).
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// ─── PNG encoder ────────────────────────────────────────────────────────────
function makeCRCTable() {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
}
const CRC = makeCRCTable()
function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length)
  const cv = Buffer.allocUnsafe(4); cv.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, cv])
}
function buildPNG(size, pixels) {
  const rows = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    rows[y * (size * 4 + 1)] = 0 // filter: None
    pixels.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6  // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(rows)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────
function setPixel(buf, x, y, size, r, g, b, a) {
  if (x < 0 || x >= size || y < 0 || y >= size) return
  const i = (y * size + x) * 4
  buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = a
}

function fillEllipse(buf, cx, cy, rx, ry, size, r, g, b, a) {
  const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(size - 1, Math.ceil(cx + rx))
  const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(size - 1, Math.ceil(cy + ry))
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry
      if (dx * dx + dy * dy <= 1) setPixel(buf, x, y, size, r, g, b, a)
    }
  }
}

function fillRect(buf, x0, y0, w, h, size, r, g, b, a) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++)
      setPixel(buf, x, y, size, r, g, b, a)
}

// Scanline triangle fill
function fillTriangle(buf, ax, ay, bx, by, cx2, cy2, size, r, g, b, a) {
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy2)))
  const maxY = Math.min(size - 1, Math.ceil(Math.max(ay, by, cy2)))
  const edges = [[ax, ay, bx, by], [bx, by, cx2, cy2], [cx2, cy2, ax, ay]]
  for (let y = minY; y <= maxY; y++) {
    const xs = []
    for (const [x1, y1, x2, y2] of edges) {
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + (y - y1) / (y2 - y1) * (x2 - x1))
      }
    }
    xs.sort((a, b) => a - b)
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const xStart = Math.max(0, Math.round(xs[i]))
      const xEnd = Math.min(size - 1, Math.round(xs[i + 1]))
      for (let x = xStart; x <= xEnd; x++) setPixel(buf, x, y, size, r, g, b, a)
    }
  }
}

// Rounded background
function fillRoundedBg(buf, size, cornerR, R, G, B) {
  const cx = size / 2, cy = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.max(0, Math.abs(x - cx) - (size / 2 - cornerR))
      const dy = Math.max(0, Math.abs(y - cy) - (size / 2 - cornerR))
      if (dx * dx + dy * dy <= cornerR * cornerR) {
        setPixel(buf, x, y, size, R, G, B, 255)
      }
    }
  }
}

// ─── Icon renderer ───────────────────────────────────────────────────────────
function renderDomusIcon(size) {
  const buf = Buffer.alloc(size * size * 4) // all transparent by default

  const s = size
  // Terracota: #C97B4A = 201,123,74
  fillRoundedBg(buf, s, s * 0.22, 201, 123, 74)

  const W = 255, WA = 255

  // House body: rect from (30%,44%) to (70%,78%)
  const bx0 = Math.round(s * 0.30), by0 = Math.round(s * 0.44)
  const bw  = Math.round(s * 0.40), bh  = Math.round(s * 0.34)
  fillRect(buf, bx0, by0, bw, bh, s, W, W, W, WA)

  // Door cutout (terracota again): (43%,61%) to (57%,78%)
  const dx0 = Math.round(s * 0.43), dy0 = Math.round(s * 0.60)
  const dw  = Math.round(s * 0.14), dh  = Math.round(s * 0.18)
  fillRect(buf, dx0, dy0, dw, dh, s, 201, 123, 74, 255)

  // Door top: rounded (small ellipse cap)
  const dcx = dx0 + dw / 2, dcy = dy0
  fillEllipse(buf, dcx, dcy, dw / 2, dw / 2 * 0.7, s, 201, 123, 74, 255)

  // Roof: triangle peak (50%, 16%), base-left (22%, 46%), base-right (78%, 46%)
  fillTriangle(
    buf,
    Math.round(s * 0.50), Math.round(s * 0.16),
    Math.round(s * 0.22), Math.round(s * 0.46),
    Math.round(s * 0.78), Math.round(s * 0.46),
    s, W, W, W, WA
  )

  // Chimney: rect (60%,10%) to (68%,28%)
  fillRect(buf, Math.round(s*0.59), Math.round(s*0.10), Math.round(s*0.09), Math.round(s*0.18), s, W, W, W, WA)

  // Chimney smoke top (rounded): ellipse
  fillEllipse(buf, Math.round(s*0.635), Math.round(s*0.10), s*0.045, s*0.045, s, W, W, W, WA)

  return buf
}

// ─── Generate files ───────────────────────────────────────────────────────────
try { mkdirSync(PUBLIC, { recursive: true }) } catch {}

for (const size of [192, 512]) {
  const pixels = renderDomusIcon(size)
  const png = buildPNG(size, pixels)
  const path = join(PUBLIC, `icon-${size}.png`)
  writeFileSync(path, png)
  console.log(`✓ icon-${size}.png (${png.length} bytes)`)
}

// Apple touch icon: 180×180
const applePixels = renderDomusIcon(180)
const applePng = buildPNG(180, applePixels)
writeFileSync(join(PUBLIC, 'apple-touch-icon.png'), applePng)
console.log('✓ apple-touch-icon.png')

// Also generate favicon.svg as fallback
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#C97B4A"/>
  <path d="M50 16 L22 46 L78 46 Z" fill="white"/>
  <rect x="30" y="44" width="40" height="34" fill="white"/>
  <rect x="43" y="60" width="14" height="18" fill="#C97B4A"/>
  <rect x="59" y="10" width="9" height="18" fill="white"/>
</svg>`
writeFileSync(join(PUBLIC, 'favicon.svg'), faviconSvg)
console.log('✓ favicon.svg')
