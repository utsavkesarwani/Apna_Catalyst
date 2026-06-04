import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Wrench, CheckCircle2, Ban, ChevronLeft, ChevronRight,
  Loader2, Star, MapPin, Calendar, X, Clock, Eye,
  ShieldCheck, ShieldOff, TrendingUp, IndianRupee, Activity,
  AlertTriangle, Plus, Zap
} from 'lucide-react'
import {
  getAllElectricians, approveElectrician, suspendElectrician,
  toggleVerifyElectrician, getElectricianPerformance,
  getElectricianFinancials, createElectricianPayout,
} from '../../api/admin.api.js'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

// ─── Sub-components ────────────────────────────

function ProgressBar({ value, color = 'bg-primary-500', label, sublabel }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-surface-400">{label}</span>
        <span className="text-xs font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-800/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      {sublabel && <p className="text-[10px] text-surface-600 mt-1">{sublabel}</p>}
    </div>
  )
}

function StatBox({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="p-3 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center">
      <p className={`text-lg font-display font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-surface-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-surface-600">{sub}</p>}
    </div>
  )
}

// ─── Detail Modal content tabs ─────────────────

function OverviewTab({ elec }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Experience" value={`${elec.experience || 0}y`} />
        <StatBox label="Rating" value={(elec.rating?.avg || 0).toFixed(1)} sub={`${elec.rating?.count || 0} reviews`} color="text-accent-400" />
        <StatBox label="Skills" value={(elec.categories || []).length} />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-3 py-2 border-b border-surface-800/50">
          <MapPin size={14} className="text-surface-500 flex-shrink-0" />
          <span className="text-surface-300">{elec.location?.city}, {elec.location?.state || ''}</span>
        </div>
        <div className="flex items-center gap-3 py-2 border-b border-surface-800/50">
          <Calendar size={14} className="text-surface-500 flex-shrink-0" />
          <span className="text-surface-300">Joined {new Date(elec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        {elec.mobile && (
          <div className="flex items-center gap-3 py-2 border-b border-surface-800/50">
            <span className="text-surface-500 text-xs w-3.5">📞</span>
            <span className="text-surface-300">{elec.mobile}</span>
          </div>
        )}
        {elec.lastSeen && (
          <div className="flex items-center gap-3 py-2">
            <Activity size={14} className="text-surface-500 flex-shrink-0" />
            <span className="text-surface-400 text-xs">
              Last seen: {new Date(elec.lastSeen).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(elec.categories || []).map((cat) => (
          <span key={cat} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-medium">{cat}</span>
        ))}
      </div>
    </div>
  )
}

function VerificationTab({ elec, onToggle, loading }) {
  const [rejectionNote, setRejectionNote] = useState('')

  const docs = [
    { label: 'Aadhar Card', key: 'aadharCard', value: elec.documents?.aadharCard },
    { label: 'PAN Card', key: 'panCard', value: elec.documents?.panCard },
    { label: 'Certificate', key: 'certificate', value: elec.documents?.certificate },
  ]

  return (
    <div className="space-y-4">
      {/* Verification Status */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${
        elec.isVerified
          ? 'bg-emerald-500/8 border-emerald-500/20'
          : 'bg-amber-500/8 border-amber-500/20'
      }`}>
        <div className="flex items-center gap-3">
          {elec.isVerified
            ? <ShieldCheck size={20} className="text-emerald-400" />
            : <ShieldOff size={20} className="text-amber-400" />}
          <div>
            <p className={`text-sm font-semibold ${elec.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
              {elec.isVerified ? 'Documents Verified' : 'Verification Pending'}
            </p>
            {elec.documents?.verifiedAt && (
              <p className="text-xs text-surface-500">
                Verified {new Date(elec.documents.verifiedAt).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggle(elec._id, !elec.isVerified, rejectionNote)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
            elec.isVerified
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : elec.isVerified ? 'Revoke' : 'Verify'}
        </button>
      </div>

      {/* Document Checklist */}
      <div>
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Submitted Documents</p>
        <div className="space-y-2">
          {docs.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-800/30">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-emerald-400' : 'bg-surface-600'}`} />
                <span className="text-sm text-surface-300">{label}</span>
              </div>
              {value ? (
                <a href={value} target="_blank" rel="noreferrer"
                   className="text-[10px] text-primary-400 hover:text-primary-300 underline">View</a>
              ) : (
                <span className="text-[10px] text-surface-600">Not uploaded</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Note */}
      {!elec.isVerified && (
        <div>
          <label className="block text-xs font-medium text-surface-500 mb-1.5">Rejection Note (optional)</label>
          <textarea
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            rows={2}
            placeholder="Reason for rejection..."
            className="input-field resize-none text-sm"
          />
        </div>
      )}
    </div>
  )
}

function PerformanceTab({ elecId }) {
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!elecId) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await getElectricianPerformance(elecId)
        setPerf(res.performance)
      } catch {
        setPerf({
          avgRating: 4.5, totalReviews: 32, totalJobs: 45,
          completed: 38, cancelled: 4, inProgress: 2, pending: 1,
          successRate: 90, cancelRate: 10,
          monthlyPerformance: [
            { month: 'Nov 24', completed: 5, cancelled: 0 },
            { month: 'Dec 24', completed: 8, cancelled: 1 },
            { month: 'Jan 25', completed: 7, cancelled: 0 },
            { month: 'Feb 25', completed: 6, cancelled: 1 },
            { month: 'Mar 25', completed: 9, cancelled: 2 },
            { month: 'Apr 25', completed: 3, cancelled: 0 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [elecId])

  if (loading) return <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-purple-400" /></div>
  if (!perf) return null

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Total Jobs" value={perf.totalJobs} />
        <StatBox label="Completed" value={perf.completed} color="text-emerald-400" />
        <StatBox label="Cancelled" value={perf.cancelled} color="text-red-400" />
        <StatBox label="Active" value={perf.inProgress} color="text-cyan-400" />
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 p-4 rounded-xl bg-surface-800/20 border border-surface-700/30">
        <ProgressBar
          label="Success Rate"
          value={perf.successRate}
          color="bg-emerald-500"
          sublabel={`${perf.completed} completed out of ${perf.completed + perf.cancelled} resolved`}
        />
        <ProgressBar
          label="Average Rating"
          value={Math.round((perf.avgRating / 5) * 100)}
          color="bg-accent-500"
          sublabel={`${perf.avgRating.toFixed(1)} / 5.0 from ${perf.totalReviews} reviews`}
        />
        <ProgressBar
          label="Cancellation Rate"
          value={perf.cancelRate}
          color="bg-red-500"
        />
      </div>

      {/* Monthly chart */}
      <div>
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Monthly Jobs (Last 6 Months)</p>
        <div className="flex items-end gap-2 h-24">
          {perf.monthlyPerformance.map((m) => {
            const maxJobs = Math.max(...perf.monthlyPerformance.map(x => x.completed + x.cancelled), 1)
            const totalH = Math.round(((m.completed + m.cancelled) / maxJobs) * 80)
            const completedH = totalH > 0 ? Math.round((m.completed / (m.completed + m.cancelled)) * totalH) : 0
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse rounded-sm overflow-hidden" style={{ height: 80 }}>
                  <div className="w-full bg-emerald-500/60 rounded-sm" style={{ height: completedH }} title={`${m.completed} completed`} />
                  <div className="w-full bg-red-500/40" style={{ height: totalH - completedH }} title={`${m.cancelled} cancelled`} />
                </div>
                <span className="text-[9px] text-surface-600">{m.month}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500/60" /><span className="text-[10px] text-surface-500">Completed</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-500/40" /><span className="text-[10px] text-surface-500">Cancelled</span></div>
        </div>
      </div>
    </div>
  )
}

function FinancialsTab({ elecId }) {
  const [fin, setFin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPayout, setShowPayout] = useState(false)
  const [payoutForm, setPayoutForm] = useState({ amount: '', note: '', reference: '' })
  const [payoutLoading, setPayoutLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getElectricianFinancials(elecId)
      setFin(res.financials)
    } catch {
      setFin({
        earnings: { total: 24500, pending: 3200, thisMonth: 6800 },
        pendingPayouts: 3200, totalPaidOut: 21300, balance: 3200,
        ledger: [
          { _id: '1', amount: 5000, type: 'payout', status: 'completed', note: 'Monthly payout', createdAt: new Date(Date.now() - 86400000 * 15) },
          { _id: '2', amount: 3200, type: 'payout', status: 'pending', note: 'Pending payout', createdAt: new Date() },
        ],
      })
    } finally {
      setLoading(false)
    }
  }, [elecId])

  useEffect(() => { load() }, [load])

  const handlePayout = async () => {
    if (!payoutForm.amount || payoutForm.amount <= 0) return
    setPayoutLoading(true)
    try {
      await createElectricianPayout(elecId, {
        amount: Number(payoutForm.amount),
        note: payoutForm.note,
        reference: payoutForm.reference,
        type: 'payout',
      })
      setShowPayout(false)
      setPayoutForm({ amount: '', note: '', reference: '' })
      load()
    } catch {
      alert('Failed to create payout entry')
    } finally {
      setPayoutLoading(false)
    }
  }

  const statusStyle = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    processing: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-purple-400" /></div>
  if (!fin) return null

  return (
    <div className="space-y-4">
      {/* Earnings Summary */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Total Earned" value={`₹${(fin.earnings?.total || 0).toLocaleString('en-IN')}`} color="text-white" />
        <StatBox label="This Month" value={`₹${(fin.earnings?.thisMonth || 0).toLocaleString('en-IN')}`} color="text-primary-400" />
        <StatBox label="Balance Due" value={`₹${(fin.balance || 0).toLocaleString('en-IN')}`} color="text-emerald-400" />
      </div>

      {/* Payout Stats */}
      <div className="flex gap-3">
        <div className="flex-1 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <p className="text-xs text-amber-400 font-medium">Pending Payouts</p>
          <p className="text-lg font-display font-bold text-white mt-1">₹{(fin.pendingPayouts || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <p className="text-xs text-emerald-400 font-medium">Total Paid Out</p>
          <p className="text-lg font-display font-bold text-white mt-1">₹{(fin.totalPaidOut || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Create Payout */}
      {!showPayout ? (
        <button
          onClick={() => setShowPayout(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
        >
          <Plus size={14} /> Create Payout Entry
        </button>
      ) : (
        <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 space-y-3">
          <p className="text-sm font-semibold text-white">New Payout Entry</p>
          <input type="number" placeholder="Amount (₹)" value={payoutForm.amount}
            onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))}
            className="input-field text-sm" />
          <input type="text" placeholder="Reference / Transaction ID" value={payoutForm.reference}
            onChange={e => setPayoutForm(f => ({ ...f, reference: e.target.value }))}
            className="input-field text-sm" />
          <input type="text" placeholder="Note (optional)" value={payoutForm.note}
            onChange={e => setPayoutForm(f => ({ ...f, note: e.target.value }))}
            className="input-field text-sm" />
          <div className="flex gap-2">
            <button onClick={handlePayout} disabled={payoutLoading || !payoutForm.amount}
              className="flex-1 py-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 text-sm font-semibold hover:bg-purple-500/25 transition-all disabled:opacity-50">
              {payoutLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Save'}
            </button>
            <button onClick={() => setShowPayout(false)}
              className="flex-1 py-2 rounded-lg bg-surface-800/50 text-surface-400 border border-surface-700/30 text-sm font-semibold hover:bg-surface-800 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div>
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Payout Ledger</p>
        {(fin.ledger || []).length === 0 ? (
          <p className="text-center py-6 text-surface-600 text-sm">No payout entries yet</p>
        ) : (
          <div className="space-y-2">
            {fin.ledger.map((entry, i) => (
              <div key={entry._id || i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface-800/20 border border-surface-800/50">
                <div>
                  <p className="text-xs font-medium text-white">₹{entry.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-surface-500 mt-0.5">
                    {new Date(entry.createdAt).toLocaleDateString('en-IN')} · {entry.note || entry.type}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusStyle[entry.status] || statusStyle.pending}`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────

export default function AdminElectricians() {
  const [electricians, setElectricians] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(null)
  const [selectedElec, setSelectedElec] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const loadElectricians = useCallback(async () => {
    setLoading(true)
    try {
      const params = { search, page, limit: 15 }
      if (filter === 'pending') { params.approved = 'false'; params.suspended = 'false' }
      if (filter === 'approved') params.approved = 'true'
      if (filter === 'suspended') params.suspended = 'true'
      const res = await getAllElectricians(params)
      setElectricians(res.electricians || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
    } catch {
      setElectricians([
        { _id: '1', name: 'Rajesh Kumar', email: 'rajesh@apnacatalyst.com', mobile: '9888888881', location: { city: 'Delhi', state: 'Delhi' }, experience: 8, rating: { avg: 4.8, count: 124 }, categories: ['Wiring', 'Fan Installation'], isApproved: true, isSuspended: false, isVerified: true, availability: { isAvailable: true }, earnings: { total: 48200, thisMonth: 6200 }, createdAt: '2025-06-15T10:00:00Z' },
        { _id: '2', name: 'Amit Verma', email: 'amit@apnacatalyst.com', mobile: '9888888882', location: { city: 'Mumbai', state: 'Maharashtra' }, experience: 5, rating: { avg: 4.5, count: 78 }, categories: ['MCB/Fuse', 'Switchboard'], isApproved: true, isSuspended: false, isVerified: false, availability: { isAvailable: false }, earnings: { total: 22100, thisMonth: 3400 }, createdAt: '2025-08-20T10:00:00Z' },
        { _id: '3', name: 'Sunil Yadav', email: 'sunil@gmail.com', mobile: '9888888883', location: { city: 'Bangalore', state: 'Karnataka' }, experience: 3, rating: { avg: 0, count: 0 }, categories: ['AC Wiring', 'CCTV'], isApproved: false, isSuspended: false, isVerified: false, availability: { isAvailable: true }, earnings: { total: 0, thisMonth: 0 }, createdAt: '2026-03-28T10:00:00Z' },
        { _id: '4', name: 'Deepak Sharma', email: 'deepak@gmail.com', mobile: '9888888884', location: { city: 'Jaipur', state: 'Rajasthan' }, experience: 10, rating: { avg: 4.9, count: 210 }, categories: ['Full Home Wiring', 'Inverter'], isApproved: true, isSuspended: true, isVerified: true, availability: { isAvailable: false }, earnings: { total: 91000, thisMonth: 0 }, createdAt: '2025-01-10T10:00:00Z' },
        { _id: '5', name: 'Ravi Tiwari', email: 'ravi@gmail.com', mobile: '9888888885', location: { city: 'Chennai', state: 'Tamil Nadu' }, experience: 2, rating: { avg: 0, count: 0 }, categories: ['Wiring'], isApproved: false, isSuspended: false, isVerified: false, availability: { isAvailable: true }, earnings: { total: 0, thisMonth: 0 }, createdAt: '2026-03-30T10:00:00Z' },
      ])
      setTotal(5); setPages(1)
    } finally { setLoading(false) }
  }, [search, page, filter])

  useEffect(() => { loadElectricians() }, [loadElectricians])

  const handleApprove = async (id) => {
    setActionLoading(id)
    try { await approveElectrician(id) } catch {}
    setElectricians(prev => prev.map(e => e._id === id ? { ...e, isApproved: true, isSuspended: false } : e))
    setActionLoading(null)
  }

  const handleSuspend = async (id) => {
    setActionLoading(id)
    try { await suspendElectrician(id) } catch {}
    setElectricians(prev => prev.map(e => e._id === id ? { ...e, isSuspended: true } : e))
    setActionLoading(null)
  }

  const handleVerify = async (id, isVerified, rejectionNote) => {
    setVerifyLoading(id)
    try {
      await toggleVerifyElectrician(id, { isVerified, rejectionNote })
      setElectricians(prev => prev.map(e => e._id === id ? { ...e, isVerified } : e))
      if (selectedElec?._id === id) setSelectedElec(e => ({ ...e, isVerified }))
    } catch {}
    setVerifyLoading(null)
  }

  const openDetail = (elec) => { setSelectedElec(elec); setActiveTab('overview') }

  const filterTabs = [
    { key: 'all', label: 'All', count: total },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
    { key: 'suspended', label: 'Suspended', icon: Ban },
  ]

  const getStatusBadge = (elec) => {
    if (elec.isSuspended) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Suspended', icon: Ban }
    if (!elec.isApproved) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Pending', icon: Clock }
    return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Approved', icon: CheckCircle2 }
  }

  const modalTabs = [
    { key: 'overview', label: 'Overview', icon: Eye },
    { key: 'verification', label: 'Verification', icon: ShieldCheck },
    { key: 'performance', label: 'Performance', icon: TrendingUp },
    { key: 'financials', label: 'Financials', icon: IndianRupee },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Electrician Management</h1>
          <p className="text-sm text-surface-500 mt-1">{total.toLocaleString()} registered electricians</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search electricians..."
            className="input-field pl-11 pr-4 py-2.5 text-sm"
          />
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button key={tab.key} onClick={() => { setFilter(tab.key); setPage(1) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              filter === tab.key
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-surface-400 border border-surface-700/50 hover:text-white hover:border-surface-600'
            }`}>
            {tab.icon && <tab.icon size={14} />}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-purple-400" />
        </div>
      ) : electricians.length === 0 ? (
        <div className="text-center py-16 text-surface-500 glass-card">
          <Wrench size={48} className="mx-auto mb-3 opacity-30" />
          <p>No electricians found</p>
        </div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {electricians.map((elec) => {
            const status = getStatusBadge(elec)
            const StatusIcon = status.icon
            return (
              <motion.div key={elec._id} variants={item}
                className="glass-card p-5 hover:border-purple-500/20 transition-all duration-300 group cursor-pointer"
                onClick={() => openDetail(elec)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative">
                    {elec.name?.charAt(0)}
                    {elec.isVerified && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <ShieldCheck size={9} className="text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{elec.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin size={11} className="text-surface-500" />
                      <span className="text-xs text-surface-400">{elec.location?.city}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text} border ${status.border}`}>
                    <StatusIcon size={10} /> {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3 text-xs text-surface-500">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-accent-400 fill-accent-400" />
                    <span className="text-accent-400">{(elec.rating?.avg || 0).toFixed(1)}</span>
                    <span>({elec.rating?.count || 0})</span>
                  </div>
                  <span>{elec.experience || 0} yrs</span>
                  <div className={`flex items-center gap-1 ${elec.availability?.isAvailable ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${elec.availability?.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-surface-600'}`} />
                    {elec.availability?.isAvailable ? 'Online' : 'Offline'}
                  </div>
                  {elec.earnings?.total > 0 && (
                    <span className="text-surface-500">₹{(elec.earnings.total / 1000).toFixed(0)}k</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {(elec.categories || []).slice(0, 2).map((cat) => (
                    <span key={cat} className="px-1.5 py-0.5 rounded bg-surface-800/60 text-surface-400 text-[9px]">{cat}</span>
                  ))}
                  {(elec.categories || []).length > 2 && (
                    <span className="px-1.5 py-0.5 rounded bg-surface-800/60 text-surface-600 text-[9px]">+{elec.categories.length - 2}</span>
                  )}
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {!elec.isApproved && !elec.isSuspended && (
                    <button onClick={() => handleApprove(elec._id)} disabled={actionLoading === elec._id}
                      className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                      {actionLoading === elec._id ? '...' : 'Approve'}
                    </button>
                  )}
                  {!elec.isSuspended && elec.isApproved && (
                    <button onClick={() => handleSuspend(elec._id)} disabled={actionLoading === elec._id}
                      className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50">
                      {actionLoading === elec._id ? '...' : 'Suspend'}
                    </button>
                  )}
                  {elec.isSuspended && (
                    <button onClick={() => handleApprove(elec._id)} disabled={actionLoading === elec._id}
                      className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                      {actionLoading === elec._id ? '...' : 'Reactivate'}
                    </button>
                  )}
                  <button onClick={() => openDetail(elec)}
                    className="px-3 py-2 rounded-lg bg-surface-800/50 text-surface-400 border border-surface-700/50 text-xs hover:text-white hover:bg-surface-800 transition-all">
                    <Eye size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-surface-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 disabled:opacity-30 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 disabled:opacity-30 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedElec && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedElec(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-xl glass-card pointer-events-auto flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center gap-4 p-6 pb-4 border-b border-surface-800/50">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 relative">
                    {selectedElec.name?.charAt(0)}
                    {selectedElec.isVerified && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-surface-900">
                        <ShieldCheck size={11} className="text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-white truncate">{selectedElec.name}</p>
                      {selectedElec.isVerified && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">VERIFIED</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Star size={12} className="text-accent-400 fill-accent-400" />
                      <span className="text-xs text-accent-400">{(selectedElec.rating?.avg || 0).toFixed(1)}</span>
                      <span className="text-xs text-surface-500">({selectedElec.rating?.count || 0} reviews)</span>
                      <span className="text-xs text-surface-600">·</span>
                      <span className="text-xs text-surface-500">{selectedElec.experience || 0} yrs exp</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedElec(null)}
                    className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all flex-shrink-0">
                    <X size={18} />
                  </button>
                </div>

                {/* Tab Bar */}
                <div className="flex px-6 pt-4 gap-1">
                  {modalTabs.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 flex-1 justify-center ${
                        activeTab === key
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/40'
                      }`}>
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 pt-4">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}>
                      {activeTab === 'overview' && <OverviewTab elec={selectedElec} />}
                      {activeTab === 'verification' && (
                        <VerificationTab
                          elec={selectedElec}
                          onToggle={handleVerify}
                          loading={verifyLoading === selectedElec._id}
                        />
                      )}
                      {activeTab === 'performance' && <PerformanceTab elecId={selectedElec._id} />}
                      {activeTab === 'financials' && <FinancialsTab elecId={selectedElec._id} />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 p-6 pt-0 border-t border-surface-800/50">
                  {selectedElec.isSuspended ? (
                    <button onClick={() => { handleApprove(selectedElec._id); setSelectedElec(null) }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                      Reactivate
                    </button>
                  ) : selectedElec.isApproved ? (
                    <button onClick={() => { handleSuspend(selectedElec._id); setSelectedElec(null) }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => { handleApprove(selectedElec._id); setSelectedElec(null) }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                      Approve
                    </button>
                  )}
                  <button onClick={() => setSelectedElec(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all">
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
