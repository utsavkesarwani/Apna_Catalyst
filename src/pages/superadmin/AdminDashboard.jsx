import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users, Wrench, CalendarCheck, IndianRupee, TrendingUp,
  ArrowUpRight, ArrowDownRight, ChevronRight, Clock,
  AlertCircle, CheckCircle2, Loader2, ShieldCheck, Activity
} from 'lucide-react'
import { getAnalyticsOverview, getRevenueAnalytics, getAllBookings } from '../../api/admin.api.js'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const statusStyles = {
  'pending':     { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Pending' },
  'confirmed':   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Confirmed' },
  'assigned':    { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', label: 'Assigned' },
  'in-progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'In Progress' },
  'completed':   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Completed' },
  'cancelled':   { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Cancelled' },
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [overviewRes, revenueRes, bookingsRes] = await Promise.all([
        getAnalyticsOverview(),
        getRevenueAnalytics(30),
        getAllBookings({ limit: 5 }),
      ])
      setAnalytics(overviewRes.analytics || {})
      setRevenueData(revenueRes.data || [])
      setRecentBookings(bookingsRes.bookings || [])
    } catch (err) {
      console.error('Failed to load admin dashboard:', err)
      // Fallback mock data for UI development
      setAnalytics({
        totalUsers: 1247,
        totalElectricians: 86,
        totalBookings: 3421,
        totalRevenue: 2847500,
        pendingApprovals: 12,
        activeBookings: 34,
      })
      setRevenueData([
        { _id: '2026-03-05', revenue: 45000, count: 12 },
        { _id: '2026-03-06', revenue: 52000, count: 15 },
        { _id: '2026-03-07', revenue: 38000, count: 10 },
        { _id: '2026-03-08', revenue: 67000, count: 18 },
        { _id: '2026-03-09', revenue: 71000, count: 20 },
        { _id: '2026-03-10', revenue: 43000, count: 11 },
        { _id: '2026-03-11', revenue: 89000, count: 25 },
        { _id: '2026-03-12', revenue: 56000, count: 14 },
        { _id: '2026-03-13', revenue: 78000, count: 22 },
        { _id: '2026-03-14', revenue: 92000, count: 28 },
      ])
      setRecentBookings([
        { _id: '1', service: 'Fan Installation', status: 'pending', user: { name: 'Rahul Sharma' }, electrician: { name: 'Rajesh Kumar' }, payment: { amount: 500 }, createdAt: new Date().toISOString() },
        { _id: '2', service: 'Switchboard Repair', status: 'in-progress', user: { name: 'Priya Singh' }, electrician: { name: 'Amit Verma' }, payment: { amount: 800 }, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: '3', service: 'MCB/Fuse Box', status: 'confirmed', user: { name: 'Vikash Gupta' }, electrician: { name: 'Sunil Yadav' }, payment: { amount: 1200 }, createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: '4', service: 'AC Wiring', status: 'completed', user: { name: 'Neha Patel' }, electrician: { name: 'Ravi Tiwari' }, payment: { amount: 2500 }, createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '5', service: 'Full Home Wiring', status: 'assigned', user: { name: 'Arjun Mehra' }, electrician: { name: 'Deepak Sharma' }, payment: { amount: 15000 }, createdAt: new Date(Date.now() - 172800000).toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const statCards = analytics ? [
    {
      title: 'Total Users',
      value: (analytics.totalUsers || 0).toLocaleString(),
      change: '+12% this month',
      trend: 'up',
      icon: Users,
      gradient: 'from-blue-500/15 to-blue-600/5',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      link: '/superadmin/users',
    },
    {
      title: 'Electricians',
      value: (analytics.totalElectricians || 0).toLocaleString(),
      change: `${analytics.pendingApprovals || 0} pending approval`,
      trend: 'up',
      icon: Wrench,
      gradient: 'from-purple-500/15 to-purple-600/5',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/15',
      iconColor: 'text-purple-400',
      link: '/superadmin/electricians',
    },
    {
      title: 'Total Bookings',
      value: (analytics.totalBookings || 0).toLocaleString(),
      change: `${analytics.activeBookings || 0} active`,
      trend: 'up',
      icon: CalendarCheck,
      gradient: 'from-emerald-500/15 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      link: '/superadmin/bookings',
    },
    {
      title: 'Total Revenue',
      value: `₹${((analytics.totalRevenue || 0) / 100000).toFixed(1)}L`,
      change: 'All time revenue',
      trend: 'up',
      icon: IndianRupee,
      gradient: 'from-accent-500/15 to-accent-600/5',
      border: 'border-accent-500/20',
      iconBg: 'bg-accent-500/15',
      iconColor: 'text-accent-400',
      link: '/superadmin/analytics',
    },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} to={stat.link}>
              <motion.div
                variants={item}
                className={`glass-card p-5 bg-gradient-to-br ${stat.gradient} border ${stat.border} hover:shadow-lg transition-all duration-300 group cursor-pointer`}
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
            </Link>
          )
        })}
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart — 2 cols */}
        <motion.div variants={item} className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Revenue Overview</h3>
              <p className="text-sm text-surface-500 mt-0.5">Last 30 days</p>
            </div>
            <Link
              to="/superadmin/analytics"
              className="flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Details <ChevronRight size={16} />
            </Link>
          </div>

          {revenueData.length > 0 ? (
            <div className="flex items-end gap-1.5 h-48">
              {revenueData.slice(-14).map((d, i, arr) => {
                const maxVal = Math.max(...arr.map(x => x.revenue), 1)
                const height = (d.revenue / maxVal) * 100
                const isLast = i === arr.length - 1
                return (
                  <div key={d._id} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className={`text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isLast ? 'text-purple-400' : 'text-surface-400'}`}>
                      ₹{(d.revenue / 1000).toFixed(0)}k
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 3)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={`w-full rounded-lg ${
                        isLast
                          ? 'bg-gradient-to-t from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20'
                          : 'bg-surface-700/60 group-hover:bg-surface-600/60'
                      } transition-colors duration-300`}
                    />
                    <span className="text-[9px] text-surface-500 font-medium">
                      {d._id.split('-')[2]}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-surface-500 text-sm">
              No revenue data yet
            </div>
          )}
        </motion.div>

        {/* Quick Actions — 1 col */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending Approvals', count: analytics?.pendingApprovals || 0, icon: ShieldCheck, color: 'purple', link: '/superadmin/electricians' },
              { label: 'Active Bookings', count: analytics?.activeBookings || 0, icon: Activity, color: 'blue', link: '/superadmin/bookings' },
              { label: 'Manage Services', count: null, icon: TrendingUp, color: 'emerald', link: '/superadmin/services' },
              { label: 'Site Settings', count: null, icon: AlertCircle, color: 'amber', link: '/superadmin/cms' },
            ].map((action) => {
              const Icon = action.icon
              const colorMap = {
                purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', hover: 'hover:border-purple-500/40' },
                blue:   { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', hover: 'hover:border-blue-500/40' },
                emerald:{ bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/40' },
                amber:  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', hover: 'hover:border-amber-500/40' },
              }
              const c = colorMap[action.color]
              return (
                <Link
                  key={action.label}
                  to={action.link}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${c.border} ${c.hover} transition-all duration-300 group`}
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={c.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{action.label}</p>
                  </div>
                  {action.count !== null && (
                    <span className={`text-lg font-display font-bold ${c.text}`}>
                      {action.count}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-surface-600 group-hover:text-surface-400 transition-colors" />
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Recent Bookings</h3>
            <p className="text-sm text-surface-500 mt-0.5">Latest platform activity</p>
          </div>
          <Link
            to="/superadmin/bookings"
            className="flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800/50">
                <th className="text-left text-surface-500 font-medium pb-3 pr-4">Service</th>
                <th className="text-left text-surface-500 font-medium pb-3 pr-4">Customer</th>
                <th className="text-left text-surface-500 font-medium pb-3 pr-4">Electrician</th>
                <th className="text-left text-surface-500 font-medium pb-3 pr-4">Amount</th>
                <th className="text-left text-surface-500 font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-surface-500 font-medium pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => {
                const style = statusStyles[booking.status] || statusStyles['pending']
                return (
                  <tr key={booking._id} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                    <td className="py-3.5 pr-4">
                      <span className="text-white font-medium">{booking.service}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-surface-300">{booking.user?.name || 'N/A'}</td>
                    <td className="py-3.5 pr-4 text-surface-300">{booking.electrician?.name || 'Unassigned'}</td>
                    <td className="py-3.5 pr-4 text-surface-300">₹{(booking.payment?.amount || 0).toLocaleString()}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${style.bg} ${style.text} border ${style.border}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="py-3.5 text-surface-500 text-xs">
                      {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
