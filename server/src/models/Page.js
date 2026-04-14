import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    default: '',  // Raw HTML or Markdown string
  },
  excerpt: {
    type: String,
    default: '',
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
  },
  type: {
    type: String,
    enum: ['static', 'blog'],
    default: 'static',
  },
  // Blog-specific fields
  coverImage: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  author: {
    type: String,
    default: 'Apna Electro Team',
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  readTime: {
    type: Number,  // minutes
    default: 1,
  },
  views: {
    type: Number,
    default: 0,
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
}, {
  timestamps: true,
})

// Auto-calculate read time before save
pageSchema.pre('save', function (next) {
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    this.readTime = Math.max(1, Math.ceil(wordCount / 200))
  }
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// Indexes
pageSchema.index({ slug: 1 })
pageSchema.index({ type: 1, isPublished: 1 })
pageSchema.index({ publishedAt: -1 })
pageSchema.index({ tags: 1 })

const Page = mongoose.model('Page', pageSchema)
export default Page
