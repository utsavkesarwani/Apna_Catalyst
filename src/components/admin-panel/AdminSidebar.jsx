import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Wrench, CalendarCheck, Settings,
  BarChart3, Zap, LogOut, ChevronLeft, ChevronRight,
  Globe, ShieldCheck, BookOpen
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const sidebarLinks = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
  { name: 'Users', path: '/superadmin/users', icon: Users },
  { name: 'Electricians', path: '/superadmin/electricians', icon: Wrench },
  { name: 'Bookings', path: '/superadmin/bookings', icon: CalendarCheck },
  { name: 'CMS / Content', path: '/superadmin/cms', icon: Globe },
  { name: 'Pages & Blog', path: '/superadmin/pages', icon: BookOpen },
  { name: 'Services', path: '/superadmin/services', icon: Settings },
  { name: 'Analytics', path: '/superadmin/analytics', icon: BarChart3 },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const displayName = user?.name || 'Super Admin'

  const handleLogout = () => {
    logout()
    navigate('/superadmin/login')
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
        <Link to="/superadmin" className="flex items-center gap-3 group overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
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
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-1">Admin</span>
                </span>
                <p className="text-[10px] text-surface-500 font-medium tracking-wider uppercase">Super Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Admin Profile */}
      <div className={`px-4 py-5 border-b border-surface-800/50 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            {displayName.charAt(0)}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={12} className="text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">Super Admin</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path ||
            (link.path !== '/superadmin' && location.pathname.startsWith(link.path))
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/40'
              } ${collapsed ? 'justify-center px-3' : ''}`}
              title={collapsed ? link.name : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeAdminSidebar"
                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-purple-400' : 'group-hover:text-white'}`} />
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
