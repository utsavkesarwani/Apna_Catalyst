import mongoose from 'mongoose'

/**
 * SkillRequest — tracks custom skills submitted by electricians
 * so the Super Admin can review and optionally add them to the master list.
 */
const skillRequestSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Electrician',
    required: true,
  },
  requestedByName: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
})

// Avoid duplicate pending requests for the same skill
skillRequestSchema.index({ skillName: 1, status: 1 })
skillRequestSchema.index({ requestedBy: 1 })

const SkillRequest = mongoose.model('SkillRequest', skillRequestSchema)
export default SkillRequest
