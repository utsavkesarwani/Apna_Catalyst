import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, Banknote, Tag, Shield, Lock, CheckCircle, Zap, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { createBooking, initiatePayment, verifyPayment } from '../api/user.api'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Debit or Credit Card' },
  { id: 'cash', name: 'Cash on Service', icon: Banknote, description: 'Pay after work is done' },
]

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const bookingData = location.state || {}

  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const basePrice = 499
  const platformFee = 49
  const discount = couponApplied ? 100 : 0
  const total = basePrice + platformFee - discount

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container max-w-md text-center">
          <div className="glass-card p-8">
            <AlertCircle size={48} className="mx-auto mb-4 text-accent-400" />
            <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-surface-400 text-sm mb-6">Please sign in to complete your booking</p>
            <Link to="/auth" state={{ from: '/checkout' }}>
              <Button variant="primary" size="lg" className="w-full">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const handleConfirm = async () => {
    setProcessing(true)
    setError(null)

    try {
      // 1. Create the booking via API
      const bookingPayload = {
        electricianId: bookingData.booking?.electricianId || bookingData.electrician?.id,
        service: bookingData.booking?.service || bookingData.service?.name || 'General Service',
        problemDescription: bookingData.booking?.description || 'Service requested',
        scheduledAt: bookingData.booking?.date
          ? new Date(`${bookingData.booking.date}T${convertTimeTo24h(bookingData.booking?.time || '10:00 AM')}`).toISOString()
          : new Date().toISOString(),
        timeSlot: bookingData.booking?.time || '10:00 AM',
        paymentMethod,
        couponCode: couponApplied ? coupon : undefined,
      }

      const bookingRes = await createBooking(bookingPayload)
      const createdBooking = bookingRes.booking

      // 2. Initiate payment
      if (paymentMethod !== 'cash') {
        const paymentRes = await initiatePayment({
          bookingId: createdBooking._id,
          method: paymentMethod,
        })

        // 3. For dev: auto-verify payment
        await verifyPayment({
          bookingId: createdBooking._id,
          transactionId: paymentRes.payment?.transactionId,
        })
      }

      // Navigate to tracking page
      navigate(`/track/${createdBooking._id}`, {
        state: { booking: createdBooking, freshBooking: true },
      })
    } catch (err) {
      // If API fails, fall back to mock flow
      console.error('Booking error:', err)

      if (err.status === 401) {
        // If it's a demo token, it will naturally fail the backend JWT verification.
        // We should let it fall through to the mock flow instead of blocking it.
        const isDemo = localStorage.getItem('apna_catalyst_token')?.startsWith('demo_token_')
        if (!isDemo) {
          setError('Session expired. Please sign in again.')
          return
        }
      }

      // Fallback: navigate with mock booking ID
      setError(null)
      navigate('/track/BK-DEMO', {
        state: { booking: bookingData, freshBooking: true },
      })
    } finally {
      setProcessing(false)
    }
  }

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'FIRST100' || coupon.toUpperCase() === 'APNA100') {
      setCouponApplied(true)
    }
  }

  return (
    <section className="py-10 md:py-16">
      <div className="section-container max-w-4xl">
        {/* Back */}
        <Link to="/booking" className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} />
          <span className="text-sm">Back to booking</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Checkout</h1>
          <p className="text-surface-400 mb-8">Complete your booking securely</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2"
          >
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left - Payment */}
          <div className="lg:col-span-3 space-y-6">
            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-primary-400" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-xl text-left border flex items-center gap-4 transition-all duration-300 ${
                      paymentMethod === method.id
                        ? 'bg-primary-500/10 border-primary-500/40 shadow-glow-sm'
                        : 'bg-surface-800/30 border-surface-700/30 hover:border-surface-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      paymentMethod === method.id ? 'bg-primary-500/20' : 'bg-surface-700/50'
                    }`}>
                      <method.icon size={20} className={paymentMethod === method.id ? 'text-primary-400' : 'text-surface-400'} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{method.name}</div>
                      <div className="text-xs text-surface-500">{method.description}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.id ? 'border-primary-500' : 'border-surface-600'
                    }`}>
                      {paymentMethod === method.id && (
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* UPI QR Placeholder */}
              {paymentMethod === 'upi' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-6 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center"
                >
                  <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center mb-3">
                    <div className="w-32 h-32 bg-surface-200 rounded-lg flex items-center justify-center">
                      <Smartphone size={32} className="text-surface-500" />
                    </div>
                  </div>
                  <p className="text-sm text-surface-400">Scan QR code with any UPI app</p>
                  <p className="text-xs text-surface-600 mt-1">Or pay using UPI ID: apnacatalyst@upi</p>
                </motion.div>
              )}

              {/* Card Form Placeholder */}
              {paymentMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-3"
                >
                  <input type="text" placeholder="Card Number" className="input-field text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" className="input-field text-sm" />
                    <input type="text" placeholder="CVV" className="input-field text-sm" />
                  </div>
                  <input type="text" placeholder="Cardholder Name" className="input-field text-sm" />
                </motion.div>
              )}
            </motion.div>

            {/* Coupon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
                <Tag size={16} className="text-accent-400" />
                Promo Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="input-field text-sm flex-1"
                  disabled={couponApplied}
                />
                <Button
                  variant={couponApplied ? 'ghost' : 'secondary'}
                  size="sm"
                  onClick={applyCoupon}
                  disabled={!coupon || couponApplied}
                >
                  {couponApplied ? '✓ Applied' : 'Apply'}
                </Button>
              </div>
              {couponApplied && (
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle size={12} /> ₹100 discount applied!
                </p>
              )}
              <p className="text-xs text-surface-600 mt-2">Try: FIRST100 or APNA100</p>
            </motion.div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 sticky top-24 space-y-5"
            >
              <h3 className="font-display font-semibold text-white text-lg">Order Summary</h3>

              {/* Service Info */}
              {bookingData.service && (
                <div className="p-3 rounded-lg bg-surface-800/40 border border-surface-700/30">
                  <span className="text-xs text-surface-500">Service</span>
                  <p className="font-medium text-white text-sm">{bookingData.service?.name || 'Selected Service'}</p>
                </div>
              )}

              {bookingData.electrician && (
                <div className="p-3 rounded-lg bg-surface-800/40 border border-surface-700/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-primary-300" />
                  </div>
                  <div>
                    <span className="text-xs text-surface-500">Electrician</span>
                    <p className="font-medium text-white text-sm">{bookingData.electrician?.name}</p>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              {bookingData.booking?.date && (
                <div className="p-3 rounded-lg bg-surface-800/40 border border-surface-700/30">
                  <span className="text-xs text-surface-500">Scheduled</span>
                  <p className="font-medium text-white text-sm">
                    {new Date(bookingData.booking.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {bookingData.booking?.time ? ` at ${bookingData.booking.time}` : ''}
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 pt-3 border-t border-surface-800/50">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Service Charge</span>
                  <span className="text-white">₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Platform Fee</span>
                  <span className="text-white">₹{platformFee}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount</span>
                    <span className="text-emerald-400">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-surface-800/50">
                  <span className="font-display font-semibold text-white">Total</span>
                  <span className="text-xl font-display font-bold gradient-text">₹{total}</span>
                </div>
              </div>

              {/* Confirm */}
              <Button
                variant="primary"
                size="lg"
                icon={processing ? Loader2 : Lock}
                className="w-full"
                loading={processing}
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm Booking'}
              </Button>

              <div className="flex items-center gap-2 text-xs text-surface-500">
                <Shield size={14} className="text-emerald-400 flex-shrink-0" />
                <span>Secure payment • 100% money-back guarantee</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Helper to convert "2:00 PM" → "14:00"
function convertTimeTo24h(time12h) {
  if (!time12h) return '10:00'
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  if (hours === '12') hours = '00'
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12
  return `${String(hours).padStart(2, '0')}:${minutes}`
}
