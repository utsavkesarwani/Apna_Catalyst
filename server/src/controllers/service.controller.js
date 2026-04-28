import Service from '../models/Service.js'
import ApiError from '../utils/ApiError.js'

/**
 * @desc    Get all active services
 * @route   GET /api/services
 * @access  Public
 */
export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ order: 1 })
      .populate('subCategories')

    res.json({ success: true, count: services.length, services })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get ALL services including inactive (admin)
 * @route   GET /api/services/all
 * @access  Private (admin/superadmin)
 */
export const getAllServicesAdmin = async (req, res, next) => {
  try {
    const services = await Service.find()
      .sort({ order: 1 })
      .populate('subCategories')

    res.json({ success: true, count: services.length, services })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Toggle service active status (admin)
 * @route   PATCH /api/services/:id/toggle
 * @access  Private (admin/superadmin)
 */
export const toggleService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) throw ApiError.notFound('Service not found')

    service.isActive = !service.isActive
    await service.save()

    res.json({
      success: true,
      message: service.isActive ? 'Service activated' : 'Service deactivated',
      service,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get service by slug
 * @route   GET /api/services/:slug
 * @access  Public
 */
export const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true })
      .populate('subCategories')

    if (!service) throw ApiError.notFound('Service not found')

    res.json({ success: true, service })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create a service (admin)
 * @route   POST /api/services
 * @access  Private (admin/superadmin)
 */
export const createService = async (req, res, next) => {
  try {
    const { name, slug, icon, description, longDescription, parentCategory, basePrice, image, order } = req.body

    const service = await Service.create({
      name, slug, icon, description, longDescription,
      parentCategory: parentCategory || null,
      basePrice: basePrice || 0,
      image: image || '',
      order: order || 0,
    })

    res.status(201).json({ success: true, service })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update a service (admin)
 * @route   PUT /api/services/:id
 * @access  Private (admin/superadmin)
 */
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!service) throw ApiError.notFound('Service not found')

    res.json({ success: true, service })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete a service (admin)
 * @route   DELETE /api/services/:id
 * @access  Private (admin/superadmin)
 */
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id)
    if (!service) throw ApiError.notFound('Service not found')

    res.json({ success: true, message: 'Service deleted' })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reorder services (admin)
 * @route   PUT /api/services/reorder
 * @access  Private (admin/superadmin)
 */
export const reorderServices = async (req, res, next) => {
  try {
    const { orderedIds } = req.body // Array of { id, order }

    if (!Array.isArray(orderedIds)) {
      throw ApiError.badRequest('orderedIds must be an array of { id, order }')
    }

    const bulkOps = orderedIds.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order },
      },
    }))

    await Service.bulkWrite(bulkOps)

    res.json({ success: true, message: 'Services reordered' })
  } catch (error) {
    next(error)
  }
}
