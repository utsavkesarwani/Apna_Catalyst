import { Router } from 'express'
import {
  getAllUsers, toggleBanUser,
  getAllElectricians, approveElectrician, suspendElectrician,
  toggleVerification, getElectricianPerformance,
  getElectricianFinancials, createPayout,
  getAllBookings, assignElectrician,
  getAnalyticsOverview, getRevenueAnalytics, getBookingAnalytics,
} from '../controllers/admin.controller.js'
import { updateLiveStatus } from '../controllers/admin.controller.js'
import {
  getAllPages, getPageById, createPage, updatePage, deletePage,
} from '../controllers/page.controller.js'
import {
  getAllLocations, createLocation, updateLocation,
  toggleLocation, deleteLocation, bulkToggle,
} from '../controllers/location.controller.js'
import { protect } from '../middleware/auth.js'
import { isAdmin, isSuperAdmin } from '../middleware/role.js'

const router = Router()

// All admin routes require authentication + admin role
router.use(protect)
router.use(isAdmin)

// User management
router.get('/users', getAllUsers)
router.put('/users/:id/ban', toggleBanUser)

// Electrician management
router.get('/electricians', getAllElectricians)
router.put('/electricians/:id/approve', approveElectrician)
router.put('/electricians/:id/suspend', suspendElectrician)
router.put('/electricians/:id/verify', toggleVerification)
router.get('/electricians/:id/performance', getElectricianPerformance)
router.get('/electricians/:id/financials', getElectricianFinancials)
router.post('/electricians/:id/payout', createPayout)

// Booking management
router.get('/bookings', getAllBookings)
router.put('/bookings/:id/assign', assignElectrician)

// Analytics
router.get('/analytics/overview', getAnalyticsOverview)
router.get('/analytics/revenue', getRevenueAnalytics)
router.get('/analytics/bookings', getBookingAnalytics)

// Pages / CMS
router.get('/pages', getAllPages)
router.get('/pages/:id', getPageById)
router.post('/pages', createPage)
router.put('/pages/:id', updatePage)
router.delete('/pages/:id', deletePage)

// Location / Service Area Management
router.get('/locations', getAllLocations)
router.post('/locations', createLocation)
router.put('/locations/:id', updateLocation)
router.patch('/locations/:id/toggle', toggleLocation)
router.delete('/locations/:id', deleteLocation)
router.patch('/locations/bulk-toggle', bulkToggle)

// Skill Requests (custom specializations from electricians)
import {
  getAllSkillRequests, reviewSkillRequest, getPendingSkillCount,
} from '../controllers/skillRequest.controller.js'

router.get('/skill-requests', getAllSkillRequests)
router.get('/skill-requests/count', getPendingSkillCount)
router.patch('/skill-requests/:id', reviewSkillRequest)

export default router
