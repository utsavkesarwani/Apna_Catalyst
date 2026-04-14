import api from './client.js'

// ─── Admin Auth ─────────────────────────────────
export const adminLogin = (data) =>
  api.post('/superadmin/login', data)

// ─── Analytics ──────────────────────────────────
export const getAnalyticsOverview = () =>
  api.get('/admin/analytics/overview')

export const getRevenueAnalytics = (period = 30) =>
  api.get(`/admin/analytics/revenue?period=${period}`)

export const getBookingAnalytics = (period = 30) =>
  api.get(`/admin/analytics/bookings?period=${period}`)

// ─── User Management ────────────────────────────
export const getAllUsers = (params = {}) =>
  api.get('/admin/users', { params })

export const toggleBanUser = (id) =>
  api.put(`/admin/users/${id}/ban`)

// ─── Electrician Management ─────────────────────
export const getAllElectricians = (params = {}) =>
  api.get('/admin/electricians', { params })

export const approveElectrician = (id) =>
  api.put(`/admin/electricians/${id}/approve`)

export const suspendElectrician = (id) =>
  api.put(`/admin/electricians/${id}/suspend`)

export const toggleVerifyElectrician = (id, data = {}) =>
  api.put(`/admin/electricians/${id}/verify`, data)

export const getElectricianPerformance = (id) =>
  api.get(`/admin/electricians/${id}/performance`)

export const getElectricianFinancials = (id) =>
  api.get(`/admin/electricians/${id}/financials`)

export const createElectricianPayout = (id, data) =>
  api.post(`/admin/electricians/${id}/payout`, data)

// ─── Booking Management ─────────────────────────
export const getAllBookings = (params = {}) =>
  api.get('/admin/bookings', { params })

export const assignElectricianToBooking = (bookingId, electricianId) =>
  api.put(`/admin/bookings/${bookingId}/assign`, { electricianId })

// ─── Site Config / CMS ──────────────────────────
export const getPublicConfig = () =>
  api.get('/config')

export const updateConfig = (key, data) =>
  api.put(`/config/${key}`, data)

export const bulkUpdateConfig = (configs) =>
  api.post('/config/bulk', { configs })

// ─── Services Management ────────────────────────
export const getServices = () =>
  api.get('/services')

export const createService = (data) =>
  api.post('/services', data)

export const updateService = (id, data) =>
  api.put(`/services/${id}`, data)

export const deleteService = (id) =>
  api.delete(`/services/${id}`)

export const reorderServices = (orderedIds) =>
  api.put('/services/reorder', { orderedIds })
