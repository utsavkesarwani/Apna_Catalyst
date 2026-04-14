import { motion } from 'framer-motion'

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'badge-primary',
    accent: 'badge-accent',
    electric: 'badge-electric',
    success: 'badge-success',
  }

  return (
    <motion.span 
      className={`${variants[variant] || variants.primary} ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  )
}
