import { Router } from 'express'
import passport from 'passport'
import { register, login, sendOTPHandler, verifyOTPHandler, getMe, logout } from '../controllers/auth.controller.js'
import { googleCallback, facebookCallback } from '../controllers/google.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// ─── Local Auth ───
router.post('/register', register)
router.post('/login', login)
router.post('/send-otp', sendOTPHandler)
router.post('/verify-otp', verifyOTPHandler)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

// ─── OAuth credential guards ───
const makeCredentialCheck = (idKey, secretKey, providerName) => (req, res, next) => {
  const id = process.env[idKey]
  const secret = process.env[secretKey]
  if (!id || !secret ||
      id.startsWith('your_') || secret.startsWith('your_')) {
    return res.status(503).json({
      success: false,
      message: `${providerName} OAuth is not configured. Add ${idKey} and ${secretKey} to your .env file.`,
    })
  }
  next()
}

const googleCheck = makeCredentialCheck('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'Google')
const facebookCheck = makeCredentialCheck('FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'Facebook')

// ─── Google OAuth ───
router.get('/google', googleCheck,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)
router.get('/google/callback', googleCheck,
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=google_auth_failed`,
    session: false,
  }),
  googleCallback
)

// ─── Facebook OAuth ───
router.get('/facebook', facebookCheck,
  passport.authenticate('facebook', { scope: ['email'], session: false })
)
router.get('/facebook/callback', facebookCheck,
  passport.authenticate('facebook', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=facebook_auth_failed`,
    session: false,
  }),
  facebookCallback
)

export default router

