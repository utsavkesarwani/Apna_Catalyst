import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values (Google users may not have mobile)
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
  },
  passwordHash: {
    type: String,
    minlength: 6,
    select: false, // Don't return password in queries by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Only indexed when present
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authMethod: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
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
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  }],
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isBanned: {
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// Index for geo-queries and common lookups
userSchema.index({ 'location.city': 1 })
userSchema.index({ 'location.pincode': 1 })
    // Removed explicit indexes for email and mobile.

// Hash password before saving (skip for Google OAuth users)
userSchema.pre('save', async function (next) {
  if (!this.passwordHash || !this.isModified('passwordHash')) return next()
  const salt = await bcrypt.genSalt(12)
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Virtual: booking count
userSchema.virtual('bookingCount').get(function () {
  return this.bookings ? this.bookings.length : 0
})

const User = mongoose.model('User', userSchema)
export default User
