import { generateToken } from '../utils/generateToken.js'

/**
 * @desc    Generic OAuth callback handler (Google + Facebook)
 *          Issues a JWT in an httpOnly cookie and redirects to frontend
 * @route   GET /api/auth/google/callback, /api/auth/facebook/callback
 * @access  Public (Passport handles auth)
 */
const createOAuthCallback = (provider) => (req, res) => {
  try {
    const user = req.user

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=${provider}_auth_failed`
      )
    }

    // Generate JWT
    const token = generateToken({ id: user._id, role: user.role || 'user' })

    // Set JWT in httpOnly cookie (secure in production)
    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie('apna_electro_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    })

    // Redirect to frontend with token + user data
    const redirectUrl = new URL('/auth/google/success', process.env.CLIENT_URL || 'http://localhost:5173')
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('user', JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      role: user.role || 'user',
      avatar: user.avatar || '',
      authMethod: user.authMethod || provider,
    }))

    res.redirect(redirectUrl.toString())
  } catch (error) {
    console.error(`${provider} OAuth callback error:`, error)
    res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=server_error`
    )
  }
}

export const googleCallback = createOAuthCallback('google')
export const facebookCallback = createOAuthCallback('facebook')
