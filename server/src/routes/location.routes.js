import { Router } from 'express'
import {
  getActiveLocations,
  getStates,
  getCitiesByState,
  getLocalitiesByCity,
} from '../controllers/location.controller.js'

const router = Router()

// All public — used by frontend dropdowns
router.get('/active', getActiveLocations)
router.get('/states', getStates)
router.get('/cities', getCitiesByState)
router.get('/localities', getLocalitiesByCity)

export default router
