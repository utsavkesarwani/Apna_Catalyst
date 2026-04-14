import { motion } from 'framer-motion'
import { Shield, Clock, CreditCard, Headphones, CheckCircle } from 'lucide-react'

const trustPoints = [
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'Every electrician is background-checked, ID-verified, and skill-tested before joining',
  },
  {
    icon: Clock,
    title: 'On-Time Guarantee',
    description: 'Your electrician arrives within the scheduled time slot or the visit is free',
  },
  {
    icon: CreditCard,
    title: 'Transparent Pricing',
    description: 'No hidden charges. Get upfront quotes and pay only for what you need',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support for emergencies and booking assistance',
  },
]

const brands = ['Havells', 'Polycab', 'Anchor', 'Schneider', 'Legrand', 'Philips']

export default function TrustBanner() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* BG Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-500/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="badge-success text-xs mb-4 inline-block">
            <CheckCircle size={12} className="inline mr-1" />
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Built on <span className="gradient-text">Trust & Safety</span>
          </h2>
          <p className="text-surface-400 max-w-xl mx-auto">
            We go above and beyond to ensure every service experience is safe, reliable, and excellent
          </p>
        </motion.div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card p-6 text-center group hover:border-primary-500/30 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-electric-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                <point.icon size={26} className="text-primary-400" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{point.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Trusted Brands */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-xs text-surface-600 uppercase tracking-widest mb-6">Trusted brands we work with</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {brands.map((brand) => (
              <span key={brand} className="text-lg md:text-xl font-display font-bold text-surface-700 hover:text-surface-500 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
