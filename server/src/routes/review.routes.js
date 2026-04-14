import { Router } from 'express'
import { createReview, getElectricianReviews } from '../controllers/review.controller.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = Router()

// Public
router.get('/electrician/:id', getElectricianReviews)

// Protected (user only)
router.post('/', protect, authorize('user', 'admin', 'superadmin'), createReview)

export default router
