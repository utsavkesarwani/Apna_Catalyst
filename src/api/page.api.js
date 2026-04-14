import api from './client.js'

// ─── Public ─────────────────────────────────────

/** Get a published page by slug */
export const getPageBySlug = (slug) =>
  api.get(`/pages/${slug}`)

/** List all published blog posts */
export const getBlogPosts = (params = {}) =>
  api.get('/pages/blog', { params })

// ─── Admin ───────────────────────────────────────

/** Get all pages including drafts */
export const adminGetAllPages = (params = {}) =>
  api.get('/admin/pages', { params })

/** Get single page by ID */
export const adminGetPage = (id) =>
  api.get(`/admin/pages/${id}`)

/** Create a page */
export const adminCreatePage = (data) =>
  api.post('/admin/pages', data)

/** Update a page */
export const adminUpdatePage = (id, data) =>
  api.put(`/admin/pages/${id}`, data)

/** Delete a page */
export const adminDeletePage = (id) =>
  api.delete(`/admin/pages/${id}`)
