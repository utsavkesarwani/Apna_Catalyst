import { Router } from 'express'
import {
  createBooking, getBookingById, getMyBookings, getElectricianBookings,
  getLatestBooking, updateBookingStatus, acceptBooking, rejectBooking, cancelBooking,
  getBookedSlots, getBookingAlternatives,
} from '../controllers/booking.controller.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = Router()

// Public route — fetch booked slots (no auth needed)
router.get('/slots/:electricianId', getBookedSlots)

// All other booking routes are protected
router.use(protect)

// User routes
router.post('/', authorize('user', 'admin', 'superadmin'), createBooking)
router.get('/user/me', authorize('user', 'admin', 'superadmin'), getMyBookings)
router.get('/latest', authorize('user', 'admin', 'superadmin'), getLatestBooking)
router.put('/:id/cancel', authorize('user', 'admin', 'superadmin'), cancelBooking)
router.get('/:id/alternatives', authorize('user', 'admin', 'superadmin'), getBookingAlternatives)

// Electrician routes
router.get('/electrician/me', authorize('electrician'), getElectricianBookings)
router.put('/:id/accept', authorize('electrician'), acceptBooking)
router.put('/:id/reject', authorize('electrician'), rejectBooking)
router.put('/:id/status', authorize('electrician'), updateBookingStatus)

// Shared (any authenticated user)
router.get('/:id', getBookingById)

export default router
