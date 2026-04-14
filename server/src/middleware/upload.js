import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'misc'
    if (file.fieldname === 'profilePhoto') subDir = 'profiles'
    else if (file.fieldname === 'workImages') subDir = 'work-images'
    else if (file.fieldname === 'workVideo') subDir = 'work-videos'

    const dir = path.join(uploadsDir, subDir)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']

  if (file.fieldname === 'workVideo') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only MP4, WebM, and MOV video formats are allowed'), false)
    }
  } else {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, and WebP image formats are allowed'), false)
    }
  }
}

// Upload configurations
export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
})

// Specific upload handlers
export const uploadProfilePhoto = uploadMedia.single('profilePhoto')
export const uploadWorkImages = uploadMedia.array('workImages', 10)
export const uploadWorkVideo = uploadMedia.single('workVideo')

// Combined upload for profile update
export const uploadElectricianMedia = uploadMedia.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'workImages', maxCount: 10 },
  { name: 'workVideo', maxCount: 1 },
])
