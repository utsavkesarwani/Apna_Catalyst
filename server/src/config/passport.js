import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

/**
 * Google OAuth 2.0 Strategy
 * Implements Account Linking: if a Google user's email already exists in the DB,
 * link the googleId to that existing user instead of creating a duplicate.
 */
const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  // Guard: skip registration if credentials are missing or still placeholder
  if (!clientID || !clientSecret ||
      clientID === 'your_google_client_id_here' ||
      clientSecret === 'your_google_client_secret_here') {
    console.warn('⚠️  Google OAuth: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set. /api/auth/google will return 503.')
    return
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          const googleId = profile.id
          const avatar = profile.photos?.[0]?.value || ''
          const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim()

          if (!email) {
            return done(null, false, { message: 'No email associated with this Google account' })
          }

          // ─── 1. Check if user already linked via googleId ───
          let user = await User.findOne({ googleId })

          if (user) {
            // Existing Google user — update avatar if changed
            if (avatar && user.avatar !== avatar) {
              user.avatar = avatar
            }
            user.lastLogin = new Date()
            await user.save({ validateBeforeSave: false })
            return done(null, user)
          }

          // ─── 2. Account Linking — check if email already exists (local signup) ───
          user = await User.findOne({ email: email.toLowerCase() })

          if (user) {
            // Link Google account to existing local user
            user.googleId = googleId
            user.authMethod = user.authMethod === 'local' ? 'local' : 'google' // Keep 'local' if they signed up manually
            if (avatar && !user.avatar) {
              user.avatar = avatar // Only set avatar if they don't have one
            }
            user.lastLogin = new Date()
            await user.save({ validateBeforeSave: false })
            return done(null, user)
          }

          // ─── 3. Brand new user — create account ───
          user = await User.create({
            name,
            email: email.toLowerCase(),
            googleId,
            avatar,
            authMethod: 'google',
            // No password or mobile required for Google users
          })

          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )

  // Serialize/deserialize (only needed if using sessions, but good practice)
  passport.serializeUser((user, done) => done(null, user._id))
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })
}

export default configurePassport
