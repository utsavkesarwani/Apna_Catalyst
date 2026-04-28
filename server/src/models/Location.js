import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  localityName: {
    type: String,
    required: [true, 'Locality name is required'],
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Compound index: unique locality per city+state
locationSchema.index({ state: 1, city: 1, localityName: 1 }, { unique: true })
locationSchema.index({ state: 1, city: 1, isActive: 1 })

const Location = mongoose.model('Location', locationSchema)
export default Location
