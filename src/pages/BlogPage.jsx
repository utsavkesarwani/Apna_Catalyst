import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Eye, Tag, Zap, Search, ArrowRight } from 'lucide-react'
import { getBlogPosts } from '../api/page.api.js'

const FALLBACK_POSTS = [
  {
    _id: '1',
    slug: 'kitchen-electrical-hazards',
    title: '5 Hidden Electrical Hazards in Modern Kitchens',
    excerpt: 'Your kitchen could be a hidden electrical danger zone. Learn about the 5 most common hazards that even new homes face and how a professional inspection can protect your family.',
    coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    tags: ['Safety', 'Kitchen', 'Home'],
    author: 'Apna Electro Team',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    readTime: 5,
    views: 1240,
  },
  {
    _id: '2',
    slug: 'revolutionizing-home-maintenance',
    title: 'How Apna Electro is Revolutionizing Home Maintenance in Delhi',
    excerpt: 'From a small startup idea to serving 10,000+ families across Delhi NCR — here\'s the story of how we\'re changing the way Indians get their electrical work done.',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    tags: ['Brand Story', 'Community'],
    author: 'Ravi Sharma, Founder',
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    readTime: 7,
    views: 3420,
  },
  {
    _id: '3',
    slug: 'smart-lighting-worth-upgrade',
    title: 'Smart Lighting: Is it Worth the Upgrade in 2025?',
    excerpt: 'Smart bulbs, automated switches, voice control — we break down the real cost vs. benefit of smart lighting upgrades for Indian homes and when they actually make financial sense.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    tags: ['Smart Home', 'Technology', 'Lighting'],
    author: 'Priya Mehta',
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    readTime: 6,
    views: 890,
  },
  {
    _id: '4',
    slug: 'mcb-tripping-guide',
    title: 'MCB Keeps Tripping? Here\'s What It Means and What To Do',
    excerpt: 'A tripping MCB is never just an inconvenience — it\'s your home\'s warning system. Learn to decode what each type of trip means and when to call a professional immediately.',
    coverImage: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&q=80',
    tags: ['MCB', 'Safety', 'DIY Guide'],
    author: 'Apna Electro Team',
    publishedAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    readTime: 4,
    views: 2100,
  },
]

function BlogCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group glass-card overflow-hidden hover:border-primary-500/20 transition-all duration-300 flex flex-col"
    >
      {/* Cover Image */}
      <Link to={`/page/${post.slug}`} className="block relative overflow-hidden h-48 flex-shrink-0">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-electric-500/20 flex items-center justify-center">
            <Zap size={40} className="text-primary-400/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 to-transparent" />
        {/* Tags overlay */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {(post.tags || []).slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/page/${post.slug}`}>
          <h2 className="text-base font-display font-semibold text-white leading-snug mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-surface-400 leading-relaxed mb-4 line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-800/50">
          <div className="flex items-center gap-3 text-xs text-surface-500">
            <div className="flex items-center gap-1">
              <Clock size={11} /> {post.readTime} min
            </div>
            <div className="flex items-center gap-1">
              <Eye size={11} /> {(post.views || 0).toLocaleString()}
            </div>
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
          <Link to={`/page/${post.slug}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors">
            Read <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

const ALL_TAGS = ['Safety', 'Technology', 'Smart Home', 'Brand Story', 'DIY Guide', 'Lighting', 'Community', 'MCB', 'Kitchen']

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag') || ''
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = {}
        if (activeTag) params.tag = activeTag
        const res = await getBlogPosts(params)
        setPosts(res.posts || [])
      } catch {
        setPosts(FALLBACK_POSTS.filter(p => !activeTag || p.tags?.includes(activeTag)))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTag])

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Hero */}
      <div className="bg-surface-950 border-b border-surface-800/50">
        <div className="section-container pt-16 pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-4">
              <Zap size={12} /> Apna Electro Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
              Electrical Tips &amp; <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-surface-400 max-w-xl">
              Expert advice on home electrical safety, smart upgrades, and why verified professionals make the difference.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-6 relative max-w-md"
          >
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 pr-4 py-2.5 text-sm"
            />
          </motion.div>
        </div>
      </div>

      <div className="section-container py-10">
        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSearchParams({})}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !activeTag ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'text-surface-400 border border-surface-700/50 hover:border-surface-600 hover:text-white'
            }`}
          >
            All Posts
          </button>
          {ALL_TAGS.map(tag => (
            <button key={tag}
              onClick={() => setSearchParams({ tag })}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTag === tag ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'text-surface-400 border border-surface-700/50 hover:border-surface-600 hover:text-white'
              }`}
            >
              <Tag size={10} /> {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card overflow-hidden animate-pulse">
                <div className="h-48 bg-surface-800/50" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-800/50 rounded w-3/4" />
                  <div className="h-3 bg-surface-800/50 rounded w-full" />
                  <div className="h-3 bg-surface-800/50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-display font-semibold text-white mb-2">No Posts Found</h3>
            <p className="text-surface-400 text-sm">Try a different search or tag filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => <BlogCard key={post._id || post.slug} post={post} index={i} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
