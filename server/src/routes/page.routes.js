import { Router } from 'express'
import { getPageBySlug, getBlogPosts } from '../controllers/page.controller.js'

const router = Router()

// Public — list published blog posts
router.get('/blog', getBlogPosts)

// Public — get any published page by slug
// Must be AFTER /blog to avoid slug conflict
router.get('/:slug', getPageBySlug)

export default router
