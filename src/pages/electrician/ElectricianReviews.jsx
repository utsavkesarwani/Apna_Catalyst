import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star, MessageSquare, TrendingUp, ThumbsUp,
  Smile, Meh, Frown, Loader2
} from 'lucide-react'
import { getMyReviews } from '../../api/electrician.api.js'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const ratingLabels = { 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Poor', 1: 'Terrible' }
const ratingColors = {
  5: 'from-emerald-500 to-emerald-400',
  4: 'from-primary-500 to-electric-500',
  3: 'from-amber-500 to-amber-400',
  2: 'from-orange-500 to-orange-400',
  1: 'from-red-500 to-red-400',
}

export default function ElectricianReviews() {
  const [reviewsData, setReviewsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadReviews()
  }, [sortBy])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await getMyReviews({ sort: sortBy, limit: 50 })
      setReviewsData(response)
    } catch (err) {
      console.error('Failed to load reviews:', err)
      // Fallback so the page renders instead of spinning forever
      setReviewsData({
        reviews: [],
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !reviewsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  const distribution = reviewsData.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const totalReviews = reviewsData.totalReviews || 0
  const averageRating = reviewsData.averageRating || 0
  const allReviews = reviewsData.reviews || []

  const filteredReviews = ratingFilter === 'all'
    ? allReviews
    : allReviews.filter(r => r.rating === Number(ratingFilter))

  const positiveCount = (distribution[5] || 0) + (distribution[4] || 0)
  const neutralCount = distribution[3] || 0
  const negativeCount = (distribution[2] || 0) + (distribution[1] || 0)
  const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-white">Reviews</h1>
        <p className="text-sm text-surface-500 mt-1">See what your customers are saying</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div variants={item} className="glass-card p-5 bg-gradient-to-br from-accent-500/15 to-accent-600/5 border border-accent-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-500/15 flex items-center justify-center">
              <Star size={28} className="text-accent-400 fill-accent-400" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-white">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-surface-400">Average Rating</p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < Math.floor(averageRating)
                        ? 'text-accent-400 fill-accent-400'
                        : 'text-surface-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 bg-gradient-to-br from-primary-500/15 to-primary-600/5 border border-primary-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/15 flex items-center justify-center">
              <MessageSquare size={28} className="text-primary-400" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-white">{totalReviews}</p>
              <p className="text-sm text-surface-400">Total Reviews</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <ThumbsUp size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-white">{positivePercent}%</p>
              <p className="text-sm text-surface-400">Positive (4-5★)</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5 bg-gradient-to-br from-electric-500/15 to-electric-600/5 border border-electric-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-electric-500/15 flex items-center justify-center">
              <TrendingUp size={28} className="text-electric-400" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-white">{distribution[5] || 0}</p>
              <p className="text-sm text-surface-400">5-Star Reviews</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-5">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating] || 0
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(ratingFilter === String(rating) ? 'all' : String(rating))}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                    ratingFilter === String(rating) ? 'bg-surface-800/60' : 'hover:bg-surface-800/30'
                  }`}
                >
                  <div className="flex items-center gap-1 w-14 flex-shrink-0">
                    <span className="text-sm font-semibold text-white">{rating}</span>
                    <Star size={14} className="text-accent-400 fill-accent-400" />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-surface-800/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: (5 - rating) * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${ratingColors[rating]}`}
                    />
                  </div>
                  <span className="text-xs text-surface-400 w-10 text-right font-medium">{count}</span>
                </button>
              )
            })}
          </div>

          {/* Sentiment Summary */}
          <div className="mt-6 pt-5 border-t border-surface-800/50 space-y-3">
            <h4 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">Sentiment</h4>
            {[
              { icon: Smile, label: 'Happy', count: positiveCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Meh, label: 'Neutral', count: neutralCount, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Frown, label: 'Unhappy', count: negativeCount, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <span className="text-sm text-surface-300 flex-1">{s.label}</span>
                <span className="text-sm font-semibold text-white">{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reviews List */}
        <motion.div variants={item} className="xl:col-span-2 space-y-4">
          {/* Sort / Filter Bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-surface-400">
              Showing {filteredReviews.length} of {totalReviews} reviews
              {ratingFilter !== 'all' && <span className="text-primary-400 ml-1">({ratingFilter}★ only)</span>}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-800/40 border border-surface-700/30 rounded-lg px-3 py-2 text-sm text-surface-300 focus:outline-none focus:border-primary-500/30 cursor-pointer"
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
              {ratingFilter !== 'all' && (
                <button
                  onClick={() => setRatingFilter('all')}
                  className="px-3 py-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm font-medium hover:bg-primary-500/20 transition-all"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Review Cards */}
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-30 text-surface-500" />
              <p className="text-surface-400 font-medium">No reviews found</p>
              <p className="text-sm text-surface-500 mt-1">Reviews will appear here after customers complete bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-card p-5 hover:border-primary-500/15 transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Stars & Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < review.rating
                                  ? 'text-accent-400 fill-accent-400'
                                  : 'text-surface-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-surface-500">{ratingLabels[review.rating]}</span>
                      </div>
                      <span className="text-xs text-surface-500">
                        {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-surface-300 leading-relaxed">"{review.comment}"</p>
                    )}

                    {review.service && (
                      <div className="flex items-center gap-3">
                        <span className="badge-primary text-[11px]">{review.service}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
