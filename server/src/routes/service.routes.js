import { Router } from 'express'
import {
  getServices, getAllServicesAdmin, getServiceBySlug,
  createService, updateService, deleteService, reorderServices,
  toggleService,
} from '../controllers/service.controller.js'
import { protect } from '../middleware/auth.js'
import { isAdmin } from '../middleware/role.js'

const router = Router()

// Public
router.get('/', getServices)

// Admin only — must be before /:slug to avoid route conflict
router.get('/all', protect, isAdmin, getAllServicesAdmin)
router.post('/', protect, isAdmin, createService)
router.put('/reorder', protect, isAdmin, reorderServices)
router.patch('/:id/toggle', protect, isAdmin, toggleService)
router.put('/:id', protect, isAdmin, updateService)
router.delete('/:id', protect, isAdmin, deleteService)

// Public — slug lookup (must be last since :slug catches everything)
router.get('/:slug', getServiceBySlug)

export default router

