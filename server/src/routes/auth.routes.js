import { Router } from 'express'
import passport from 'passport'
import { register, login, sendOTPHandler, verifyOTPHandler, getMe, logout } from '../controllers/auth.controller.js'
import { googleCallback } from '../controllers/google.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// ─── Local Auth ───
router.post('/register', register)
router.post('/login', login)
router.post('/send-otp', sendOTPHandler)
router.post('/verify-otp', verifyOTPHandler)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

// ─── Google OAuth ───
// Guard middleware: reject cleanly if credentials aren't configured yet
const googleCredentialCheck = (req, res, next) => {
  const id = process.env.GOOGLE_CLIENT_ID
  const secret = process.env.GOOGLE_CLIENT_SECRET
  if (!id || !secret ||
      id === 'your_google_client_id_here' ||
      secret === 'your_google_client_secret_here') {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on this server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.',
    })
  }
  next()
}

// Step 1: Redirect user to Google's consent screen
router.get(
  '/google',
  googleCredentialCheck,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

// Step 2: Google redirects back here with a code
router.get(
  '/google/callback',
  googleCredentialCheck,
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=google_auth_failed`,
    session: false,
  }),
  googleCallback
)

export default router
