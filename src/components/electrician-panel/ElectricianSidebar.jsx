import { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, User, CalendarCheck, Wallet, Star,
  Zap, LogOut, ChevronLeft, ChevronRight,
  ToggleLeft, ToggleRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateAvailability } from '../../api/electrician.api.js'

const sidebarLinks = [
  { name: 'Dashboard', path: '/electrician', icon: LayoutDashboard },
  { name: 'My Profile', path: '/electrician/profile', icon: User },
  { name: 'Bookings', path: '/electrician/bookings', icon: CalendarCheck },
  { name: 'Earnings', path: '/electrician/earnings', icon: Wallet },
  { name: 'Reviews', path: '/electrician/reviews', icon: Star },
]

export default function ElectricianSidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()

  const [isAvailable, setIsAvailable] = useState(user?.availability?.isAvailable ?? true)
  const [toggling, setToggling] = useState(false)

  const displayName = user?.name || 'Electrician'
  const rating = user?.rating?.avg || 0
  const reviewCount = user?.rating?.count || 0

  const handleAvailabilityToggle = useCallback(async () => {
    const newState = !isAvailable
    setIsAvailable(newState)
    setToggling(true)
    try {
      await updateAvailability({ isAvailable: newState })
      updateUser({ availability: { isAvailable: newState } })
    } catch {
      // Revert on failure
      setIsAvailable(!newState)
    } finally {
      setToggling(false)
    }
  }, [isAvailable, updateUser])

  const handleLogout = () => {
    logout()
    navigate('/electrician/login')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 bottom-0 z-40 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800/50 flex flex-col"
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-5 border-b border-surface-800/50">
        <Link to="/electrician" className="flex items-center gap-3 group overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
              <Zap size={22} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-electric-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-lg font-display font-bold">
                  <span className="text-white">Apna</span>
                  <span className="gradient-text ml-1">Electro</span>
                </span>
                <p className="text-[10px] text-surface-500 font-medium tracking-wider uppercase">Electrician Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Profile Summary */}
      <div className={`px-4 py-5 border-b border-surface-800/50 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white font-bold text-sm">
            {displayName.charAt(0)}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star size={12} className="text-accent-400 fill-accent-400" />
                <span className="text-xs text-accent-400 font-medium">{rating}</span>
                <span className="text-xs text-surface-500">({reviewCount})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability Toggle */}
      <div className={`px-4 py-4 border-b border-surface-800/50 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={handleAvailabilityToggle}
            disabled={toggling}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isAvailable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}
            title={isAvailable ? 'Available' : 'Unavailable'}
          >
            <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          </button>
        ) : (
          <button
            onClick={handleAvailabilityToggle}
            disabled={toggling}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-60 ${
              isAvailable
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                {toggling ? 'Updating...' : isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            {isAvailable ? (
              <ToggleRight size={24} className="text-emerald-400" />
            ) : (
              <ToggleLeft size={24} className="text-red-400" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/40'
              } ${collapsed ? 'justify-center px-3' : ''}`}
              title={collapsed ? link.name : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-primary-500 to-electric-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary-400' : 'group-hover:text-white'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {link.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-surface-800/50 space-y-1">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 ${collapsed ? 'justify-center px-3' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-all z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  )
}
