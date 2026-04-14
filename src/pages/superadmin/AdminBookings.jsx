import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, CalendarCheck, ChevronLeft, ChevronRight, Loader2,
  Filter, IndianRupee, MapPin, Clock, X, UserPlus, AlertCircle
} from 'lucide-react'
import { getAllBookings, assignElectricianToBooking, getAllElectricians } from '../../api/admin.api.js'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const statusStyles = {
  'pending':     { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Pending' },
  'confirmed':   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Confirmed' },
  'assigned':    { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', label: 'Assigned' },
  'in-progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'In Progress' },
  'completed':   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Completed' },
  'cancelled':   { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Cancelled' },
}

const statusFilters = ['all', 'pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [assignModal, setAssignModal] = useState(null) // booking id
  const [electricians, setElectricians] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [elecSearch, setElecSearch] = useState('')

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await getAllBookings(params)
      setBookings(res.bookings || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
    } catch {
      setBookings([
        { _id: '1', service: 'Fan Installation', status: 'pending', user: { name: 'Rahul Sharma' }, electrician: null, payment: { amount: 500, status: 'pending' }, location: { city: 'Delhi' }, scheduledAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
        { _id: '2', service: 'Switchboard Repair', status: 'in-progress', user: { name: 'Priya Singh' }, electrician: { name: 'Amit Verma' }, payment: { amount: 800, status: 'paid' }, location: { city: 'Mumbai' }, scheduledAt: new Date().toISOString(), createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: '3', service: 'MCB/Fuse Box', status: 'confirmed', user: { name: 'Vikash Gupta' }, electrician: { name: 'Sunil Yadav' }, payment: { amount: 1200, status: 'paid' }, location: { city: 'Bangalore' }, scheduledAt: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: '4', service: 'Full Home Wiring', status: 'completed', user: { name: 'Neha Patel' }, electrician: { name: 'Rajesh Kumar' }, payment: { amount: 15000, status: 'paid' }, location: { city: 'Ahmedabad' }, scheduledAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString() },
        { _id: '5', service: 'AC Wiring', status: 'cancelled', user: { name: 'Arjun Mehra' }, electrician: null, payment: { amount: 2500, status: 'refunded' }, location: { city: 'Pune' }, scheduledAt: new Date(Date.now() + 259200000).toISOString(), createdAt: new Date(Date.now() - 259200000).toISOString() },
        { _id: '6', service: 'Inverter Setup', status: 'assigned', user: { name: 'Kavita Rao' }, electrician: { name: 'Deepak Sharma' }, payment: { amount: 3500, status: 'paid' }, location: { city: 'Chennai' }, scheduledAt: new Date(Date.now() + 43200000).toISOString(), createdAt: new Date(Date.now() - 14400000).toISOString() },
      ])
      setTotal(6)
      setPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { loadBookings() }, [loadBookings])

  const openAssignModal = async (bookingId) => {
    setAssignModal(bookingId)
    try {
      const res = await getAllElectricians({ approved: 'true', limit: 50 })
      setElectricians(res.electricians || [])
    } catch {
      setElectricians([
        { _id: 'e1', name: 'Rajesh Kumar', location: { city: 'Delhi' }, rating: { avg: 4.8 }, availability: { isAvailable: true } },
        { _id: 'e2', name: 'Amit Verma', location: { city: 'Mumbai' }, rating: { avg: 4.5 }, availability: { isAvailable: true } },
        { _id: 'e3', name: 'Deepak Sharma', location: { city: 'Jaipur' }, rating: { avg: 4.9 }, availability: { isAvailable: false } },
      ])
    }
  }

  const handleAssign = async (electricianId) => {
    setAssignLoading(true)
    try {
      await assignElectricianToBooking(assignModal, electricianId)
      loadBookings()
    } catch {
      // Update locally
      const elec = electricians.find(e => e._id === electricianId)
      setBookings(prev => prev.map(b =>
        b._id === assignModal ? { ...b, status: 'assigned', electrician: elec } : b
      ))
    } finally {
      setAssignLoading(false)
      setAssignModal(null)
    }
  }

  const filteredElectricians = electricians.filter(e =>
    e.name?.toLowerCase().includes(elecSearch.toLowerCase())
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-white">Booking Management</h1>
        <p className="text-sm text-surface-500 mt-1">{total.toLocaleString()} total bookings</p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((s) => {
          const style = s === 'all' ? null : statusStyles[s]
          return (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 capitalize ${
                statusFilter === s
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'text-surface-400 border border-surface-700/50 hover:text-white hover:border-surface-600'
              }`}
            >
              {s === 'all' ? 'All Bookings' : (style?.label || s)}
            </button>
          )
        })}
      </motion.div>

      {/* Bookings Table */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-purple-400" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-surface-500">
            <CalendarCheck size={48} className="mx-auto mb-3 opacity-30" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800/50 bg-surface-800/20">
                  <th className="text-left text-surface-500 font-medium p-4">Service</th>
                  <th className="text-left text-surface-500 font-medium p-4">Customer</th>
                  <th className="text-left text-surface-500 font-medium p-4">Electrician</th>
                  <th className="text-left text-surface-500 font-medium p-4">Scheduled</th>
                  <th className="text-left text-surface-500 font-medium p-4">Amount</th>
                  <th className="text-left text-surface-500 font-medium p-4">Status</th>
                  <th className="text-right text-surface-500 font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const style = statusStyles[booking.status] || statusStyles['pending']
                  return (
                    <tr key={booking._id} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                      <td className="p-4">
                        <div>
                          <span className="text-white font-medium">{booking.service}</span>
                          {booking.location?.city && (
                            <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5">
                              <MapPin size={10} /> {booking.location.city}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-surface-300">{booking.user?.name || 'N/A'}</td>
                      <td className="p-4">
                        {booking.electrician ? (
                          <span className="text-surface-300">{booking.electrician.name}</span>
                        ) : (
                          <span className="text-surface-600 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-xs">
                          <span className="text-surface-300">
                            {new Date(booking.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-surface-500 ml-1.5">
                            {new Date(booking.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">₹{(booking.payment?.amount || 0).toLocaleString()}</span>
                        <div className={`text-[10px] mt-0.5 ${booking.payment?.status === 'paid' ? 'text-emerald-400' : 'text-surface-500'}`}>
                          {booking.payment?.status || 'pending'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${style.bg} ${style.text} border ${style.border}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {(booking.status === 'pending' || !booking.electrician) && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => openAssignModal(booking._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold hover:bg-purple-500/20 transition-all"
                          >
                            <UserPlus size={12} /> Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-800/50">
            <p className="text-xs text-surface-500">Page {page} of {pages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Assign Electrician Modal */}
      <AnimatePresence>
        {assignModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setAssignModal(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md glass-card p-6 pointer-events-auto max-h-[70vh] flex flex-col"
              >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-white">Assign Electrician</h3>
                <button onClick={() => setAssignModal(null)} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  type="text"
                  value={elecSearch}
                  onChange={(e) => setElecSearch(e.target.value)}
                  placeholder="Search electricians..."
                  className="input-field pl-9 py-2 text-sm"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {filteredElectricians.length === 0 ? (
                  <p className="text-center py-8 text-surface-500 text-sm">No electricians found</p>
                ) : (
                  filteredElectricians.map((elec) => (
                    <button
                      key={elec._id}
                      onClick={() => handleAssign(elec._id)}
                      disabled={assignLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-surface-700/50 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all disabled:opacity-50 text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {elec.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{elec.name}</p>
                        <div className="flex items-center gap-2 text-xs text-surface-400">
                          <span>{elec.location?.city || 'N/A'}</span>
                          <span>★ {(elec.rating?.avg || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${elec.availability?.isAvailable ? 'bg-emerald-400' : 'bg-surface-600'}`} />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
