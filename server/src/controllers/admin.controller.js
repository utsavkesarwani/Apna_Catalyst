import User from '../models/User.js'
import Electrician from '../models/Electrician.js'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import Review from '../models/Review.js'
import ApiError from '../utils/ApiError.js'

// ─── User Management ────────────────────────────

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query
    const filter = {}

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash -otp').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ])

    res.json({ success: true, count: users.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), users })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Ban/unban a user
 * @route   PUT /api/admin/users/:id/ban
 */
export const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) throw ApiError.notFound('User not found')

    user.isBanned = !user.isBanned
    await user.save({ validateBeforeSave: false })

    res.json({ success: true, message: user.isBanned ? 'User banned' : 'User unbanned', isBanned: user.isBanned })
  } catch (error) {
    next(error)
  }
}

// ─── Electrician Management ─────────────────────

/**
 * @desc    Get all electricians (admin, with all fields)
 * @route   GET /api/admin/electricians
 */
export const getAllElectricians = async (req, res, next) => {
  try {
    const { search, approved, suspended, page = 1, limit = 20 } = req.query
    const filter = {}

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') },
      ]
    }
    if (approved !== undefined) filter.isApproved = approved === 'true'
    if (suspended !== undefined) filter.isSuspended = suspended === 'true'

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [electricians, total] = await Promise.all([
      Electrician.find(filter).select('-passwordHash -otp').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Electrician.countDocuments(filter),
    ])

    res.json({ success: true, count: electricians.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), electricians })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Approve an electrician
 * @route   PUT /api/admin/electricians/:id/approve
 */
export const approveElectrician = async (req, res, next) => {
  try {
    const electrician = await Electrician.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isSuspended: false },
      { new: true }
    ).select('-passwordHash -otp')

    if (!electrician) throw ApiError.notFound('Electrician not found')

    res.json({ success: true, message: 'Electrician approved', electrician })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Suspend an electrician
 * @route   PUT /api/admin/electricians/:id/suspend
 */
export const suspendElectrician = async (req, res, next) => {
  try {
    const electrician = await Electrician.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true }
    ).select('-passwordHash -otp')

    if (!electrician) throw ApiError.notFound('Electrician not found')

    res.json({ success: true, message: 'Electrician suspended', electrician })
  } catch (error) {
    next(error)
  }
}

// ─── Booking Management ─────────────────────────

/**
 * @desc    Get all bookings (admin)
 * @route   GET /api/admin/bookings
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, city, page = 1, limit = 20 } = req.query
    const filter = {}

    if (status) filter.status = status
    if (city) filter['location.city'] = new RegExp(city, 'i')

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email mobile')
        .populate('electrician', 'name email mobile location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ])

    res.json({ success: true, count: bookings.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), bookings })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Force-assign electrician to booking
 * @route   PUT /api/admin/bookings/:id/assign
 */
export const assignElectrician = async (req, res, next) => {
  try {
    const { electricianId } = req.body

    const electrician = await Electrician.findById(electricianId)
    if (!electrician) throw ApiError.notFound('Electrician not found')

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { electrician: electricianId, status: 'assigned' },
      { new: true }
    ).populate('electrician', 'name mobile')

    if (!booking) throw ApiError.notFound('Booking not found')

    // Add to electrician's bookings
    await Electrician.findByIdAndUpdate(electricianId, { $addToSet: { bookings: booking._id } })

    res.json({ success: true, message: 'Electrician assigned', booking })
  } catch (error) {
    next(error)
  }
}

// ─── Analytics ──────────────────────────────────

/**
 * @desc    Get admin analytics overview
 * @route   GET /api/admin/analytics/overview
 */
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalElectricians, totalBookings, totalRevenue, pendingApprovals, activeBookings] = await Promise.all([
      User.countDocuments(),
      Electrician.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$payment.total' } } },
      ]),
      Electrician.countDocuments({ isApproved: false, isSuspended: false }),
      Booking.countDocuments({ status: { $in: ['pending', 'confirmed', 'assigned', 'in-progress'] } }),
    ])

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalElectricians,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingApprovals,
        activeBookings,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get revenue analytics
 * @route   GET /api/admin/analytics/revenue
 */
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)

    const revenue = await Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid',
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$payment.total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.json({ success: true, period: parseInt(period), data: revenue })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get booking analytics
 * @route   GET /api/admin/analytics/bookings
 */
export const getBookingAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)

    const [byStatus, byDay, byService] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ])

    res.json({
      success: true,
      analytics: { byStatus, byDay, byService },
    })
  } catch (error) {
    next(error)
  }
}

// ─── Verification Management ────────────────────

/**
 * @desc    Toggle electrician verification status
 * @route   PUT /api/admin/electricians/:id/verify
 */
export const toggleVerification = async (req, res, next) => {
  try {
    const electrician = await Electrician.findById(req.params.id)
    if (!electrician) throw ApiError.notFound('Electrician not found')

    const { isVerified, rejectionNote } = req.body
    const newVerified = isVerified !== undefined ? isVerified : !electrician.isVerified

    const updates = {
      isVerified: newVerified,
      'documents.rejectionNote': newVerified ? '' : (rejectionNote || ''),
    }

    if (newVerified) {
      updates['documents.verifiedAt'] = new Date()
      updates['documents.verifiedBy'] = req.user._id
    }

    const updated = await Electrician.findByIdAndUpdate(
      req.params.id, updates, { new: true }
    ).select('-passwordHash -otp')

    res.json({
      success: true,
      message: newVerified ? 'Electrician verified' : 'Verification revoked',
      electrician: updated,
    })
  } catch (error) {
    next(error)
  }
}

