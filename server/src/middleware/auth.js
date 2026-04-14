import ApiError from '../utils/ApiError.js'
import { verifyToken } from '../utils/generateToken.js'
import User from '../models/User.js'
import Electrician from '../models/Electrician.js'

/**
 * Protect routes — requires valid JWT
 * Attaches req.user with role info
 */
export const protect = async (req, res, next) => {
  try {
    let token

    // Get token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      throw ApiError.unauthorized('Access denied. No token provided.')
    }

    // Verify token
    const decoded = verifyToken(token)

    // Find user based on role
    let user
    if (decoded.role === 'electrician') {
      user = await Electrician.findById(decoded.id).select('-passwordHash')
      if (user?.isSuspended) {
        throw ApiError.forbidden('Your account has been suspended. Contact support.')
      }
    } else {
      user = await User.findById(decoded.id).select('-passwordHash')
      if (user?.isBanned) {
        throw ApiError.forbidden('Your account has been banned. Contact support.')
      }
    }

    if (!user) {
      throw ApiError.unauthorized('User not found. Token may be invalid.')
    }

    // Attach user to request
    req.user = {
      ...user.toObject(),
      role: decoded.role,
    }

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'))
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired. Please login again.'))
    }
    next(error)
  }
}

/**
 * Optional auth — doesn't fail if no token, but attaches user if present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      const decoded = verifyToken(token)
      if (decoded.role === 'electrician') {
        req.user = await Electrician.findById(decoded.id).select('-passwordHash')
      } else {
        req.user = await User.findById(decoded.id).select('-passwordHash')
      }
      if (req.user) {
        req.user = { ...req.user.toObject(), role: decoded.role }
      }
    }
  } catch {
    // Silently fail — user is just not authenticated
  }
  next()
}
