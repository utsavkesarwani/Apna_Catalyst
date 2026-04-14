import apiClient from './client.js'

// ═══════════════════════════════════════════
// Electrician Auth APIs
// ═══════════════════════════════════════════

export const electricianLogin = (data) =>
  apiClient.post('/electricians/login', data)

export const electricianRegister = (data) =>
  apiClient.post('/electricians/register', data)

export const getMyProfile = () =>
  apiClient.get('/electricians/me')

// ═══════════════════════════════════════════
// Profile APIs
// ═══════════════════════════════════════════

export const updateProfile = (data) =>
  apiClient.put('/electricians/profile', data)

export const updateAvailability = (data) =>
  apiClient.put('/electricians/availability', data)

export const uploadMedia = (formData) =>
  apiClient.post('/electricians/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s for file uploads
  })

// ═══════════════════════════════════════════
// Booking APIs (Electrician Side)
// ═══════════════════════════════════════════

export const getElectricianBookings = (params = {}) =>
  apiClient.get('/bookings/electrician/me', { params })

export const acceptBooking = (id) =>
  apiClient.put(`/bookings/${id}/accept`)

export const rejectBooking = (id, reason = '') =>
  apiClient.put(`/bookings/${id}/reject`, { reason })

export const updateBookingStatus = (id, status, note = '') =>
  apiClient.put(`/bookings/${id}/status`, { status, note })

// ═══════════════════════════════════════════
// Earnings API
// ═══════════════════════════════════════════

export const getEarnings = () =>
  apiClient.get('/electricians/me/earnings')

// ═══════════════════════════════════════════
// Reviews API
// ═══════════════════════════════════════════

export const getMyReviews = (params = {}) =>
  apiClient.get('/electricians/me/reviews', { params })
