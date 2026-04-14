import { Router } from 'express'
import { superadminLogin } from '../controllers/superadmin.controller.js'

const router = Router()

// POST /api/superadmin/login — dedicated superadmin login endpoint
router.post('/login', superadminLogin)

export default router
