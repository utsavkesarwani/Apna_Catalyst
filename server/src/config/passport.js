import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import User from '../models/User.js'

/**
 * OAuth Strategies: Google + Facebook
 * Both implement Account Linking: if the provider email already exists in the DB,
 * link the provider ID to that existing user instead of creating a duplicate.
 */
const configurePassport = () => {

  // ═══════════════════════════════════
  // Google OAuth 2.0
  // ═══════════════════════════════════
  const googleID = process.env.GOOGLE_CLIENT_ID
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET

  if (googleID && googleSecret &&
      googleID !== 'your_google_client_id_here' &&
      googleSecret !== 'your_google_client_secret_here') {

    passport.use(
      new GoogleStrategy(
        {
          clientID: googleID,
          clientSecret: googleSecret,
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

            // 1. Check if user already linked via googleId
            let user = await User.findOne({ googleId })
            if (user) {
              if (avatar && user.avatar !== avatar) user.avatar = avatar
              user.lastLogin = new Date()
              await user.save({ validateBeforeSave: false })
              return done(null, user)
            }

            // 2. Account Linking — email already exists
            user = await User.findOne({ email: email.toLowerCase() })
            if (user) {
              user.googleId = googleId
              if (avatar && !user.avatar) user.avatar = avatar
              user.lastLogin = new Date()
              await user.save({ validateBeforeSave: false })
              return done(null, user)
            }

            // 3. Brand new user
            user = await User.create({
              name,
              email: email.toLowerCase(),
              googleId,
              avatar,
              authMethod: 'google',
            })
            return done(null, user)
          } catch (error) {
            return done(error, null)
          }
        }
      )
    )
    console.log('✅ Google OAuth strategy registered')
  } else {
    console.warn('⚠️  Google OAuth: credentials not set. /api/auth/google will return 503.')
  }

  // ═══════════════════════════════════
  // Facebook OAuth
  // ═══════════════════════════════════
  const fbID = process.env.FACEBOOK_APP_ID
  const fbSecret = process.env.FACEBOOK_APP_SECRET

  if (fbID && fbSecret &&
      fbID !== 'your_facebook_app_id_here' &&
      fbSecret !== 'your_facebook_app_secret_here') {

    passport.use(
      new FacebookStrategy(
        {
          clientID: fbID,
          clientSecret: fbSecret,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'emails', 'photos'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value
            const facebookId = profile.id
            const avatar = profile.photos?.[0]?.value || ''
            const name = profile.displayName || ''

            // 1. Check if user already linked via facebookId
            let user = await User.findOne({ facebookId })
            if (user) {
              if (avatar && user.avatar !== avatar) user.avatar = avatar
              user.lastLogin = new Date()
              await user.save({ validateBeforeSave: false })
              return done(null, user)
            }

            // 2. Account Linking — email already exists
            if (email) {
              user = await User.findOne({ email: email.toLowerCase() })
              if (user) {
                user.facebookId = facebookId
                if (avatar && !user.avatar) user.avatar = avatar
                user.lastLogin = new Date()
                await user.save({ validateBeforeSave: false })
                return done(null, user)
              }
            }

            // 3. Brand new user
            if (!email) {
              // Facebook may not return email — generate a placeholder
              return done(null, false, { message: 'No email associated with this Facebook account. Please use a different login method.' })
            }

            user = await User.create({
              name,
              email: email.toLowerCase(),
              facebookId,
              avatar,
              authMethod: 'facebook',
            })
            return done(null, user)
          } catch (error) {
            return done(error, null)
          }
        }
      )
    )
    console.log('✅ Facebook OAuth strategy registered')
  } else {
    console.warn('⚠️  Facebook OAuth: credentials not set. /api/auth/facebook will return 503.')
  }

  // ═══════════════════════════════════
  // Serialize / Deserialize
  // ═══════════════════════════════════
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

