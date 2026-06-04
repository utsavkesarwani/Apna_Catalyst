import User from '../models/User.js'
import Address from '../models/Address.js'
import ApiError from '../utils/ApiError.js'

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('bookings').populate('addresses')
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

    if (updates.mobile) {
      const existing = await User.findOne({ mobile: updates.mobile, _id: { $ne: req.user._id } })
      if (existing) throw ApiError.badRequest('Mobile number is already registered by another user')
    }

    if (updates.detailedAddress) {
      const existingAddress = await Address.findOne({ user: req.user._id })
      if (existingAddress) {
        Object.assign(existingAddress, updates.detailedAddress)
        await existingAddress.save()
      } else {
        const newAddress = await Address.create({ user: req.user._id, ...updates.detailedAddress })
        await User.findByIdAndUpdate(req.user._id, { $push: { addresses: newAddress._id } })
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate('bookings').populate('addresses')

    if (!user) throw ApiError.notFound('User not found')

    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

export const addAddress = async (req, res, next) => {
  try {
    const { flatNo, locality, landmark, city, state, pincode } = req.body
    if (!flatNo || !locality || !landmark || !city || !state || !pincode) {
      throw ApiError.badRequest('All address fields are required')
    }
    const address = await Address.create({
      user: req.user._id, flatNo, locality, landmark, city, state, pincode
    })
    const user = await User.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address._id }
    }, { new: true }).populate('bookings').populate('addresses')
    res.status(201).json({ success: true, user })
  } catch (error) { next(error) }
}

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params
    const { flatNo, locality, landmark, city, state, pincode } = req.body
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { flatNo, locality, landmark, city, state, pincode },
      { new: true, runValidators: true }
    )
    if (!address) throw ApiError.notFound('Address not found or unauthorized')
    const user = await User.findById(req.user._id).populate('bookings').populate('addresses')
    res.json({ success: true, user })
  } catch (error) { next(error) }
}

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id })
    if (!address) throw ApiError.notFound('Address not found or unauthorized')
    const user = await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: id }
    }, { new: true }).populate('bookings').populate('addresses')
    res.json({ success: true, user })
  } catch (error) { next(error) }
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
