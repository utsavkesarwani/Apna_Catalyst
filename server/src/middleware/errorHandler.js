import ApiError from '../utils/ApiError.js'

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message
  error.stack = err.stack

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err)
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    error = ApiError.conflict(`Duplicate value for '${field}': '${value}'. Please use another value.`)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    error = ApiError.badRequest('Validation failed', messages)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token')
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired')
  }

  const statusCode = error.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  })
}
