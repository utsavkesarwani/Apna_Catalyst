import Booking from '../models/Booking.js'
import Electrician from '../models/Electrician.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { getIO } from '../socket.js'

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (user)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { electricianId, service, problemDescription, scheduledAt, timeSlot, paymentMethod, couponCode, location } = req.body

    // Validate electrician exists and is available
    const electrician = await Electrician.findById(electricianId)
    if (!electrician) throw ApiError.notFound('Electrician not found')
    if (!electrician.isApproved) throw ApiError.badRequest('This electrician is not yet approved')
    if (electrician.isSuspended) throw ApiError.badRequest('This electrician is currently unavailable')

    // Calculate pricing
    const basePrice = electrician.priceRange?.min || 299
    const platformFee = 49
    let discount = 0

    if (couponCode) {
      const code = couponCode.toUpperCase()
      if (code === 'FIRST100' || code === 'APNA100') {
        discount = 100
      }
    }

    // ── Double-booking prevention ──
    const scheduledDate = new Date(scheduledAt)
    const dayStart = new Date(scheduledDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(scheduledDate)
    dayEnd.setHours(23, 59, 59, 999)

    if (timeSlot) {
      const conflicting = await Booking.findOne({
        electrician: electricianId,
        timeSlot,
        scheduledAt: { $gte: dayStart, $lte: dayEnd },
        status: { $nin: ['cancelled'] },
      })

      if (conflicting) {
        throw ApiError.badRequest(
          `This time slot (${timeSlot}) is already booked for the selected date. Please choose another slot.`
        )
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      electrician: electricianId,
      service,
      problemDescription,
      scheduledAt: scheduledDate,
      timeSlot,
      payment: {
        method: paymentMethod || 'cash',
        amount: basePrice,
        platformFee,
        discount,
        total: basePrice + platformFee - discount,
        status: paymentMethod === 'cash' ? 'pending' : 'pending',
      },
      couponCode,
      location: location || {},
    })

    // Add booking ref to user and electrician
    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } }),
      Electrician.findByIdAndUpdate(electricianId, { $push: { bookings: booking._id } }),
    ])

    const populatedBooking = await Booking.findById(booking._id)
      .populate('electrician', 'name profilePhoto rating location mobile')
      .populate('user', 'name email mobile')

    // ── Broadcast slot update via Socket.IO ──
    try {
      const io = getIO()
      const dateStr = scheduledDate.toISOString().split('T')[0]
      io.to(`elec:${electricianId}`).emit('slot:booked', {
        electricianId,
        date: dateStr,
        timeSlot,
      })
    } catch {
      // Socket.IO may not be initialized in tests
    }

    res.status(201).json({ success: true, booking: populatedBooking })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('electrician', 'name profilePhoto rating location mobile experience')
      .populate('user', 'name email mobile')

    if (!booking) throw ApiError.notFound('Booking not found')

    // Check ownership (user, electrician, or admin)
    const isOwner = booking.user._id.toString() === req.user._id.toString()
    const isElectrician = booking.electrician._id.toString() === req.user._id.toString()
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role)

    if (!isOwner && !isElectrician && !isAdmin) {
      throw ApiError.forbidden('Not authorized to view this booking')
    }

    res.json({ success: true, booking })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/user/me
 * @access  Private (user)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const filter = { user: req.user._id }
    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('electrician', 'name profilePhoto rating location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ])

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get user's latest booking
 * @route   GET /api/bookings/latest
 * @access  Private (user)
 */
export const getLatestBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ user: req.user._id })
      .populate('electrician', 'name profilePhoto rating location mobile experience')
      .sort({ createdAt: -1 })

    if (!booking) throw ApiError.notFound('No bookings found')

    res.json({ success: true, booking })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get electrician's bookings
 * @route   GET /api/bookings/electrician/me
 * @access  Private (electrician)
 */
export const getElectricianBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const filter = { electrician: req.user._id }
    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email mobile location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ])

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update booking status (electrician)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (electrician)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body
    const validStatuses = ['confirmed', 'assigned', 'in-progress', 'completed']

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    const booking = await Booking.findById(req.params.id)
    if (!booking) throw ApiError.notFound('Booking not found')

    // Only assigned electrician can update
    if (booking.electrician.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Not authorized to update this booking')
    }

    booking.status = status
    if (note) {
      booking.statusHistory[booking.statusHistory.length - 1].note = note
    }

    // If completed, update payment status and electrician earnings
    if (status === 'completed') {
      if (booking.payment.method !== 'cash') {
        booking.payment.status = 'paid'
        booking.payment.paidAt = new Date()
      }

      await Electrician.findByIdAndUpdate(req.user._id, {
        $inc: {
          'earnings.total': booking.payment.amount,
          'earnings.thisMonth': booking.payment.amount,
        },
      })
    }

    await booking.save()

    res.json({ success: true, booking })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Accept a booking (electrician)
 * @route   PUT /api/bookings/:id/accept
 * @access  Private (electrician)
 */
export const acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) throw ApiError.notFound('Booking not found')

    if (booking.electrician.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Not authorized')
    }

    if (booking.status !== 'pending') {
      throw ApiError.badRequest('Booking is not in pending status')
    }

    booking.status = 'confirmed'
    await booking.save()

    res.json({ success: true, booking })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reject a booking (electrician)
 * @route   PUT /api/bookings/:id/reject
 * @access  Private (electrician)
 */
