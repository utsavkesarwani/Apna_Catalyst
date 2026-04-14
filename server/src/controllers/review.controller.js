import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import ApiError from '../utils/ApiError.js'

/**
 * @desc    Create a review for a completed booking
 * @route   POST /api/reviews
 * @access  Private (user)
 */
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body

    if (!bookingId || !rating) {
      throw ApiError.badRequest('Booking ID and rating are required')
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
    if (!booking) throw ApiError.notFound('Booking not found')

    // Only the booking owner can review
    if (booking.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only review your own bookings')
    }

    // Only completed bookings can be reviewed
    if (booking.status !== 'completed') {
      throw ApiError.badRequest('You can only review completed bookings')
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ booking: bookingId })
    if (existingReview) {
      throw ApiError.conflict('You have already reviewed this booking')
    }

    const review = await Review.create({
      user: req.user._id,
      electrician: booking.electrician,
      booking: bookingId,
      rating,
      comment: comment || '',
    })

    // Also update the booking's review field
    booking.review = {
      rating,
      comment: comment || '',
      reviewedAt: new Date(),
    }
    await booking.save({ validateBeforeSave: false })

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')

    res.status(201).json({ success: true, review: populatedReview })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get reviews for an electrician
 * @route   GET /api/reviews/electrician/:id
 * @access  Public
 */
export const getElectricianReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)

    let sortOption = { createdAt: -1 }
    if (sort === 'highest') sortOption = { rating: -1 }
    if (sort === 'lowest') sortOption = { rating: 1 }

    const [reviews, total] = await Promise.all([
      Review.find({ electrician: req.params.id, isVisible: true })
        .populate('user', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ electrician: req.params.id, isVisible: true }),
    ])

    // Calculate rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { electrician: require('mongoose').Types.ObjectId.createFromHexString(req.params.id), isVisible: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ])

    const breakdown = {}
    for (let i = 1; i <= 5; i++) {
      const found = ratingBreakdown.find(r => r._id === i)
      breakdown[i] = found ? found.count : 0
    }

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      breakdown,
      reviews,
    })
  } catch (error) {
    next(error)
  }
}