// ─── Performance Monitoring ─────────────────────

/**
 * @desc    Get electrician performance stats (success rate, avg rating, job breakdown)
 * @route   GET /api/admin/electricians/:id/performance
 */
export const getElectricianPerformance = async (req, res, next) => {
  try {
    const { id } = req.params

    const electrician = await Electrician.findById(id).select('name rating')
    if (!electrician) throw ApiError.notFound('Electrician not found')

    const [total, completed, cancelled, inProgress, pending] = await Promise.all([
      Booking.countDocuments({ electrician: id }),
      Booking.countDocuments({ electrician: id, status: 'completed' }),
      Booking.countDocuments({ electrician: id, status: 'cancelled' }),
      Booking.countDocuments({ electrician: id, status: { $in: ['confirmed', 'assigned', 'in-progress'] } }),
      Booking.countDocuments({ electrician: id, status: 'pending' }),
    ])

    const resolved = completed + cancelled
    const successRate = resolved > 0 ? Math.round((completed / resolved) * 100) : 0
    const cancelRate = resolved > 0 ? Math.round((cancelled / resolved) * 100) : 0

    // Monthly performance (last 6 months)
    const now = new Date()
    const monthlyPerformance = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const [mComplete, mCancel] = await Promise.all([
        Booking.countDocuments({ electrician: id, status: 'completed', updatedAt: { $gte: start, $lte: end } }),
        Booking.countDocuments({ electrician: id, status: 'cancelled', updatedAt: { $gte: start, $lte: end } }),
      ])

      monthlyPerformance.push({
        month: start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        completed: mComplete,
        cancelled: mCancel,
      })
    }

    res.json({
      success: true,
      performance: {
        name: electrician.name,
        avgRating: electrician.rating?.avg || 0,
        totalReviews: electrician.rating?.count || 0,
        totalJobs: total,
        completed,
        cancelled,
        inProgress,
        pending,
        successRate,
        cancelRate,
        monthlyPerformance,
      },
    })
  } catch (error) {
    next(error)
  }
}

// ─── Financial Ledger ───────────────────────────

/**
 * @desc    Get electrician financial details (earnings + payout ledger)
 * @route   GET /api/admin/electricians/:id/financials
 */
export const getElectricianFinancials = async (req, res, next) => {
  try {
    const electrician = await Electrician.findById(req.params.id).select('name earnings payoutLedger')
    if (!electrician) throw ApiError.notFound('Electrician not found')

    // Calculate pending payouts from ledger
    const pendingPayouts = (electrician.payoutLedger || [])
      .filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + p.amount, 0)

    // Calculate total paid out
    const totalPaidOut = (electrician.payoutLedger || [])
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    res.json({
      success: true,
      financials: {
        name: electrician.name,
        earnings: electrician.earnings || { total: 0, pending: 0, thisMonth: 0 },
        pendingPayouts,
        totalPaidOut,
        balance: (electrician.earnings?.total || 0) - totalPaidOut,
        ledger: (electrician.payoutLedger || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create a payout entry for an electrician
 * @route   POST /api/admin/electricians/:id/payout
 */
export const createPayout = async (req, res, next) => {
  try {
    const { amount, type, note, reference } = req.body
    if (!amount || amount <= 0) throw ApiError.badRequest('Valid amount is required')

    const electrician = await Electrician.findById(req.params.id)
    if (!electrician) throw ApiError.notFound('Electrician not found')

    const entry = {
      amount,
      type: type || 'payout',
      status: 'pending',
      reference: reference || '',
      note: note || '',
      createdAt: new Date(),
    }

    electrician.payoutLedger.push(entry)

    // Update pending earnings
    if (type === 'payout') {
      electrician.earnings.pending = (electrician.earnings.pending || 0) + amount
    }

    await electrician.save({ validateBeforeSave: false })

    res.status(201).json({
      success: true,
      message: 'Payout entry created',
      entry: electrician.payoutLedger[electrician.payoutLedger.length - 1],
    })
  } catch (error) {
    next(error)
  }
}

// ─── Live Status ────────────────────────────────

/**
 * @desc    Update electrician's live status (lastSeen + currentLocation)
 * @route   PUT /api/electricians/live-status
 * @access  Private (electrician - self)
 */
export const updateLiveStatus = async (req, res, next) => {
  try {
    const { lat, lng } = req.body

    const updates = {
      lastSeen: new Date(),
    }

    if (lat !== undefined && lng !== undefined) {
      updates.currentLocation = {
        lat,
        lng,
        updatedAt: new Date(),
      }
    }

    const electrician = await Electrician.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('lastSeen currentLocation availability')

    if (!electrician) throw ApiError.notFound('Electrician not found')

    res.json({
      success: true,
      lastSeen: electrician.lastSeen,
      currentLocation: electrician.currentLocation,
    })
  } catch (error) {
    next(error)
  }
}
