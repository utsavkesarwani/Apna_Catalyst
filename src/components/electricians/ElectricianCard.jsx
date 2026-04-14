import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, CheckCircle, Zap, Award } from 'lucide-react'
import StarRating from '../ui/StarRating'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function ElectricianCard({ electrician }) {
  const navigate = useNavigate()
  const initials = (electrician.name || 'User').split(' ').map(n => n[0]).join('')

  return (
    <Link to={`/electricians/${electrician.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card p-5 md:p-6 h-full flex flex-col group hover:border-primary-500/30 hover:shadow-glow-sm transition-all duration-500"
      >
        {/* Top Row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center border border-primary-500/20">
              <span className="text-lg font-display font-bold text-primary-300">{initials}</span>
            </div>
            {electrician.availability?.isAvailable && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-surface-900 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                {electrician.name}
              </h3>
              {electrician.verified && (
                <CheckCircle size={14} className="text-primary-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 mb-2">
              <StarRating rating={electrician.rating?.avg || 0} size={13} />
              <span className="text-xs text-surface-500">({electrician.rating?.count || 0})</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-surface-500">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {electrician.location?.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {electrician.experience} yrs
              </span>
            </div>
          </div>
        </div>

        {/* Badge */}
        {electrician.topBadge && (
          <div className="mb-3">
            <Badge variant="accent">
              <Award size={11} />
              {electrician.topBadge}
            </Badge>
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {electrician.categories?.slice(0, 3).map((cat) => (
            <span key={cat} className="px-2 py-0.5 text-[10px] rounded-md bg-surface-800/80 text-surface-400 border border-surface-700/50">
              {cat}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-800/50">
          <div>
            <span className="text-xs text-surface-500">Price range</span>
            <p className="text-sm font-semibold text-white">
              {electrician.priceRangeFormatted || 
                (electrician.priceRange?.min 
                  ? `₹${electrician.priceRange.min} - ₹${electrician.priceRange.max}` 
                  : 'Contact for pricing')}
            </p>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Zap} 
            onClick={(e) => { 
              e.preventDefault(); 
              navigate(`/electricians/${electrician.id}`);
            }}
          >
            Book
          </Button>
        </div>
      </motion.div>
    </Link>
  )
}
