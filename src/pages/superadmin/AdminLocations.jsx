import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Plus, Search, ToggleLeft, ToggleRight,
  Trash2, Edit2, X, Check, Loader2, ChevronDown,
  Map, Building2, Globe, Filter, AlertCircle
} from 'lucide-react'
import {
  getAllLocations, createLocationAdmin, updateLocationAdmin,
  toggleLocationAdmin, deleteLocationAdmin, bulkToggleLocations,
} from '../../api/admin.api'

// ─── Indian States List ────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Jammu & Kashmir', 'Ladakh',
]

export default function AdminLocations() {
  const [locations, setLocations] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  // ─── Fetch Locations ───
  const fetchLocations = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterState) params.state = filterState
      if (filterCity) params.city = filterCity
      if (filterActive) params.active = filterActive
      const res = await getAllLocations(params)
      setLocations(res.locations || [])
      setStats(res.stats || {})
    } catch (err) {
      setError(err.message || 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [filterState, filterCity, filterActive])

  // ─── Derived data ───
  const distinctStates = useMemo(() => {
    const s = new Set(locations.map(l => l.state))
    return [...s].sort()
  }, [locations])

  const distinctCities = useMemo(() => {
    const filtered = filterState
      ? locations.filter(l => l.state === filterState)
      : locations
    const c = new Set(filtered.map(l => l.city))
    return [...c].sort()
  }, [locations, filterState])

  // Group by state → city for display
  const grouped = useMemo(() => {
    const filtered = locations.filter(l => {
      if (search) {
        const q = search.toLowerCase()
        return (
          l.localityName.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          (l.pincode && l.pincode.includes(q))
        )
      }
      return true
    })

    const groups = {}
    filtered.forEach(loc => {
      const key = `${loc.state} → ${loc.city}`
      if (!groups[key]) groups[key] = { state: loc.state, city: loc.city, localities: [] }
      groups[key].localities.push(loc)
    })
    return Object.values(groups).sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city))
  }, [locations, search])

  // ─── Toggle ───
  const handleToggle = async (id) => {
    setActionLoading(id)
    try {
      await toggleLocationAdmin(id)
      setLocations(prev =>
        prev.map(l => l._id === id ? { ...l, isActive: !l.isActive } : l)
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Delete ───
  const handleDelete = async (id) => {
    if (!confirm('Delete this locality?')) return
    setActionLoading(id)
    try {
      await deleteLocationAdmin(id)
      setLocations(prev => prev.filter(l => l._id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Bulk toggle ───
  const handleBulkToggle = async (state, city, isActive) => {
    try {
      await bulkToggleLocations({ state, city, isActive })
      fetchLocations()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Map size={24} className="text-primary-400" />
            Service Area Management
          </h2>
          <p className="text-sm text-surface-400 mt-1">
            Manage cities and localities where Apna Electro operates
          </p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowAddModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-all shadow-glow-sm"
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Areas', value: stats.total || 0, icon: MapPin, color: 'text-primary-400' },
          { label: 'Active', value: stats.totalActive || 0, icon: ToggleRight, color: 'text-emerald-400' },
          { label: 'Inactive', value: stats.totalInactive || 0, icon: ToggleLeft, color: 'text-amber-400' },
          { label: 'States', value: stats.states || 0, icon: Globe, color: 'text-blue-400' },
          { label: 'Cities', value: stats.cities || 0, icon: Building2, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-surface-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchLocations()}
            placeholder="Search localities, cities, pincodes…"
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={filterState}
            onChange={e => { setFilterState(e.target.value); setFilterCity('') }}
            className="input-field appearance-none pr-8 py-2 text-sm min-w-[140px] cursor-pointer"
          >
            <option value="">All States</option>
            {distinctStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500" />
        </div>
        <div className="relative">
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="input-field appearance-none pr-8 py-2 text-sm min-w-[140px] cursor-pointer"
            disabled={!filterState}
          >
            <option value="">All Cities</option>
            {distinctCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500" />
        </div>
        <div className="relative">
          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value)}
            className="input-field appearance-none pr-8 py-2 text-sm min-w-[120px] cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500" />
        </div>
        <button
          onClick={fetchLocations}
          className="px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-sm text-white transition-colors"
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400"><X size={14} /></button>
        </div>
      )}

      {/* Locations grouped by State → City */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={32} className="text-primary-400 animate-spin mx-auto mb-3" />
          <p className="text-surface-400 text-sm">Loading service areas…</p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <MapPin size={48} className="text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Locations Found</h3>
          <p className="text-surface-400 text-sm mb-6">
            {search || filterState ? 'Try adjusting your filters' : 'Start by adding your first service area'}
          </p>
          <button
            onClick={() => { setEditItem(null); setShowAddModal(true) }}
            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-all"
          >
            <Plus size={16} className="inline mr-1" /> Add First Location
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <motion.div
              key={`${group.state}-${group.city}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              {/* City Header */}
              <div className="px-5 py-3 bg-surface-800/50 border-b border-surface-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-primary-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{group.city}</h3>
                    <p className="text-xs text-surface-500">{group.state} · {group.localities.length} localities</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkToggle(group.state, group.city, true)}
                    className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="Activate all"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => handleBulkToggle(group.state, group.city, false)}
                    className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                    title="Deactivate all"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              {/* Localities Table */}
              <div className="divide-y divide-surface-800/50">
                {group.localities.map(loc => (
                  <div
                    key={loc._id}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-surface-800/20 transition-colors"
                  >
                    <MapPin size={14} className={loc.isActive ? 'text-emerald-400' : 'text-surface-600'} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${loc.isActive ? 'text-white' : 'text-surface-500'}`}>
                        {loc.localityName}
                      </p>
                      {loc.pincode && (
                        <p className="text-xs text-surface-600 font-mono">{loc.pincode}</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      loc.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {loc.isActive ? 'Active' : 'Future'}
                    </span>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(loc._id)}
                      disabled={actionLoading === loc._id}
                      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                      style={{ background: loc.isActive ? '#10b981' : '#374151' }}
                      title={loc.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <motion.div
                        layout
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                        style={{ left: loc.isActive ? '22px' : '2px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>

                    {/* Actions */}
                    <button
                      onClick={() => { setEditItem(loc); setShowAddModal(true) }}
                      className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc._id)}
                      disabled={actionLoading === loc._id}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddLocationModal
            editItem={editItem}
            states={INDIAN_STATES}
            onClose={() => { setShowAddModal(false); setEditItem(null) }}
            onSuccess={() => { setShowAddModal(false); setEditItem(null); fetchLocations() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════
// Add / Edit Location Modal
// ═══════════════════════════════════════════
function AddLocationModal({ editItem, states, onClose, onSuccess }) {
  const [form, setForm] = useState({
    state: editItem?.state || '',
    city: editItem?.city || '',
    localityName: editItem?.localityName || '',
    pincode: editItem?.pincode || '',
    isActive: editItem?.isActive ?? true,
  })
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (editItem) {
        await updateLocationAdmin(editItem._id, form)
        setSuccess('Location updated!')
      } else if (bulkMode) {
        // Parse bulk text: one locality per line, optionally "locality | pincode"
        const lines = bulkText.split('\n').filter(l => l.trim())
        const bulk = lines.map(line => {
          const parts = line.split('|').map(p => p.trim())
          return {
            state: form.state,
            city: form.city,
            localityName: parts[0],
            pincode: parts[1] || '',
            isActive: form.isActive,
          }
        })
        await createLocationAdmin({ state: form.state, city: form.city, bulk })
        setSuccess(`${bulk.length} localities added!`)
      } else {
        await createLocationAdmin(form)
        setSuccess('Location added!')
      }
      setTimeout(onSuccess, 800)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <MapPin size={20} className="text-primary-400" />
            {editItem ? 'Edit Location' : 'Add Service Area'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
            <Check size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">State</label>
            <div className="relative">
              <select
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
                required
                className="input-field appearance-none pr-10 cursor-pointer"
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500" />
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">City</label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              required
              placeholder="e.g. Lucknow, Kanpur, Varanasi"
              className="input-field"
            />
          </div>

          {/* Single vs Bulk mode */}
          {!editItem && (
            <div className="flex rounded-xl bg-surface-800/50 p-1">
              <button
                type="button"
                onClick={() => setBulkMode(false)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  !bulkMode ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-surface-400'
                }`}
              >
                Single Locality
              </button>
              <button
                type="button"
                onClick={() => setBulkMode(true)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  bulkMode ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-surface-400'
                }`}
              >
                Bulk Add
              </button>
            </div>
          )}

          {bulkMode && !editItem ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Localities (one per line, optional: locality | pincode)
              </label>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={`Hazratganj | 226001\nGomti Nagar | 226010\nAliganj\nIndira Nagar | 226016`}
                rows={6}
                className="input-field resize-none font-mono text-sm"
                required
              />
              <p className="text-xs text-surface-600">
                {bulkText.split('\n').filter(l => l.trim()).length} localities to add
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Locality Name</label>
                <input
                  type="text"
                  value={form.localityName}
                  onChange={e => setForm({ ...form, localityName: e.target.value })}
                  required
                  placeholder="e.g. Gomti Nagar, Hazratganj"
                  className="input-field"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="226001"
                  maxLength={6}
                  className="input-field font-mono"
                />
              </div>
            </>
          )}

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30">
            <div>
              <p className="text-sm font-medium text-white">Show on Frontend</p>
              <p className="text-xs text-surface-500">
                {form.isActive ? 'Visible in user dropdowns' : 'Hidden — future service area'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0"
              style={{ background: form.isActive ? '#10b981' : '#374151' }}
            >
              <motion.div
                layout
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                style={{ left: form.isActive ? '22px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? 'Saving…' : editItem ? 'Update Location' : bulkMode ? 'Add All Localities' : 'Add Location'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
