/**
 * imageBytes.js — verify an upload is really a raster image by its magic bytes.
 *
 * Why this exists: both upload paths previously trusted `file.type`, which is
 * browser-declared and attacker-controlled. The Supabase buckets enforce
 * `allowed_mime_types`, but that check also reads the *declared* Content-Type,
 * not the file's actual bytes — so SVG content uploaded as `image/png` gets
 * past both. (Verified empirically: it lands in the bucket. It is not
 * currently exploitable as XSS, because Supabase then serves it back as
 * `image/png` and browsers will not sniff `image/png` into SVG script
 * execution — but the object should never have been accepted in the first
 * place.)
 *
 * This closes the accidental and UI-driven cases by reading the leading bytes.
 * It is NOT the security boundary: anything calling the Storage SDK directly
 * bypasses it entirely. The bucket's `allowed_mime_types` is the server-side
 * control; see docs/security-review-2026-07-25.md for the residual.
 */

const SIGNATURES = [
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif',  bytes: [0x47, 0x49, 0x46, 0x38] }, // "GIF8"
]

const startsWith = (buf, sig) => sig.every((b, i) => buf[i] === b)

// WEBP is a RIFF container: "RIFF" at 0, "WEBP" at 8.
const isWebp = (buf) =>
  startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
  [0x57, 0x45, 0x42, 0x50].every((b, i) => buf[8 + i] === b)

/**
 * Resolve a File to its real image MIME type, or null if the bytes don't match
 * any allowed raster format. Only the first 16 bytes are read.
 */
export async function sniffImageMime(file) {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (isWebp(head)) return 'image/webp'
  for (const { mime, bytes } of SIGNATURES) {
    if (startsWith(head, bytes)) return mime
  }
  return null
}

/**
 * Throw unless `file` is genuinely one of our allowed raster formats.
 * Returns the sniffed MIME type, which callers should send as the upload's
 * contentType instead of the browser-supplied `file.type` — so a mislabelled
 * file cannot dictate how the object is later served.
 */
export async function assertRasterImage(file) {
  const mime = await sniffImageMime(file)
  if (!mime) throw new Error('File must be a PNG, JPEG, WEBP, or GIF image')
  return mime
}
