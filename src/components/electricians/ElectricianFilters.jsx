import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { services } from '../../data/services'

const cities = ['All Cities', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur', 'Lucknow']
const ratings = ['All', '4.5+', '4.0+', '3.5+']
const sortOptions = ['Rating (High to Low)', 'Experience', 'Most Reviews', 'Price (Low to High)']

export default function ElectricianFilters({ filters, setFilters }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const FilterContent = () => (
    <>
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          placeholder="Search electrician name..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="input-field pl-11 text-sm"
        />
      </div>

      {/* City Filter */}
      <div>
        <label className="text-xs font-medium text-surface-400 mb-2 block">
          <MapPin size={12} className="inline mr-1" />
          Location
        </label>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => updateFilter('city', city === 'All Cities' ? '' : city)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-300 ${
                (city === 'All Cities' && !filters.city) || filters.city === city
                  ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                  : 'bg-surface-800/50 text-surface-400 border-surface-700/50 hover:border-surface-600'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Service Filter */}
      <div>
        <label className="text-xs font-medium text-surface-400 mb-2 block">Service Type</label>
        <select
          value={filters.service}
          onChange={(e) => updateFilter('service', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Services</option>
          {services.map(s => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="text-xs font-medium text-surface-400 mb-2 block">Minimum Rating</label>
        <div className="flex gap-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilter('rating', rating === 'All' ? '' : rating)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-300 ${
                (rating === 'All' && !filters.rating) || filters.rating === rating
                  ? 'bg-accent-500/15 text-accent-400 border-accent-500/30'
                  : 'bg-surface-800/50 text-surface-400 border-surface-700/50 hover:border-surface-600'
              }`}
            >
              {rating === 'All' ? 'All' : `⭐ ${rating}`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-medium text-surface-400 mb-2 block">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-field text-sm"
        >
          {sortOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Availability Toggle */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={filters.availableOnly}
            onChange={(e) => updateFilter('availableOnly', e.target.checked)}
          />
          <div className="w-10 h-5 bg-surface-700 rounded-full peer-checked:bg-primary-500 transition-colors duration-300" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-5" />
        </div>
        <span className="text-sm text-surface-400 group-hover:text-surface-300 transition-colors">
          Available now only
        </span>
      </label>
    </>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block glass-card p-6 space-y-5 sticky top-24">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal size={16} />
            Filters
          </h3>
          <button
            onClick={() => setFilters({ search: '', city: '', service: '', rating: '', sort: 'Rating (High to Low)', availableOnly: false })}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Reset
          </button>
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <SlidersHorizontal size={16} />
          Filters & Sort
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-surface-900 border-t border-surface-800/50 rounded-t-3xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-white">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-surface-400">
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn-primary w-full mt-4"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  )
}
