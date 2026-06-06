import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { Link, useNavigate } from 'react-router-dom'

export default function FloatingCart() {
  const { cart, totalItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div className="relative rounded-2xl bg-surface-900/95 backdrop-blur-xl border border-surface-700/50 shadow-2xl shadow-black/40 p-4 flex items-center gap-4">
              {/* Glow effect */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary-500/20 via-electric-500/10 to-primary-500/20 -z-10 blur-sm" />

              {/* Cart icon + count */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-white" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
                  Total: <span className="text-white font-bold">₹{totalPrice.toLocaleString()}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={clearCart}
                  className="p-2.5 rounded-xl text-surface-400 hover:text-red-400 hover:bg-red-500/10 border border-surface-700/50 transition-all"
                  title="Clear cart"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => navigate('/booking', { state: { fromCart: true } })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-electric-500 text-white text-sm font-bold rounded-xl hover:shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Proceed
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
