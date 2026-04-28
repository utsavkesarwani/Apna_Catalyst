import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const electricianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['electrician'],
    default: 'electrician',
  },
  location: {
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    country: { type: String, trim: true, default: 'India' },
    pincode: { type: String, trim: true, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  detailedAddress: {
    flatNo: { type: String, trim: true, default: '' },
    landmark: { type: String, trim: true, default: '' },
    locality: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience seems too high'],
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
  },
  profilePhoto: {
    type: String, // Cloudinary URL
    default: '',
  },
  workImages: [{
    type: String, // Cloudinary URLs
  }],
  workVideo: {
    type: String, // Cloudinary URL
    default: '',
  },
  categories: [{
    type: String,
    trim: true,
  }],
  // Services this electrician offers (references to Service slugs)
  services: [{
    type: String,
    trim: true,
  }],
  rating: {
    avg: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    nextAvailableAt: { type: Date, default: null },
  },
  aadhar: {
    number: {
      type: String,
      trim: true,
      select: false, // Sensitive data
      match: [/^\d{12}$/, 'Aadhar must be a 12-digit number'],
    },
    verified: { type: Boolean, default: false },
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  earnings: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
  topBadge: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  // OTP fields
  otp: {
    type: {
      code: { type: String },
      expiresAt: { type: Date }
    },
    select: false
  },
  lastLogin: {
    type: Date,
  },
  // ─── Verification System ──────────────────────
  isVerified: {
    type: Boolean,
    default: false,
  },
  documents: {
    aadharCard: { type: String, default: '' },   // Upload URL
    panCard: { type: String, default: '' },
    certificate: { type: String, default: '' },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionNote: { type: String, default: '' },
  },
  // ─── Live Status Tracking ─────────────────────
  lastSeen: {
    type: Date,
    default: null,
  },
  currentLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    updatedAt: { type: Date, default: null },
  },
  // ─── Financial Payout Ledger ──────────────────
  payoutLedger: [{
    amount: { type: Number, required: true },
    type: { type: String, enum: ['payout', 'hold', 'bonus', 'deduction'], default: 'payout' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    reference: { type: String, default: '' },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// Indexes
electricianSchema.index({ 'location.city': 1 })
electricianSchema.index({ 'location.state': 1 })
electricianSchema.index({ 'location.pincode': 1 })
electricianSchema.index({ 'rating.avg': -1 })
electricianSchema.index({ categories: 1 })
electricianSchema.index({ services: 1 })
electricianSchema.index({ isApproved: 1, 'availability.isAvailable': 1 })
    // Removed duplicate schema explicit index for email and mobile.

// Hash password before saving
electricianSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  const salt = await bcrypt.genSalt(12)
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
  next()
})

// Compare password method
electricianSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Virtual: review count alias
electricianSchema.virtual('reviewCount').get(function () {
  return this.rating?.count || 0
})

// Virtual: formatted price range
electricianSchema.virtual('priceRangeFormatted').get(function () {
  if (this.priceRange?.min && this.priceRange?.max) {
    return `₹${this.priceRange.min} – ₹${this.priceRange.max}`
  }
  return 'Contact for pricing'
})

const Electrician = mongoose.model('Electrician', electricianSchema)
export default Electrician
