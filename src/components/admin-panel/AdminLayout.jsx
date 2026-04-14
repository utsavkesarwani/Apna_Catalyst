import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, Menu, LogOut, ShieldCheck } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'Admin'
  const initial = displayName.charAt(0)

  const handleLogout = () => {
    logout()
    navigate('/superadmin/login')
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
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
            <AdminSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content Area — Desktop */}
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
                Welcome, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{displayName.split(' ')[0]}</span>
              </h2>
              <p className="text-sm text-surface-500">Super Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all duration-300">
              <Search size={20} />
            </button>

            <button className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all duration-300">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-surface-950" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            <div className="flex items-center gap-3 pl-3 ml-1 border-l border-surface-800/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
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

      {/* Mobile Content Area */}
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
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-1">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-surface-950" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
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
