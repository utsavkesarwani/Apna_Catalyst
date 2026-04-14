import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getTopElectricians as mockGetTop } from '../../data/electricians'
import { getTopElectricians as fetchTopElectricians } from '../../api/user.api'
import ElectricianCard from '../electricians/ElectricianCard'

export default function FeaturedElectricians() {
  const [topElectricians, setTopElectricians] = useState(() => mockGetTop(6))

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetchTopElectricians({ limit: 6 })
        if (!cancelled && res.electricians?.length > 0) {
          setTopElectricians(
            res.electricians.map(e => ({
              id: e._id || e.id,
              name: e.name,
              photo: e.profilePhoto || null,
              rating: e.rating?.avg || e.rating || 0,
              reviewCount: e.rating?.count || e.reviewCount || 0,
              experience: e.experience || 0,
              location: e.location || {},
              categories: e.categories || [],
              topBadge: e.topBadge || '',
              bio: e.bio || '',
              availability: e.availability || { isAvailable: true },
              services: e.services || [],
              priceRange: e.priceRange || '₹200 - ₹5,000',
              completedJobs: e.completedJobs || 0,
              verified: e.aadhar?.verified || e.verified || false,
            }))
          )
        }
      } catch {
        // Keep mock data
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="py-20 md:py-28 relative">
      {/* BG Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-surface-900/50 to-surface-950" />
      
      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="badge-accent text-xs mb-4 inline-block">Top Rated</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Meet Our <span className="gradient-text-gold">Best Electricians</span>
          </h2>
          <p className="text-surface-400 max-w-xl mx-auto">
            Hand-picked professionals with the highest ratings and most completed jobs
          </p>
        </motion.div>

        {/* Electrician Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {topElectricians.map((electrician, index) => (
            <motion.div
              key={electrician.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <ElectricianCard electrician={electrician} />
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            to="/electricians"
            className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 font-medium transition-colors group"
          >
            View all electricians
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
