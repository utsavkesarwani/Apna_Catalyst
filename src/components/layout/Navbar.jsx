import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Zap, ChevronRight, User, LogOut, ClipboardList } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'
import Button from '../ui/Button'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Electricians', path: '/electricians' },
  { name: 'Home Wiring', path: '/home-wiring' },
  { name: 'Join as Electrician', path: '/join' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { config } = useSiteConfig()

  // Split site name for branding
  const siteName = config.site_name || 'Apna Catalyst'
  const nameParts = siteName.includes(' ') ? [siteName.split(' ')[0], siteName.split(' ').slice(1).join(' ')] : [siteName, '']

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setUserMenuOpen(false)
  }, [location])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handleClick = () => setUserMenuOpen(false)
    setTimeout(() => window.addEventListener('click', handleClick), 0)
    return () => window.removeEventListener('click', handleClick)
  }, [userMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 shadow-lg shadow-black/10'
            : 'bg-transparent'
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center p-0.5">
                <img src="/apna_catalyst_logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-display font-bold">
                <span className="text-white">{nameParts[0]}</span>
                {nameParts[1] && <span className="gradient-text ml-1">{nameParts[1]}</span>}
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'text-primary-400'
                      : 'text-surface-400 hover:text-white hover:bg-surface-800/40'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-500 to-electric-500 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all duration-300"
              >
                <Search size={20} />
              </motion.button>

              {/* Book Now CTA */}
              <Link to="/booking" className="hidden sm:block">
                <Button variant="primary" size="sm" icon={Zap}>
                  Book Now
                </Button>
              </Link>

              {/* Auth: Show user menu or login */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen) }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800/50 border border-surface-700/30 hover:border-primary-500/30 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center">
                      <span className="text-xs font-display font-bold text-primary-300">{userInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-surface-300 max-w-[80px] truncate">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface-900/95 backdrop-blur-xl border border-surface-700/50 shadow-xl shadow-black/20 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-surface-800/50">
                          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                          <p className="text-xs text-surface-500 truncate">{user?.email || user?.mobile}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/track/latest"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800/50 hover:text-white transition-colors"
                          >
                            <ClipboardList size={16} />
                            My Bookings
                          </Link>
                          <Link
                            to={user?.role === 'electrician' ? '/electrician/profile' : '/profile'}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800/50 hover:text-white transition-colors"
                          >
                            <User size={16} />
                            My Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/auth" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-surface-800/50"
            >
              <div className="section-container py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    type="text"
                    placeholder="Search electricians, services, or locations..."
                    className="input-field pl-12 pr-4"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        navigate(`/electricians?search=${encodeURIComponent(e.target.value)}`)
                        setSearchOpen(false)
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 max-w-2xl mx-auto mt-3">
                  {['By Location', 'By Rating', 'By Service'].map((chip) => (
                    <button
                      key={chip}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface-800/60 text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 border border-surface-700/50 hover:border-primary-500/30 transition-all duration-300"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-surface-900/95 backdrop-blur-xl border-l border-surface-800/50 z-50 lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-display font-bold gradient-text">Menu</span>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-surface-800/50 text-surface-400">
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile User Info */}
                {isAuthenticated && (
                  <div className="mb-6 p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center">
                        <span className="text-sm font-display font-bold text-primary-300">{userInitials}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{user?.name || 'User'}</p>
                        <p className="text-xs text-surface-500">{user?.email || user?.mobile}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === link.path
                          ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                          : 'text-surface-300 hover:bg-surface-800/50 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">{link.name}</span>
                      <ChevronRight size={16} className="opacity-50" />
                    </Link>
                  ))}
                </div>
                <div className="mt-8 space-y-3">
                  <Link to="/booking" className="block">
                    <Button variant="primary" size="md" icon={Zap} className="w-full">
                      Book Now
                    </Button>
                  </Link>
                  {isAuthenticated ? (
                    <Button variant="secondary" size="md" icon={LogOut} className="w-full" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  ) : (
                    <Link to="/auth" className="block">
                      <Button variant="secondary" size="md" className="w-full">
                        Login / Sign Up
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  )
}