export const rejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body
    const booking = await Booking.findById(req.params.id)
      .populate('electrician', 'name location categories services')
    if (!booking) throw ApiError.notFound('Booking not found')

    if (booking.electrician._id.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Not authorized')
    }

    if (booking.status !== 'pending') {
      throw ApiError.badRequest('Booking is not in pending status')
    }

    booking.status = 'rejected'
    booking.cancellation = {
      reason: reason || 'Rejected by electrician',
      cancelledBy: 'electrician',
      cancelledAt: new Date(),
    }

    // Refund if already paid
    if (booking.payment.status === 'paid') {
      booking.payment.status = 'refunded'
    }

    await booking.save()

    // Find alternative electricians in the same city with overlapping services
    const rejectedElec = booking.electrician
    let alternatives = []
    try {
      alternatives = await Electrician.find({
        _id: { $ne: rejectedElec._id },
        isApproved: true,
        isSuspended: false,
        'availability.isAvailable': true,
        $or: [
          { 'location.city': { $regex: new RegExp(rejectedElec.location?.city || '', 'i') } },
          { categories: { $in: rejectedElec.categories || [] } },
        ],
      })
        .select('name profilePhoto rating experience location categories availability priceRange')
        .sort({ 'rating.avg': -1 })
        .limit(6)
    } catch {
      // Non-critical — just return empty alternatives
    }

    // Broadcast rejection to user via Socket.IO
    try {
      const io = getIO()
      io.emit(`booking:rejected:${booking.user}`, {
        bookingId: booking._id,
        reason: booking.cancellation.reason,
        alternatives: alternatives.map(e => ({
          id: e._id,
          name: e.name,
          photo: e.profilePhoto,
          rating: e.rating?.avg || 0,
          experience: e.experience,
          city: e.location?.city,
          categories: e.categories,
        })),
      })
    } catch {
      // Socket.IO may not be initialized
    }

    res.json({
      success: true,
      message: 'Booking rejected',
      booking,
      alternatives: alternatives.map(e => ({
        id: e._id,
        name: e.name,
        profilePhoto: e.profilePhoto,
        rating: e.rating,
        experience: e.experience,
        location: e.location,
        categories: e.categories,
        availability: e.availability,
        priceRange: e.priceRange,
      })),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get alternative electricians for a rejected/cancelled booking
 * @route   GET /api/bookings/:id/alternatives
 * @access  Private (user)
 */
export const getBookingAlternatives = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('electrician', 'location categories services')

    if (!booking) throw ApiError.notFound('Booking not found')

    if (booking.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Not authorized')
    }

    const rejectedElec = booking.electrician
    const alternatives = await Electrician.find({
      _id: { $ne: rejectedElec._id },
      isApproved: true,
      isSuspended: false,
      'availability.isAvailable': true,
      $or: [
        { 'location.city': { $regex: new RegExp(rejectedElec.location?.city || '', 'i') } },
        { categories: { $in: rejectedElec.categories || [] } },
      ],
    })
      .select('name profilePhoto rating experience location categories availability priceRange')
      .sort({ 'rating.avg': -1 })
      .limit(10)

    res.json({
      success: true,
      booking: {
        _id: booking._id,
        service: booking.service,
        scheduledAt: booking.scheduledAt,
        timeSlot: booking.timeSlot,
        status: booking.status,
      },
      alternatives: alternatives.map(e => ({
        id: e._id,
        name: e.name,
        profilePhoto: e.profilePhoto,
        rating: e.rating,
        experience: e.experience,
        location: e.location,
        categories: e.categories,
        availability: e.availability,
        priceRange: e.priceRange,
      })),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Cancel booking (user)
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (user)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) throw ApiError.notFound('Booking not found')

    if (booking.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Not authorized')
    }

    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      throw ApiError.badRequest('Cannot cancel a completed or already cancelled booking')
    }

    booking.status = 'cancelled'
    booking.cancellation = {
      reason: reason || 'Cancelled by user',
      cancelledBy: 'user',
      cancelledAt: new Date(),
    }

    // Refund if already paid
    if (booking.payment.status === 'paid') {
      booking.payment.status = 'refunded'
    }

    await booking.save()

    // ── Broadcast slot freed via Socket.IO ──
    try {
      const io = getIO()
      const dateStr = booking.scheduledAt.toISOString().split('T')[0]
      io.to(`elec:${booking.electrician}`).emit('slot:freed', {
        electricianId: booking.electrician.toString(),
        date: dateStr,
        timeSlot: booking.timeSlot,
      })
    } catch {
      // Socket.IO may not be initialized
    }

    res.json({ success: true, message: 'Booking cancelled', booking })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get booked time slots for an electrician on a specific date
 * @route   GET /api/bookings/slots/:electricianId
 * @access  Public
 */
export const getBookedSlots = async (req, res, next) => {
  try {
    const { electricianId } = req.params
    const { date } = req.query

    if (!date) {
      throw ApiError.badRequest('Date query parameter is required (YYYY-MM-DD)')
    }

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const bookings = await Booking.find({
      electrician: electricianId,
      scheduledAt: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['cancelled'] },
    }).select('timeSlot scheduledAt')

    const bookedSlots = bookings
      .map(b => b.timeSlot)
      .filter(Boolean)

    res.json({
      success: true,
      date,
      electricianId,
      bookedSlots,
    })
  } catch (error) {
    next(error)
  }
}
