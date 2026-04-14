import Page from '../models/Page.js'
import ApiError from '../utils/ApiError.js'

// ─── Public Routes ───────────────────────────────

/**
 * @desc    Get single page by slug (increments views)
 * @route   GET /api/pages/:slug
 * @access  Public
 */
export const getPageBySlug = async (req, res, next) => {
  try {
    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).select('-__v')

    if (!page) throw ApiError.notFound('Page not found')

    res.json({ success: true, page })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    List all published blog posts
 * @route   GET /api/pages/blog
 * @access  Public
 */
export const getBlogPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, tag } = req.query
    const filter = { type: 'blog', isPublished: true }
    if (tag) filter.tags = tag

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [posts, total] = await Promise.all([
      Page.find(filter)
        .select('slug title excerpt coverImage tags author publishedAt readTime views')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Page.countDocuments(filter),
    ])

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      posts,
    })
  } catch (error) {
    next(error)
  }
}

// ─── Admin Routes ────────────────────────────────

/**
 * @desc    Get all pages (admin, including drafts)
 * @route   GET /api/admin/pages
 */
export const getAllPages = async (req, res, next) => {
  try {
    const { type, search } = req.query
    const filter = {}
    if (type) filter.type = type
    if (search) filter.title = new RegExp(search, 'i')

    const pages = await Page.find(filter)
      .select('slug title type isPublished publishedAt readTime views createdAt')
      .sort({ updatedAt: -1 })

    res.json({ success: true, count: pages.length, pages })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single page by ID (admin — includes drafts)
 * @route   GET /api/admin/pages/:id
 */
export const getPageById = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id)
    if (!page) throw ApiError.notFound('Page not found')
    res.json({ success: true, page })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create a new page
 * @route   POST /api/admin/pages
 */
export const createPage = async (req, res, next) => {
  try {
    const { slug, title, content, excerpt, type, coverImage, tags, author, isPublished, seo } = req.body
    if (!slug || !title) throw ApiError.badRequest('Slug and title are required')

    const exists = await Page.findOne({ slug })
    if (exists) throw ApiError.conflict(`Slug "${slug}" already exists`)

    const page = await Page.create({
      slug, title, content, excerpt, type, coverImage,
      tags: tags || [], author, isPublished: isPublished || false, seo,
    })

    res.status(201).json({ success: true, message: 'Page created', page })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update a page (content, publish status, SEO, etc.)
 * @route   PUT /api/admin/pages/:id
 */
export const updatePage = async (req, res, next) => {
  try {
    const allowed = ['title', 'content', 'excerpt', 'type', 'coverImage', 'tags', 'author', 'isPublished', 'seo', 'slug']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const page = await Page.findById(req.params.id)
    if (!page) throw ApiError.notFound('Page not found')

    Object.assign(page, updates)
    await page.save()

    res.json({ success: true, message: 'Page updated', page })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete a page
 * @route   DELETE /api/admin/pages/:id
 */
export const deletePage = async (req, res, next) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id)
    if (!page) throw ApiError.notFound('Page not found')
    res.json({ success: true, message: 'Page deleted' })
  } catch (error) {
    next(error)
  }
}
