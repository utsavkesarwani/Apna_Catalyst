import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  flatNo: {
    type: String,
    required: [true, 'Flat/House No. is required'],
    trim: true,
  },
  locality: {
    type: String,
    required: [true, 'Street/Colony/Area is required'],
    trim: true,
  },
  landmark: {
    type: String,
    required: [true, 'Landmark is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode'],
  },
}, {
  timestamps: true,
})

const Address = mongoose.model('Address', addressSchema)
export default Address
