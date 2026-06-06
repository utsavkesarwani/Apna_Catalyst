import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Zap, ChevronRight, User, LogOut, ClipboardList, ShoppingCart, Calendar, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'
import { getLatestBooking } from '../../api/user.api'
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
  const { cart, totalItems, totalPrice, clearCart, removeItem } = useCart()
  const { config } = useSiteConfig()

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [latestBooking, setLatestBooking] = useState(null)

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
    setCartDrawerOpen(false)
  }, [location])

  // Fetch latest booking if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      getLatestBooking()
        .then(res => {
          if (res.booking && !['completed', 'cancelled', 'rejected'].includes(res.booking.status)) {
            setLatestBooking(res.booking)
          } else {
            setLatestBooking(null)
          }
        })
        .catch(() => setLatestBooking(null))
    } else {
      setLatestBooking(null)
    }
  }, [isAuthenticated, user?.role, location.pathname]) // Re-fetch on navigation

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

              {/* Cart / Booking Indicator */}
              {(totalItems > 0 || latestBooking) && (
                <div className="relative">
                  {latestBooking && totalItems === 0 ? (
                    // Active Booking Glowing Indicator
                    <Link to="/track/latest">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative p-2.5 rounded-xl text-primary-400 hover:text-white hover:bg-surface-800/50 transition-all duration-300"
                        title="Active Booking"
                      >
                        <div className="absolute inset-0 rounded-xl bg-primary-500/20 animate-pulse" />
                        <Calendar size={20} className="relative z-10" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface-950 z-20" />
                      </motion.button>
                    </Link>
                  ) : (
                    // Cart Indicator
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCartDrawerOpen(true)}
                      className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all duration-300 relative"
                    >
                      <ShoppingCart size={20} />
                      {totalItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-primary-500/20">
                          {totalItems}
                        </span>
                      )}
                    </motion.button>
                  )}
                </div>
              )}

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

      {/* Cart Side Drawer */}
      <AnimatePresence>
        {cartDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setCartDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-surface-900 border-l border-surface-800/50 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-surface-800/50 flex items-center justify-between bg-surface-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-electric-500/10 flex items-center justify-center">
                    <ShoppingCart size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-white">Your Cart</h2>
                    <p className="text-xs text-surface-400">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.subcategory._id} className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/50 hover:border-surface-600/50 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white mb-1">{item.subcategory.name}</h4>
                            <p className="text-xs text-surface-400 line-clamp-1">{item.parentServiceName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-sm font-bold text-primary-400 block mb-2">
                              ₹{(item.subcategory.price * item.quantity).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-xs text-surface-400 bg-surface-800 px-2 py-1 rounded-md">
                                Qty: {item.quantity}
                              </span>
                              <button
                                onClick={() => removeItem(item.subcategory._id)}
                                className="p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center pb-10">
                    <div className="w-20 h-20 rounded-full bg-surface-800/50 flex items-center justify-center mb-6">
                      <ShoppingCart size={32} className="text-surface-600" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-white mb-2">Cart is empty</h3>
                    <p className="text-sm text-surface-400 max-w-[240px]">
                      Looks like you haven't added any services yet.
                    </p>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false)
                        navigate('/services')
                      }}
                      className="mt-6 px-6 py-2.5 rounded-xl border border-surface-700/50 text-surface-300 hover:text-white hover:bg-surface-800/50 transition-all text-sm font-medium"
                    >
                      Browse Services
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-surface-800/50 bg-surface-900/95 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-surface-400 text-sm">Estimated Total</span>
                    <span className="text-xl font-bold text-white">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="px-4 py-3 rounded-xl border border-surface-700/50 text-surface-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false)
                        navigate('/booking', { state: { fromCart: true } })
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-electric-500 text-white font-bold rounded-xl hover:shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Resume Booking <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  )
}
