import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Eye, ArrowLeft, Tag, Share2, CheckCircle2 } from 'lucide-react'
import { getPageBySlug } from '../api/page.api.js'

// Default content for each static slug — shown if backend is offline
const FALLBACK_CONTENT = {
  'about': {
    title: 'About Apna Electro',
    content: `
      <h2>Our Mission</h2>
      <p>Apna Electro is India's most trusted platform for connecting home and business owners with verified, skilled electricians. We believe that safe, quality electrical work should be accessible to everyone — from metro cities to small towns.</p>
      <h2>Who We Are</h2>
      <p>Founded in 2024, Apna Electro was built by a team passionate about solving the everyday frustration of finding reliable electricians. Our platform rigorously vets every professional before they can take their first booking.</p>
      <h2>Our Promise</h2>
      <ul><li>✅ 100% verified electricians</li><li>✅ Transparent, upfront pricing</li><li>✅ Real-time booking tracking</li><li>✅ Satisfaction guaranteed</li></ul>
    `,
  },
  'terms': {
    title: 'Terms of Service',
    content: `<h2>Terms of Service</h2><p>By using Apna Electro, you agree to these terms. Our platform connects customers with independent electricians. Apna Electro acts as an intermediary and is not responsible for the quality of individual electrician services, though we take every step to ensure professional standards.</p><h2>User Responsibilities</h2><p>Users must provide accurate information when booking. Cancellations made less than 2 hours before the appointment may incur a cancellation fee.</p>`,
  },
  'privacy': {
    title: 'Privacy Policy',
    content: `<h2>Privacy Policy</h2><p>We take your privacy seriously. Your personal information is never sold to third parties. We collect only the data needed to facilitate your bookings and improve our service. All data is encrypted and stored securely in compliance with Indian IT Act regulations.</p>`,
  },
  'refunds': {
    title: 'Refund Policy',
    content: `<h2>Refund Policy</h2><p>If you are not satisfied with a service, report the issue within 24 hours and we will arrange a free re-visit or a full refund. Refunds for digital payments are processed within 5-7 business days.</p>`,
  },
  'careers': {
    title: 'Careers at Apna Electro',
    content: `<h2>Join Our Team</h2><p>We are building the future of home services in India. If you are passionate about technology, operations, or community building, we would love to hear from you.</p><h2>Open Positions</h2><ul><li>City Operations Manager</li><li>Full Stack Developer</li><li>Electrician Onboarding Specialist</li></ul><p>Send your CV to <a href="mailto:careers@apnaelectro.com">careers@apnaelectro.com</a></p>`,
  },
  'help': {
    title: 'Help Center',
    content: `<h2>Frequently Asked Questions</h2><h3>How do I book an electrician?</h3><p>Click "Book Now", select your service, choose an electrician, pick a time slot, and confirm. It takes under 2 minutes.</p><h3>Are electricians verified?</h3><p>Yes. Every electrician on our platform undergoes document verification, background checks, and a skill assessment before being approved.</p><h3>How do I track my booking?</h3><p>After booking, you will receive a tracking link via SMS. You can also track from your profile page.</p>`,
  },
  'safety': {
    title: 'Safety Commitment',
    content: `<h2>Your Safety Is Our Priority</h2><p>Every Apna Electro electrician carries valid ID and a skill certificate. They are background verified and trained in electrical safety standards.</p><h2>Tips for Customers</h2><ul><li>Always verify the electrician's ID when they arrive</li><li>Never attempt electrical work yourself</li><li>Turn off the main switch before any electrical work begins</li></ul>`,
  },
  'how-it-works': {
    title: 'How Apna Electro Works',
    content: `<h2>Simple, Fast, Reliable</h2><ol><li><strong>Describe your problem</strong> — tell us what needs fixing or installing.</li><li><strong>Choose an electrician</strong> — browse profiles, ratings, and availability.</li><li><strong>Book a slot</strong> — pick a date and time that works for you.</li><li><strong>Get it done</strong> — your verified electrician arrives on time.</li><li><strong>Pay securely</strong> — pay only after the job is complete.</li></ol>`,
  },
  'contact': {
    title: 'Contact Us',
    content: `<h2>Get In Touch</h2><p>We are here to help. Reach us through any of the following channels:</p><ul><li>📧 Email: <a href="mailto:support@apnaelectro.com">support@apnaelectro.com</a></li><li>📞 Phone: 1800-XXX-XXXX (Toll Free, Mon–Sat 9am–7pm)</li><li>💬 WhatsApp: Available via the app</li></ul>`,
  },
  'kitchen-electrical-hazards': {
    title: '5 Hidden Electrical Hazards in Modern Kitchens',
    coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    tags: ['Safety', 'Kitchen', 'Home'],
    author: 'Apna Electro Team',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    readTime: 5,
    views: 1240,
    type: 'blog',
    content: `<h2>1. Overloaded Outlets</h2><p>Modern kitchens are packed with power-hungry appliances—microwaves, air fryers, blenders, and coffee makers. Plugging too many into a single circuit can easily cause an overload, leading to tripped breakers or, worst-case, electrical fires. Always plug heavy appliances directly into wall outlets, never into extension cords.</p><h2>2. Water and Electricity Proximity</h2><p>The cardinal rule of electricity is to keep it away from water. Yet, countertops often feature outlets right next to sinks. Ensure you have GFCI (Ground Fault Circuit Interrupter) outlets installed anywhere water is present. These cut power instantly if water comes into contact.</p><h2>3. Damaged Appliance Cords</h2><p>Heat from stoves or accidental crimping from heavy appliances can damage the insulation on cords. Exposed wires are a massive shock hazard. Regularly inspect the cords of all your appliances.</p><h2>4. Faulty or Outdated Wiring</h2><p>Warning signs include flickering lights when you turn on the microwave or a slight burning smell near outlets.</p><h2>5. DIY Countertop Lighting</h2><p>Kitchens generate steam and heat, which can easily melt improper wiring. Always hire a professional for integrated lighting.</p><p><br/><strong>Need a kitchen inspection?</strong> Our verified electricians at Apna Electro can assess your setup. <strong>Book a visit today!</strong></p>`
  },
  'revolutionizing-home-maintenance': {
    title: 'How Apna Electro is Revolutionizing Home Maintenance in Delhi',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    tags: ['Brand Story', 'Community'],
    author: 'Ravi Sharma, Founder',
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    readTime: 7,
    views: 3420,
    type: 'blog',
    content: `<p>Delhi NCR is a bustling, fast-paced region. Yet, for decades, finding a reliable electrician has been an exercise in frustration. You ask neighbours for a number, wait hours for someone to show up, and often get overcharged with zero guarantee on the work. We decided it was time for a change.</p><h2>The Core Problem</h2><p>We realized that independent electricians were struggling to find consistent work and secure their payments, while customers were terrified of being scammed by untrained workers. The trust deficit was massive.</p><h2>Our Solution</h2><p>Apna Electro was built to bridge this gap. We developed a rigorous vetting process. Every electrician must pass a technical test, a background check, and a customer service orientation. On the flip side, we guarantee them fair wages and insurance coverage.</p><h2>The Impact So Far</h2><p>Wait times for electricians have dropped from an average of 4 hours to just 30 minutes. Most importantly, we've helped over 2,000 independent electricians triple their monthly income.</p><p>We are just getting started. The future of Indian home maintenance is transparent, digital, and deeply focused on quality.</p>`
  },
  'smart-lighting-worth-upgrade': {
    title: 'Smart Lighting: Is it Worth the Upgrade in 2025?',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    tags: ['Smart Home', 'Technology', 'Lighting'],
    author: 'Priya Mehta',
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    readTime: 6,
    views: 890,
    type: 'blog',
    content: `<h2>The Rise of Smart Indian Homes</h2><p>A few years ago, controlling your lights with your smartphone or voice was a luxury reserved for the ultra-rich. Today, brands like Philips, Wipro, and Syska have flooded the Indian market with affordable smart bulbs and switches. But are they actually worth the investment?</p><h2>Pros of Smart Lighting</h2><ul><li><strong>Energy Efficiency:</strong> Smart LEDs consume less power. The ability to schedule them or turn them off remotely ensures no electricity is wasted.</li><li><strong>Security:</strong> You can set your lights to mimic your routine while you are on vacation, deterring potential burglars.</li><li><strong>Convenience:</strong> "Alexa, turn off the bedroom lights" is undeniably the best way to end the day.</li></ul><h2>The Hidden Costs</h2><p>While the bulbs themselves are becoming cheaper, wiring an older home to support fully automated smart switches can be an expensive endeavor. Many smart switches require a neutral wire, which older Indian homes often lack in switchboards.</p><h2>The Verdict</h2><p>If you are renting, stick to standalone smart bulbs. If you are renovating your home, investing in a complete smart switchboard ecosystem is absolutely worth the relatively small premium, provided you hire a professional electrician to handle the complex modern wiring.</p>`
  },
  'mcb-tripping-guide': {
    title: 'MCB Keeps Tripping? Here\'s What It Means and What To Do',
    coverImage: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&q=80',
    tags: ['MCB', 'Safety', 'DIY Guide'],
    author: 'Apna Electro Team',
    publishedAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    readTime: 4,
    views: 2100,
    type: 'blog',
    content: `<p>A Miniature Circuit Breaker (MCB) popping and shutting off your power is annoying, but remember: it is doing exactly what it was designed to do—protecting your home from a potential fire.</p><h2>1. Overloaded Circuit</h2><p>This is the most common reason. If you run your AC, a microwave, and a heavy geyser on the same circuit, the total power demand exceeds the MCB's safety rating (typically 10A, 16A, or 32A). The MCB detects the massive current and instantly breaks the circuit.<br><br><em>Fix:</em> Unplug some heavy appliances and flip the switch back up. If it happens frequently, you need an electrician to split your circuits.</p><h2>2. Short Circuit</h2><p>A short circuit happens when a "live" wire directly touches a "neutral" wire. This creates a massive, uncontrolled rush of current, generating immense heat. It's highly dangerous.<br><br><em>Fix:</em> If you flip the MCB up and it instantly violently snaps back down with a sparking sound, DO NOT touch it again. You have a short circuit. Call an electrician immediately.</p><h2>3. Ground Fault</h2><p>Similar to a short circuit, this occurs when a live wire touches a ground wire or the metal casing of an appliance (like your washing machine).<br><br><em>Fix:</em> Unplug the suspected appliance and try resetting the breaker.</p><h2>4. A Bad MCB</h2><p>MCBs are mechanical devices and they wear out over time. If the switch feels "spongy" and won't lock back into place even when the main power is off, the breaker itself has failed.</p>`
  }
}

