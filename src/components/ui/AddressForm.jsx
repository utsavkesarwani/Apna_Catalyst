import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ChevronDown, Loader2, CheckCircle, Building2, Navigation } from 'lucide-react'
import { getLocationStates, getLocationCities, getLocationLocalities } from '../../api/admin.api'

/**
 * AddressForm — Cascading dropdown address input
 * State → City → Locality (only active localities shown)
 *
 * Props:
 *  - value: { flatNo, landmark, locality, city, state, pincode }
 *  - onChange: (address) => void
 *  - className: additional CSS
 *  - compact: boolean — single column layout
 */
export default function AddressForm({ value = {}, onChange, className = '', compact = false }) {
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [localities, setLocalities] = useState([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingLocalities, setLoadingLocalities] = useState(false)

  const address = {
    flatNo: value.flatNo || '',
    landmark: value.landmark || '',
    locality: value.locality || '',
    city: value.city || '',
    state: value.state || '',
    pincode: value.pincode || '',
  }

  const updateField = useCallback((field, val) => {
    const updated = { ...address, [field]: val }

    // Reset downstream when upstream changes
    if (field === 'state') {
      updated.city = ''
      updated.locality = ''
      updated.pincode = ''
    }
    if (field === 'city') {
      updated.locality = ''
      updated.pincode = ''
    }

    onChange?.(updated)
  }, [address, onChange])

  // ─── Fetch states on mount ───
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true)
      try {
        const res = await getLocationStates()
        setStates(res.states || [])
      } catch {
        setStates([])
      } finally {
        setLoadingStates(false)
      }
    }
    fetchStates()
  }, [])

  // ─── Fetch cities when state changes ───
  useEffect(() => {
    if (!address.state) {
      setCities([])
      return
    }
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const res = await getLocationCities(address.state)
        setCities(res.cities || [])
      } catch {
        setCities([])
      } finally {
        setLoadingCities(false)
      }
    }
    fetchCities()
  }, [address.state])

  // ─── Fetch localities when city changes ───
  useEffect(() => {
    if (!address.state || !address.city) {
      setLocalities([])
      return
    }
    const fetchLocalities = async () => {
      setLoadingLocalities(true)
      try {
        const res = await getLocationLocalities(address.state, address.city)
        setLocalities(res.localities || [])
      } catch {
        setLocalities([])
      } finally {
        setLoadingLocalities(false)
      }
    }
    fetchLocalities()
  }, [address.state, address.city])

  // Auto-fill pincode when locality is selected
  const handleLocalityChange = (localityName) => {
    const match = localities.find(l => l.localityName === localityName)
    const updated = { ...address, locality: localityName }
    if (match?.pincode) {
      updated.pincode = match.pincode
    }
    onChange?.(updated)
  }

  const gridCols = compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Row 1: Flat/House No + Landmark */}
      <div className={`grid ${gridCols} gap-4`}>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
            <Building2 size={12} /> Flat / House No
          </label>
          <input
            type="text"
            value={address.flatNo}
            onChange={e => updateField('flatNo', e.target.value)}
            placeholder="e.g. B-204, 3rd Floor"
            className="input-field"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
            <Navigation size={12} /> Landmark
          </label>
          <input
            type="text"
            value={address.landmark}
            onChange={e => updateField('landmark', e.target.value)}
            placeholder="e.g. Near City Mall"
            className="input-field"
          />
        </div>
      </div>

      {/* Row 2: State + City (Cascading) */}
      <div className={`grid ${gridCols} gap-4`}>
        {/* State Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider ml-1">
            State
          </label>
          <div className="relative">
            <select
              value={address.state}
              onChange={e => updateField('state', e.target.value)}
              className="input-field appearance-none pr-10 cursor-pointer"
            >
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">
              {loadingStates ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {/* City Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider ml-1">
            City
          </label>
          <div className="relative">
            <select
              value={address.city}
              onChange={e => updateField('city', e.target.value)}
              disabled={!address.state || loadingCities}
              className="input-field appearance-none pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{!address.state ? 'Select state first' : 'Select City'}</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">
              {loadingCities ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Locality + Pincode */}
      <div className={`grid ${gridCols} gap-4`}>
        {/* Locality Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
            <MapPin size={12} /> Locality / Area
          </label>
          <div className="relative">
            <select
              value={address.locality}
              onChange={e => handleLocalityChange(e.target.value)}
              disabled={!address.city || loadingLocalities}
              className="input-field appearance-none pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{!address.city ? 'Select city first' : localities.length === 0 ? 'No localities available' : 'Select Locality'}</option>
              {localities.map(loc => (
                <option key={loc._id} value={loc.localityName}>{loc.localityName}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">
              {loadingLocalities ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {/* Pincode */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
            Pincode
            {address.pincode && address.locality && (
              <CheckCircle size={12} className="text-emerald-500" />
            )}
          </label>
          <input
            type="text"
            value={address.pincode}
            onChange={e => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit pincode"
            maxLength={6}
            className="input-field font-mono"
          />
        </div>
      </div>

      {/* Compact preview of selected address */}
      {address.locality && address.city && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-surface-300"
        >
          <span className="text-emerald-400 font-medium">📍 Selected: </span>
          {[address.flatNo, address.landmark, address.locality, address.city, address.state, address.pincode]
            .filter(Boolean)
            .join(', ')}
        </motion.div>
      )}
    </div>
  )
}
