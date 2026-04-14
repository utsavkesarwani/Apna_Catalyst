import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, Menu, LogOut } from 'lucide-react'
import ElectricianSidebar from './ElectricianSidebar'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ElectricianLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'Electrician'
  const initial = displayName.charAt(0)

  const handleLogout = () => {
    logout()
    navigate('/electrician/login')
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ElectricianSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden z-40">
            <ElectricianSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen hidden lg:block"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-20 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-lg font-display font-semibold text-white">
                Welcome back, <span className="gradient-text">{displayName.split(' ')[0]}</span>
              </h2>
              <p className="text-sm text-surface-500">Here's your overview for today</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all duration-300">
              <Search size={20} />
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all duration-300">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface-950" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 ml-1 border-l border-surface-800/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white font-bold text-sm">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </motion.div>

      {/* Mobile Content Area (no margin animation) */}
      <div className="lg:hidden min-h-screen">
        <header className="sticky top-0 z-20 h-16 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all"
            >
              <Menu size={22} />
            </button>
            <span className="text-lg font-display font-bold">
              <span className="text-white">Apna</span>
              <span className="gradient-text ml-1">Electro</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface-950" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white font-bold text-sm">
              {initial}
            </div>
          </div>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
