import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { authResponse } from '../utils/generateToken.js'

/**
 * @desc    Super admin login — validates admin/superadmin role
 * @route   POST /api/superadmin/login
 * @access  Public
 */
export const superadminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required')
    }

    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials')
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid credentials')
    }

    // Enforce admin/superadmin role
    if (!['admin', 'superadmin'].includes(user.role)) {
      throw ApiError.forbidden('Access denied: admin credentials required')
    }

    res.json(authResponse(user, user.role))
  } catch (error) {
    next(error)
  }
}
