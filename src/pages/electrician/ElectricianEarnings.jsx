import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  IndianRupee, TrendingUp, ArrowUpRight, ArrowDownRight,
  Wallet, Calendar, Download, CreditCard,
  ArrowDown, ArrowUp, Banknote, PiggyBank, Loader2
} from 'lucide-react'
import { getEarnings } from '../../api/electrician.api.js'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ElectricianEarnings() {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    setLoading(true)
    try {
      const response = await getEarnings()
      setEarnings(response.earnings)
    } catch (err) {
      console.error('Failed to load earnings:', err)
      // Fallback so the page renders instead of spinning forever
      setEarnings({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        thisWeek: 0,
        pending: 0,
        avgPerJob: 0,
        monthlyBreakdown: [],
        recentTransactions: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !earnings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  const overviewCards = [
    {
      title: 'Total Earned',
      value: earnings.total || 0,
      icon: Wallet,
      gradient: 'from-primary-500/15 to-electric-500/5',
      border: 'border-primary-500/20',
      iconBg: 'bg-primary-500/15',
      iconColor: 'text-primary-400',
      prefix: '₹',
    },
    {
      title: 'This Month',
      value: earnings.thisMonth || 0,
      change: earnings.lastMonth ? `${earnings.thisMonth >= earnings.lastMonth ? '+' : ''}${Math.round(((earnings.thisMonth - earnings.lastMonth) / (earnings.lastMonth || 1)) * 100)}%` : '',
      trend: (earnings.thisMonth || 0) >= (earnings.lastMonth || 0) ? 'up' : 'down',
      icon: TrendingUp,
      gradient: 'from-emerald-500/15 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      prefix: '₹',
    },
    {
      title: 'This Week',
      value: earnings.thisWeek || 0,
      icon: Calendar,
      gradient: 'from-electric-500/15 to-electric-600/5',
      border: 'border-electric-500/20',
      iconBg: 'bg-electric-500/15',
      iconColor: 'text-electric-400',
      prefix: '₹',
    },
    {
      title: 'Pending Payout',
      value: earnings.pending || 0,
      icon: PiggyBank,
      gradient: 'from-accent-500/15 to-accent-600/5',
      border: 'border-accent-500/20',
      iconBg: 'bg-accent-500/15',
      iconColor: 'text-accent-400',
      prefix: '₹',
    },
  ]

  const filteredTransactions = filter === 'all'
    ? (earnings.recentTransactions || [])
    : (earnings.recentTransactions || []).filter(t => t.type === filter)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Earnings</h1>
          <p className="text-sm text-surface-500 mt-1">Track your income and payouts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800/40 border border-surface-700/30 text-surface-300 text-sm font-medium hover:bg-surface-700/40 transition-all">
          <Download size={16} /> Export Report
        </button>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {overviewCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              variants={item}
              className={`glass-card p-5 bg-gradient-to-br ${card.gradient} border ${card.border} hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                {card.trend && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    card.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {card.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {card.change}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-display font-bold text-white">
                  {card.prefix}{card.value.toLocaleString()}
                </p>
                <p className="text-sm text-surface-400 mt-0.5">{card.title}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-5">Monthly Earnings</h3>
          {earnings.monthlyBreakdown?.length > 0 ? (
            <div className="flex items-end gap-3 h-52">
              {earnings.monthlyBreakdown.map((m, i) => {
                const maxVal = Math.max(...earnings.monthlyBreakdown.map(d => d.earned), 1)
                const height = (m.earned / maxVal) * 100
                const isLast = i === earnings.monthlyBreakdown.length - 1
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className={`text-xs font-semibold ${isLast ? 'text-primary-400' : 'text-surface-300'}`}>
                        ₹{(m.earned / 1000).toFixed(1)}k
                      </p>
                      <p className="text-[10px] text-surface-500">{m.jobs} jobs</p>
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 2)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      className={`w-full rounded-xl transition-colors duration-300 ${
                        isLast
                          ? 'bg-gradient-to-t from-primary-500 to-electric-500 shadow-glow-sm'
                          : 'bg-surface-700/50 group-hover:bg-surface-600/60'
                      }`}
                    />
                    <span className="text-[10px] text-surface-500 font-medium">
                      {m.month.split(' ')[0]?.slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-surface-500 text-sm">
              No earnings data yet
            </div>
          )}
        </motion.div>

        {/* Earning Breakdown */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-5">Breakdown</h3>

          <div className="space-y-6">
            {/* Visual Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500/20 to-electric-500/10 border-4 border-primary-500/30 flex items-center justify-center mb-3">
                  <IndianRupee size={24} className="text-primary-400" />
                </div>
                <p className="text-xl font-display font-bold text-white">₹{(earnings.avgPerJob || 0).toLocaleString()}</p>
                <p className="text-xs text-surface-500 mt-0.5">Avg. per Job</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent-500/20 to-accent-600/10 border-4 border-accent-500/30 flex items-center justify-center mb-3">
                  <Banknote size={24} className="text-accent-400" />
                </div>
                <p className="text-xl font-display font-bold text-white">₹{(earnings.lastMonth || 0).toLocaleString()}</p>
                <p className="text-xs text-surface-500 mt-0.5">Last Month</p>
              </div>
            </div>

            {/* Comparison */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-600/0 border border-emerald-500/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Month over Month</p>
                  <p className="text-lg font-display font-bold text-white mt-1">
                    {(earnings.thisMonth || 0) >= (earnings.lastMonth || 0) ? '+' : ''}
                    ₹{Math.abs((earnings.thisMonth || 0) - (earnings.lastMonth || 0)).toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                  (earnings.thisMonth || 0) >= (earnings.lastMonth || 0)
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {(earnings.thisMonth || 0) >= (earnings.lastMonth || 0)
                    ? <><ArrowUpRight size={16} /> Growing</>
                    : <><ArrowDownRight size={16} /> Declining</>
                  }
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-display font-semibold text-white">Transaction History</h3>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-800/40 border border-surface-700/30">
            {[
              { id: 'all', label: 'All' },
              { id: 'credit', label: 'Credits' },
              { id: 'payout', label: 'Payouts' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f.id
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-surface-500">
            <Wallet size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/20 border border-surface-700/20 hover:bg-surface-800/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  txn.type === 'credit'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {txn.type === 'credit' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{txn.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-surface-500">{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="text-xs text-surface-600">•</span>
                    <span className="text-xs text-surface-500">{txn.id}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${
                    txn.type === 'credit' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    txn.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
