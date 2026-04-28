import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('bookings')
    if (!user) throw ApiError.notFound('User not found')

    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'email', 'mobile', 'avatar', 'location', 'detailedAddress']
    const updates = {}

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    })

    if (!user) throw ApiError.notFound('User not found')

    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get user bookings
 * @route   GET /api/users/bookings
 * @access  Private
 */
export const getUserBookings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookings',
      populate: { path: 'electrician', select: 'name profilePhoto rating location' },
      options: { sort: { createdAt: -1 } },
    })

    res.json({ success: true, bookings: user?.bookings || [] })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update user password
 * @route   PUT /api/users/password
 * @access  Private
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current password and new password are required')
    }

    const user = await User.findById(req.user._id).select('+passwordHash')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect')
    }

    user.passwordHash = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
}
