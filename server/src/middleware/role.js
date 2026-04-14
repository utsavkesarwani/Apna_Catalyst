import ApiError from '../utils/ApiError.js'

/**
 * Role-based access control middleware
 * Usage: authorize('admin', 'superadmin')
 * 
 * Role hierarchy: superadmin > admin > electrician > user
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'))
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      )
    }

    next()
  }
}

/**
 * Check if user is admin or superadmin
 */
export const isAdmin = authorize('admin', 'superadmin')

/**
 * Check if user is superadmin
 */
export const isSuperAdmin = authorize('superadmin')

/**
 * Check if user owns the resource or is admin
 * @param {Function} getOwnerId - function that takes req and returns the resource owner's ID
 */
export const isOwnerOrAdmin = (getOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'))
    }

    const ownerId = getOwnerId(req)
    const isOwner = req.user._id.toString() === ownerId?.toString()
    const isAdminUser = ['admin', 'superadmin'].includes(req.user.role)

    if (!isOwner && !isAdminUser) {
      return next(ApiError.forbidden('You are not authorized to access this resource'))
    }

    next()
  }
}
