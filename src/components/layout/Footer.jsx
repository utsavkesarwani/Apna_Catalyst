import { Link } from 'react-router-dom'
import { Zap, MapPin, Phone, Mail, ArrowRight, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'

const footerLinks = {
  Services: [
    { name: 'Wiring & Rewiring', path: '/electricians?service=wiring', isActive: true },
    { name: 'Fan Installation', path: '/electricians?service=fan-installation', isActive: true },
    { name: 'AC Wiring', path: '/electricians?service=ac-wiring', isActive: true },
    { name: 'CCTV Installation', path: '/electricians?service=cctv', isActive: false },
    { name: 'Smart Home Setup', path: '/electricians?service=smart-home', isActive: false },
    { name: 'Full Home Wiring', path: '/home-wiring', isActive: true },
  ],
  Company: [
    { name: 'About Us', path: '/page/about' },
    { name: 'How It Works', path: '/page/how-it-works' },
    { name: 'Careers', path: '/page/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/page/contact' },
  ],
  Support: [
    { name: 'Help Center', path: '/page/help' },
    { name: 'Safety', path: '/page/safety' },
    { name: 'Terms of Service', path: '/page/terms' },
    { name: 'Privacy Policy', path: '/page/privacy' },
    { name: 'Refund Policy', path: '/page/refunds' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export default function Footer() {
  const { config } = useSiteConfig()

  const siteName = config.site_name || 'Apna Catalyst'
  const nameParts = siteName.includes(' ') ? [siteName.split(' ')[0], siteName.split(' ').slice(1).join(' ')] : [siteName, '']
  const contactEmail = config.contact_email || 'support@apnacatalyst.com'
  const contactPhone = config.contact_phone || '1800-XXX-XXXX (Toll Free)'
  const contactAddress = config.contact_address || 'Available across all major cities in India'
  const siteDescription = config.site_description || "India's most trusted platform for electrical services. Verified professionals, transparent pricing, and guaranteed satisfaction."

  return (
    <footer className="relative bg-surface-950 border-t border-surface-800/50">
      {/* Top CTA Strip */}
      <div className="bg-gradient-to-r from-primary-500/10 via-electric-500/10 to-primary-500/10 border-b border-surface-800/30">
        <div className="section-container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-bold text-white">Ready to get started?</h3>
            <p className="text-surface-400 text-sm mt-1">Book a verified electrician in under 2 minutes</p>
          </div>
          <Link
            to="/booking"
            className="btn-primary flex items-center gap-2 group"
          >
            Book Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center p-0.5">
                <img src="/apna_catalyst_logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-display font-bold">
                <span className="text-white">{nameParts[0]}</span>
                {nameParts[1] && <span className="gradient-text ml-1">{nameParts[1]}</span>}
              </span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed max-w-sm mb-6">
              {siteDescription}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-surface-400">
                <MapPin size={16} className="text-primary-400 flex-shrink-0" />
                <span>{contactAddress}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-400">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <span>{contactPhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-400">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <span>{contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-display font-semibold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.isActive === false ? (
                      <div className="relative group w-fit flex items-center gap-2">
                        <span className="text-sm text-surface-500 cursor-not-allowed transition-colors duration-300">
                          {link.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-primary-500/10 text-primary-400 rounded-md whitespace-nowrap">
                          Soon
                        </span>
                        
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-52 p-3 bg-surface-900 border border-surface-700/50 rounded-xl shadow-xl z-50">
                          <p className="text-xs text-surface-300 leading-relaxed">
                            We are onboarding top-tier certified technicians for this service. Launching soon!
                          </p>
                          {/* Triangle pointer */}
                          <div className="absolute left-4 -bottom-1.5 w-3 h-3 bg-surface-900 border-b border-r border-surface-700/50 transform rotate-45"></div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-sm text-surface-400 hover:text-primary-400 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800/50">
        <div className="section-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-lg bg-surface-800/50 border border-surface-700/50 flex items-center justify-center text-surface-400 hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all duration-300"
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
    </footer>
  )
}
