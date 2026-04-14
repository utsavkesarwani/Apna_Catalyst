import apiClient from './client.js'

// ═══════════════════════════════════════════
// User Auth APIs
// ═══════════════════════════════════════════

export const userRegister = (data) =>
  apiClient.post('/auth/register', data)

export const userLogin = (data) =>
  apiClient.post('/auth/login', data)

export const sendOTP = (mobile) =>
  apiClient.post('/auth/send-otp', { mobile })

export const verifyOTP = (data) =>
  apiClient.post('/auth/verify-otp', data)

export const getMe = () =>
  apiClient.get('/auth/me')

export const userLogout = () =>
  apiClient.post('/auth/logout')

// ═══════════════════════════════════════════
// User Profile APIs
// ═══════════════════════════════════════════

export const getUserProfile = () =>
  apiClient.get('/users/profile')

export const updateUserProfile = (data) =>
  apiClient.put('/users/profile', data)

export const updatePassword = (data) =>
  apiClient.put('/users/password', data)

export const getUserBookings = () =>
  apiClient.get('/users/bookings')

// ═══════════════════════════════════════════
// Electrician Discovery APIs (Public)
// ═══════════════════════════════════════════

export const getElectricians = (params = {}) =>
  apiClient.get('/electricians', { params })

export const getElectricianById = (id) =>
  apiClient.get(`/electricians/${id}`)

export const getTopElectricians = (params = {}) =>
  apiClient.get('/electricians/top', { params })

// ═══════════════════════════════════════════
// Service / Category APIs (Public)
// ═══════════════════════════════════════════

export const getServices = () =>
  apiClient.get('/services')

export const getServiceBySlug = (slug) =>
  apiClient.get(`/services/${slug}`)

// ═══════════════════════════════════════════
// Booking APIs (User Side)
// ═══════════════════════════════════════════

export const createBooking = (data) =>
  apiClient.post('/bookings', data)

export const getBookingById = (id) =>
  apiClient.get(`/bookings/${id}`)

export const getMyBookings = (params = {}) =>
  apiClient.get('/bookings/user/me', { params })

export const cancelBooking = (id, reason = '') =>
  apiClient.put(`/bookings/${id}/cancel`, { reason })

export const getBookedSlots = (electricianId, date) =>
  apiClient.get(`/bookings/slots/${electricianId}`, { params: { date } })

// ═══════════════════════════════════════════
// Payment APIs
// ═══════════════════════════════════════════

export const initiatePayment = (data) =>
  apiClient.post('/payments/initiate', data)

export const verifyPayment = (data) =>
  apiClient.post('/payments/verify', data)

export const getPaymentStatus = (bookingId) =>
  apiClient.get(`/payments/${bookingId}/status`)

// ═══════════════════════════════════════════
// Review APIs
// ═══════════════════════════════════════════

export const createReview = (data) =>
  apiClient.post('/reviews', data)

export const getElectricianReviews = (electricianId, params = {}) =>
  apiClient.get(`/reviews/electrician/${electricianId}`, { params })
