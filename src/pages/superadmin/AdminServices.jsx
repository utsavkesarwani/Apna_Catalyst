import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Plus, Edit3, Trash2, Save, X, Loader2,
  GripVertical, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react'
import { getAllServicesAdmin, createService, updateService, deleteService, toggleServiceStatus } from '../../api/admin.api.js'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const defaultService = {
  name: '', slug: '', icon: '⚡', description: '', basePrice: 0, order: 0
}

const iconOptions = ['⚡', '🔧', '💡', '🔌', '🏠', '❄️', '📹', '🔋', '🛠️', '🔩', '📡', '🌀']

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'create' | { editing service }
  const [form, setForm] = useState({ ...defaultService })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    setLoading(true)
    try {
      const res = await getAllServicesAdmin()
      setServices(res.services || [])
    } catch {
      setServices([
        { _id: '1', name: 'Fan Installation', slug: 'fan-installation', icon: '🌀', description: 'Install ceiling, table or exhaust fans', basePrice: 300, isActive: true, order: 1 },
        { _id: '2', name: 'Switchboard Repair', slug: 'switchboard-repair', icon: '🔌', description: 'Fix or replace switchboards and sockets', basePrice: 200, isActive: true, order: 2 },
        { _id: '3', name: 'MCB/Fuse Box', slug: 'mcb-fuse', icon: '⚡', description: 'MCB trip issues, fuse replacement', basePrice: 400, isActive: true, order: 3 },
        { _id: '4', name: 'Wiring', slug: 'wiring', icon: '🔧', description: 'New wiring, re-wiring and concealed wiring', basePrice: 500, isActive: true, order: 4 },
        { _id: '5', name: 'AC Wiring', slug: 'ac-wiring', icon: '❄️', description: 'AC installation wiring and power points', basePrice: 800, isActive: true, order: 5 },
        { _id: '6', name: 'CCTV Installation', slug: 'cctv', icon: '📹', description: 'CCTV camera setup and wiring', basePrice: 1500, isActive: true, order: 6 },
        { _id: '7', name: 'Inverter Setup', slug: 'inverter', icon: '🔋', description: 'Inverter and battery installation', basePrice: 600, isActive: true, order: 7 },
        { _id: '8', name: 'Full Home Wiring', slug: 'full-home-wiring', icon: '🏠', description: 'Complete home electrical wiring solution', basePrice: 5000, isActive: true, order: 8 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm({ ...defaultService, order: services.length + 1 })
    setModal('create')
  }

  const openEdit = (service) => {
    setForm({ ...service })
    setModal('edit')
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const data = { ...form, slug }

      if (modal === 'create') {
        const res = await createService(data)
        setServices(prev => [...prev, res.service || { ...data, _id: Date.now().toString(), isActive: true }])
      } else {
        await updateService(form._id, data)
        setServices(prev => prev.map(s => s._id === form._id ? { ...s, ...data } : s))
      }
    } catch {
      // Apply locally
      if (modal === 'create') {
        const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-')
        setServices(prev => [...prev, { ...form, slug, _id: Date.now().toString(), isActive: true }])
      } else {
        setServices(prev => prev.map(s => s._id === form._id ? { ...s, ...form } : s))
      }
    } finally {
      setSaving(false)
      setModal(null)
    }
  }

  const handleDelete = async (id) => {
    setDeleteLoading(true)
    try {
      await deleteService(id)
    } catch {
      // Remove locally anyway
    }
    setServices(prev => prev.filter(s => s._id !== id))
    setDeleteConfirm(null)
    setDeleteLoading(false)
  }

  const toggleActive = async (service) => {
    // Optimistic update
    setServices(prev =>
      prev.map(s => s._id === service._id ? { ...s, isActive: !s.isActive } : s)
    )
    try {
      await toggleServiceStatus(service._id)
    } catch {
      // Revert on failure
      setServices(prev =>
        prev.map(s => s._id === service._id ? { ...s, isActive: service.isActive } : s)
      )
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Service Management</h1>
          <p className="text-sm text-surface-500 mt-1">{services.length} services configured</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97]"
        >
          <Plus size={18} /> Add Service
        </button>
      </motion.div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-purple-400" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-surface-500 glass-card">
          <Settings size={48} className="mx-auto mb-3 opacity-30" />
          <p>No services configured yet</p>
        </div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.sort((a, b) => a.order - b.order).map((service) => (
            <motion.div
              key={service._id}
              variants={item}
              className={`glass-card p-5 transition-all duration-300 group ${
                service.isActive === false ? 'opacity-50' : 'hover:border-purple-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{service.icon || '⚡'}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{service.name}</h3>
                    <span className="text-xs text-surface-500">/{service.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Toggle switch — always visible */}
                  <button
                    onClick={() => toggleActive(service)}
                    className="relative w-10 h-5 rounded-full transition-colors shrink-0 mr-1"
                    style={{ background: service.isActive !== false ? '#10b981' : '#374151' }}
                    title={service.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200"
                      style={{ left: service.isActive !== false ? '22px' : '2px' }}
                    />
                  </button>
                  <button
                    onClick={() => openEdit(service)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(service._id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-surface-400 mb-3 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-bold text-white">₹{(service.basePrice || 0).toLocaleString()}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  service.isActive !== false
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-surface-700/50 text-surface-500 border border-surface-600/50'
                }`}>
                  {service.isActive !== false ? 'Active' : 'Disabled'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setModal(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-card p-6 pointer-events-auto"
              >
              <div className="flex items-center justify-between mb-5 sticky top-0 bg-surface-900/80 backdrop-blur-sm z-10 -mt-2 pt-2 pb-2">
                <h3 className="text-lg font-display font-semibold text-white">
                  {modal === 'create' ? 'Add Service' : 'Edit Service'}
                </h3>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-surface-400 mb-1.5">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setForm(f => ({ ...f, icon }))}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                          form.icon === icon
                            ? 'border-purple-500/50 bg-purple-500/10 scale-110'
                            : 'border-surface-700/50 hover:border-surface-600'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Fan Installation"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-400 mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                    onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="fan-installation"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-400 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-400 mb-1.5">Base Price (₹)</label>
                    <input
                      type="number"
                      value={form.basePrice}
                      onChange={(e) => setForm(f => ({ ...f, basePrice: parseInt(e.target.value) || 0 }))}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-400 mb-1.5">Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {modal === 'create' ? 'Create' : 'Update'}
                </button>
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm glass-card p-6 pointer-events-auto"
              >
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white">Delete Service?</h3>
                <p className="text-sm text-surface-500 mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all"
                >
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
