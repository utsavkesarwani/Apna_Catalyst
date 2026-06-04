import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Loader2, Zap, Plus, Minus, ShoppingCart } from 'lucide-react'
import { getServiceBySlug, getSubcategoriesByService } from '../api/user.api'
import { serviceIcons } from '../data/services'
import { useCart } from '../context/CartContext.jsx'
import FloatingCart from '../components/ui/FloatingCart.jsx'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const { addItem, increment, decrement, getItemQuantity } = useCart()

  const [service, setService] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getServiceBySlug(slug)
        const svc = res.service
        setService(svc)

        // If subcategories are already populated on the service, use them
        if (svc.subcategories?.length > 0) {
          setSubcategories(svc.subcategories)
        } else if (svc._id || svc.id) {
          // Fetch subcategories separately
          try {
            const subRes = await getSubcategoriesByService(svc._id || svc.id)
            setSubcategories(subRes.subcategories || [])
          } catch {
            setSubcategories([])
          }
        }
      } catch {
        setService(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
          <p className="text-surface-400">Loading service...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center glass-card p-12">
          <Zap size={48} className="mx-auto text-surface-700 mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Service Not Found</h2>
          <p className="text-surface-500 mb-6">This service may have been removed or is temporarily unavailable.</p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-electric-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all"
          >
            <ArrowLeft size={18} /> Back to Services
          </Link>
        </div>
      </div>
    )
  }

  const IconComponent = serviceIcons[service.icon] || Zap

  return (
    <div className="min-h-screen bg-surface-950 pb-28">
      {/* Header */}
      <section className="relative py-16 md:py-24 overflow-hidden border-b border-surface-800/50">
        <div className="absolute inset-0 bg-hero-gradient opacity-30" />
        <div className="section-container relative z-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to All Services
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/15 to-electric-500/10 flex items-center justify-center shrink-0">
              {typeof service.icon === 'string' && service.icon.length <= 2 ? (
                <span className="text-3xl">{service.icon}</span>
              ) : (
                <IconComponent size={32} className="text-primary-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {service.name}
              </h1>
              <p className="text-surface-400 text-lg max-w-2xl">{service.description}</p>
              {service.basePrice > 0 && (
                <p className="mt-3 text-sm text-surface-500">
                  Starting from <span className="text-white font-semibold">₹{service.basePrice.toLocaleString()}</span>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subcategories */}
      <section className="py-12">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-display font-bold text-white mb-2">
              Available Services
            </h2>
            <p className="text-sm text-surface-500 mb-8">
              {subcategories.length} option{subcategories.length !== 1 ? 's' : ''} available — select what you need
            </p>
          </motion.div>

          {subcategories.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Zap size={48} className="mx-auto text-surface-700 mb-4" />
              <h3 className="text-lg font-display font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-surface-500">Detailed service options are being set up. Check back shortly!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subcategories.map((sub, index) => {
                const qty = getItemQuantity(sub._id)
                return (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="glass-card p-5 md:p-6 flex items-center gap-4 md:gap-6 group hover:border-primary-500/20 transition-all duration-300"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-display font-semibold text-white group-hover:text-primary-300 transition-colors">
                        {sub.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        {sub.duration && (
                          <span className="flex items-center gap-1.5 text-xs text-surface-400">
                            <Clock size={13} className="text-surface-500" />
                            {sub.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0 mr-2 md:mr-4">
                      <p className="text-lg md:text-xl font-display font-bold text-white">
                        ₹{sub.price?.toLocaleString()}
                      </p>
                    </div>

                    {/* Add / Quantity Toggle */}
                    <div className="shrink-0">
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(sub, service.name)}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-electric-500 text-white text-sm font-bold rounded-xl hover:shadow-glow-sm hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
                        >
                          <Plus size={16} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-0 rounded-xl border border-primary-500/30 bg-primary-500/5 overflow-hidden">
                          <button
                            onClick={() => decrement(sub._id)}
                            className="px-3 py-2.5 text-primary-400 hover:bg-primary-500/10 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-2.5 text-sm font-bold text-white min-w-[32px] text-center tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() => increment(sub._id)}
                            className="px-3 py-2.5 text-primary-400 hover:bg-primary-500/10 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart */}
      <FloatingCart />
    </div>
  )
}
