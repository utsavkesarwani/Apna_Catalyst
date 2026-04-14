import SiteConfig from '../models/SiteConfig.js'
import ApiError from '../utils/ApiError.js'

/**
 * @desc    Get all public site configs
 * @route   GET /api/config
 * @access  Public
 */
export const getPublicConfig = async (req, res, next) => {
  try {
    const configs = await SiteConfig.find()
    const result = {}
    configs.forEach(c => { result[c.key] = c.value })

    res.json({ success: true, config: result })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get config by group
 * @route   GET /api/config/group/:group
 * @access  Public
 */
export const getConfigByGroup = async (req, res, next) => {
  try {
    const config = await SiteConfig.getByGroup(req.params.group)
    res.json({ success: true, config })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update a single config key
 * @route   PUT /api/config/:key
 * @access  Private (superadmin)
 */
export const updateConfig = async (req, res, next) => {
  try {
    const { value, type, group, label, description } = req.body

    const config = await SiteConfig.setConfig(req.params.key, value, {
      type: type || 'string',
      group: group || 'general',
      label: label || req.params.key,
      description: description || '',
      updatedBy: req.user._id,
    })

    res.json({ success: true, config })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Bulk update configs
 * @route   POST /api/config/bulk
 * @access  Private (superadmin)
 */
export const bulkUpdateConfig = async (req, res, next) => {
  try {
    const { configs } = req.body // Array of { key, value, type?, group? }

    if (!Array.isArray(configs)) {
      throw ApiError.badRequest('configs must be an array')
    }

    const results = await Promise.all(
      configs.map(c =>
        SiteConfig.setConfig(c.key, c.value, {
          type: c.type || 'string',
          group: c.group || 'general',
          label: c.label || c.key,
          updatedBy: req.user._id,
        })
      )
    )

    res.json({ success: true, count: results.length, message: 'Configs updated' })
  } catch (error) {
    next(error)
  }
}
