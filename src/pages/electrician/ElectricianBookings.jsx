import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, Clock, ChevronDown, MapPin,
  Phone, IndianRupee, CheckCircle2, XCircle, ArrowRight,
  AlertCircle, Search, Calendar, User as UserIcon, Loader2
} from 'lucide-react'
import {
  getElectricianBookings, acceptBooking, rejectBooking, updateBookingStatus
} from '../../api/electrician.api.js'

const statusConfig = {
  'in-progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400', label: 'In Progress' },
  'confirmed': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', label: 'Confirmed' },
  'assigned': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400', label: 'Assigned' },
  'completed': { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20', dot: 'bg-primary-400', label: 'Completed' },
  'pending': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400', label: 'Pending' },
  'cancelled': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400', label: 'Cancelled' },
  'rejected': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400', label: 'Rejected' },
}

const statusUpdateMap = {
  'confirmed': { next: 'assigned', label: 'Mark Assigned' },
  'assigned': { next: 'in-progress', label: 'Start Work' },
  'in-progress': { next: 'completed', label: 'Mark Completed' },
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function ElectricianBookings() {
  const [activeTab, setActiveTab] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [bookings, setBookings] = useState({ active: [], pending: [], history: [] })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const [activeRes, pendingRes, historyRes] = await Promise.all([
        getElectricianBookings({ status: 'confirmed' }),
        getElectricianBookings({ status: 'pending' }),
        getElectricianBookings({ status: 'completed', limit: 20 }),
      ])

      // Also fetch in-progress and assigned bookings for the active tab
      const [inProgressRes, assignedRes, rejectedRes] = await Promise.all([
        getElectricianBookings({ status: 'in-progress' }),
        getElectricianBookings({ status: 'assigned' }),
        getElectricianBookings({ status: 'rejected', limit: 20 }),
      ])

      setBookings({
        active: [...(inProgressRes.bookings || []), ...(assignedRes.bookings || []), ...(activeRes.bookings || [])],
        pending: pendingRes.bookings || [],
        history: [...(historyRes.bookings || []), ...(rejectedRes.bookings || [])],
      })
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBookings() }, [loadBookings])

  const handleAccept = async (id) => {
    setActionLoading(id)
    try {
      await acceptBooking(id)
      await loadBookings()
    } catch (err) {
      console.error('Failed to accept:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      await rejectBooking(id, 'Unavailable at this time')
      await loadBookings()
    } catch (err) {
      console.error('Failed to reject:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id)
    try {
      await updateBookingStatus(id, newStatus)
      await loadBookings()
      setExpandedBooking(null)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const tabs = [
    { id: 'active', label: 'Active', count: bookings.active.length },
    { id: 'pending', label: 'Pending', count: bookings.pending.length },
    { id: 'history', label: 'History', count: bookings.history.length },
  ]

  const currentBookings = bookings[activeTab] || []
  const filteredBookings = searchQuery
    ? currentBookings.filter(b =>
        (b.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b._id || '').includes(searchQuery)
      )
    : currentBookings

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Bookings</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your incoming and active bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 pr-4 py-2 text-sm w-56"
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex items-center gap-1 p-1 rounded-xl bg-surface-800/40 border border-surface-700/30 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeBookingTab"
                className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-electric-500/10 border border-primary-500/20 rounded-lg"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative">{tab.label}</span>
            <span className={`relative px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-surface-700/50 text-surface-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <CalendarCheck size={48} className="mx-auto mb-4 opacity-30 text-surface-500" />
              <p className="text-surface-400 font-medium">No {activeTab} bookings found</p>
              <p className="text-sm text-surface-500 mt-1">
                {activeTab === 'pending' ? 'New booking requests will appear here' : 'Bookings will appear here as they come in'}
              </p>
            </div>
          ) : filteredBookings.map((booking) => {
            const style = statusConfig[booking.status] || statusConfig['pending']
            const isExpanded = expandedBooking === booking._id
            const nextAction = statusUpdateMap[booking.status]

            return (
              <div
                key={booking._id}
                className="glass-card overflow-hidden hover:border-primary-500/20 transition-all duration-300"
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Time Block */}
                  <div className="w-20 flex-shrink-0 text-center p-3 rounded-xl bg-surface-800/40 border border-surface-700/30">
                    <p className="text-lg font-bold text-white">
                      {new Date(booking.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0]}
                    </p>
                    <p className="text-[10px] uppercase text-surface-500 font-semibold tracking-wider">
                      {new Date(booking.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[1]}
                    </p>
                    <p className="text-[10px] text-surface-600 mt-1">
                      {new Date(booking.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{booking.user?.name || 'Customer'}</h3>
                        <span className="text-xs text-surface-600">#{booking._id?.slice(-6)}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${booking.status === 'in-progress' ? 'animate-pulse' : ''}`} />
                        {style.label}
                      </span>
                    </div>
                    <p className="text-sm text-primary-400 font-medium">{booking.service}</p>
                    <p className="text-xs text-surface-500 mt-1 line-clamp-1">{booking.problemDescription}</p>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-surface-400">
                        <MapPin size={13} /> {booking.location?.city || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-surface-400">
                        <IndianRupee size={13} /> ₹{(booking.payment?.amount || 0).toLocaleString()}
                        <span className={`ml-1 text-[10px] ${booking.payment?.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          ({booking.payment?.status || 'pending'})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAccept(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 size={16} /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    ) : (
                      <>
                        {booking.user?.mobile && (
                          <a href={`tel:${booking.user.mobile}`} className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Call">
                            <Phone size={16} />
                          </a>
                        )}
                        {nextAction && (
                          <button
                            onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
                            className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-all"
                            title="Actions"
                          >
                            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Actions */}
                <AnimatePresence>
                  {isExpanded && nextAction && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-surface-800/50"
                    >
                      <div className="p-4 bg-surface-800/20">
                        <p className="text-xs text-surface-500 mb-3 font-medium uppercase tracking-wider">Update Status</p>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, nextAction.next)}
                          disabled={actionLoading === booking._id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm font-medium hover:bg-primary-500/20 transition-all duration-300 disabled:opacity-50"
                        >
                          {actionLoading === booking._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ArrowRight size={14} />
                          )}
                          {nextAction.label}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
