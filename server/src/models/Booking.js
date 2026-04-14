import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
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
  service: {
    type: String,
    required: [true, 'Service is required'],
    trim: true,
  },
  serviceRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  problemDescription: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true,
    minlength: [10, 'Problem description must be at least 10 characters'],
    maxlength: [500, 'Problem description cannot exceed 500 characters'],
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled date/time is required'],
    validate: {
      validator: function (v) {
        return v > new Date()
      },
      message: 'Scheduled time must be in the future',
    },
  },
  timeSlot: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
  payment: {
    method: {
      type: String,
      enum: ['upi', 'card', 'cash', 'online'],
      default: 'cash',
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  couponCode: {
    type: String,
    trim: true,
  },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    reviewedAt: { type: Date },
  },
  cancellation: {
    reason: { type: String },
    cancelledBy: { type: String, enum: ['user', 'electrician', 'admin'] },
    cancelledAt: { type: Date },
  },
  location: {
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// Indexes
bookingSchema.index({ user: 1, status: 1 })
bookingSchema.index({ electrician: 1, status: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ scheduledAt: 1 })
bookingSchema.index({ createdAt: -1 })
// Compound index for real-time slot availability checks
bookingSchema.index({ electrician: 1, scheduledAt: 1, timeSlot: 1, status: 1 })

// Auto-push initial status to history on creation
bookingSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Booking created',
    })
    // Calculate total
    this.payment.total = (this.payment.amount || 0) + (this.payment.platformFee || 0) - (this.payment.discount || 0)
  }
  next()
})

// Track status changes
bookingSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    })
  }
  next()
})

// Virtual: is active booking
bookingSchema.virtual('isActive').get(function () {
  return ['pending', 'confirmed', 'assigned', 'in-progress'].includes(this.status)
})

// Virtual: booking ID formatted
bookingSchema.virtual('bookingId').get(function () {
  return `BK-${this._id.toString().slice(-6).toUpperCase()}`
})

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
