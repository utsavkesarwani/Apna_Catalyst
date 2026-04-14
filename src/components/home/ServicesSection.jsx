import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { services as mockServices, serviceIcons } from '../../data/services'
import { getServices } from '../../api/user.api'

export default function ServicesSection() {
  const [services, setServices] = useState(mockServices)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await getServices()
        if (!cancelled && res.services?.length > 0) {
          // Merge API data with local icon mapping
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
        // Keep mock data
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section id="services" className="py-20 md:py-28 relative">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="badge-electric text-xs mb-4 inline-block">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Every Electrical Problem,{' '}
            <span className="gradient-text">One Solution</span>
          </h2>
          <p className="text-surface-400 max-w-xl mx-auto">
            From simple repairs to complete installations — we've got certified experts for every electrical need
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {services.map((service, index) => {
            const IconComponent = serviceIcons[service.icon]
            return (
              <motion.div
                key={service.id || service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={`/electricians?service=${service.slug}`}
                  className="glass-card p-5 md:p-6 block group hover:border-primary-500/30 hover:shadow-glow-sm transition-all duration-500 h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-electric-500/10 flex items-center justify-center mb-4 group-hover:from-primary-500/30 group-hover:to-electric-500/20 transition-all duration-500">
                    {IconComponent && <IconComponent size={24} className="text-primary-400 group-hover:text-electric-400 transition-colors duration-300" />}
                  </div>
                  <h3 className="font-display font-semibold text-white text-sm md:text-base mb-1.5 group-hover:text-primary-300 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-surface-500 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  {service.popular && (
                    <span className="inline-block mt-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400 border border-accent-500/20">
                      Popular
                    </span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors group"
          >
            View all services
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
