import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CalendarCheck, Clock, IndianRupee, Star,
  ArrowUpRight, ArrowDownRight, CheckCircle2,
  MapPin, Phone, ChevronRight, AlertCircle, Eye, Loader2, Bell, Zap, XCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getElectricianBookings, getEarnings, acceptBooking, rejectBooking } from '../../api/electrician.api.js'

const statusStyles = {
  'in-progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'In Progress' },
  'confirmed': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Confirmed' },
  'assigned': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', label: 'Assigned' },
  'pending': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Pending' },
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ElectricianDashboard() {
  const { user } = useAuth()
  const [activeBookings, setActiveBookings] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showBanner, setShowBanner] = useState(true)
  const prevPendingCount = useRef(0)

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [activeRes, pendingRes, earningsRes] = await Promise.all([
        getElectricianBookings({ status: 'confirmed' }),
        getElectricianBookings({ status: 'pending' }),
        getEarnings(),
      ])
      const newPending = pendingRes.bookings || []

      // If new requests came in while we were away, reset banner visibility
      if (newPending.length > prevPendingCount.current) {
        setShowBanner(true)
        // Play subtle audio cue for new request
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(880, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
          gain.gain.setValueAtTime(0.15, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime)
          osc.stop(ctx.currentTime + 0.4)
          setTimeout(() => ctx.close(), 600)
        } catch { /* audio not available */ }
      }
      prevPendingCount.current = newPending.length

      setActiveBookings(activeRes.bookings || [])
      setPendingBookings(newPending)
      setEarnings(earningsRes.earnings || null)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      if (!silent) {
        setActiveBookings([])
        setPendingBookings([])
        setEarnings(null)
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { loadDashboardData() }, [loadDashboardData])

  // Poll every 15s for new booking requests
  useEffect(() => {
    const interval = setInterval(() => loadDashboardData(true), 15000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  const handleAccept = async (id) => {
    setActionLoading(id)
    try {
      await acceptBooking(id)
      setPendingBookings(prev => prev.filter(b => b._id !== id))
      loadDashboardData()
    } catch (err) {
      console.error('Failed to accept booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      await rejectBooking(id, 'Not available')
      setPendingBookings(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      console.error('Failed to reject booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Stats derived from user + earnings
  const completedJobs = user?.stats?.completedBookings || 0
  const avgRating = user?.rating?.avg || 0
  const reviewCount = user?.rating?.count || 0

  const statCards = [
    {
      title: "Today's Bookings",
      value: String(activeBookings.length + pendingBookings.length),
      change: `${pendingBookings.length} pending`,
      trend: 'up',
      icon: CalendarCheck,
      gradient: 'from-primary-500/15 to-primary-600/5',
      border: 'border-primary-500/20',
      iconBg: 'bg-primary-500/15',
      iconColor: 'text-primary-400',
    },
    {
      title: 'This Month',
      value: `₹${(earnings?.thisMonth || 0).toLocaleString()}`,
      change: earnings?.lastMonth ? `vs ₹${earnings.lastMonth.toLocaleString()} last month` : '',
      trend: (earnings?.thisMonth || 0) >= (earnings?.lastMonth || 0) ? 'up' : 'down',
      icon: IndianRupee,
      gradient: 'from-emerald-500/15 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Completed Jobs',
      value: completedJobs.toLocaleString(),
      change: `${activeBookings.length} active`,
      trend: 'up',
      icon: CheckCircle2,
      gradient: 'from-electric-500/15 to-electric-600/5',
      border: 'border-electric-500/20',
      iconBg: 'bg-electric-500/15',
      iconColor: 'text-electric-400',
    },
    {
      title: 'Avg. Rating',
      value: avgRating.toFixed(1),
      change: `${reviewCount} reviews`,
      trend: 'up',
      icon: Star,
      gradient: 'from-accent-500/15 to-accent-600/5',
      border: 'border-accent-500/20',
      iconBg: 'bg-accent-500/15',
      iconColor: 'text-accent-400',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ── Pending Booking Alert Banner ── */}
      <AnimatePresence>
        {pendingBookings.length > 0 && showBanner && (
          <motion.div
            key="pending-banner"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 flex items-center gap-4"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 relative">
              <Bell size={20} className="text-amber-400" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                {pendingBookings.length}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-white text-sm">
                {pendingBookings.length === 1
                  ? '1 new booking request is waiting for your response'
                  : `${pendingBookings.length} new booking requests are waiting for your response`
                }
              </p>
              <p className="text-xs text-surface-400 mt-0.5">
                Accept or reject them below — users are notified instantly
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/electrician/bookings"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-all"
              >
                <Zap size={13} /> View All
              </Link>
              <button
                onClick={() => setShowBanner(false)}
                className="p-2 rounded-lg text-surface-500 hover:text-surface-300 transition-colors"
                title="Dismiss"
              >
                <XCircle size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              variants={item}
              className={`glass-card p-5 bg-gradient-to-br ${stat.gradient} border ${stat.border} hover:shadow-lg transition-all duration-300 group cursor-default`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={stat.iconColor} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span className="hidden sm:inline">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-sm text-surface-400 mt-0.5">{stat.title}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Bookings - 2 cols wide */}
        <motion.div variants={item} className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Active Bookings</h3>
              <p className="text-sm text-surface-500 mt-0.5">{activeBookings.length} confirmed bookings</p>
            </div>
            <Link
              to="/electrician/bookings"
              className="flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {activeBookings.length === 0 ? (
            <div className="text-center py-10 text-surface-500">
              <CalendarCheck size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No active bookings right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.slice(0, 5).map((booking) => {
                const style = statusStyles[booking.status] || statusStyles['confirmed']
                return (
                  <div
                    key={booking._id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 hover:border-surface-600/50 transition-all duration-300 group"
                  >
                    {/* Time */}
                    <div className="text-center flex-shrink-0 w-16">
                      <p className="text-lg font-bold text-white">
                        {new Date(booking.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0]}
                      </p>
                      <p className="text-[10px] uppercase text-surface-500 font-medium">
                        {new Date(booking.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[1]}
                      </p>
                    </div>

                    <div className="w-px bg-surface-700/50 self-stretch flex-shrink-0" />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-semibold text-white truncate">{booking.user?.name || 'Customer'}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${style.bg} ${style.text} border ${style.border}`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-sm text-primary-400 font-medium mb-1">{booking.service}</p>
                      <p className="text-xs text-surface-500 line-clamp-1">{booking.problemDescription}</p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <span className="flex items-center gap-1 text-xs text-surface-500">
                          <MapPin size={12} />
                          <span className="truncate max-w-[150px]">{booking.location?.city || 'N/A'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-surface-500">
                          <IndianRupee size={12} />
                          ₹{(booking.payment?.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {booking.user?.mobile && (
                        <a href={`tel:${booking.user.mobile}`} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Call Customer">
                          <Phone size={16} />
                        </a>
                      )}
                      <Link to="/electrician/bookings" className="p-2 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all" title="View Details">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Pending Requests - 1 col wide */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Pending Requests</h3>
              <p className="text-sm text-surface-500 mt-0.5">{pendingBookings.length} new requests</p>
            </div>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 text-sm font-bold">
              {pendingBookings.length}
            </span>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="text-center py-10 text-surface-500">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.slice(0, 5).map((req) => (
                <div
                  key={req._id}
                  className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 hover:border-amber-500/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{req.user?.name || 'Customer'}</h4>
                  </div>
                  <p className="text-sm text-primary-400 font-medium">{req.service}</p>
                  <p className="text-xs text-surface-500 mt-1 line-clamp-2">{req.problemDescription}</p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(req.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee size={12} />
                      ₹{(req.payment?.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAccept(req._id)}
                      disabled={actionLoading === req._id}
                      className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {actionLoading === req._id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={actionLoading === req._id}
                      className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Earnings Overview + Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Bar Chart */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-display font-semibold text-white">Earnings Overview</h3>
            <Link
              to="/electrician/earnings"
              className="flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              Details <ChevronRight size={16} />
            </Link>
          </div>

          {earnings?.monthlyBreakdown?.length > 0 ? (
            <div className="flex items-end gap-2 h-44">
              {earnings.monthlyBreakdown.map((m, i) => {
                const maxVal = Math.max(...earnings.monthlyBreakdown.map(d => d.earned), 1)
                const height = (m.earned / maxVal) * 100
                const isLast = i === earnings.monthlyBreakdown.length - 1
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className={`text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isLast ? 'text-primary-400' : 'text-surface-400'}`}>
                      ₹{(m.earned / 1000).toFixed(1)}k
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 2)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className={`w-full rounded-lg ${
                        isLast
                          ? 'bg-gradient-to-t from-primary-500 to-electric-500 shadow-glow-sm'
                          : 'bg-surface-700/60 group-hover:bg-surface-600/60'
                      } transition-colors duration-300`}
                    />
                    <span className="text-[10px] text-surface-500 font-medium">
                      {m.month.split(' ')[0]?.slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-surface-500 text-sm">
              No earnings data yet
            </div>
          )}
        </motion.div>

        {/* Performance */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-5">Performance</h3>

          <div className="space-y-4">
            {[
              { label: 'Completed Jobs', value: `${completedJobs}`, fill: Math.min(completedJobs, 100), color: 'from-emerald-500 to-emerald-400' },
              { label: 'Active Bookings', value: `${activeBookings.length}`, fill: Math.min(activeBookings.length * 10, 100), color: 'from-primary-500 to-electric-500' },
              { label: 'Average Rating', value: `${avgRating}/5`, fill: (avgRating / 5) * 100, color: 'from-accent-500 to-accent-400' },
              { label: 'Reviews', value: `${reviewCount}`, fill: Math.min(reviewCount, 100), color: 'from-purple-500 to-pink-500' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-surface-300">{stat.label}</span>
                  <span className="text-sm font-semibold text-white">{stat.value}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-800/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.fill}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="p-3 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center">
              <p className="text-xl font-display font-bold gradient-text">₹{(earnings?.avgPerJob || 0).toLocaleString()}</p>
              <p className="text-xs text-surface-500 mt-0.5">Avg per Job</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center">
              <p className="text-xl font-display font-bold gradient-text-gold">{user?.experience || 0}</p>
              <p className="text-xs text-surface-500 mt-0.5">Years Exp.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
