import mongoose from 'mongoose'

const subcategorySchema = new mongoose.Schema({
  parentServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Parent service is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    maxlength: [150, 'Subcategory name cannot exceed 150 characters'],
  },
  duration: {
    type: String,
    default: '',
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [120, 'Short description cannot exceed 120 characters'],
    default: '',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// Compound index for efficient queries
subcategorySchema.index({ parentServiceId: 1, isActive: 1, order: 1 })

const Subcategory = mongoose.model('Subcategory', subcategorySchema)
export default Subcategory
