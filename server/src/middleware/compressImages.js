import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

/**
 * Express middleware that compresses uploaded image files to ≤500 KB.
 * Runs AFTER multer has saved the raw files to disk.
 *
 * • Images above 500 KB are re-encoded as JPEG with progressively lower
 *   quality until the target is met (or quality floor of 20 is reached).
 * • Images already ≤500 KB are left untouched.
 * • Non-image files (videos, etc.) are skipped entirely.
 */
const MAX_SIZE_BYTES = 500 * 1024 // 500 KB
const MAX_DIMENSION = 1920        // Max width or height in px
const QUALITY_START = 85
const QUALITY_STEP = 10
const QUALITY_FLOOR = 20

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp']
  if (!imageExts.includes(ext)) return // skip non-images

  const stats = fs.statSync(filePath)
  if (stats.size <= MAX_SIZE_BYTES) return // already small enough

  // Read original into sharp
  const image = sharp(filePath)
  const metadata = await image.metadata()

  // Determine resize dimensions
  let width = metadata.width
  let height = metadata.height
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Try progressively lower quality
  let quality = QUALITY_START
  let buffer

  while (quality >= QUALITY_FLOOR) {
    buffer = await sharp(filePath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()

    if (buffer.length <= MAX_SIZE_BYTES) break
    quality -= QUALITY_STEP
  }

  // Overwrite the original file with compressed version
  const newPath = filePath.replace(/\.[^.]+$/, '.jpg')
  fs.writeFileSync(newPath, buffer)

  // Remove old file if extension changed
  if (newPath !== filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  return newPath
}

/**
 * Middleware: compress all uploaded image files in req.files / req.file
 */
export const compressUploadedImages = async (req, res, next) => {
  try {
    if (req.file) {
      // Single file upload (multer.single)
      const newPath = await compressFile(req.file.path)
      if (newPath) {
        req.file.path = newPath
        req.file.filename = path.basename(newPath)
      }
    }

    if (req.files) {
      // Multi-field upload (multer.fields) → req.files is an object
      if (!Array.isArray(req.files)) {
        for (const fieldName of Object.keys(req.files)) {
          for (const file of req.files[fieldName]) {
            if (file.mimetype?.startsWith('image/')) {
              const newPath = await compressFile(file.path)
              if (newPath) {
                file.path = newPath
                file.filename = path.basename(newPath)
              }
            }
          }
        }
      } else {
        // Array upload (multer.array) → req.files is an array
        for (const file of req.files) {
          if (file.mimetype?.startsWith('image/')) {
            const newPath = await compressFile(file.path)
            if (newPath) {
              file.path = newPath
              file.filename = path.basename(newPath)
            }
          }
        }
      }
    }

    next()
  } catch (err) {
    console.error('Image compression error:', err.message)
    // Don't block the upload — proceed with un-compressed files
    next()
  }
}
