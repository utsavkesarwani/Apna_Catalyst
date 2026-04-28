import { Router } from 'express'
import { createSkillRequests } from '../controllers/skillRequest.controller.js'

const router = Router()

// Public — called after electrician registration
router.post('/', createSkillRequests)

export default router
