import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, FileText, Calendar, User, CreditCard,
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  Minus, Plus, Trash2, Clock, ArrowRight, Zap
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { createBooking } from '../../api/user.api.js'

// ─── Steps Config ───────────────────────────────
const STEPS = [
  { id: 1, label: 'Cart', icon: ShoppingCart },
  { id: 2, label: 'Details', icon: FileText },
  { id: 3, label: 'Schedule', icon: Calendar },
  { id: 4, label: 'Professional', icon: User },
  { id: 5, label: 'Payment', icon: CreditCard },
]

export default function CheckoutFlow() {
  const {
    cart, totalItems, totalPrice,
    addItem, increment, decrement, removeItem, clearCart,
  } = useCart()

  const location = useLocation()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(
    location.state?.booking ? 5 : 1
  )
  const [formData, setFormData] = useState({
    problemDescription: '',
    bookingDate: '',
    bookingTime: '',
    electricianId: null,
  })
  const [professionals, setProfessionals] = useState([])
  const [loadingPros, setLoadingPros] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Sync booking data passed from BookingPage (run once on mount)
  useEffect(() => {
    if (location.state?.booking) {
      const b = location.state.booking
      
      // Pre-fill form fields
      setFormData(prev => ({
        ...prev,
        problemDescription: b.description || prev.problemDescription,
        bookingDate: b.date || prev.bookingDate,
        bookingTime: b.time || prev.bookingTime,
        electricianId: b.electricianId || prev.electricianId,
      }))

      // Sync subcategories to cart
      if (b.subcategories && b.subcategories.length > 0) {
        clearCart()
        b.subcategories.forEach(sub => {
          addItem(sub, location.state.service?.name || '')
        })
      }
    }
  }, [])

  // Fetch public electricians when reaching step 4
  useEffect(() => {
    if (currentStep === 4 && professionals.length === 0) {
      setLoadingPros(true)
      // TODO: Replace with actual API call:
      // getPublicElectricians().then(res => { setProfessionals(res.electricians); setLoadingPros(false) })
      setTimeout(() => {
        setProfessionals([
          { _id: 'auto', name: 'Auto-Assign', publicBio: 'We will assign the nearest top-rated professional automatically.', profilePictureUrl: '', isAuto: true },
          { _id: 'p1', name: 'Rajesh Kumar', publicBio: 'Expert AC & wiring technician with 8+ years of experience in residential & commercial setups.', profilePictureUrl: '' },
          { _id: 'p2', name: 'Amit Verma', publicBio: 'Specialist in MCB/Fuse, Switchboards and complete home rewiring projects.', profilePictureUrl: '' },
        ])
        setLoadingPros(false)
      }, 800)
    }
  }, [currentStep])

  const canProceed = () => {
    switch (currentStep) {
      case 1: return cart.length > 0
      case 2: return formData.problemDescription.trim().length >= 10
      case 3: return formData.bookingDate && formData.bookingTime
      case 4: return true // auto-assign is always valid
      case 5: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  // ─── Mock Razorpay Payment ────────────────────
  const initializePayment = async () => {
    setPaymentLoading(true)
    // Simulate Razorpay checkout init
    const options = {
      key: 'rzp_test_XXXXXXXXXXXXXXX',
      amount: totalPrice * 100, // paise
      currency: 'INR',
      name: 'Apna Catalyst',
      description: `Booking – ${cart.map(i => i.subcategory.name).join(', ')}`,
      handler: async function (response) {
        console.log('Payment success:', response)
        try {
          // Create the booking in our database
          const bookingPayload = {
            electricianId: formData.electricianId === 'auto' ? null : formData.electricianId,
            service: cart[0]?.parentServiceName || 'General Service',
            cartItems: cart.map(item => ({
              subcategory: item.subcategory._id || item.subcategory.id,
              name: item.subcategory.name,
              quantity: item.quantity,
              price: item.subcategory.price,
            })),
            problemDescription: formData.problemDescription,
            scheduledAt: formData.bookingDate && formData.bookingTime
              ? new Date(`${formData.bookingDate}T${formData.bookingTime}`).toISOString()
              : new Date().toISOString(),
            timeSlot: formData.bookingTime || '10:00 AM',
            paymentMethod: 'card',
            paymentStatus: 'completed',
          }
          const bookingRes = await createBooking(bookingPayload)
          const createdBooking = bookingRes.booking
          
          alert(`Payment Successful!\nTransaction ID: ${response.razorpay_payment_id || 'MOCK_TXN_' + Date.now()}`)
          clearCart()
          navigate(`/track/${createdBooking._id}`, {
            state: { booking: createdBooking, freshBooking: true },
          })
        } catch (err) {
          console.error('Error creating booking after payment:', err)
          alert('Payment was successful, but we failed to save your booking. Please contact support.')
        } finally {
          setPaymentLoading(false)
        }
      },
      prefill: {},
    }

    // Check if Razorpay SDK is loaded
    if (typeof window.Razorpay !== 'undefined') {
      const rzp = new window.Razorpay(options)
      rzp.open()
      setPaymentLoading(false)
    } else {
      // Fallback mock for development
      setTimeout(async () => {
        try {
          const bookingPayload = {
            electricianId: formData.electricianId === 'auto' ? null : formData.electricianId,
            service: cart[0]?.parentServiceName || 'General Service',
            cartItems: cart.map(item => ({
              subcategory: item.subcategory._id || item.subcategory.id,
              name: item.subcategory.name,
              quantity: item.quantity,
              price: item.subcategory.price,
            })),
            problemDescription: formData.problemDescription,
            scheduledAt: formData.bookingDate && formData.bookingTime
              ? new Date(`${formData.bookingDate}T${formData.bookingTime}`).toISOString()
              : new Date().toISOString(),
            timeSlot: formData.bookingTime || '10:00 AM',
            paymentMethod: 'upi',
            paymentStatus: 'completed',
          }
          const bookingRes = await createBooking(bookingPayload)
          const createdBooking = bookingRes.booking

          alert(`[Mock] Razorpay Payment Gateway\nAmount: ₹${totalPrice.toLocaleString()}\nStatus: Success\nTxn: MOCK_TXN_${Date.now()}`)
          clearCart()
          navigate(`/track/${createdBooking._id}`, {
            state: { booking: createdBooking, freshBooking: true },
          })
        } catch (err) {
          console.error('Error creating booking in fallback:', err)
          alert('Failed to save booking. Please try again.')
        } finally {
          setPaymentLoading(false)
        }
      }, 1500)
    }
  }

  // ─── Generate time slots ─────────────────────
  const timeSlots = []
  for (let h = 8; h <= 20; h++) {
    const hour12 = h > 12 ? h - 12 : h
    const ampm = h >= 12 ? 'PM' : 'AM'
    timeSlots.push({ value: `${h.toString().padStart(2, '0')}:00`, label: `${hour12}:00 ${ampm}` })
    if (h < 20) {
      timeSlots.push({ value: `${h.toString().padStart(2, '0')}:30`, label: `${hour12}:30 ${ampm}` })
    }
  }

  // ─── Today's date for min attr ───────────────
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-surface-950 py-8 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10 relative">
          {/* Background Line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-surface-800 -z-10" />
          <div
            className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-primary-500 to-electric-500 -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep
            const StepIcon = step.icon
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-primary-500 to-electric-500 text-white shadow-glow-sm scale-110'
                    : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-surface-800 text-surface-500 border border-surface-700'
                }`}>
                  {isCompleted ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider hidden md:block ${
                  isActive ? 'text-primary-400' : isCompleted ? 'text-emerald-400' : 'text-surface-600'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Step Content Card */}
        <div className="glass-card overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="p-6 md:p-8"
            >
              {/* ─── STEP 1: CART REVIEW ─────────────── */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-1">Review Your Services</h2>
                  <p className="text-sm text-surface-500 mb-6">{totalItems} item{totalItems !== 1 ? 's' : ''} selected</p>

                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart size={48} className="mx-auto text-surface-700 mb-3" />
                      <p className="text-surface-500">Your cart is empty</p>
                      <p className="text-xs text-surface-600 mt-1">Browse services to add items</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.subcategory._id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-900/50 border border-surface-800/50">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{item.subcategory.name}</h4>
                            {item.parentServiceName && (
                              <p className="text-[11px] text-surface-500 mt-0.5">{item.parentServiceName}</p>
                            )}
                            {item.subcategory.duration && (
                              <div className="flex items-center gap-1 mt-1 text-[11px] text-surface-400">
                                <Clock size={10} /> {item.subcategory.duration}
                              </div>
                            )}
                          </div>

                          <p className="text-sm font-bold text-white shrink-0">
                            ₹{(item.subcategory.price * item.quantity).toLocaleString()}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-0 rounded-lg border border-surface-700/50 overflow-hidden shrink-0">
                            <button
                              onClick={() => decrement(item.subcategory._id)}
                              className="px-2.5 py-1.5 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 py-1.5 text-xs font-bold text-white min-w-[28px] text-center tabular-nums bg-surface-800/30">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increment(item.subcategory._id)}
                              className="px-2.5 py-1.5 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.subcategory._id)}
                            className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Total */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-800">
                        <span className="text-base font-display font-bold text-white">Total</span>
                        <span className="text-xl font-display font-bold text-primary-400">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 2: PROBLEM DESCRIPTION ────── */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-1">Describe the Problem</h2>
                  <p className="text-sm text-surface-500 mb-6">Help our professional come prepared with the right tools.</p>

                  <textarea
                    value={formData.problemDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, problemDescription: e.target.value }))}
                    placeholder="e.g., The AC is leaking water from the indoor unit, and the cooling has reduced significantly over the past week..."
                    rows={6}
                    maxLength={500}
                    className="input-field w-full resize-none text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-[11px] ${formData.problemDescription.length < 10 ? 'text-amber-400' : 'text-surface-600'}`}>
                      {formData.problemDescription.length < 10
                        ? `Minimum 10 characters (${10 - formData.problemDescription.length} more)`
                        : `${formData.problemDescription.length}/500`}
                    </p>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: DATE & TIME ─────────────── */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-1">Schedule Your Booking</h2>
                  <p className="text-sm text-surface-500 mb-6">Pick a date and time that works for you.</p>

                  <div className="space-y-5">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                        <Calendar size={13} className="inline mr-1.5 -mt-0.5" />
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.bookingDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, bookingDate: e.target.value }))}
                        min={today}
                        className="input-field w-full text-sm"
                      />
                    </div>

                    {/* Time Slot Grid */}
                    <div>
                      <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                        <Clock size={13} className="inline mr-1.5 -mt-0.5" />
                        Preferred Time
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.value}
                            onClick={() => setFormData(prev => ({ ...prev, bookingTime: slot.value }))}
                            className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                              formData.bookingTime === slot.value
                                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm'
                                : 'bg-surface-800/30 text-surface-400 border border-surface-700/50 hover:border-surface-600 hover:text-surface-300'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 4: CHOOSE PROFESSIONAL ────── */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-1">Choose a Professional</h2>
                  <p className="text-sm text-surface-500 mb-6">Select a preferred expert or let us auto-assign.</p>

                  {loadingPros ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 size={28} className="animate-spin text-primary-400" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {professionals.map((pro) => {
                        const isSelected = formData.electricianId === pro._id || (pro.isAuto && formData.electricianId === null)
                        return (
                          <button
                            key={pro._id}
                            onClick={() => setFormData(prev => ({ ...prev, electricianId: pro.isAuto ? null : pro._id }))}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                              isSelected
                                ? 'border-primary-500/40 bg-primary-500/8 shadow-sm'
                                : 'border-surface-700/50 bg-surface-900/30 hover:border-surface-600'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {pro.isAuto ? (
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-electric-500/20 flex items-center justify-center shrink-0">
                                  <Zap size={20} className="text-primary-400" />
                                </div>
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                                  {pro.profilePictureUrl ? (
                                    <img src={pro.profilePictureUrl} alt={pro.name} className="w-full h-full object-cover" />
                                  ) : (
                                    pro.name.charAt(0)
                                  )}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-white">{pro.name}</h4>
                                <p className="text-[11px] text-surface-400 mt-0.5 line-clamp-2 leading-relaxed">{pro.publicBio}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-primary-400">
                                <CheckCircle2 size={12} /> Selected
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 5: PAYMENT ─────────────────── */}
              {currentStep === 5 && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/15 to-electric-500/10 flex items-center justify-center mx-auto mb-6">
                    <CreditCard size={36} className="text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">Confirm & Pay</h2>
                  <p className="text-surface-400 max-w-md mx-auto mb-8">
                    You are about to pay <strong className="text-white">₹{totalPrice.toLocaleString()}</strong> to confirm your booking.
                  </p>

                  {/* Order Summary */}
                  <div className="max-w-sm mx-auto text-left mb-8">
                    <div className="space-y-2 p-4 rounded-xl bg-surface-900/50 border border-surface-800/50">
                      {cart.map((item) => (
                        <div key={item.subcategory._id} className="flex justify-between text-sm">
                          <span className="text-surface-400 truncate pr-4">{item.subcategory.name} × {item.quantity}</span>
                          <span className="text-white font-medium shrink-0">₹{(item.subcategory.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t border-surface-800 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-white text-sm">Total</span>
                        <span className="font-bold text-primary-400">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={initializePayment}
                    disabled={paymentLoading}
                    className="inline-flex items-center gap-2.5 px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base rounded-2xl hover:shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                  >
                    {paymentLoading ? (
                      <><Loader2 size={20} className="animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard size={20} /> Pay ₹{totalPrice.toLocaleString()}</>
                    )}
                  </button>
                  <p className="text-[11px] text-surface-600 mt-3">Secured by Razorpay • 256-bit SSL encryption</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-6 md:px-8 py-5 border-t border-surface-800/50 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentStep === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
              }`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < 5 && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-electric-500 text-white font-bold text-sm rounded-xl hover:shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
