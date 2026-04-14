import { Router } from 'express'
import {
  getServices, getServiceBySlug,
  createService, updateService, deleteService, reorderServices,
} from '../controllers/service.controller.js'
import { protect } from '../middleware/auth.js'
import { isAdmin } from '../middleware/role.js'

const router = Router()

// Public
router.get('/', getServices)
router.get('/:slug', getServiceBySlug)

// Admin only
router.post('/', protect, isAdmin, createService)
router.put('/reorder', protect, isAdmin, reorderServices)
router.put('/:id', protect, isAdmin, updateService)
router.delete('/:id', protect, isAdmin, deleteService)

export default router
