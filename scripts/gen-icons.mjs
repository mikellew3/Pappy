// Dependency-free PWA icon generator for "Pappy & One".
// Renders simple country-club iconography (cream field, green frame, a gold
// golf ball + ground line) and writes PNGs using Node's built-in zlib.
//
//   node scripts/gen-icons.mjs
//
// Output: public/icons/{icon-192,icon-512,icon-512-maskable,apple-touch-icon}.png
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../public/icons')
mkdirSync(OUT, { recursive: true })

const COLORS = {
  cream: [0xf5, 0xf1, 0xe8],
  card: [0xfb, 0xf8, 0xf0],
  green: [0x1d, 0x4d, 0x2e],
  gold: [0xb8, 0x86, 0x0b],
  goldSoft: [0xd4, 0xa7, 0x2c],
  ink: [0x1a, 0x1a, 0x1a],
}

function blend(dst, src, a) {
  for (let i = 0; i < 3; i++) dst[i] = Math.round(dst[i] * (1 - a) + src[i] * a)
}

// Render an icon into an RGBA buffer. `maskable` skips the frame and shrinks
// content into the safe zone so platforms can crop to any shape.
function render(size, maskable) {
  const buf = Buffer.alloc(size * size * 4)
  const px = (x, y) => (y * size + x) * 4
  const set = (x, y, rgb) => {
    const o = px(x, y)
    buf[o] = rgb[0]
    buf[o + 1] = rgb[1]
    buf[o + 2] = rgb[2]
    buf[o + 3] = 255
  }
  const over = (x, y, rgb, a) => {
    if (a <= 0) return
    const o = px(x, y)
    const dst = [buf[o], buf[o + 1], buf[o + 2]]
    blend(dst, rgb, Math.min(1, a))
    buf[o] = dst[0]
    buf[o + 1] = dst[1]
    buf[o + 2] = dst[2]
    buf[o + 3] = 255
  }

  // Fill background.
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) set(x, y, COLORS.cream)

  // Green frame (skipped for maskable to keep the safe zone clean).
  if (!maskable) {
    const inset = Math.round(size * 0.06)
    const t = Math.max(2, Math.round(size * 0.018))
    for (let y = inset; y < size - inset; y++) {
      for (let x = inset; x < size - inset; x++) {
        const edge =
          x < inset + t || x >= size - inset - t || y < inset + t || y >= size - inset - t
        if (edge) set(x, y, COLORS.green)
      }
    }
  }

  // Layout: golf ball centered slightly high, a gold "ground" line beneath.
  const cx = size / 2
  const ballR = size * (maskable ? 0.24 : 0.22)
  const cy = size * 0.44
  const aaCircle = (px0, py0, r, rgb) => {
    const minX = Math.max(0, Math.floor(px0 - r - 1))
    const maxX = Math.min(size - 1, Math.ceil(px0 + r + 1))
    const minY = Math.max(0, Math.floor(py0 - r - 1))
    const maxY = Math.min(size - 1, Math.ceil(py0 + r + 1))
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d = Math.hypot(x + 0.5 - px0, y + 0.5 - py0)
        const a = Math.max(0, Math.min(1, r - d + 0.5))
        over(x, y, rgb, a)
      }
    }
  }
  const aaRing = (px0, py0, r, thick, rgb) => {
    const outer = r
    const inner = r - thick
    const minX = Math.max(0, Math.floor(px0 - r - 1))
    const maxX = Math.min(size - 1, Math.ceil(px0 + r + 1))
    const minY = Math.max(0, Math.floor(py0 - r - 1))
    const maxY = Math.min(size - 1, Math.ceil(py0 + r + 1))
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d = Math.hypot(x + 0.5 - px0, y + 0.5 - py0)
        const a = Math.min(
          Math.max(0, Math.min(1, outer - d + 0.5)),
          Math.max(0, Math.min(1, d - inner + 0.5)),
        )
        over(x, y, rgb, a)
      }
    }
  }

  // Gold ground line.
  const lineW = size * 0.34
  const lineY = size * 0.74
  const lineT = Math.max(2, size * 0.016)
  for (let y = Math.round(lineY); y < Math.round(lineY + lineT); y++) {
    for (let x = Math.round(cx - lineW / 2); x < Math.round(cx + lineW / 2); x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, COLORS.gold)
    }
  }

  // Ball: soft card fill, gold ring, three dimples.
  aaCircle(cx, cy, ballR, COLORS.card)
  aaRing(cx, cy, ballR, Math.max(2, size * 0.02), COLORS.goldSoft)
  const dimpleR = ballR * 0.12
  const dimples = [
    [cx - ballR * 0.3, cy - ballR * 0.25],
    [cx + ballR * 0.32, cy - ballR * 0.15],
    [cx - ballR * 0.05, cy + ballR * 0.3],
  ]
  for (const [dx, dy] of dimples) aaCircle(dx, dy, dimpleR, COLORS.gold)

  return buf
}

// Minimal PNG encoder (truecolor + alpha, no interlace).
function toPng(rgba, width, height) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const crcTable = (() => {
    const t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[n] = c >>> 0
    }
    return t
  })()
  const crc32 = (buf) => {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type, 'ascii')
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
    return Buffer.concat([len, typeBuf, data, crcBuf])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  // Add filter byte (0) per scanline.
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const targets = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-512-maskable.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
]
for (const t of targets) {
  const rgba = render(t.size, t.maskable)
  const png = toPng(rgba, t.size, t.size)
  writeFileSync(resolve(OUT, t.file), png)
  console.log(`wrote ${t.file} (${png.length} bytes)`)
}
