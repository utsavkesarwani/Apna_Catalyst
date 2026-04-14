import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  electrician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Electrician',
    required: [true, 'Electrician is required'],
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    default: '',
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Indexes
reviewSchema.index({ electrician: 1, createdAt: -1 })
reviewSchema.index({ user: 1 })
reviewSchema.index({ booking: 1 }, { unique: true }) // One review per booking

// After saving a review, update electrician's average rating
reviewSchema.post('save', async function () {
  const Electrician = mongoose.model('Electrician')
  const stats = await mongoose.model('Review').aggregate([
    { $match: { electrician: this.electrician, isVisible: true } },
    {
      $group: {
        _id: '$electrician',
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ])

  if (stats.length > 0) {
    await Electrician.findByIdAndUpdate(this.electrician, {
      'rating.avg': Math.round(stats[0].avg * 10) / 10,
      'rating.count': stats[0].count,
    })
  }
})

// After removing a review, recalculate rating
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Electrician = mongoose.model('Electrician')
    const stats = await mongoose.model('Review').aggregate([
      { $match: { electrician: doc.electrician, isVisible: true } },
      {
        $group: {
          _id: '$electrician',
          avg: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ])

    if (stats.length > 0) {
      await Electrician.findByIdAndUpdate(doc.electrician, {
        'rating.avg': Math.round(stats[0].avg * 10) / 10,
        'rating.count': stats[0].count,
      })
    } else {
      await Electrician.findByIdAndUpdate(doc.electrician, {
        'rating.avg': 0,
        'rating.count': 0,
      })
    }
  }
})

const Review = mongoose.model('Review', reviewSchema)
export default Review
