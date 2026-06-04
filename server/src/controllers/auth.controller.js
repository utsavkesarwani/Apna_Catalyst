import User from '../models/User.js'
import Electrician from '../models/Electrician.js'
import ApiError from '../utils/ApiError.js'
import { generateToken, authResponse } from '../utils/generateToken.js'
import { sendOTP, verifyOTP, getOTPData } from '../utils/otp.js'

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, location } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    })
    if (existingUser) {
      throw ApiError.conflict('User with this email or mobile already exists')
    }

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      passwordHash: password,
      location: location || {},
    })

    res.status(201).json(authResponse(user, 'user'))
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Login user with email/password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw ApiError.badRequest('Please provide email and password')
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+passwordHash').populate('addresses')
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password')
    }

    if (user.isBanned) {
      throw ApiError.forbidden('Your account has been banned. Contact support.')
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password')
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    res.json(authResponse(user, user.role))
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Send OTP to mobile number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTPHandler = async (req, res, next) => {
  try {
    const { mobile } = req.body

    if (!mobile) {
      throw ApiError.badRequest('Mobile number is required')
    }

    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(mobile)) {
      throw ApiError.badRequest('Please provide a valid 10-digit Indian mobile number')
    }

    // Generate and store OTP on the user record
    const otpData = getOTPData(mobile)

    // Try to find existing user, or we'll create one later at verify
    const user = await User.findOne({ mobile })
    if (user) {
      user.otp = otpData
      await user.save({ validateBeforeSave: false })
    }

    // Send OTP
    const result = await sendOTP(mobile)

    res.json({
      success: true,
      message: result.message,
      ...(process.env.NODE_ENV === 'development' && { otp: result.otp }),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Verify OTP and login/register
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTPHandler = async (req, res, next) => {
  try {
    const { mobile, otp, name } = req.body

    if (!mobile || !otp) {
      throw ApiError.badRequest('Mobile number and OTP are required')
    }

    const user = await User.findOne({ mobile }).select('+otp').populate('addresses')
    
    let isValid
    if (user && user.otp) {
      isValid = verifyOTP(mobile, otp, user.otp)
    } else {
      // For new users using mock service
      isValid = verifyOTP(mobile, otp)
    }

    if (!isValid) {
      throw ApiError.badRequest('Invalid or expired OTP')
    }

    if (user) {
      // Existing user — clear OTP and login
      user.otp = undefined
      user.lastLogin = new Date()
      await user.save({ validateBeforeSave: false })
      return res.json(authResponse(user, user.role))
    }

    // New user — create account
    if (!name) {
      // Return a flag asking for name to complete registration  
      return res.json({
        success: true,
        isNewUser: true,
        message: 'OTP verified. Please provide your name to complete registration.',
        mobile,
      })
    }

    const newUser = await User.create({
      name,
      mobile,
      email: `${mobile}@apnacatalyst.com`, // Temp email, user should update
      passwordHash: `otp_${Date.now()}`, // Placeholder, OTP-only users
    })

    res.status(201).json(authResponse(newUser, 'user'))
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    let user
    if (req.user.role === 'electrician') {
      user = await Electrician.findById(req.user._id)
    } else {
      user = await User.findById(req.user._id).populate('addresses')
    }

    if (!user) {
      throw ApiError.notFound('User not found')
    }

    res.json({
      success: true,
      user: { ...user.toObject(), role: req.user.role },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Logout (client-side token removal, but we can blacklist if needed)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  // JWT is stateless — logout is handled client-side by removing the token
  // In production, you could add token blacklisting with Redis
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
}
