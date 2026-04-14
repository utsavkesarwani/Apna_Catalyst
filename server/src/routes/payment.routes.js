import { Router } from 'express'
import { initiatePayment, verifyPayment, getPaymentStatus } from '../controllers/payment.controller.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = Router()

// All payment routes are protected
router.use(protect)

// User can initiate and verify payments
router.post('/initiate', authorize('user', 'admin', 'superadmin'), initiatePayment)
router.post('/verify', authorize('user', 'admin', 'superadmin'), verifyPayment)

// Any authenticated user can check payment status
router.get('/:bookingId/status', getPaymentStatus)

export default router
