import Location from '../models/Location.js'
import ApiError from '../utils/ApiError.js'

// ═══════════════════════════════════════════
// Public Endpoints
// ═══════════════════════════════════════════

/**
 * @desc    Get all active locations (for frontend dropdowns)
 * @route   GET /api/locations/active
 * @access  Public
 */
export const getActiveLocations = async (req, res, next) => {
  try {
    const { state, city } = req.query

    const filter = { isActive: true }
    if (state) filter.state = state
    if (city) filter.city = city

    const locations = await Location.find(filter)
      .select('state city localityName pincode')
      .sort({ state: 1, city: 1, localityName: 1 })

    // Group by state → city for cascading dropdown
    const grouped = {}
    locations.forEach(loc => {
      if (!grouped[loc.state]) grouped[loc.state] = {}
      if (!grouped[loc.state][loc.city]) grouped[loc.state][loc.city] = []
      grouped[loc.state][loc.city].push({
        _id: loc._id,
        localityName: loc.localityName,
        pincode: loc.pincode,
      })
    })

    res.json({ success: true, locations, grouped })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get distinct states (for first dropdown)
 * @route   GET /api/locations/states
 * @access  Public
 */
export const getStates = async (req, res, next) => {
  try {
    const states = await Location.distinct('state', { isActive: true })
    res.json({ success: true, states: states.sort() })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get cities by state (for second dropdown)
 * @route   GET /api/locations/cities?state=...
 * @access  Public
 */
export const getCitiesByState = async (req, res, next) => {
  try {
    const { state } = req.query
    if (!state) throw ApiError.badRequest('State is required')

    const cities = await Location.distinct('city', { state, isActive: true })
    res.json({ success: true, cities: cities.sort() })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get localities by city (for third dropdown)
 * @route   GET /api/locations/localities?state=...&city=...
 * @access  Public
 */
export const getLocalitiesByCity = async (req, res, next) => {
  try {
    const { state, city } = req.query
    if (!state || !city) throw ApiError.badRequest('State and city are required')

    const localities = await Location.find({ state, city, isActive: true })
      .select('localityName pincode')
      .sort({ localityName: 1 })

    res.json({ success: true, localities })
  } catch (error) {
    next(error)
  }
}

// ═══════════════════════════════════════════
// Admin Endpoints
// ═══════════════════════════════════════════

/**
 * @desc    Get ALL locations (admin — includes inactive)
 * @route   GET /api/admin/locations
 * @access  Admin
 */
export const getAllLocations = async (req, res, next) => {
  try {
    const { search, state, city, active } = req.query
    const filter = {}

    if (state) filter.state = state
    if (city) filter.city = city
    if (active !== undefined) filter.isActive = active === 'true'
    if (search) {
      filter.$or = [
        { state: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { localityName: new RegExp(search, 'i') },
        { pincode: new RegExp(search, 'i') },
      ]
    }

    const locations = await Location.find(filter).sort({ state: 1, city: 1, localityName: 1 })

    // Stats
    const totalActive = await Location.countDocuments({ isActive: true })
    const totalInactive = await Location.countDocuments({ isActive: false })
    const distinctStates = await Location.distinct('state')
    const distinctCities = await Location.distinct('city')

    res.json({
      success: true,
      count: locations.length,
      stats: {
        totalActive,
        totalInactive,
        total: totalActive + totalInactive,
        states: distinctStates.length,
        cities: distinctCities.length,
      },
      locations,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Add a new location (or bulk add)
 * @route   POST /api/admin/locations
 * @access  Admin
 */
export const createLocation = async (req, res, next) => {
  try {
    const { state, city, localityName, pincode, isActive, bulk } = req.body

    // Bulk mode: array of localities for same state+city
    if (bulk && Array.isArray(bulk)) {
      const docs = bulk.map(item => ({
        state: item.state || state,
        city: item.city || city,
        localityName: item.localityName,
        pincode: item.pincode || '',
        isActive: item.isActive !== undefined ? item.isActive : true,
      }))

      const result = await Location.insertMany(docs, { ordered: false }).catch(err => {
        // Handle duplicate key errors gracefully
        if (err.code === 11000 || err.writeErrors) {
          return { insertedCount: err.result?.nInserted || 0, errors: err.writeErrors?.length || 0 }
        }
        throw err
      })

      return res.status(201).json({
        success: true,
        message: `${Array.isArray(result) ? result.length : result.insertedCount} localities added`,
        ...(result.errors ? { skipped: result.errors } : {}),
      })
    }

    // Single add
    if (!state || !city || !localityName) {
      throw ApiError.badRequest('State, city, and locality name are required')
    }

    const location = await Location.create({
      state,
      city,
      localityName,
      pincode: pincode || '',
      isActive: isActive !== undefined ? isActive : true,
    })

    res.status(201).json({ success: true, message: 'Location added', location })
  } catch (error) {
    if (error.code === 11000) {
      return next(ApiError.conflict('This locality already exists in the given city/state'))
    }
    next(error)
  }
}

/**
 * @desc    Update a location
 * @route   PUT /api/admin/locations/:id
 * @access  Admin
 */
export const updateLocation = async (req, res, next) => {
  try {
    const { state, city, localityName, pincode, isActive } = req.body
    const updates = {}

    if (state !== undefined) updates.state = state
    if (city !== undefined) updates.city = city
    if (localityName !== undefined) updates.localityName = localityName
    if (pincode !== undefined) updates.pincode = pincode
    if (isActive !== undefined) updates.isActive = isActive

    const location = await Location.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    if (!location) throw ApiError.notFound('Location not found')

    res.json({ success: true, message: 'Location updated', location })
  } catch (error) {
    if (error.code === 11000) {
      return next(ApiError.conflict('This locality already exists in the given city/state'))
    }
    next(error)
  }
}

/**
 * @desc    Toggle locality active status (one-click enable/disable)
 * @route   PATCH /api/admin/locations/:id/toggle
 * @access  Admin
 */
export const toggleLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id)
    if (!location) throw ApiError.notFound('Location not found')

    location.isActive = !location.isActive
    await location.save()

    res.json({
      success: true,
      message: location.isActive ? 'Locality activated' : 'Locality deactivated',
      location,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete a location
 * @route   DELETE /api/admin/locations/:id
 * @access  Admin
 */
export const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id)
    if (!location) throw ApiError.notFound('Location not found')
    res.json({ success: true, message: 'Location deleted' })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Bulk toggle entire city or state
 * @route   PATCH /api/admin/locations/bulk-toggle
 * @access  Admin
 */
export const bulkToggle = async (req, res, next) => {
  try {
    const { state, city, isActive } = req.body
    if (isActive === undefined) throw ApiError.badRequest('isActive is required')

    const filter = {}
    if (state) filter.state = state
    if (city) filter.city = city

    const result = await Location.updateMany(filter, { isActive })

    res.json({
      success: true,
      message: `${result.modifiedCount} localities updated`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    next(error)
  }
}
