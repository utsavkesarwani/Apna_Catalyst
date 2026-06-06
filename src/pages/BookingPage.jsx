import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Calendar, Clock, FileText, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, User, Loader2, Search, Mic, MicOff, CreditCard } from 'lucide-react'
import { io as socketIOClient } from 'socket.io-client'
import { services as mockServices } from '../data/services'
import { getElectricianById as mockGetById, getAvailableElectricians as mockGetAvailable } from '../data/electricians'
import { getServices, getElectricians as fetchElectricians, getElectricianById as fetchElectricianById, getBookedSlots, getSubcategoriesByService, createBooking } from '../api/user.api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'
import StarRating from '../components/ui/StarRating'

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
]

const DEFAULT_STEPS = ['Select Service', 'Select Subcategory', 'Describe Issue', 'Choose Electrician', 'Date & Time', 'Review', 'Payment']

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { cart, clearCart } = useCart()

  const [step, setStep] = useState(0)
  const steps = id 
    ? DEFAULT_STEPS.filter(s => s !== 'Choose Electrician')
    : DEFAULT_STEPS
  const [services, setServices] = useState(mockServices)
  const [availableElectricians, setAvailableElectricians] = useState([])
  const [preSelectedElectrician, setPreSelectedElectrician] = useState(null)
  const [selectedElectrician, setSelectedElectrician] = useState(null)
  const [loadingElectricians, setLoadingElectricians] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [elecSearchTerm, setElecSearchTerm] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechLang, setSpeechLang] = useState('hi-IN') // default Hindi
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const socketRef = useRef(null)

  // Check for Speech Recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

  // --- Sound effects using Web Audio API ---
  const playTone = (frequencies, durations, gainValue = 0.18) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      let time = ctx.currentTime

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, time)
        gain.gain.setValueAtTime(gainValue, time)
        gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i])
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(time)
        osc.stop(time + durations[i])
        time += durations[i] * 0.6 // slight overlap for smoothness
      })

      // Close context after sounds finish
      setTimeout(() => ctx.close(), 1000)
    } catch {
      // Silently fail if AudioContext not available
    }
  }

  const playStartSound = () => {
    // Bright ascending two-note chime: C5 → E5 → G5
    playTone([523.25, 659.25, 783.99], [0.12, 0.12, 0.18], 0.15)
  }

  const playStopSound = () => {
    // Soft descending confirmation: G5 → E5
    playTone([783.99, 523.25], [0.14, 0.22], 0.12)
  }

  // Voice-to-text handler
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    if (isListening) {
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = speechLang
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      playStartSound()
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setBooking(prev => ({
        ...prev,
        description: prev.description ? prev.description + ' ' + transcript : transcript,
      }))
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => {
      setIsListening(false)
      playStopSound()
    }

    recognition.start()
  }

  const [booking, setBooking] = useState({
    service: '',
    subcategories: [],
    description: '',
    date: '',
    time: '',
    electricianId: null,
  })

  const [subcategories, setSubcategories] = useState([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)

  const selectedService = services.find(s => s.slug === booking.service)

  const toggleSubcategory = (sub) => {
    setBooking(prev => {
      const exists = prev.subcategories.some(item => item._id === sub._id || item.id === sub.id)
      if (exists) {
        return {
          ...prev,
          subcategories: prev.subcategories.filter(item => item._id !== sub._id && item.id !== sub.id),
        }
      } else {
        return {
          ...prev,
          subcategories: [...prev.subcategories, sub],
        }
      }
    })
  }

  const handleServiceSelect = (serviceSlug) => {
    setBooking(prev => {
      if (prev.service === serviceSlug) return prev
      return {
        ...prev,
        service: serviceSlug,
        subcategories: [], // Reset selected subcategories on service change
      }
    })
  }

  // Load services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await getServices()
        if (res.services?.length > 0) {
          setServices(res.services.map(s => ({
            ...s,
            id: s._id || s.id,
            slug: s.slug,
            name: s.name,
            description: s.description,
          })))
        }
      } catch {
        // Use mock services
      }
    }
    loadServices()
  }, [])

  // Handle query parameters (e.g., ?service=general-visit)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const serviceSlug = params.get('service')
    if (serviceSlug) {
      setBooking(prev => ({ ...prev, service: serviceSlug }))
      // If service is provided, we can move to step 1 (Select Subcategory)
      setStep(1)
    }
  }, [location.search])

  // Handle incoming cart items
  useEffect(() => {
    if (location.state?.fromCart && cart.length > 0 && services.length > 0) {
      const parentName = cart[0].parentServiceName
      const matchedService = services.find(s => s.name === parentName)
      
      setBooking(prev => ({
        ...prev,
        service: matchedService ? matchedService.slug : prev.service,
        subcategories: cart.map(item => ({ ...item.subcategory, quantity: item.quantity })),
      }))
      
      // Clear location state to prevent re-trigger on refresh
      navigate(location.pathname, { replace: true, state: {} })
      
      // Proceed to Step 2 (Describe Issue)
      setStep(2)
    }
  }, [location.state?.fromCart, cart, services, navigate, location.pathname])

  // Fetch subcategories when the selected service changes
  useEffect(() => {
    if (!selectedService) {
      setSubcategories([])
      return
    }

    const loadSubcategories = async () => {
      setLoadingSubcategories(true)
      try {
        const serviceId = selectedService._id || selectedService.id
        const res = await getSubcategoriesByService(serviceId)
        if (res.subcategories) {
          setSubcategories(res.subcategories)
        } else {
          setSubcategories([])
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err)
        setSubcategories(selectedService.subcategories || [])
      } finally {
        setLoadingSubcategories(false)
      }
    }

    loadSubcategories()
  }, [booking.service, services, selectedService])

  // Handle rebook flow from rejected booking
  useEffect(() => {
    const rebookData = location.state?.rebookData
    if (!rebookData) return

    // Pre-fill from the rejected booking
    const preElec = rebookData.preSelectedElectrician
    if (preElec) {
      setPreSelectedElectrician(preElec)
      setSelectedElectrician(preElec)
    }

    setBooking(prev => ({
      ...prev,
      service: rebookData.service || prev.service,
      description: rebookData.description || prev.description,
      electricianId: preElec?.id || null,
    }))

    // Jump to Date & Time step (step 3 in default flow, step 2 if electrician pre-selected)
    // Since we have a pre-selected electrician, skip Choose Electrician
    setStep(id ? 2 : 3)
  }, [location.state?.rebookData])

  // Load pre-selected electrician
  useEffect(() => {
    if (!id) { setDataLoading(false); return }

    const loadElectrician = async () => {
      try {
        const res = await fetchElectricianById(id)
        if (res.electrician) {
          const e = res.electrician
          const normalized = {
            id: e._id || e.id,
            name: e.name,
            rating: e.rating?.avg || e.rating || 0,
            reviewCount: e.rating?.count || 0,
            experience: e.experience || 0,
            services: e.services || [],
            priceRange: e.priceRange || '₹200 - ₹5,000',
            verified: e.aadhar?.verified || e.verified || false,
            availability: e.availability || { isAvailable: true },
          }
          setPreSelectedElectrician(normalized)
          setSelectedElectrician(normalized)
          setBooking(prev => ({
            ...prev,
            service: normalized.services[0] || '',
            electricianId: normalized.id,
          }))
        }
      } catch {
        // Try mock data
        const mock = mockGetById(id)
        if (mock) {
          setPreSelectedElectrician(mock)
          setSelectedElectrician(mock)
          setBooking(prev => ({
            ...prev,
            service: mock.services[0] || '',
            electricianId: mock.id,
          }))
        }
      } finally {
        setDataLoading(false)
      }
    }
    loadElectrician()
  }, [id])

  // Load available electricians when reaching 'Choose Electrician' step
  useEffect(() => {
    const currentStepName = steps[step]
    if (currentStepName !== 'Choose Electrician') return

    const loadAvailable = async () => {
      setLoadingElectricians(true)
      try {
        const res = await fetchElectricians({
          service: booking.service,
          available: 'true',
          limit: 20,
        })
        if (res.electricians?.length > 0) {
          setAvailableElectricians(
            res.electricians.map(e => ({
              id: e._id || e.id,
              name: e.name,
              rating: e.rating?.avg || e.rating || 0,
              experience: e.experience || 0,
              services: e.services || [],
              priceRange: e.priceRange?.min 
                ? `₹${e.priceRange.min} - ₹${e.priceRange.max}` 
                : (e.priceRange || '₹200 - ₹5,000'),
              verified: e.aadhar?.verified || e.verified || false,
              location: e.location || {},
            }))
          )
        } else {
          // Fallback to mock
          setAvailableElectricians(mockGetAvailable())
        }
      } catch {
        setAvailableElectricians(mockGetAvailable())
      } finally {
        setLoadingElectricians(false)
      }
    }
    loadAvailable()
  }, [step, booking.service])

  // Update selectedElectrician when electricianId changes
  useEffect(() => {
    if (!booking.electricianId) { setSelectedElectrician(null); return }
    const found = availableElectricians.find(e => e.id === booking.electricianId)
    if (found) setSelectedElectrician(found)
    else if (preSelectedElectrician?.id === booking.electricianId) setSelectedElectrician(preSelectedElectrician)
  }, [booking.electricianId, availableElectricians, preSelectedElectrician])

  // ─── Fetch booked slots when electrician + date are selected ───
  useEffect(() => {
    const electricianIdToCheck = booking.electricianId || id
    if (!electricianIdToCheck || !booking.date) {
      setBookedSlots([])
      return
    }

    const fetchSlots = async () => {
      setLoadingSlots(true)
      try {
        const res = await getBookedSlots(electricianIdToCheck, booking.date)
        setBookedSlots(res.bookedSlots || [])
      } catch {
        setBookedSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [booking.electricianId, booking.date, id])

  // ─── Socket.IO: Real-time slot updates ───
  useEffect(() => {
    const electricianIdToWatch = booking.electricianId || id
    if (!electricianIdToWatch) return

    // Connect to Socket.IO
    const socket = socketIOClient(window.location.origin, {
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      // Join room for this electrician
      socket.emit('join:electrician', electricianIdToWatch)
    })

    // When someone books a slot
    socket.on('slot:booked', ({ date, timeSlot }) => {
      if (date === booking.date) {
        setBookedSlots(prev => {
          if (prev.includes(timeSlot)) return prev
          return [...prev, timeSlot]
        })
        // If the current user had this slot selected, deselect it
        if (booking.time === timeSlot) {
          setBooking(prev => ({ ...prev, time: '' }))
        }
      }
    })

    // When a booking is cancelled and a slot opens up
    socket.on('slot:freed', ({ date, timeSlot }) => {
      if (date === booking.date) {
        setBookedSlots(prev => prev.filter(s => s !== timeSlot))
      }
    })

    return () => {
      socket.emit('leave:electrician', electricianIdToWatch)
      socket.disconnect()
      socketRef.current = null
    }
  }, [booking.electricianId, id])

  const canProceed = () => {
    const currentStepName = steps[step]
    switch (currentStepName) {
      case 'Select Service': return !!booking.service
      case 'Select Subcategory': return booking.subcategories && booking.subcategories.length > 0
      case 'Describe Issue': return booking.description.length >= 10
      case 'Choose Electrician': return !!booking.electricianId
      case 'Date & Time': return booking.date && booking.time
      case 'Review': return true
      case 'Payment': return true
      default: return false
    }
  }

  const nextStep = () => {
    if (step < steps.length - 1) {
      // Require auth before proceeding to Payment
      const currentStepName = steps[step]
      if (currentStepName === 'Review' && !isAuthenticated) {
        navigate('/auth', { state: { from: '/booking' } })
        return
      }
      setStep(step + 1)
    }
  }

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  if (dataLoading) {
    return (
      <section className="py-10 md:py-16">
        <div className="section-container max-w-3xl text-center">
          <Loader2 size={32} className="mx-auto mb-4 text-primary-400 animate-spin" />
          <p className="text-surface-400">Loading...</p>
        </div>
      </section>
    )
  }

  const renderStep = () => {
    const currentStepName = steps[step]
    switch (currentStepName) {
      case 'Select Service':
        return (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-display font-semibold text-white mb-2">Select a Service</h2>
            <p className="text-sm text-surface-400 mb-6">What kind of electrical work do you need?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(service => (
                <button
                  key={service.slug}
                  onClick={() => handleServiceSelect(service.slug)}
                  className={`p-4 rounded-xl text-left border transition-all duration-300 ${
                    booking.service === service.slug
                      ? 'bg-primary-500/10 border-primary-500/40 shadow-glow-sm'
                      : 'bg-surface-800/30 border-surface-700/30 hover:border-surface-600'
                  }`}
                >
                  <div className="font-medium text-white text-sm">{service.name}</div>
                  <div className="text-xs text-surface-500 mt-1">{service.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 'Select Subcategory':
        return (
          <motion.div key="stepSub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-display font-semibold text-white mb-2">Select Subcategories</h2>
            <p className="text-sm text-surface-400 mb-6">
              Choose the specific services you need for <span className="text-primary-400 font-semibold">{selectedService?.name}</span>
            </p>

            {loadingSubcategories ? (
              <div className="py-12 text-center">
                <Loader2 size={32} className="mx-auto mb-4 text-primary-400 animate-spin" />
                <p className="text-surface-400">Loading subcategories...</p>
              </div>
            ) : subcategories.length === 0 ? (
              <div className="py-12 text-center bg-surface-800/20 border border-surface-700/30 rounded-xl">
                <p className="text-surface-500">No subcategories found for this service.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subcategories.map(sub => {
                  const isSelected = booking.subcategories.some(item => item._id === sub._id || item.id === sub.id)
                  return (
                    <button
                      key={sub._id || sub.id}
                      type="button"
                      onClick={() => toggleSubcategory(sub)}
                      className={`p-4 rounded-xl text-left border transition-all duration-300 flex gap-4 items-start ${
                        isSelected
                          ? 'bg-primary-500/10 border-primary-500/40 shadow-glow-sm scale-[1.01]'
                          : 'bg-surface-800/30 border-surface-700/30 hover:border-surface-600'
                      }`}
                    >
                      {sub.imageUrl && (
                        <img 
                          src={sub.imageUrl} 
                          alt={sub.name} 
                          className="w-16 h-16 object-cover rounded-lg shrink-0 border border-surface-700/50"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm flex items-center justify-between gap-2">
                          <span className="truncate">{sub.name}</span>
                          <span className="text-primary-400 font-bold shrink-0">₹{sub.price}</span>
                        </div>
                        {sub.shortDescription && (
                          <p className="text-xs text-surface-400 mt-1 line-clamp-2 leading-relaxed">
                            {sub.shortDescription}
                          </p>
                        )}
                        {sub.duration && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-surface-500">
                            <Clock size={10} />
                            <span>{sub.duration}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )

      case 'Describe Issue':
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-display font-semibold text-white mb-1">Describe the Issue</h2>
            <p className="text-sm text-amber-400/90 font-medium mb-1">अपनी समस्या बताएं / Apni problem batayein</p>
            <p className="text-sm text-surface-400 mb-4">Help the electrician understand your problem</p>

            {/* Bilingual hint card */}
            <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/30 mb-4">
              <p className="text-xs text-surface-300 leading-relaxed">
                <span className="text-amber-400/80">💡</span>{' '}
                Aap Hindi, Hinglish ya English mein likh sakte hain — jo bhi aapko aasan lage!
                <br />
                <span className="text-surface-500">आप हिंदी, हिंग्लिश या इंग्लिश में लिख सकते हैं — जो भी आसान लगे!</span>
              </p>
            </div>

            {/* Textarea with mic button */}
            <div className="relative">
              <textarea
                value={booking.description}
                onChange={(e) => setBooking(prev => ({ ...prev, description: e.target.value }))}
                placeholder={'e.g., Mere ghar ka fan awaaz kar raha hai aur hil raha hai... \nउदाहरण: मेरे घर का पंखा आवाज़ कर रहा है और हिल रहा है...\ne.g., My ceiling fan is making noise and wobbling...'}
                rows={6}
                maxLength={500}
                className="input-field resize-none pr-14"
              />
              {/* Mic button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-3 top-3 p-2.5 rounded-xl transition-all duration-300 ${
                    isListening
                      ? 'bg-red-500/20 border border-red-500/50 text-red-400 shadow-[0_0_16px_rgba(239,68,68,0.25)] animate-pulse'
                      : 'bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500/20 hover:shadow-glow-sm'
                  }`}
                  title={isListening ? 'Listening... tap to stop / सुन रहा है... रोकने के लिए दबाएं' : 'Tap to speak / बोलने के लिए दबाएं'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
            </div>

            {/* Listening indicator */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs text-red-400">Listening... बोलिए, हम सुन रहे हैं!</span>
              </motion.div>
            )}

            {/* Language selector for mic */}
            {speechSupported && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-surface-500">🎙️ Mic language / माइक भाषा:</span>
                <div className="flex gap-1.5">
                  {[
                    { code: 'hi-IN', label: 'हिंदी' },
                    { code: 'en-IN', label: 'English' },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSpeechLang(lang.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        speechLang === lang.code
                          ? 'bg-primary-500/15 text-primary-400 border-primary-500/40'
                          : 'bg-surface-800/30 text-surface-400 border-surface-700/30 hover:border-surface-600'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-surface-500 mt-2">
              {booking.description.length}/500 characters (min 10) • कम से कम 10 अक्षर लिखें
            </p>
          </motion.div>
        )

      case 'Choose Electrician':
        return renderChooseElectrician()
      case 'Date & Time':
        return renderDateTime()
      case 'Review':
        return renderReview()
      case 'Payment':
        return renderPayment()
      default:
        return null
    }
  }

  const renderChooseElectrician = () => (
    <motion.div key="stepChoose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-white mb-1">Choose Electrician</h2>
          <p className="text-sm text-surface-400">Select a verified professional for your job</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by name..."
            className="input-field pl-10 pr-4 py-2 text-sm w-full"
            value={elecSearchTerm}
            onChange={(e) => setElecSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loadingElectricians ? (
        <div className="p-12 text-center glass-card">
          <Loader2 size={32} className="mx-auto mb-4 text-primary-400 animate-spin" />
          <p className="text-surface-400">Finding best matches for you...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableElectricians
            .filter(e => {
              const matchesService = !booking.service || e.services?.includes(booking.service);
              const matchesSearch = !elecSearchTerm || e.name.toLowerCase().includes(elecSearchTerm.toLowerCase());
              return matchesService && matchesSearch;
            })
            .sort((a, b) => {
              const userPin = user?.location?.pincode || '';
              if (userPin) {
                const aMatch = a.location?.pincode === userPin;
                const bMatch = b.location?.pincode === userPin;
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
              }
              const userCity = user?.location?.city?.toLowerCase() || '';
              if (userCity) {
                const aMatch = a.location?.city?.toLowerCase() === userCity;
                const bMatch = b.location?.city?.toLowerCase() === userCity;
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
              }
              const aRating = a.rating?.avg || a.rating || 0;
              const bRating = b.rating?.avg || b.rating || 0;
              return bRating - aRating;
            })
            .map(elec => {
              const initials = elec.name.split(' ').map(n => n[0]).join('')
              const isSelected = booking.electricianId === elec.id
              return (
                <button
                  key={elec.id}
                  type="button"
                  onClick={() => setBooking(prev => ({ ...prev, electricianId: elec.id }))}
                  className={`w-full p-4 rounded-xl text-left border transition-all duration-300 flex items-center gap-4 ${
                    isSelected
                      ? 'bg-primary-500/15 border-primary-500 shadow-glow-sm scale-[1.01]'
                      : 'bg-surface-800/30 border-surface-700/30 hover:border-surface-600'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-primary-300">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{elec.name}</span>
                      {elec.verified && <CheckCircle size={13} className="text-primary-400" />}
                      {user?.location?.pincode === elec.location?.pincode && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">NEARBY</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={elec.rating} size={11} />
                      <span className="text-xs text-surface-500">{elec.experience} yrs exp • {elec.location?.city || 'India'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-white block">{elec.priceRange}</span>
                    <span className="text-[10px] text-surface-500">Min. visit fee</span>
                  </div>
                </button>
              )
            })}
        </div>
      )}
    </motion.div>
  )

  const renderDateTime = () => {
    const availableCount = timeSlots.length - bookedSlots.length
    return (
    <motion.div key="stepTime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-xl font-display font-semibold text-white mb-2">Choose Date & Time</h2>
      <p className="text-sm text-surface-400 mb-6">Pick a convenient slot</p>
      
      {/* Dates */}
      <div className="mb-6">
        <label className="text-sm font-medium text-surface-300 mb-3 flex items-center gap-2">
          <Calendar size={14} /> Select Date
        </label>
        <div className="scroll-container">
          {dates.map(date => {
            const dateStr = date.toISOString().split('T')[0]
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <button
                key={dateStr}
                onClick={() => setBooking(prev => ({ ...prev, date: dateStr, time: '' }))}
                className={`px-5 py-4 rounded-xl text-center border transition-all duration-300 min-w-[90px] ${
                  booking.date === dateStr
                    ? 'bg-primary-500/15 border-primary-500/40 shadow-glow-sm'
                    : 'bg-surface-800/30 border-surface-700/30 hover:border-surface-600'
                }`}
              >
                <div className="text-[10px] text-surface-500 uppercase">
                  {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold text-white mt-1">{date.getDate()}</div>
                <div className="text-[10px] text-surface-500">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <label className="text-sm font-medium text-surface-300 mb-3 flex items-center gap-2">
          <Clock size={14} /> Select Time
          {booking.date && !loadingSlots && (
            <span className="text-xs text-surface-500 ml-auto">
              {availableCount} of {timeSlots.length} slots available
            </span>
          )}
        </label>

        {loadingSlots ? (
          <div className="flex items-center gap-2 py-4 justify-center">
            <Loader2 size={16} className="text-primary-400 animate-spin" />
            <span className="text-sm text-surface-400">Checking availability...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {timeSlots.map(time => {
              const isBooked = bookedSlots.includes(time)
              const isSelected = booking.time === time
              return (
                <button
                  key={time}
                  disabled={isBooked}
                  onClick={() => !isBooked && setBooking(prev => ({ ...prev, time }))}
                  className={`relative px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 ${
                    isBooked
                      ? 'bg-red-500/5 text-surface-600 border-surface-800/40 cursor-not-allowed line-through opacity-60'
                      : isSelected
                        ? 'bg-primary-500/15 text-primary-400 border-primary-500/40'
                        : 'bg-surface-800/30 text-surface-400 border-surface-700/30 hover:border-surface-600'
                  }`}
                  title={isBooked ? 'This slot is already booked / यह स्लॉट पहले से बुक है' : `Select ${time}`}
                >
                  {time}
                  {isBooked && (
                    <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded text-[8px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 leading-none">
                      Booked
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* All slots booked warning */}
        {booking.date && !loadingSlots && availableCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-400 font-medium">All slots booked for this date</p>
              <p className="text-xs text-surface-500 mt-0.5">Kripya doosri date chunein / Please pick another date</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )}

  const renderReview = () => (
    <motion.div key="stepReview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-xl font-display font-semibold text-white mb-2">Review Booking</h2>
      <p className="text-sm text-surface-400 mb-6">Confirm everything looks good</p>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
          <span className="text-xs text-surface-500">Service Category</span>
          <p className="font-medium text-white">{selectedService?.name || booking.service}</p>
        </div>
        {booking.subcategories && booking.subcategories.length > 0 && (
          <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
            <span className="text-xs text-surface-500">Subcategories</span>
            <div className="mt-1 space-y-1.5">
              {booking.subcategories.map(sub => (
                <div key={sub._id || sub.id} className="flex justify-between text-sm">
                  <span className="text-surface-300">{sub.name}</span>
                  <span className="text-white font-semibold">₹{sub.price}</span>
                </div>
              ))}
              <div className="border-t border-surface-700/50 pt-1.5 mt-1.5 flex justify-between text-sm font-bold">
                <span className="text-white">Total Service Charge</span>
                <span className="text-primary-400">
                  ₹{booking.subcategories.reduce((acc, sub) => acc + (sub.price || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
          <span className="text-xs text-surface-500">Problem Description</span>
          <p className="text-sm text-surface-300 mt-1">{booking.description}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 flex gap-6">
          <div>
            <span className="text-xs text-surface-500">Date</span>
            <p className="font-medium text-white">
              {booking.date && new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <span className="text-xs text-surface-500">Time</span>
            <p className="font-medium text-white">{booking.time}</p>
          </div>
        </div>
        {selectedElectrician && (
          <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-electric-500/20 flex items-center justify-center">
              <User size={20} className="text-primary-300" />
            </div>
            <div>
              <span className="text-xs text-surface-500">Electrician</span>
              <p className="font-medium text-white">{selectedElectrician.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <StarRating rating={selectedElectrician.rating} size={11} />
              </div>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="p-3 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center gap-2">
            <AlertCircle size={14} className="text-accent-400 flex-shrink-0" />
            <span className="text-xs text-accent-400">You'll need to sign in to complete your booking</span>
          </div>
        )}
      </div>
    </motion.div>
  )

  // ─── Payment Logic ───────────────────────────────
  const totalServicePrice = booking.subcategories.reduce((acc, sub) => acc + (sub.price || 0) * (sub.quantity || 1), 0)

  const convertTimeTo24h = (time12h) => {
    if (!time12h) return '10:00'
    const [time, modifier] = time12h.split(' ')
    let [hours, minutes] = time.split(':')
    if (hours === '12') hours = '00'
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12
    return `${String(hours).padStart(2, '0')}:${minutes}`
  }

  const initializePayment = async () => {
    setPaymentLoading(true)

    const bookingPayload = {
      electricianId: booking.electricianId,
      service: selectedService?.name || booking.service,
      cartItems: booking.subcategories.map(sub => ({
        subcategory: sub._id || sub.id,
        name: sub.name,
        quantity: sub.quantity || 1,
        price: sub.price,
      })),
      problemDescription: booking.description,
      scheduledAt: booking.date && booking.time
        ? new Date(`${booking.date}T${convertTimeTo24h(booking.time)}`).toISOString()
        : new Date().toISOString(),
      timeSlot: booking.time || '10:00 AM',
      paymentMethod: 'card',
      paymentStatus: 'completed',
    }

    const options = {
      key: 'rzp_test_XXXXXXXXXXXXXXX',
      amount: totalServicePrice * 100,
      currency: 'INR',
      name: 'Apna Catalyst',
      description: `Booking – ${booking.subcategories.map(s => s.name).join(', ')}`,
      handler: async function (response) {
        try {
          const bookingRes = await createBooking(bookingPayload)
          const createdBooking = bookingRes.booking
          alert(`Payment Successful!\nTransaction ID: ${response.razorpay_payment_id || 'MOCK_TXN_' + Date.now()}`)
          clearCart() // Clear the global cart after successful payment
          navigate(`/track/${createdBooking._id}`, {
            state: { booking: createdBooking, freshBooking: true },
          })
        } catch (err) {
          console.error('Error creating booking:', err)
          navigate('/track/BK-DEMO', {
            state: { booking: bookingPayload, freshBooking: true },
          })
        } finally {
          setPaymentLoading(false)
        }
      },
      prefill: {},
    }

    if (typeof window.Razorpay !== 'undefined') {
      const rzp = new window.Razorpay(options)
      rzp.open()
      setPaymentLoading(false)
    } else {
      // Fallback mock for development
      setTimeout(async () => {
        try {
          const bookingRes = await createBooking(bookingPayload)
          const createdBooking = bookingRes.booking
          alert(`[Mock] Payment Gateway\nAmount: ₹${totalServicePrice.toLocaleString()}\nStatus: Success\nTxn: MOCK_TXN_${Date.now()}`)
          clearCart() // Clear the global cart after mock payment
          navigate(`/track/${createdBooking._id}`, {
            state: { booking: createdBooking, freshBooking: true },
          })
        } catch (err) {
          console.error('Error creating booking:', err)
          alert(`[Mock] Payment Gateway\nAmount: ₹${totalServicePrice.toLocaleString()}\nStatus: Success`)
          navigate('/track/BK-DEMO', {
            state: { booking: bookingPayload, freshBooking: true },
          })
        } finally {
          setPaymentLoading(false)
        }
      }, 1500)
    }
  }

  const renderPayment = () => (
    <motion.div key="stepPayment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/15 to-electric-500/10 flex items-center justify-center mx-auto mb-6">
          <CreditCard size={36} className="text-primary-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Confirm & Pay</h2>
        <p className="text-surface-400 max-w-md mx-auto mb-8">
          You are about to pay <strong className="text-white">₹{totalServicePrice.toLocaleString()}</strong> to confirm your booking.
        </p>

        {/* Order Summary */}
        <div className="max-w-sm mx-auto text-left mb-8">
          <div className="space-y-2 p-4 rounded-xl bg-surface-900/50 border border-surface-800/50">
            {booking.subcategories.map((sub) => (
              <div key={sub._id || sub.id} className="flex justify-between text-sm">
                <span className="text-surface-400 truncate pr-4">
                  {sub.name} {sub.quantity > 1 ? `× ${sub.quantity}` : ''}
                </span>
                <span className="text-white font-medium shrink-0">₹{(sub.price * (sub.quantity || 1))?.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-surface-800 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-white text-sm">Total</span>
              <span className="font-bold text-primary-400">₹{totalServicePrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={initializePayment}
          disabled={paymentLoading}
          className="inline-flex items-center gap-2.5 px-10 py-3.5 bg-gradient-to-r from-primary-500 to-electric-500 text-white font-bold text-base rounded-2xl hover:shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        >
          {paymentLoading ? (
            <><Loader2 size={20} className="animate-spin" /> Processing...</>
          ) : (
            <><CreditCard size={20} /> Pay ₹{totalServicePrice.toLocaleString()}</>
          )}
        </button>
        <p className="text-[11px] text-surface-600 mt-3">Secured by Razorpay • 256-bit SSL encryption</p>
      </div>
    </motion.div>
  )

  return (
    <section className="py-10 md:py-16">
      <div className="section-container max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  i < step ? 'bg-primary-500 text-white'
                  : i === step ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40 shadow-glow-sm'
                  : 'bg-surface-800 text-surface-600'
                }`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`hidden sm:block w-12 md:w-20 h-0.5 mx-1 transition-colors duration-500 ${
                    i < step ? 'bg-primary-500' : 'bg-surface-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <span key={s} className={`text-[10px] hidden sm:block transition-colors ${
                i === step ? 'text-primary-400' : 'text-surface-600'
              }`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-6 md:p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-800/50">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {steps[step] !== 'Payment' && (
              <Button
                variant="primary"
                size="md"
                icon={steps[step] === 'Review' ? Zap : ChevronRight}
                iconPosition="right"
                onClick={nextStep}
                disabled={!canProceed()}
              >
                {steps[step] === 'Review' ? 'Proceed to Payment' : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
