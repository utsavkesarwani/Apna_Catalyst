import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, Zap, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { services as mockServices, serviceIcons } from '../data/services'
import { getServices } from '../api/user.api'

export default function ServicesPage() {
  const [services, setServices] = useState(mockServices)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getServices()
        if (res.services?.length > 0) {
          setServices(
            res.services.map(s => {
              const mockMatch = mockServices.find(ms => ms.slug === s.slug)
              return {
                ...s,
                id: s._id || s.id,
                icon: s.icon || mockMatch?.icon || 'Zap',
                popular: s.popular ?? mockMatch?.popular ?? false,
              }
            })
          )
        }
      } catch {
        // Fallback to mock
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header Section */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b border-surface-800/50">
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="badge-electric text-xs mb-4 inline-block">Apna Catalyst Solutions</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Professional <span className="gradient-text">Electrical Services</span>
            </h1>
            <p className="text-lg text-surface-400 mb-10 text-balance">
              From emergency repairs to complex industrial installations, our certified 
              electricians offer a wide range of services to keep your home or office safe.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={20} />
              <input 
                type="text" 
                placeholder="Search for a specific service (e.g. Inverter, AC, Wiring)"
                className="input-field pl-12 pr-6 h-14"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="section-container">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
              <p className="text-surface-400">Loading catalog...</p>
            </div>
          ) : (
            <>
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredServices.map((service, index) => {
                    const IconComponent = serviceIcons[service.icon] || Zap
                    return (
                      <motion.div
                        key={service.id || service.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={`/services/${service.slug}`}
                          className="glass-card group p-8 h-full flex flex-col hover:border-primary-500/30 transition-all duration-500"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/10 to-electric-500/5 flex items-center justify-center group-hover:from-primary-500/20 group-hover:to-electric-500/10 transition-all duration-500">
                              <IconComponent size={28} className="text-primary-400 group-hover:text-electric-400" />
                            </div>
                            {service.popular && (
                              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20 shadow-glow-xs">
                                Popular
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-primary-300 transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-surface-400 text-sm leading-relaxed mb-6 flex-1">
                            {service.description}
                          </p>
                          <div className="pt-6 border-t border-surface-800/50 flex items-center justify-between group-hover:border-primary-500/20 transition-colors">
                            <span className="text-xs font-semibold text-surface-500 flex items-center gap-1.5 uppercase tracking-wider">
                              Starts from <span className="text-white">₹{service.basePrice || 299}</span>
                            </span>
                            <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-surface-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                              <ArrowRight size={16} />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-20 text-center glass-card p-12">
                  <Search size={48} className="mx-auto text-surface-700 mb-4" />
                  <h3 className="text-xl font-display font-bold text-white mb-2">No Service Found</h3>
                  <p className="text-surface-500 max-w-sm mx-auto">We couldn't find any service matching "{searchTerm}". Please try a different keyword.</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-6 text-primary-400 hover:text-white font-medium underline underline-offset-4"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-surface-900/50 relative overflow-hidden">
        <div className="section-container">
          <div className="glass-card-light p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                Not sure which service <span className="gradient-text">you need?</span>
              </h2>
              <p className="text-surface-400 mb-8">
                Request a general visit for ₹299. Our expert will diagnose the problem and give you a transparent quote before starting any work.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  'Verified Professionals',
                  'Upfront Pricing',
                  'Same Day Availability',
                  'Service Guarantee'
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-surface-200">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
              <Link to="/booking?service=general-visit">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-electric-500 text-white font-bold shadow-glow-sm hover:shadow-glow-md transition-all duration-300 flex items-center gap-3 group">
                  <ShieldCheck size={20} />
                  Book General Visit
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-primary-500/20 blur-3xl absolute inset-0" />
                <Zap size={160} className="text-primary-500/20 relative animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
