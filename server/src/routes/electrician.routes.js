import { Router } from 'express'
import {
  registerElectrician, loginElectrician, getMyProfile,
  getElectricians, getElectricianById, getTopElectricians,
  updateProfile, updateAvailability, getEarnings,
  uploadMediaFiles, getMyReviews,
} from '../controllers/electrician.controller.js'
import { updateLiveStatus } from '../controllers/admin.controller.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { uploadElectricianMedia } from '../middleware/upload.js'
import { compressUploadedImages } from '../middleware/compressImages.js'

const router = Router()

// Public routes
router.post('/register', registerElectrician)
router.post('/login', loginElectrician)
router.get('/', getElectricians)
router.get('/top', getTopElectricians)

// Protected routes (electrician only) — must be before /:id
router.get('/me', protect, authorize('electrician'), getMyProfile)
router.get('/me/earnings', protect, authorize('electrician'), getEarnings)
router.get('/me/reviews', protect, authorize('electrician'), getMyReviews)
router.put('/profile', protect, authorize('electrician'), updateProfile)
router.put('/availability', protect, authorize('electrician'), updateAvailability)
router.post('/upload-media', protect, authorize('electrician'), uploadElectricianMedia, compressUploadedImages, uploadMediaFiles)
router.put('/live-status', protect, authorize('electrician'), updateLiveStatus)

// Public dynamic routes (must be after /me to avoid conflict)
router.get('/:id', getElectricianById)

export default router
