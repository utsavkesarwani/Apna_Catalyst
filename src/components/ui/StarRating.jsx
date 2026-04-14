import { Star, StarHalf } from 'lucide-react'

export default function StarRating({ rating, size = 16, showValue = true }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-accent-400 text-accent-400" />
        ))}
        {hasHalf && <StarHalf size={size} className="fill-accent-400 text-accent-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-surface-600" />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-surface-300">{rating}</span>
      )}
    </div>
  )
}
