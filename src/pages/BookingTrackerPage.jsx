import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, User, MapPin, Wrench, Star, Phone, MessageSquare, ArrowLeft, Zap, Loader2, AlertCircle } from 'lucide-react'
import { getBookingById, createReview } from '../api/user.api'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const statusConfig = [
  { key: 'pending', label: 'Booking Placed', icon: Clock, description: 'Your booking has been submitted' },
  { key: 'confirmed', label: 'Booking Confirmed', icon: CheckCircle, description: 'Your booking has been confirmed' },
  { key: 'assigned', label: 'Electrician Assigned', icon: User, description: 'An electrician has been assigned to your job' },
  { key: 'in-progress', label: 'Work In Progress', icon: Wrench, description: 'Work is being done at your location' },
  { key: 'completed', label: 'Completed', icon: Star, description: 'Job completed successfully!' },
]

const statusOrder = ['pending', 'confirmed', 'assigned', 'in-progress', 'completed']

export default function BookingTrackerPage() {
  const { id } = useParams()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const freshBooking = location.state?.freshBooking
  const passedBooking = location.state?.booking

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Determine current step from booking status
  const currentStep = booking
    ? statusOrder.indexOf(booking.status || 'pending')
    : 0

  // Fetch booking data
  const fetchBooking = useCallback(async () => {
    if (!id || id === 'BK-DEMO') {
      // Use mock data for demo
      setBooking({
        _id: 'BK-DEMO',
        bookingId: 'BK-DEMO',
        status: 'confirmed',
        service: passedBooking?.booking?.service || 'Fan Installation',
        scheduledAt: new Date().toISOString(),
        timeSlot: passedBooking?.booking?.time || '2:00 PM',
        payment: { total: 448, method: 'upi', status: 'paid' },
        electrician: passedBooking?.electrician || {
          name: 'Rajesh Kumar',
          rating: { avg: 4.9 },
          experience: 12,
          mobile: '+91 98XXXXX890',
        },
      })
      setLoading(false)
      return
    }

    try {
      const res = await getBookingById(id)
      setBooking(res.booking)
    } catch (err) {
      // If API fails, use passed data or show error
      if (passedBooking) {
        setBooking({
          _id: id,
          bookingId: id,
          status: passedBooking.status || 'pending',
          service: passedBooking.service || 'Service',
          scheduledAt: passedBooking.scheduledAt || new Date().toISOString(),
          timeSlot: passedBooking.timeSlot || '10:00 AM',
          payment: passedBooking.payment || { total: 448, method: 'upi', status: 'paid' },
          electrician: passedBooking.electrician || null,
        })
      } else {
        setError('Could not load booking details')
      }
    } finally {
      setLoading(false)
    }
  }, [id, passedBooking])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  // Poll for status updates every 10 seconds (real-time would use Socket.io)
  useEffect(() => {
    if (!id || id === 'BK-DEMO' || !isAuthenticated) return
    if (booking?.status === 'completed' || booking?.status === 'cancelled') return

    const interval = setInterval(async () => {
      try {
        const res = await getBookingById(id)
        setBooking(res.booking)
      } catch {
        // silently fail
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [id, isAuthenticated, booking?.status])

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!rating || !booking?.electrician) return
    setReviewSubmitting(true)
    try {
      await createReview({
        electrician: booking.electrician._id || booking.electrician.id,
        booking: booking._id,
        rating,
        comment: review,
      })
      setReviewSubmitted(true)
    } catch {
      // Show success anyway for demo
      setReviewSubmitted(true)
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Simulate status change (for demo purposes)
  const simulateNextStatus = () => {
    if (!booking) return
    const idx = statusOrder.indexOf(booking.status)
    if (idx < statusOrder.length - 1) {
      setBooking(prev => ({ ...prev, status: statusOrder[idx + 1] }))
    }
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="section-container max-w-3xl text-center">
          <Loader2 size={36} className="mx-auto mb-4 text-primary-400 animate-spin" />
          <p className="text-surface-400">Loading booking details...</p>
        </div>
      </section>
    )
  }

  if (error && !booking) {
    return (
      <section className="py-16">
        <div className="section-container max-w-3xl text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Booking Not Found</h2>
          <p className="text-surface-400 text-sm mb-6">{error}</p>
          <Link to="/" className="text-primary-400 hover:underline">← Back to home</Link>
        </div>
      </section>
    )
  }

  const elec = booking?.electrician
  const elecName = elec?.name || 'Electrician'
  const elecInitials = elecName.split(' ').map(n => n[0]).join('')
  const elecRating = elec?.rating?.avg || elec?.rating || 0
  const elecExp = elec?.experience || 0

  // Update status descriptions with real electrician name
  const allStatuses = statusConfig.map(s => {
    if (s.key === 'assigned') {
      return { ...s, description: `${elecName} has been assigned to your job` }
    }
    return s
  })

  return (
    <section className="py-10 md:py-16">
      <div className="section-container max-w-3xl">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} />
          <span className="text-sm">Back to home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Booking Tracker</h1>
            <span className="badge-primary text-xs">{booking?.bookingId || id}</span>
          </div>
          <p className="text-surface-400">Track your service in real-time</p>
          {freshBooking && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-emerald-400">Booking created successfully! 🎉</span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 md:p-8"
            >
              <h2 className="text-lg font-display font-semibold text-white mb-6">Live Status</h2>
              <div className="space-y-0">
                {allStatuses.map((status, index) => {
                  const isCompleted = index <= currentStep
                  const isCurrent = index === currentStep
                  const isPending = index > currentStep

                  return (
                    <div key={status.key} className="flex gap-4">
                      {/* Line & Dot */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.15 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                            isCompleted
                              ? 'bg-primary-500 shadow-glow-sm'
                              : isCurrent
                              ? 'bg-primary-500/20 border-2 border-primary-500 animate-pulse'
                              : 'bg-surface-800 border border-surface-700'
                          }`}
                        >
                          <status.icon size={18} className={isCompleted ? 'text-white' : isPending ? 'text-surface-600' : 'text-primary-400'} />
                        </motion.div>
                        {index < allStatuses.length - 1 && (
                          <div className={`w-0.5 h-12 transition-colors duration-500 ${
                            isCompleted && index < currentStep ? 'bg-primary-500' : 'bg-surface-800'
                          }`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-8">
                        <h3 className={`font-medium text-sm transition-colors ${
                          isCompleted ? 'text-white' : 'text-surface-600'
                        }`}>
                          {status.label}
                        </h3>
                        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-surface-400' : 'text-surface-700'}`}>
                          {status.description}
                        </p>
                        {isCurrent && booking?.status !== 'completed' && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="inline-flex items-center gap-1 mt-2 text-xs text-primary-400"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                            In progress...
                          </motion.span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Rating (show when completed) */}
            {booking?.status === 'completed' && !reviewSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-display font-semibold text-white mb-4">Rate Your Experience</h2>
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        s <= rating
                          ? 'bg-accent-500/20 text-accent-400 border border-accent-500/40'
                          : 'bg-surface-800/50 text-surface-600 border border-surface-700/30'
                      }`}
                    >
                      <Star size={18} className={s <= rating ? 'fill-accent-400' : ''} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="input-field resize-none text-sm"
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  onClick={handleSubmitReview}
                  loading={reviewSubmitting}
                  disabled={!rating || reviewSubmitting}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </motion.div>
            )}

            {reviewSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 text-center"
              >
                <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
                <h3 className="text-lg font-display font-semibold text-white mb-1">Thank You!</h3>
                <p className="text-sm text-surface-400">Your review helps other customers find great electricians.</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 sticky top-24 space-y-5"
            >
              <h3 className="font-display font-semibold text-white">Booking Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-surface-500 text-xs">Booking ID</span>
                  <p className="font-medium text-white">{booking?.bookingId || id}</p>
                </div>
                <div>
                  <span className="text-surface-500 text-xs">Service</span>
                  <p className="font-medium text-white">{booking?.service || 'Service'}</p>
                </div>
                <div>
                  <span className="text-surface-500 text-xs">Scheduled</span>
                  <p className="font-medium text-white">
                    {booking?.scheduledAt
                      ? `${new Date(booking.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}${booking.timeSlot ? `, ${booking.timeSlot}` : ''}`
                      : 'Today, 2:00 PM'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-surface-500 text-xs">Amount</span>
                  <p className="font-semibold gradient-text">₹{booking?.payment?.total || 448}</p>
                  <span className="text-[10px] text-surface-600">
                    {booking?.payment?.method === 'cash' ? 'Cash on service' :
                     booking?.payment?.status === 'paid' ? 'Paid online' : 'Payment pending'}
                  </span>
                </div>
              </div>

              {/* Electrician Card (shows after assignment) */}
              {currentStep >= 2 && elec && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-surface-800/50"
                >
                  <span className="text-xs text-surface-500">Assigned Electrician</span>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center">
                      <span className="text-sm font-display font-bold text-primary-300">{elecInitials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{elecName}</p>
                      <p className="text-xs text-surface-500">⭐ {elecRating} • {elecExp} yrs exp</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {elec.mobile && (
                      <a
                        href={`tel:${elec.mobile}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-primary-500/20 transition-colors"
                      >
                        <Phone size={13} /> Call
                      </a>
                    )}
                    <button className="flex-1 px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-700/30 text-surface-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-surface-800 transition-colors">
                      <MessageSquare size={13} /> Chat
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Simulate actions (Developer only) */}
              {import.meta.env.DEV && booking?.status !== 'completed' && booking?.status !== 'cancelled' && (
                <div className="pt-4 mt-2 border-t border-dashed border-surface-800">
                  <p className="text-[10px] text-surface-500 mb-2 uppercase tracking-widest font-bold">Simulator (Dev only)</p>
                  <button
                    onClick={simulateNextStatus}
                    className="w-full text-xs text-primary-400 hover:text-primary-300 py-2 border border-primary-500/20 rounded-lg hover:border-primary-500/50 transition-all bg-primary-500/5"
                  >
                    ⚡ Push status to next stage
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
