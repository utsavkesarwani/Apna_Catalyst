import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Plus, Save, Loader2, Trash2, Edit3, Clock,
  AlertCircle, ChevronDown, ChevronUp, IndianRupee
} from 'lucide-react'
import {
  getSubcategoriesAdmin,
  createSubcategory,
  updateSubcategory as updateSubcategoryAPI,
  toggleSubcategoryStatus,
  deleteSubcategory as deleteSubcategoryAPI,
} from '../../api/admin.api.js'

const defaultSubcategory = { name: '', duration: '', price: 0 }

export default function SubcategoryModal({ service, onClose }) {
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...defaultSubcategory })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadSubcategories()
  }, [service._id])

  const loadSubcategories = async () => {
    setLoading(true)
    try {
      const res = await getSubcategoriesAdmin(service._id)
      setSubcategories(res.subcategories || [])
    } catch {
      setSubcategories([])
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm({ ...defaultSubcategory })
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (sub) => {
    setForm({ name: sub.name, duration: sub.duration, price: sub.price })
    setEditingId(sub._id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        const res = await updateSubcategoryAPI(editingId, form)
        setSubcategories(prev =>
          prev.map(s => s._id === editingId ? (res.subcategory || { ...s, ...form }) : s)
        )
      } else {
        const res = await createSubcategory(service._id, form)
        setSubcategories(prev => [...prev, res.subcategory || { ...form, _id: Date.now().toString(), isActive: true }])
      }
    } catch {
      if (editingId) {
        setSubcategories(prev =>
          prev.map(s => s._id === editingId ? { ...s, ...form } : s)
        )
      } else {
        setSubcategories(prev => [...prev, { ...form, _id: Date.now().toString(), isActive: true }])
      }
    } finally {
      setSaving(false)
      setShowForm(false)
      setEditingId(null)
      setForm({ ...defaultSubcategory })
    }
  }

  const handleToggle = async (sub) => {
    setSubcategories(prev =>
      prev.map(s => s._id === sub._id ? { ...s, isActive: !s.isActive } : s)
    )
    try {
      await toggleSubcategoryStatus(sub._id)
    } catch {
      setSubcategories(prev =>
        prev.map(s => s._id === sub._id ? { ...s, isActive: sub.isActive } : s)
      )
    }
  }

  const handleDelete = async (id) => {
    setDeleteLoading(true)
    try {
      await deleteSubcategoryAPI(id)
    } catch {
      // Remove locally anyway
    }
    setSubcategories(prev => prev.filter(s => s._id !== id))
    setDeleteConfirm(null)
    setDeleteLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg max-h-[85vh] flex flex-col glass-card pointer-events-auto overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-800/50 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{service.icon || '⚡'}</span>
              <div>
                <h3 className="text-lg font-display font-semibold text-white">Subcategories</h3>
                <p className="text-xs text-surface-500">{service.name} • {subcategories.length} items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg active:scale-[0.97]"
              >
                <Plus size={14} /> Add
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Inline Create/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-surface-800/50"
              >
                <div className="p-4 bg-surface-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                      {editingId ? 'Edit Subcategory' : 'New Subcategory'}
                    </p>
                    <button
                      onClick={() => { setShowForm(false); setEditingId(null) }}
                      className="p-1 rounded text-surface-500 hover:text-white transition"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Jet Based AC Service"
                    className="input-field text-sm"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-surface-500 mb-1 uppercase tracking-wider">Duration</label>
                      <input
                        type="text"
                        value={form.duration}
                        onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                        placeholder="e.g. 50min"
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-surface-500 mb-1 uppercase tracking-wider">Price (₹)</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                        className="input-field text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSave}
                      disabled={saving || !form.name.trim()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setEditingId(null) }}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subcategory List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-purple-400" />
              </div>
            ) : subcategories.length === 0 ? (
              <div className="text-center py-12 text-surface-500">
                <ChevronDown size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No subcategories yet</p>
                <p className="text-xs mt-1 text-surface-600">Click "Add" to create one</p>
              </div>
            ) : (
              subcategories.map((sub) => (
                <motion.div
                  key={sub._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    sub.isActive === false
                      ? 'border-surface-800/30 bg-surface-900/30 opacity-50'
                      : 'border-surface-800/50 bg-surface-900/50 hover:border-purple-500/20'
                  }`}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{sub.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      {sub.duration && (
                        <span className="flex items-center gap-1 text-[11px] text-surface-400">
                          <Clock size={10} /> {sub.duration}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400">
                        <IndianRupee size={10} />{sub.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(sub)}
                      className="relative w-9 h-[18px] rounded-full transition-colors shrink-0"
                      style={{ background: sub.isActive !== false ? '#10b981' : '#374151' }}
                      title={sub.isActive !== false ? 'Deactivate' : 'Activate'}
                    >
                      <div
                        className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-md transition-all duration-200"
                        style={{ left: sub.isActive !== false ? '19px' : '2px' }}
                      />
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(sub)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                    >
                      <Edit3 size={13} />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirm(sub._id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xs glass-card p-5 pointer-events-auto"
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                    <AlertCircle size={24} className="text-red-400" />
                  </div>
                  <h4 className="text-sm font-display font-semibold text-white">Delete Subcategory?</h4>
                  <p className="text-xs text-surface-500 mt-1">This action cannot be undone.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleteLoading}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
