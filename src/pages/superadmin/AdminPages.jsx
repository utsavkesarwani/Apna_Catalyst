import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Plus, Edit3, Trash2, Save, X, Loader2,
  Globe, BookOpen, Eye, EyeOff, Calendar, Hash,
  CheckCircle2, AlertCircle, ExternalLink, Tag
} from 'lucide-react'
import {
  adminGetAllPages, adminCreatePage, adminUpdatePage, adminDeletePage,
} from '../../api/page.api.js'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const DEFAULT_STATIC_SLUGS = [
  { slug: 'about', label: 'About Us' },
  { slug: 'how-it-works', label: 'How It Works' },
  { slug: 'careers', label: 'Careers' },
  { slug: 'contact', label: 'Contact' },
  { slug: 'help', label: 'Help Center' },
  { slug: 'safety', label: 'Safety' },
  { slug: 'terms', label: 'Terms of Service' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'refunds', label: 'Refund Policy' },
]

const defaultPage = {
  slug: '', title: '', content: '', excerpt: '',
  type: 'static', coverImage: '', tags: '',
  author: 'Apna Catalyst Team', isPublished: false,
  seo: { metaTitle: '', metaDescription: '' },
}

export default function AdminPages() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [modal, setModal] = useState(null) // null | 'create' | page object
  const [form, setForm] = useState({ ...defaultPage })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadPages = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (typeFilter !== 'all') params.type = typeFilter
      const res = await adminGetAllPages(params)
      setPages(res.pages || [])
    } catch {
      // Fallback mock
      setPages([
        { _id: '1', slug: 'about', title: 'About Us', type: 'static', isPublished: true, views: 342, updatedAt: new Date().toISOString() },
        { _id: '2', slug: 'terms', title: 'Terms of Service', type: 'static', isPublished: true, views: 128, updatedAt: new Date().toISOString() },
        { _id: '3', slug: 'privacy', title: 'Privacy Policy', type: 'static', isPublished: false, views: 0, updatedAt: new Date().toISOString() },
        { _id: '4', slug: 'kitchen-electrical-hazards', title: '5 Hidden Electrical Hazards in Modern Kitchens', type: 'blog', isPublished: true, views: 1240, publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date().toISOString() },
        { _id: '5', slug: 'smart-lighting-worth-upgrade', title: 'Smart Lighting: Is it Worth the Upgrade in 2025?', type: 'blog', isPublished: false, views: 0, updatedAt: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => { loadPages() }, [loadPages])

  const openCreate = (type = 'static') => {
    setForm({ ...defaultPage, type })
    setModal('create')
    setSaved(false)
  }

  const openEdit = async (page) => {
    setForm({
      ...defaultPage,
      ...page,
      tags: Array.isArray(page.tags) ? page.tags.join(', ') : (page.tags || ''),
      seo: page.seo || { metaTitle: '', metaDescription: '' },
    })
    setModal(page)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      const data = {
        ...form,
        slug: form.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }

      if (modal === 'create') {
        const res = await adminCreatePage(data)
        setPages(prev => [res.page || { ...data, _id: Date.now().toString(), views: 0, updatedAt: new Date().toISOString() }, ...prev])
      } else {
        await adminUpdatePage(modal._id, data)
        setPages(prev => prev.map(p => p._id === modal._id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
      }
      setSaved(true)
      setTimeout(() => { setSaved(false); setModal(null) }, 1000)
    } catch (error) {
      console.error('Failed to save page:', error)
      alert(error?.message || 'Failed to save page to database.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleteLoading(true)
    try { await adminDeletePage(id) } catch {}
    setPages(prev => prev.filter(p => p._id !== id))
    setDeleteConfirm(null)
    setDeleteLoading(false)
  }

  const togglePublish = async (page) => {
    try { await adminUpdatePage(page._id, { isPublished: !page.isPublished }) } catch {}
    setPages(prev => prev.map(p => p._id === page._id ? { ...p, isPublished: !p.isPublished } : p))
  }

  const staticPages = pages.filter(p => p.type === 'static')
  const blogPages = pages.filter(p => p.type === 'blog')

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Pages & Blog</h1>
          <p className="text-sm text-surface-500 mt-1">{pages.length} pages total · {blogPages.filter(p => p.isPublished).length} published posts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openCreate('static')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:text-white hover:bg-surface-800 transition-all">
            <Globe size={15} /> New Page
          </button>
          <button onClick={() => openCreate('blog')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg active:scale-[0.97] text-sm">
            <Plus size={15} /> New Blog Post
          </button>
        </div>
      </motion.div>

      {/* Type Filter */}
      <motion.div variants={item} className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'static', label: 'Static Pages', icon: Globe },
          { key: 'blog', label: 'Blog Posts', icon: BookOpen },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTypeFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              typeFilter === key
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-surface-400 border border-surface-700/50 hover:text-white hover:border-surface-600'
            }`}>
            {Icon && <Icon size={13} />}{label}
          </button>
        ))}
      </motion.div>

      {/* Quick-create footer pages hint */}
      {(typeFilter === 'all' || typeFilter === 'static') && staticPages.length === 0 && !loading && (
        <motion.div variants={item} className="glass-card p-5 border-dashed border-amber-500/20 bg-amber-500/5">
          <p className="text-sm text-amber-400 font-medium mb-3">⚡ Footer pages not created yet. Quick-create them:</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_STATIC_SLUGS.map(({ slug, label }) => (
              <button key={slug}
                onClick={() => { setForm({ ...defaultPage, slug, title: label, type: 'static', isPublished: true }); setModal('create') }}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-800/60 text-surface-300 border border-surface-700/50 hover:border-amber-500/30 hover:text-amber-400 transition-all">
                + {label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pages list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-purple-400" /></div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 glass-card text-surface-500">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No pages yet. Create your first one above.</p>
        </div>
      ) : (
        <motion.div variants={item} className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800/50 bg-surface-800/20">
                <th className="text-left text-surface-500 font-medium p-4">Title</th>
                <th className="text-left text-surface-500 font-medium p-4">Type</th>
                <th className="text-left text-surface-500 font-medium p-4">Slug</th>
                <th className="text-left text-surface-500 font-medium p-4">Views</th>
                <th className="text-left text-surface-500 font-medium p-4">Status</th>
                <th className="text-right text-surface-500 font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page._id} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium">{page.title}</p>
                    {page.publishedAt && <p className="text-xs text-surface-500 mt-0.5">{new Date(page.publishedAt).toLocaleDateString('en-IN')}</p>}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      page.type === 'blog'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {page.type === 'blog' ? <BookOpen size={9} /> : <Globe size={9} />}
                      {page.type === 'blog' ? 'Blog' : 'Static'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-surface-400 font-mono text-xs">/page/{page.slug}</span>
                      <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer"
                        className="text-surface-600 hover:text-primary-400 transition-colors">
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </td>
                  <td className="p-4 text-surface-400">{(page.views || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <button onClick={() => togglePublish(page)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer ${
                        page.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                          : 'bg-surface-800/50 text-surface-500 border-surface-700/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                      }`}>
                      {page.isPublished ? <><Eye size={9} /> Published</> : <><EyeOff size={9} /> Draft</>}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(page)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(page._id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setModal(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl glass-card pointer-events-auto flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-surface-800/50">
                  <div className="flex items-center gap-3">
                    {form.type === 'blog' ? <BookOpen size={18} className="text-purple-400" /> : <Globe size={18} className="text-cyan-400" />}
                    <h3 className="text-lg font-display font-semibold text-white">
                      {modal === 'create' ? `New ${form.type === 'blog' ? 'Blog Post' : 'Page'}` : 'Edit Page'}
                    </h3>
                  </div>
                  <button onClick={() => setModal(null)} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all">
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Type toggle */}
                  <div className="flex gap-2">
                    {['static', 'blog'].map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          form.type === t
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'text-surface-400 border border-surface-700/50 hover:text-white'
                        }`}>
                        {t === 'blog' ? '📝 Blog Post' : '📄 Static Page'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-surface-400 mb-1.5">Title *</label>
                      <input type="text" value={form.title}
                        onChange={e => setForm(f => ({
                          ...f, title: e.target.value,
                          slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        }))}
                        placeholder="Page / Post title"
                        className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-400 mb-1.5">Slug *</label>
                      <input type="text" value={form.slug}
                        onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                        placeholder="url-friendly-slug"
                        className="input-field text-sm font-mono" />
                    </div>
                  </div>

                  {form.type === 'blog' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-surface-400 mb-1.5">Excerpt / Summary</label>
                        <textarea value={form.excerpt}
                          onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                          rows={2} placeholder="Short description shown on blog listing..."
                          className="input-field resize-none text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-surface-400 mb-1.5">Cover Image URL</label>
                          <input type="url" value={form.coverImage}
                            onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                            placeholder="https://..."
                            className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-400 mb-1.5">
                            <Tag size={11} className="inline mr-1" />Tags (comma separated)
                          </label>
                          <input type="text" value={form.tags}
                            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                            placeholder="Safety, Smart Home, Tips"
                            className="input-field text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-400 mb-1.5">Author</label>
                        <input type="text" value={form.author}
                          onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                          className="input-field text-sm" />
                      </div>
                    </>
                  )}

                  {/* Content Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-surface-400">Content (HTML supported)</label>
                      <span className="text-[10px] text-surface-600">{form.content.length} chars</span>
                    </div>
                    <textarea
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={10}
                      placeholder={`<h2>Section Title</h2>\n<p>Your content here...</p>\n<ul><li>Point 1</li><li>Point 2</li></ul>`}
                      className="input-field resize-y text-sm font-mono text-xs leading-relaxed"
                    />
                    <p className="text-[10px] text-surface-600 mt-1">Supports HTML tags: h2, h3, p, ul, ol, li, strong, a, blockquote, code</p>
                  </div>

                  {/* SEO */}
                  <div className="border-t border-surface-800/50 pt-4">
                    <p className="text-xs font-medium text-surface-400 mb-3">SEO (optional)</p>
                    <div className="space-y-3">
                      <input type="text" value={form.seo?.metaTitle || ''}
                        onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))}
                        placeholder="Meta Title" className="input-field text-sm" />
                      <textarea value={form.seo?.metaDescription || ''}
                        onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))}
                        rows={2} placeholder="Meta Description"
                        className="input-field resize-none text-sm" />
                    </div>
                  </div>

                  {/* Publish toggle */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/20 border border-surface-700/30">
                    <button
                      onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.isPublished ? 'bg-emerald-500' : 'bg-surface-700'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${form.isPublished ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                    <span className={`text-sm font-medium ${form.isPublished ? 'text-emerald-400' : 'text-surface-400'}`}>
                      {form.isPublished ? 'Published — Visible to users' : 'Draft — Hidden from users'}
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 p-6 pt-0 border-t border-surface-800/50">
                  <button onClick={handleSave}
                    disabled={saving || !form.title.trim() || !form.slug.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {saving ? 'Saving...' : saved ? 'Saved!' : modal === 'create' ? 'Create' : 'Update'}
                  </button>
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm glass-card p-6 pointer-events-auto">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle size={28} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white">Delete Page?</h3>
                  <p className="text-sm text-surface-500 mt-1">The link will stop working immediately.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
