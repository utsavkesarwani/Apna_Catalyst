import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Loader2, WifiOff } from 'lucide-react'
import { electricians as mockElectricians } from '../data/electricians'
import { getElectricians as fetchElectricians } from '../api/user.api'
import ElectricianCard from '../components/electricians/ElectricianCard'
import ElectricianFilters from '../components/electricians/ElectricianFilters'

export default function ElectriciansPage() {
  const [searchParams] = useSearchParams()
  const initialService = searchParams.get('service') || ''
  const initialSearch = searchParams.get('search') || ''

  const [filters, setFilters] = useState({
    search: initialSearch,
    city: '',
    service: initialService,
    rating: '',
    sort: 'Rating (High to Low)',
    availableOnly: false,
  })

  const [apiElectricians, setApiElectricians] = useState(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [usingApi, setUsingApi] = useState(false)

  // Try to fetch from API
  useEffect(() => {
    let cancelled = false
    const loadElectricians = async () => {
      setApiLoading(true)
      try {
        const sortMap = {
          'Rating (High to Low)': 'rating',
          'Experience': 'experience',
          'Most Reviews': 'reviews',
          'Price (Low to High)': 'price',
        }

        const params = { limit: 50 }
        if (filters.search) params.search = filters.search
        if (filters.city) params.city = filters.city
        if (filters.service) params.service = filters.service
        if (filters.rating) params.rating = filters.rating
        if (filters.availableOnly) params.available = 'true'
        if (sortMap[filters.sort]) params.sort = sortMap[filters.sort]

        const response = await fetchElectricians(params)
        if (!cancelled && response.electricians?.length > 0) {
          // Normalize API response to match card component expectations
          const normalized = response.electricians.map(e => ({
            id: e._id || e.id,
            name: e.name,
            photo: e.profilePhoto || null,
            rating: e.rating?.avg || e.rating || 0,
            reviewCount: e.rating?.count || e.reviewCount || 0,
            experience: e.experience || 0,
            location: e.location || {},
            categories: e.categories || [],
            topBadge: e.topBadge || (e.categories?.[0] ? `${e.categories[0]} Expert` : ''),
            bio: e.bio || '',
            availability: e.availability || { isAvailable: true },
            services: e.services || [],
            priceRange: e.priceRange || '₹200 - ₹5,000',
            completedJobs: e.completedJobs || 0,
            verified: e.aadhar?.verified || e.verified || false,
          }))
          setApiElectricians(normalized)
          setUsingApi(true)
        }
      } catch {
        // API unavailable — fall through to mock data
        setUsingApi(false)
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }

    loadElectricians()
    return () => { cancelled = true }
  }, [filters.search, filters.city, filters.service, filters.rating, filters.sort, filters.availableOnly])

  // Data source: API or fallback mock
  const sourceElectricians = usingApi ? apiElectricians : mockElectricians

  const filteredElectricians = useMemo(() => {
    if (!sourceElectricians) return []

    // If using API, the server already filtered — return as-is
    if (usingApi) return sourceElectricians

    // Mock data: client-side filtering
    let result = [...sourceElectricians]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(e => e.name.toLowerCase().includes(q))
    }
    if (filters.city) {
      result = result.filter(e => e.location.city === filters.city)
    }
    if (filters.service) {
      result = result.filter(e => e.services.includes(filters.service))
    }
    if (filters.rating) {
      const minRating = parseFloat(filters.rating)
      result = result.filter(e => e.rating >= minRating)
    }
    if (filters.availableOnly) {
      result = result.filter(e => e.availability.isAvailable)
    }

    switch (filters.sort) {
      case 'Rating (High to Low)':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'Experience':
        result.sort((a, b) => b.experience - a.experience)
        break
      case 'Most Reviews':
        result.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case 'Price (Low to High)':
        result.sort((a, b) => a.experience - b.experience)
        break
    }

    return result
  }, [filters, sourceElectricians, usingApi])

  return (
    <section className="py-10 md:py-16">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Find <span className="gradient-text">Electricians</span>
          </h1>
          <p className="text-surface-400">
            Browse verified professionals near you
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-72 flex-shrink-0">
            <ElectricianFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <Users size={16} />
                <span>{filteredElectricians.length} electricians found</span>
                {!usingApi && !apiLoading && (
                  <span className="flex items-center gap-1 text-xs text-surface-600 ml-2">
                    <WifiOff size={12} />
                    Offline mode
                  </span>
                )}
              </div>
            </div>

            {apiLoading && !apiElectricians ? (
              <div className="glass-card p-12 text-center">
                <Loader2 size={32} className="mx-auto mb-4 text-primary-400 animate-spin" />
                <p className="text-surface-400 text-sm">Loading electricians...</p>
              </div>
            ) : filteredElectricians.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredElectricians.map((electrician, index) => (
                  <motion.div
                    key={electrician.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ElectricianCard electrician={electrician} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center"
              >
                <Users size={48} className="mx-auto mb-4 text-surface-600" />
                <h3 className="text-lg font-display font-semibold text-white mb-2">No electricians found</h3>
                <p className="text-surface-400 text-sm">Try adjusting your filters to see more results</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
