import { describe, it, expect } from 'vitest'
import { sniffImageMime, assertRasterImage } from './imageBytes'

// Minimal real magic-byte headers.
const PNG  = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPEG = [0xff, 0xd8, 0xff, 0xe0]
const GIF  = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]

const fileOf = (bytes, { type = 'application/octet-stream', name = 'f' } = {}) =>
  new File([new Uint8Array([...bytes, ...new Array(8).fill(0)])], name, { type })

const SVG_XSS = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'

describe('sniffImageMime', () => {
  it('identifies each allowed raster format from its bytes', async () => {
    expect(await sniffImageMime(fileOf(PNG))).toBe('image/png')
    expect(await sniffImageMime(fileOf(JPEG))).toBe('image/jpeg')
    expect(await sniffImageMime(fileOf(GIF))).toBe('image/gif')
    expect(await sniffImageMime(fileOf(WEBP))).toBe('image/webp')
  })

  it('ignores a truthful-looking declared type and trusts bytes', async () => {
    // PNG bytes but declared as gif — we report what it actually is.
    expect(await sniffImageMime(fileOf(PNG, { type: 'image/gif' }))).toBe('image/png')
  })
})

describe('assertRasterImage — the bypass this was written for', () => {
  it('rejects SVG-with-<script> declared as image/png (the accepted-by-bucket case)', async () => {
    const f = new File([SVG_XSS], 'avatar.png', { type: 'image/png' })
    await expect(assertRasterImage(f)).rejects.toThrow(/PNG, JPEG, WEBP, or GIF/)
  })

  it('rejects SVG declared honestly as image/svg+xml', async () => {
    const f = new File([SVG_XSS], 'a.svg', { type: 'image/svg+xml' })
    await expect(assertRasterImage(f)).rejects.toThrow()
  })

  it('rejects HTML renamed to .png', async () => {
    const f = new File(['<html><script>alert(1)</script></html>'], 'x.png', { type: 'image/png' })
    await expect(assertRasterImage(f)).rejects.toThrow()
  })

  it('returns the sniffed type for a genuine image, so callers send that as contentType', async () => {
    await expect(assertRasterImage(fileOf(PNG, { type: 'image/gif' }))).resolves.toBe('image/png')
  })

  it('rejects an empty file', async () => {
    await expect(assertRasterImage(new File([], 'e.png', { type: 'image/png' }))).rejects.toThrow()
  })
})
