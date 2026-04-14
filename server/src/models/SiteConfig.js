import mongoose from 'mongoose'

const siteConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Config key is required'],
    unique: true,
    trim: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Config value is required'],
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json', 'image', 'html'],
    default: 'string',
  },
  group: {
    type: String,
    enum: ['general', 'hero', 'seo', 'contact', 'social', 'payment', 'banner', 'banners', 'features', 'featured'],
    default: 'general',
  },
  label: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
})

// Index for group lookups
siteConfigSchema.index({ group: 1 })

// Static: get config by key
siteConfigSchema.statics.getByKey = async function (key) {
  const config = await this.findOne({ key })
  return config?.value || null
}

// Static: get all configs for a group
siteConfigSchema.statics.getByGroup = async function (group) {
  const configs = await this.find({ group })
  const result = {}
  configs.forEach(c => { result[c.key] = c.value })
  return result
}

// Static: set config
siteConfigSchema.statics.setConfig = async function (key, value, options = {}) {
  const updatePayload = {
    value,
    ...options,
    updatedAt: new Date(),
  }

  return this.findOneAndUpdate(
    { key },
    { $set: updatePayload },
    { upsert: true, new: true }
  )
}

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema)
export default SiteConfig
