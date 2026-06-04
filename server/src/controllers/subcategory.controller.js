import Subcategory from '../models/Subcategory.js'
import Service from '../models/Service.js'
import ApiError from '../utils/ApiError.js'

/**
 * @desc    Get active subcategories for a service (public)
 * @route   GET /api/services/:serviceId/subcategories
 * @access  Public
 */
export const getSubcategoriesByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params

    const service = await Service.findById(serviceId)
    if (!service) throw ApiError.notFound('Service not found')

    const subcategories = await Subcategory.find({
      parentServiceId: serviceId,
      isActive: true,
    }).sort({ order: 1, createdAt: 1 })

    res.json({ success: true, count: subcategories.length, subcategories })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get ALL subcategories for a service including inactive (admin)
 * @route   GET /api/services/:serviceId/subcategories/all
 * @access  Private (admin/superadmin)
 */
export const getAllSubcategoriesAdmin = async (req, res, next) => {
  try {
    const { serviceId } = req.params

    const subcategories = await Subcategory.find({
      parentServiceId: serviceId,
    }).sort({ order: 1, createdAt: 1 })

    res.json({ success: true, count: subcategories.length, subcategories })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create a subcategory (admin)
 * @route   POST /api/services/:serviceId/subcategories
 * @access  Private (admin/superadmin)
 */
export const createSubcategory = async (req, res, next) => {
  try {
    const { serviceId } = req.params
    const { name, duration, price, order } = req.body

    const service = await Service.findById(serviceId)
    if (!service) throw ApiError.notFound('Parent service not found')

    const subcategory = await Subcategory.create({
      parentServiceId: serviceId,
      name,
      duration: duration || '',
      price: price || 0,
      order: order || 0,
    })

    res.status(201).json({ success: true, subcategory })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update a subcategory (admin)
 * @route   PUT /api/subcategories/:id
 * @access  Private (admin/superadmin)
 */
export const updateSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!subcategory) throw ApiError.notFound('Subcategory not found')

    res.json({ success: true, subcategory })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Toggle subcategory active status (admin)
 * @route   PATCH /api/subcategories/:id/toggle
 * @access  Private (admin/superadmin)
 */
export const toggleSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id)
    if (!subcategory) throw ApiError.notFound('Subcategory not found')

    subcategory.isActive = !subcategory.isActive
    await subcategory.save()

    res.json({
      success: true,
      message: subcategory.isActive ? 'Subcategory activated' : 'Subcategory deactivated',
      subcategory,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete a subcategory (admin)
 * @route   DELETE /api/subcategories/:id
 * @access  Private (admin/superadmin)
 */
export const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id)
    if (!subcategory) throw ApiError.notFound('Subcategory not found')

    res.json({ success: true, message: 'Subcategory deleted' })
  } catch (error) {
    next(error)
  }
}
