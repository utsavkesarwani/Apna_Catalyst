import Electrician from '../models/Electrician.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import ApiError from '../utils/ApiError.js'
import { authResponse } from '../utils/generateToken.js'

/**
 * @desc    Register a new electrician
 * @route   POST /api/electricians/register
 * @access  Public
 */
export const registerElectrician = async (req, res, next) => {
  try {
    const { name, email, mobile, password, location, experience, bio, categories, services } = req.body

    const existing = await Electrician.findOne({ $or: [{ email }, { mobile }] })
    if (existing) {
      throw ApiError.conflict('Electrician with this email or mobile already exists')
    }

    const electrician = await Electrician.create({
      name,
      email,
      mobile,
      passwordHash: password,
      location,
      experience,
      bio: bio || '',
      categories: categories || [],
      services: services || [],
      isApproved: false, // Requires admin approval
    })

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your profile is pending admin approval.',
      electrician: {
        id: electrician._id,
        name: electrician.name,
        email: electrician.email,
        isApproved: electrician.isApproved,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Login electrician
 * @route   POST /api/electricians/login
 * @access  Public
 */
export const loginElectrician = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw ApiError.badRequest('Please provide email and password')
    }

    const electrician = await Electrician.findOne({ email }).select('+passwordHash')
    if (!electrician) {
      throw ApiError.unauthorized('Invalid email or password')
    }

    if (electrician.isSuspended) {
      throw ApiError.forbidden('Your account has been suspended. Contact support.')
    }

    const isMatch = await electrician.comparePassword(password)
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password')
    }

    electrician.lastLogin = new Date()
    await electrician.save({ validateBeforeSave: false })

    res.json(authResponse(electrician, 'electrician'))
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get current logged-in electrician profile
 * @route   GET /api/electricians/me
 * @access  Private (electrician)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const electrician = await Electrician.findById(req.user._id)
      .select('-passwordHash -otp')

    if (!electrician) throw ApiError.notFound('Electrician not found')

    // Get additional stats
    const [totalBookings, completedBookings, activeBookings, pendingBookings] = await Promise.all([
      Booking.countDocuments({ electrician: req.user._id }),
      Booking.countDocuments({ electrician: req.user._id, status: 'completed' }),
      Booking.countDocuments({ electrician: req.user._id, status: { $in: ['confirmed', 'assigned', 'in-progress'] } }),
      Booking.countDocuments({ electrician: req.user._id, status: 'pending' }),
    ])

    res.json({
      success: true,
      electrician: {
        ...electrician.toObject(),
        stats: {
          totalBookings,
          completedBookings,
          activeBookings,
          pendingBookings,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all electricians (public, with filters)
 * @route   GET /api/electricians
 * @access  Public
 */
export const getElectricians = async (req, res, next) => {
  try {
    const {
      city, state, category, service, rating, available,
      search, sort, page = 1, limit = 20,
    } = req.query

    const filter = { isApproved: true, isSuspended: false }

    if (city) filter['location.city'] = new RegExp(city, 'i')
    if (state) filter['location.state'] = new RegExp(state, 'i')
    if (category) filter.categories = { $in: [new RegExp(category, 'i')] }
    if (service) filter.services = { $in: [service] }
    if (rating) filter['rating.avg'] = { $gte: parseFloat(rating) }
    if (available === 'true') filter['availability.isAvailable'] = true

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { categories: { $in: [new RegExp(search, 'i')] } },
        { 'location.city': new RegExp(search, 'i') },
      ]
    }

    // Sort options
    let sortOption = { 'rating.avg': -1 } // Default: highest rated
    if (sort === 'experience') sortOption = { experience: -1 }
    if (sort === 'reviews') sortOption = { 'rating.count': -1 }
    if (sort === 'newest') sortOption = { createdAt: -1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [electricians, total] = await Promise.all([
      Electrician.find(filter)
        .select('-passwordHash -aadhar.number')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Electrician.countDocuments(filter),
    ])

    res.json({
      success: true,
      count: electricians.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      electricians,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single electrician by ID
 * @route   GET /api/electricians/:id
 * @access  Public
 */
export const getElectricianById = async (req, res, next) => {
  try {
    const electrician = await Electrician.findById(req.params.id)
      .select('-passwordHash -aadhar.number')

    if (!electrician) throw ApiError.notFound('Electrician not found')
    if (!electrician.isApproved) throw ApiError.notFound('Electrician not found')

    res.json({ success: true, electrician })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get top-rated electricians
 * @route   GET /api/electricians/top
 * @access  Public
 */
export const getTopElectricians = async (req, res, next) => {
  try {
    const { limit = 6, category } = req.query

    const filter = { isApproved: true, isSuspended: false, 'rating.count': { $gte: 1 } }
    if (category) filter.categories = { $in: [new RegExp(category, 'i')] }

    const electricians = await Electrician.find(filter)
      .select('-passwordHash -aadhar.number')
      .sort({ 'rating.avg': -1, 'rating.count': -1 })
      .limit(parseInt(limit))

    res.json({ success: true, electricians })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update electrician profile (own profile)
 * @route   PUT /api/electricians/profile
 * @access  Private (electrician)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name', 'bio', 'profilePhoto', 'workImages', 'workVideo',
      'categories', 'services', 'location', 'priceRange',
    ]
    const updates = {}

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    }

    const electrician = await Electrician.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash')

    if (!electrician) throw ApiError.notFound('Electrician not found')

    res.json({ success: true, electrician })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Upload media files (images, video)
 * @route   POST /api/electricians/upload-media
 * @access  Private (electrician)
 */
export const uploadMediaFiles = async (req, res, next) => {
  try {
    const updates = {}
    const baseUrl = `${req.protocol}://${req.get('host')}`

    if (req.files) {
      // Profile photo
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        updates.profilePhoto = `${baseUrl}/uploads/profiles/${req.files.profilePhoto[0].filename}`
      }

      // Work images — append to existing
      if (req.files.workImages && req.files.workImages.length > 0) {
        const newImages = req.files.workImages.map(
          f => `${baseUrl}/uploads/work-images/${f.filename}`
        )
        const existing = await Electrician.findById(req.user._id).select('workImages')
        updates.workImages = [...(existing?.workImages || []), ...newImages]
      }

      // Work video
      if (req.files.workVideo && req.files.workVideo[0]) {
        updates.workVideo = `${baseUrl}/uploads/work-videos/${req.files.workVideo[0].filename}`
      }
    }

    if (Object.keys(updates).length === 0) {
      throw ApiError.badRequest('No files uploaded')
    }

    const electrician = await Electrician.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select('-passwordHash')

    if (!electrician) throw ApiError.notFound('Electrician not found')

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      electrician,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update electrician availability
 * @route   PUT /api/electricians/availability
 * @access  Private (electrician)
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable, nextAvailableAt } = req.body

    const electrician = await Electrician.findByIdAndUpdate(
      req.user._id,
      {
        availability: {
          isAvailable: isAvailable ?? true,
          nextAvailableAt: nextAvailableAt || null,
        },
      },
      { new: true }
    ).select('-passwordHash')

    if (!electrician) throw ApiError.notFound('Electrician not found')

    res.json({ success: true, availability: electrician.availability })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get electrician earnings with detailed breakdown
 * @route   GET /api/electricians/me/earnings
 * @access  Private (electrician)
 */
export const getEarnings = async (req, res, next) => {
  try {
    const electrician = await Electrician.findById(req.user._id).select('earnings')
    if (!electrician) throw ApiError.notFound('Electrician not found')

    // Get completed bookings for transaction history
    const completedBookings = await Booking.find({
      electrician: req.user._id,
      status: 'completed',
    })
      .populate('user', 'name')
      .sort({ updatedAt: -1 })
      .limit(20)

    // Calculate monthly breakdown (last 7 months)
    const now = new Date()
    const monthlyBreakdown = []
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const monthBookings = await Booking.find({
        electrician: req.user._id,
        status: 'completed',
        updatedAt: { $gte: start, $lte: end },
      })

      const earned = monthBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0)

      monthlyBreakdown.push({
        month: start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        earned,
        jobs: monthBookings.length,
      })
    }

    // Calculate this week's earnings
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekBookings = await Booking.find({
      electrician: req.user._id,
      status: 'completed',
      updatedAt: { $gte: weekStart },
    })
    const thisWeek = weekBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0)

    // Transform completed bookings into transaction format
    const recentTransactions = completedBookings.map(b => ({
      id: `TXN-${b._id.toString().slice(-4).toUpperCase()}`,
      date: b.updatedAt,
      amount: b.payment?.amount || 0,
      type: 'credit',
      description: `Booking ${b.bookingId} - ${b.service}`,
      status: 'completed',
      customer: b.user?.name || 'Customer',
    }))

    // Avg per job
    const totalCompleted = await Booking.countDocuments({
      electrician: req.user._id,
      status: 'completed',
    })
    const avgPerJob = totalCompleted > 0
      ? Math.round(electrician.earnings.total / totalCompleted)
      : 0

    // Last month earnings
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const lastMonthBookings = await Booking.find({
      electrician: req.user._id,
      status: 'completed',
      updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    })
    const lastMonth = lastMonthBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0)

    res.json({
      success: true,
      earnings: {
        ...electrician.earnings.toObject(),
        thisWeek,
        lastMonth,
        avgPerJob,
        monthlyBreakdown,
        recentTransactions,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get reviews for the logged-in electrician
 * @route   GET /api/electricians/me/reviews
 * @access  Private (electrician)
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = 'newest' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    let sortOption = { createdAt: -1 }
    if (sort === 'highest') sortOption = { rating: -1 }
    if (sort === 'lowest') sortOption = { rating: 1 }

    const [reviews, total] = await Promise.all([
      Review.find({ electrician: req.user._id, isVisible: true })
        .populate('user', 'name')
        .populate('booking', 'service bookingId')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ electrician: req.user._id, isVisible: true }),
    ])

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const allReviews = await Review.find({ electrician: req.user._id, isVisible: true })
    allReviews.forEach(r => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++
      }
    })

    // Average rating
    const electrician = await Electrician.findById(req.user._id).select('rating')

    res.json({
      success: true,
      averageRating: electrician?.rating?.avg || 0,
      totalReviews: total,
      distribution,
      count: reviews.length,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reviews: reviews.map(r => ({
        id: r._id,
        customer: r.user?.name || 'Customer',
        rating: r.rating,
        comment: r.comment,
        service: r.booking?.service || 'Service',
        date: r.createdAt,
        bookingId: r.booking?.bookingId || '',
      })),
    })
  } catch (error) {
    next(error)
  }
}