export default function ContentPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getPageBySlug(slug)
        setPage(res.page)
      } catch (err) {
        // Fall back to hardcoded content if backend is down
        const fallback = FALLBACK_CONTENT[slug]
        if (fallback) {
          setPage({ ...fallback, slug, type: 'static', isPublished: true })
        } else {
          setError('Page not found')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [slug])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
          <p className="text-surface-500 text-sm">Loading page...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-4"
        >
          <div className="text-6xl mb-4">🔌</div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-surface-400 mb-6">This page doesn't exist or hasn't been published yet.</p>
          <button onClick={() => navigate(-1)}
            className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
        </motion.div>
      </div>
    )
  }

  const isBlog = page.type === 'blog'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Hero */}
      <div className="relative overflow-hidden bg-surface-950 border-b border-surface-800/50">
        {/* Cover image for blog posts */}
        {isBlog && page.coverImage && (
          <div className="absolute inset-0">
            <img src={page.coverImage} alt={page.title}
              className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-surface-950/60 via-surface-950/80 to-surface-950" />
          </div>
        )}

        <div className="relative section-container pt-16 pb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-6">
            <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <span>/</span>
            {isBlog && (
              <>
                <Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link>
                <span>/</span>
              </>
            )}
            <span className="text-surface-400">{page.title}</span>
          </div>

          {/* Tags (blog) */}
          {isBlog && page.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {page.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${tag}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-all">
                  <Tag size={10} /> {tag}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-4">
            {page.title}
          </h1>

          {/* Blog meta */}
          {isBlog && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white text-xs font-bold">
                  {(page.author || 'A').charAt(0)}
                </div>
                <span>{page.author || 'Apna Electro Team'}</span>
              </div>
              {page.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(page.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock size={14} /> {page.readTime || 1} min read
              </div>
              <div className="flex items-center gap-1.5">
                <Eye size={14} /> {(page.views || 0).toLocaleString()} views
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto lg:grid lg:grid-cols-[1fr_260px] lg:gap-12">
          {/* Article Body */}
          <article>
            {page.excerpt && isBlog && (
              <p className="text-lg text-surface-300 leading-relaxed mb-8 pb-8 border-b border-surface-800/50 font-light">
                {page.excerpt}
              </p>
            )}

            {/* Rendered HTML content */}
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: page.content || '<p>Content coming soon...</p>' }}
            />
          </article>

          {/* Sidebar */}
          <aside className="mt-10 lg:mt-0 space-y-6">
            {/* Share */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Share</h3>
              <button onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-surface-800/50 text-surface-300 border border-surface-700/50 hover:text-white hover:bg-surface-800 transition-all">
                {copied ? <><CheckCircle2 size={14} className="text-emerald-400" /> Copied!</> : <><Share2 size={14} /> Copy Link</>}
              </button>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
              <ul className="space-y-1.5 text-sm">
                {[
                  { label: 'Book an Electrician', to: '/booking' },
                  { label: 'Browse Electricians', to: '/electricians' },
                  { label: 'Join as Electrician', to: '/join' },
                  { label: 'Read our Blog', to: '/blog' },
                ].map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="text-surface-400 hover:text-primary-400 transition-colors">
                      → {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Back button */}
            <button onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-surface-400 border border-surface-700/50 hover:text-white hover:border-surface-600 transition-all">
              <ArrowLeft size={14} /> Go Back
            </button>
          </aside>
        </div>
      </div>
    </motion.div>
  )
}
