import { Router } from 'express'
import {
  getSubcategoriesByService,
  getAllSubcategoriesAdmin,
  createSubcategory,
  updateSubcategory,
  toggleSubcategory,
  deleteSubcategory,
} from '../controllers/subcategory.controller.js'
import { protect } from '../middleware/auth.js'
import { isAdmin } from '../middleware/role.js'

const router = Router()

// ─── Nested under /api/services/:serviceId/subcategories ───
// Public: get active subcategories for a service
router.get('/services/:serviceId/subcategories', getSubcategoriesByService)

// Admin: get ALL subcategories (including inactive) for a service
router.get('/services/:serviceId/subcategories/all', protect, isAdmin, getAllSubcategoriesAdmin)

// Admin: create subcategory under a parent service
router.post('/services/:serviceId/subcategories', protect, isAdmin, createSubcategory)

// ─── Direct subcategory operations at /api/subcategories/:id ───
// Admin: update a subcategory
router.put('/subcategories/:id', protect, isAdmin, updateSubcategory)

// Admin: toggle active/inactive
router.patch('/subcategories/:id/toggle', protect, isAdmin, toggleSubcategory)

// Admin: delete a subcategory
router.delete('/subcategories/:id', protect, isAdmin, deleteSubcategory)

export default router
