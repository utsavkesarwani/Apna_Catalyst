import jwt from 'jsonwebtoken'

/**
 * Generate a JWT token for a user/electrician
 * @param {Object} payload - { id, role }
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

/**
 * Generate auth response with token + user data
 */
export const authResponse = (user, role = 'user') => {
  const token = generateToken({ id: user._id, role })
  
  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role,
      location: user.location,
    },
  }
}
