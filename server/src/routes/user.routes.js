import { Router } from 'express'
import { getProfile, updateProfile, getUserBookings, updatePassword, addAddress, updateAddress, deleteAddress } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = Router()

// All user routes are protected
router.use(protect)
router.use(authorize('user', 'admin', 'superadmin'))

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/bookings', getUserBookings)
router.put('/password', updatePassword)

router.post('/addresses', addAddress)
router.put('/addresses/:id', updateAddress)
router.delete('/addresses/:id', deleteAddress)

export default router
