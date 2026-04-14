import { Router } from 'express'
import { register, login, sendOTPHandler, verifyOTPHandler, getMe, logout } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/send-otp', sendOTPHandler)
router.post('/verify-otp', verifyOTPHandler)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

export default router
