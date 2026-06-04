import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, CheckCircle, ArrowRight, Star, Shield, Zap, Phone } from 'lucide-react'
import { homeWiringPackages } from '../data/services'
import { electricians } from '../data/electricians'
import Button from '../components/ui/Button'
import StarRating from '../components/ui/StarRating'

const beforeAfter = [
  { label: 'Old tangled wiring', type: 'before' },
  { label: 'Clean organized wiring', type: 'after' },
  { label: 'Damaged switch panel', type: 'before' },
  { label: 'Modern modular panel', type: 'after' },
]

export default function HomeWiringPage() {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const wiringExperts = electricians.filter(e => e.services.includes('full-home-wiring')).slice(0, 4)

  return (
    <section className="py-10 md:py-16">
      {/* Hero */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-primary-950/30 to-surface-950" />
        <div className="absolute inset-0">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 right-[20%] w-64 h-64 bg-primary-500/8 rounded-full blur-3xl"
          />
        </div>

        <div className="section-container relative z-10 text-center">
          <span className="badge-accent text-xs mb-4 inline-flex items-center gap-1">
            <Home size={12} /> Premium Service
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            Full Home Wiring &{' '}
            <span className="gradient-text">Renovation</span>
          </h1>
          <p className="text-lg text-surface-400 max-w-2xl mx-auto mb-8">
            Complete electrical solutions for new construction and renovation. From wiring to switches, we handle everything.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div onClick={(e) => { e.preventDefault(); setIsComingSoonOpen(true); }} className="cursor-pointer">
              <Button variant="primary" size="lg" icon={Zap}>Get Free Quote</Button>
            </div>
            <Button variant="secondary" size="lg" icon={Phone}>Call Now</Button>
          </div>
        </div>
      </div>

      <div className="section-container">
        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white text-center mb-10">
            What's <span className="gradient-text">Included</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Complete copper wiring (ISI certified)',
              'MCB/RCCB distribution panel',
              'Modular switches & sockets',
              'Earthing & safety setup',
              'All light & fan points',
              'AC & heavy load points',
              'CCTV wiring points',
              'Cable concealing & channeling',
              'Post-installation safety audit',
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/20"
              >
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-surface-300">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white text-center mb-4">
            Choose Your <span className="gradient-text-gold">Package</span>
          </h2>
          <p className="text-surface-400 text-center mb-10 max-w-xl mx-auto">
            Transparent pricing with no hidden charges
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {homeWiringPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative glass-card p-6 md:p-7 ${
                  pkg.popular ? 'border-primary-500/40 shadow-glow-sm' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-primary text-xs px-3 py-1">Most Popular</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-display font-bold text-white text-lg mb-1">{pkg.name}</h3>
                  <p className="text-xs text-surface-500 mb-4">{pkg.description}</p>
                  <div className="text-3xl font-display font-bold gradient-text">{pkg.price}</div>
                  <p className="text-xs text-surface-600 mt-1">Starting price</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {pkg.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-surface-400">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div onClick={(e) => { e.preventDefault(); setIsComingSoonOpen(true); }} className="block cursor-pointer">
                  <Button
                    variant={pkg.popular ? 'primary' : 'secondary'}
                    size="md"
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Before/After Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white text-center mb-10">
            Before & <span className="gradient-text">After</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {beforeAfter.map((item, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl bg-surface-800/40 border border-surface-700/30 flex items-center justify-center overflow-hidden group">
                <Zap size={32} className="text-surface-700 group-hover:text-surface-600 transition-colors" />
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  item.type === 'before'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.type}
                </div>
                <span className="absolute bottom-3 left-3 right-3 text-xs text-surface-400">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Electricians for Home Wiring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white text-center mb-10">
            Top <span className="gradient-text">Home Wiring Experts</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wiringExperts.map(elec => {
              const initials = elec.name.split(' ').map(n => n[0]).join('')
              return (
                <div 
                  key={elec.id} 
                  className="block cursor-pointer"
                  onClick={(e) => { e.preventDefault(); setIsComingSoonOpen(true); }}
                >
                  <div className="glass-card p-5 text-center group hover:border-primary-500/30 transition-all duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center mx-auto mb-3 border border-primary-500/20">
                      <span className="text-xl font-display font-bold text-primary-300">{initials}</span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-sm mb-1">{elec.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <StarRating rating={elec.rating} size={12} />
                    </div>
                    <p className="text-xs text-surface-500">{elec.experience} years experience</p>
                    <p className="text-xs text-surface-500">{elec.completedJobs}+ jobs done</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Coming Soon Modal */}
      {isComingSoonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface-900 border border-surface-700 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl relative"
          >
            <h3 className="text-xl font-display font-bold text-white mb-3">Service Coming Soon</h3>
            <p className="text-surface-300 mb-6 text-sm leading-relaxed">
              We are onboarding premium certified technician teams for full-house wiring and large-scale renovations. This premium service will be launching soon!
            </p>
            <div className="flex justify-end">
              <Button 
                variant="primary" 
                onClick={() => setIsComingSoonOpen(false)}
              >
                Got It
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}
