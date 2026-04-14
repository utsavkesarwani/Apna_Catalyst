import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  icon: {
    type: String,
    default: 'Zap', // Lucide icon name
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
  },
  longDescription: {
    type: String,
    default: '',
    maxlength: [2000, 'Long description cannot exceed 2000 characters'],
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  basePrice: {
    type: Number,
    default: 0,
  },
  image: {
    type: String, // Cloudinary URL
    default: '',
  },
  // For SEO
  metaTitle: {
    type: String,
    default: '',
  },
  metaDescription: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// Indexes
    // Removed duplicate schema explicit index for slug.
serviceSchema.index({ isActive: 1, order: 1 })
serviceSchema.index({ parentCategory: 1 })

// Auto-generate slug from name if not provided
serviceSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  next()
})

// Virtual: sub-categories
serviceSchema.virtual('subCategories', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'parentCategory',
})

const Service = mongoose.model('Service', serviceSchema)
export default Service
