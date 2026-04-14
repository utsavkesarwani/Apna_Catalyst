import { Router } from 'express'
import { getPublicConfig, getConfigByGroup, updateConfig, bulkUpdateConfig } from '../controllers/config.controller.js'
import { protect } from '../middleware/auth.js'
import { isSuperAdmin } from '../middleware/role.js'

const router = Router()

// Public
router.get('/', getPublicConfig)
router.get('/group/:group', getConfigByGroup)

// Superadmin only
router.put('/:key', protect, isSuperAdmin, updateConfig)
router.post('/bulk', protect, isSuperAdmin, bulkUpdateConfig)

export default router
