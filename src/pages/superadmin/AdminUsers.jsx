import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Users, Ban, CheckCircle2, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Mail, Phone, MapPin, Calendar, X, Shield
} from 'lucide-react'
import { getAllUsers, toggleBanUser } from '../../api/admin.api.js'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllUsers({ search, page, limit: 15 })
      setUsers(res.users || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
    } catch {
      // Fallback mock data
      setUsers([
        { _id: '1', name: 'Rahul Sharma', email: 'rahul@gmail.com', mobile: '9876543210', location: { city: 'Delhi', state: 'Delhi' }, isBanned: false, createdAt: '2026-01-15T10:00:00Z' },
        { _id: '2', name: 'Priya Singh', email: 'priya@gmail.com', mobile: '9876543211', location: { city: 'Mumbai', state: 'Maharashtra' }, isBanned: false, createdAt: '2026-02-10T10:00:00Z' },
        { _id: '3', name: 'Vikash Gupta', email: 'vikash@gmail.com', mobile: '9876543212', location: { city: 'Bangalore', state: 'Karnataka' }, isBanned: true, createdAt: '2026-02-20T10:00:00Z' },
        { _id: '4', name: 'Neha Patel', email: 'neha@gmail.com', mobile: '9876543213', location: { city: 'Ahmedabad', state: 'Gujarat' }, isBanned: false, createdAt: '2026-03-01T10:00:00Z' },
        { _id: '5', name: 'Arjun Mehra', email: 'arjun@gmail.com', mobile: '9876543214', location: { city: 'Pune', state: 'Maharashtra' }, isBanned: false, createdAt: '2026-03-10T10:00:00Z' },
        { _id: '6', name: 'Anita Kumari', email: 'anita@gmail.com', mobile: '9876543215', location: { city: 'Jaipur', state: 'Rajasthan' }, isBanned: false, createdAt: '2026-03-15T10:00:00Z' },
      ])
      setTotal(6)
      setPages(1)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleBanToggle = async (userId) => {
    setActionLoading(userId)
    try {
      const res = await toggleBanUser(userId)
      setUsers(prev =>
        prev.map(u => u._id === userId ? { ...u, isBanned: res.isBanned } : u)
      )
    } catch {
      // Toggle locally for demo
      setUsers(prev =>
        prev.map(u => u._id === userId ? { ...u, isBanned: !u.isBanned } : u)
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">User Management</h1>
          <p className="text-sm text-surface-500 mt-1">{total.toLocaleString()} registered users</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or mobile..."
            className="input-field pl-11 pr-4 py-2.5 text-sm"
          />
        </form>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-purple-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-surface-500">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800/50 bg-surface-800/20">
                  <th className="text-left text-surface-500 font-medium p-4">User</th>
                  <th className="text-left text-surface-500 font-medium p-4">Contact</th>
                  <th className="text-left text-surface-500 font-medium p-4">Location</th>
                  <th className="text-left text-surface-500 font-medium p-4">Joined</th>
                  <th className="text-left text-surface-500 font-medium p-4">Status</th>
                  <th className="text-right text-surface-500 font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-surface-300 text-xs">
                          <Mail size={12} /> {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-surface-400 text-xs">
                          <Phone size={12} /> {user.mobile || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-surface-300 text-xs">
                        <MapPin size={12} />
                        {user.location?.city || 'N/A'}{user.location?.state ? `, ${user.location.state}` : ''}
                      </div>
                    </td>
                    <td className="p-4 text-surface-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <Ban size={11} /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleBanToggle(user._id)}
                        disabled={actionLoading === user._id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                          user.isBanned
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {actionLoading === user._id ? 'Processing...' : user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-800/50">
            <p className="text-xs text-surface-500">Page {page} of {pages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card p-6 z-50"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-semibold text-white">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{selectedUser.name}</p>
                  <p className="text-sm text-surface-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-surface-500" />
                  <span className="text-surface-300">{selectedUser.mobile || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-surface-500" />
                  <span className="text-surface-300">
                    {selectedUser.location?.city || 'N/A'}{selectedUser.location?.state ? `, ${selectedUser.location.state}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-surface-500" />
                  <span className="text-surface-300">Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield size={16} className="text-surface-500" />
                  <span className={selectedUser.isBanned ? 'text-red-400' : 'text-emerald-400'}>
                    {selectedUser.isBanned ? 'Banned' : 'Active'}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { handleBanToggle(selectedUser._id); setSelectedUser(null) }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedUser.isBanned
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                  }`}
                >
                  {selectedUser.isBanned ? 'Unban User' : 'Ban User'}
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:bg-surface-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
