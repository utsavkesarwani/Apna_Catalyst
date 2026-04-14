import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, IndianRupee, CalendarCheck,
  Loader2, ArrowUpRight, ArrowDownRight, Activity, Users, Wrench
} from 'lucide-react'
import { getAnalyticsOverview, getRevenueAnalytics, getBookingAnalytics } from '../../api/admin.api.js'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const periodOptions = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '1 Year', value: 365 },
]

const statusColors = {
  'pending': 'bg-amber-500',
  'confirmed': 'bg-emerald-500',
  'assigned': 'bg-cyan-500',
  'in-progress': 'bg-blue-500',
  'completed': 'bg-emerald-400',
  'cancelled': 'bg-red-500',
}

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [bookingData, setBookingData] = useState({ byStatus: [], byDay: [], byService: [] })
  const [period, setPeriod] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [overviewRes, revenueRes, bookingRes] = await Promise.all([
        getAnalyticsOverview(),
        getRevenueAnalytics(period),
        getBookingAnalytics(period),
      ])
      setOverview(overviewRes.analytics || null)
      setRevenueData(revenueRes.data || [])
      setBookingData(bookingRes.analytics || { byStatus: [], byDay: [], byService: [] })
    } catch {
      // Fallback mock data
      setOverview({
        totalUsers: 1247,
        totalElectricians: 86,
        totalBookings: 3421,
        totalRevenue: 2847500,
        pendingApprovals: 12,
        activeBookings: 34,
      })
      const days = []
      for (let i = period; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000)
        days.push({
          _id: d.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 80000) + 20000,
          count: Math.floor(Math.random() * 25) + 5,
        })
      }
      setRevenueData(days)
      setBookingData({
        byStatus: [
          { _id: 'completed', count: 2150 },
          { _id: 'pending', count: 180 },
          { _id: 'in-progress', count: 95 },
          { _id: 'confirmed', count: 220 },
          { _id: 'assigned', count: 145 },
          { _id: 'cancelled', count: 631 },
        ],
        byDay: days.map(d => ({ _id: d._id, count: d.count })),
        byService: [
          { _id: 'Fan Installation', count: 845 },
          { _id: 'Switchboard Repair', count: 620 },
          { _id: 'Wiring', count: 512 },
          { _id: 'MCB/Fuse Box', count: 398 },
          { _id: 'AC Wiring', count: 321 },
          { _id: 'CCTV Installation', count: 287 },
          { _id: 'Full Home Wiring', count: 198 },
          { _id: 'Inverter Setup', count: 156 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const totalRevInPeriod = revenueData.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalBookingsInPeriod = revenueData.reduce((s, d) => s + (d.count || 0), 0)
  const avgDaily = revenueData.length > 0 ? totalRevInPeriod / revenueData.length : 0
  const totalByStatus = (bookingData.byStatus || []).reduce((s, d) => s + d.count, 0) || 1

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
          <p className="text-sm text-surface-500 mt-1">Platform performance insights</p>
        </div>
        <div className="flex gap-2">
          {periodOptions.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                period === p.value
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'text-surface-400 border border-surface-700/50 hover:text-white hover:border-surface-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Revenue', value: `₹${(totalRevInPeriod / 1000).toFixed(0)}k`, sub: `Last ${period} days`, icon: IndianRupee, gradient: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
          { title: 'Bookings', value: totalBookingsInPeriod.toLocaleString(), sub: `Last ${period} days`, icon: CalendarCheck, gradient: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/20', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
          { title: 'Avg Daily Revenue', value: `₹${(avgDaily / 1000).toFixed(1)}k`, sub: 'Per day average', icon: TrendingUp, gradient: 'from-purple-500/15 to-purple-600/5', border: 'border-purple-500/20', iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400' },
          { title: 'Active Now', value: overview?.activeBookings || 0, sub: 'Currently in progress', icon: Activity, gradient: 'from-accent-500/15 to-accent-600/5', border: 'border-accent-500/20', iconBg: 'bg-accent-500/15', iconColor: 'text-accent-400' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.title} variants={item} className={`glass-card p-5 bg-gradient-to-br ${stat.gradient} border ${stat.border}`}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={stat.iconColor} />
                </div>
                <ArrowUpRight size={16} className="text-emerald-400" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-sm text-surface-400 mt-0.5">{stat.sub}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Chart + Booking Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Bar Chart — 2 cols */}
        <motion.div variants={item} className="xl:col-span-2 glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-1">Revenue Trend</h3>
          <p className="text-sm text-surface-500 mb-5">Daily revenue for the selected period</p>

          {revenueData.length > 0 ? (
            <div className="flex items-end gap-[2px] h-52">
              {revenueData.slice(-Math.min(revenueData.length, 30)).map((d, i, arr) => {
                const maxVal = Math.max(...arr.map(x => x.revenue), 1)
                const height = (d.revenue / maxVal) * 100
                const isLast = i === arr.length - 1
                return (
                  <div key={d._id} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                    <span className="text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 whitespace-nowrap">
                      ₹{(d.revenue / 1000).toFixed(0)}k
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 2)}%` }}
                      transition={{ duration: 0.4, delay: i * 0.02 }}
                      className={`w-full rounded-sm ${
                        isLast
                          ? 'bg-gradient-to-t from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20'
                          : 'bg-surface-700/60 group-hover:bg-purple-500/40'
                      } transition-colors duration-300`}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-surface-500 text-sm">No data</div>
          )}
        </motion.div>

        {/* Booking Status Breakdown — 1 col */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-1">Booking Status</h3>
          <p className="text-sm text-surface-500 mb-5">Distribution by status</p>

          <div className="space-y-3">
            {(bookingData.byStatus || []).sort((a, b) => b.count - a.count).map((s) => {
              const pct = ((s.count / totalByStatus) * 100).toFixed(1)
              return (
                <div key={s._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[s._id] || 'bg-surface-500'}`} />
                      <span className="text-sm text-surface-300 capitalize">{s._id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{s.count}</span>
                      <span className="text-xs text-surface-500">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-800/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${statusColors[s._id] || 'bg-surface-500'}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Bookings Timeline + Top Services */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bookings per day */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-1">Bookings Timeline</h3>
          <p className="text-sm text-surface-500 mb-5">Daily bookings count</p>

          {(bookingData.byDay || []).length > 0 ? (
            <div className="flex items-end gap-[2px] h-40">
              {(bookingData.byDay || []).slice(-Math.min(bookingData.byDay.length, 30)).map((d, i, arr) => {
                const maxVal = Math.max(...arr.map(x => x.count), 1)
                const height = (d.count / maxVal) * 100
                return (
                  <div key={d._id} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                    <span className="text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-surface-400">
                      {d.count}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 2)}%` }}
                      transition={{ duration: 0.4, delay: i * 0.02 }}
                      className="w-full rounded-sm bg-blue-500/50 group-hover:bg-blue-400/60 transition-colors duration-300"
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-surface-500 text-sm">No data</div>
          )}
        </motion.div>

        {/* Top Services */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-1">Top Services</h3>
          <p className="text-sm text-surface-500 mb-5">Most popular service categories</p>

          <div className="space-y-3">
            {(bookingData.byService || []).slice(0, 8).map((s, i) => {
              const maxCount = (bookingData.byService || [])[0]?.count || 1
              const pct = (s.count / maxCount) * 100
              const colors = [
                'from-purple-500 to-purple-400',
                'from-blue-500 to-blue-400',
                'from-emerald-500 to-emerald-400',
                'from-amber-500 to-amber-400',
                'from-pink-500 to-pink-400',
                'from-cyan-500 to-cyan-400',
                'from-red-500 to-red-400',
                'from-indigo-500 to-indigo-400',
              ]
              return (
                <div key={s._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-surface-500 w-5">#{i + 1}</span>
                      <span className="text-sm text-surface-300">{s._id}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{s.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-800/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Platform Overview Cards */}
      {overview && (
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { label: 'Total Users', value: overview.totalUsers, icon: Users, color: 'text-blue-400' },
            { label: 'Electricians', value: overview.totalElectricians, icon: Wrench, color: 'text-purple-400' },
            { label: 'Total Bookings', value: overview.totalBookings, icon: CalendarCheck, color: 'text-emerald-400' },
            { label: 'Lifetime Revenue', value: `₹${(overview.totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-accent-400' },
            { label: 'Pending Approvals', value: overview.pendingApprovals, icon: Activity, color: 'text-amber-400' },
            { label: 'Active Bookings', value: overview.activeBookings, icon: TrendingUp, color: 'text-cyan-400' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="glass-card p-4 text-center">
                <Icon size={20} className={`${stat.color} mx-auto mb-2`} />
                <p className="text-lg font-display font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-surface-500 mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
