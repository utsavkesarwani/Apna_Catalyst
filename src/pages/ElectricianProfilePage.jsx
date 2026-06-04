import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, CheckCircle, Clock, Zap, Award, Star, Shield, Phone, ArrowLeft, Calendar, Loader2 } from 'lucide-react'
import { getElectricianById as mockGetById } from '../data/electricians'
import { getReviewsByElectrician as mockGetReviews } from '../data/reviews'
import { getElectricianById as fetchElectricianById, getElectricianReviews as fetchReviews } from '../api/user.api'
import StarRating from '../components/ui/StarRating'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

export default function ElectricianProfilePage() {
  const { id } = useParams()
  const [electrician, setElectrician] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingApi, setUsingApi] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
      setLoading(true)
      let finalElec = null
      let finalReviews = []
      let isApi = false

      try {
        // Try API first
        const [elecRes, reviewRes] = await Promise.all([
          fetchElectricianById(id),
          fetchReviews(id).catch(() => ({ reviews: [] })),
        ])

        if (!cancelled && elecRes.electrician) {
          const e = elecRes.electrician
          finalElec = {
            id: e._id || e.id,
            name: e.name,
            photo: e.profilePhoto || null,
            rating: e.rating?.avg ?? (typeof e.rating === 'number' ? e.rating : 0),
            reviewCount: e.rating?.count ?? (e.reviewCount || 0),
            experience: e.experience || 0,
            location: e.location || {},
            categories: e.categories || [],
            topBadge: e.topBadge || '',
            bio: e.bio || '',
            availability: e.availability || { isAvailable: true },
            services: e.services || [],
            priceRange: (e.priceRange && e.priceRange.min > 0 && e.priceRange.max > 0)
              ? `₹${e.priceRange.min} - ₹${e.priceRange.max}` 
              : 'Contact for pricing',
            completedJobs: e.completedJobs || 0,
            verified: e.aadhar?.verified || e.verified || false,
            workImages: e.workImages || [],
            workVideo: e.workVideo || null,
          }
          finalReviews = (reviewRes.reviews || []).map(r => ({
            id: r._id || r.id,
            userName: r.user?.name || r.customer || r.userName || 'Customer',
            rating: r.rating,
            comment: r.comment,
            service: r.booking?.service || r.service || 'Service',
            date: r.createdAt || r.date,
          }))
          isApi = true
        }
      } catch {
        // API unavailable — use mock data
        if (!cancelled) {
          finalElec = mockGetById(id)
          finalReviews = mockGetReviews(id)
        }
      }

      if (!cancelled) {
        // --- Demo mode cross-tab sync ---
        // Force-merge data if viewing the demo electrician, regardless of whether data came from API or Mock
        if (finalElec && (finalElec.id === 1 || finalElec.id === 'demo_elec_001' || id === 'demo_elec_001' || id === '1' || String(finalElec.name).includes('Rajesh'))) {
           try {
             const localUserStr = localStorage.getItem('apna_catalyst_user')
             if (localUserStr) {
               const localUser = JSON.parse(localUserStr)
               if (localUser && localUser._id === 'demo_elec_001') {
                 // Merge local dashboard updates into the public display map
                 finalElec = { 
                   ...finalElec, 
                   ...localUser,
                   photo: localUser.profilePhoto || finalElec.photo,
                   rating: localUser.rating?.avg || finalElec.rating,
                   reviewCount: localUser.rating?.count || finalElec.reviewCount,
                   id: finalElec.id,
                   workImages: localUser.workImages || finalElec.workImages || [],
                   workVideo: localUser.workVideo || finalElec.workVideo || null,
                 }
               }
             }
           } catch (e) {
             console.error("Failed to parse demo user data", e)
           }
        }

        setElectrician(finalElec || null)
        setReviews(finalReviews)
        setUsingApi(isApi)
        setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="section-container py-20 text-center">
        <Loader2 size={40} className="mx-auto mb-4 text-primary-400 animate-spin" />
        <p className="text-surface-400">Loading profile...</p>
      </div>
    )
  }

  if (!electrician) {
    return (
      <div className="section-container py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-4">Electrician not found</h2>
        <Link to="/electricians" className="text-primary-400 hover:underline">← Back to electricians</Link>
      </div>
    )
  }

  const initials = electrician.name.split(' ').map(n => n[0]).join('')

  return (
    <section className="py-8 md:py-12">
      <div className="section-container">
        {/* Back Link */}
        <Link
          to="/electricians"
          className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to electricians</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-8"
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {electrician.photo ? (
                    <img
                      src={electrician.photo}
                      alt={electrician.name}
                      className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border border-primary-500/20"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center border border-primary-500/20">
                      <span className="text-3xl font-display font-bold text-primary-300">{initials}</span>
                    </div>
                  )}
                  {electrician.verified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-500 border-3 border-surface-900 flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{electrician.name}</h1>
                    {electrician.topBadge && (
                      <Badge variant="accent">
                        <Award size={12} />
                        {electrician.topBadge}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={electrician.rating} size={16} />
                    <span className="text-sm text-surface-400">({electrician.reviewCount} reviews)</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-surface-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary-400" />
                      {electrician.location.city}{electrician.location.state ? `, ${electrician.location.state}` : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-primary-400" />
                      {electrician.experience} years experience
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap size={14} className="text-accent-400" />
                      {(electrician.completedJobs || 0).toLocaleString()} jobs completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mt-6 pt-5 border-t border-surface-800/50">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${electrician.availability.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-surface-600'}`} />
                  <span className={`text-sm font-medium ${electrician.availability.isAvailable ? 'text-emerald-400' : 'text-surface-400'}`}>
                    {electrician.availability.isAvailable
                      ? 'Available Now'
                      : `Next Available: ${new Date(electrician.availability.nextAvailableAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`
                    }
                  </span>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-display font-semibold text-white mb-3">About</h2>
              <p className="text-surface-400 leading-relaxed">{electrician.bio}</p>
            </motion.div>

            {/* Services Offered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-display font-semibold text-white mb-4">Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {electrician.categories.map(cat => (
                  <span key={cat} className="badge-primary text-sm px-3 py-1.5">
                    {cat}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Work Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-display font-semibold text-white mb-4">Work Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {electrician.workVideo && (
                  <div className="aspect-square rounded-xl overflow-hidden border border-primary-500/30 col-span-2 md:col-span-1 shadow-glow-sm relative">
                    <video src={electrician.workVideo} className="w-full h-full object-cover" controls playsInline />
                  </div>
                )}
                {electrician.workImages && electrician.workImages.length > 0 ? (
                  electrician.workImages.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-surface-700/30">
                      <img src={img} alt={`Work sample ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  !electrician.workVideo && [1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square rounded-xl bg-surface-800/60 border border-surface-700/30 flex items-center justify-center">
                      <Zap size={24} className="text-surface-700" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-display font-semibold text-white mb-4">
                Customer Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-white text-sm">{review.userName}</span>
                          <span className="mx-2 text-surface-700">•</span>
                          <span className="text-xs text-surface-500">{review.service}</span>
                        </div>
                        <StarRating rating={review.rating} size={12} showValue={false} />
                      </div>
                      <p className="text-sm text-surface-400 leading-relaxed">{review.comment}</p>
                      <span className="text-xs text-surface-600 mt-2 block">
                        {new Date(review.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500 text-sm">No reviews yet</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Book Now Sticky */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 sticky top-24 space-y-5"
            >
              <h3 className="font-display font-semibold text-white text-lg">Book This Electrician</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">Price Range</span>
                  <span className="font-semibold text-white">{electrician.priceRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">Response Time</span>
                  <span className="font-semibold text-emerald-400">~30 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">Jobs Done</span>
                  <span className="font-semibold text-white">{(electrician.completedJobs || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-800/50 space-y-3">
                <Link to={`/booking/${electrician.id}`} className="block">
                  <Button variant="primary" size="lg" icon={Zap} className="w-full">
                    Book Now
                  </Button>
                </Link>
                <Button variant="secondary" size="md" icon={Phone} className="w-full">
                  Contact
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-surface-500 pt-2">
                <Shield size={14} className="text-emerald-400" />
                <span>100% satisfaction guarantee</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
