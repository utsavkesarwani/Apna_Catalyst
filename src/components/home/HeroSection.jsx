import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Shield, Star, Clock, Users } from 'lucide-react'
import Button from '../ui/Button'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy Customers' },
  { icon: Shield, value: '500+', label: 'Verified Pros' },
  { icon: Star, value: '4.8/5', label: 'Average Rating' },
  { icon: Clock, value: '30 min', label: 'Avg Response' },
]

export default function HeroSection() {
  const { config } = useSiteConfig()

  // Split headline for gradient styling
  const headline = config.hero_headline || 'Expert Electricians at Your Doorstep'
  const headlineParts = headline.includes('at ')
    ? [headline.split('at ')[0], 'at ' + headline.split('at ').slice(1).join('at ')]
    : [headline, '']

  const subHeadline = config.hero_subheadline || 'Book verified, background-checked electricians for any job — from a simple switch fix to complete home wiring. Fast, safe, and guaranteed.'
  const ctaPrimary = config.hero_cta_primary || 'Book Now'
  const ctaSecondary = config.hero_cta_secondary || 'Explore Services'
  const bgImage = config.hero_bg_image || ''
  const bannerActive = config.banner_active === 'true'
  const bannerText = config.banner_text || ''

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 noise-overlay" />

      {/* CMS Background Image */}
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover opacity-15" />
        </div>
      )}
      
      {/* Floating Orbs */}
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[20%] w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-[10%] w-96 h-96 bg-electric-500/8 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [-15, 15, -15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 right-[5%] w-48 h-48 bg-accent-500/8 rounded-full blur-3xl"
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(47,123,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(47,123,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="section-container relative z-10 pt-8 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Promotional Banner */}
          {bannerActive && bannerText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6"
            >
              <span className="text-sm font-medium text-white">{bannerText}</span>
            </motion.div>
          )}

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-primary-300">Trusted by 10,000+ homeowners across India</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
          >
            <span className="text-white">{headlineParts[0]}</span>
            {headlineParts[1] && (
              <>
                <br />
                <span className="gradient-text">{headlineParts[1]}</span>
              </>
            )}
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 text-balance leading-relaxed"
          >
            {subHeadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/booking">
              <Button variant="primary" size="lg" icon={Zap}>
                {ctaPrimary}
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="secondary" size="lg" icon={ArrowRight} iconPosition="right">
                {ctaSecondary}
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="glass-card-light p-4 md:p-5 text-center group hover:border-primary-500/30 transition-all duration-300"
              >
                <stat.icon size={22} className="mx-auto mb-2 text-primary-400 group-hover:text-electric-400 transition-colors" />
                <div className="text-xl md:text-2xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-950 to-transparent" />
    </section>
  )
}
