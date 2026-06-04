import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import path from 'path'
import { fileURLToPath } from 'url'
import configurePassport from './config/passport.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Route imports
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import electricianRoutes from './routes/electrician.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import serviceRoutes from './routes/service.routes.js'
import reviewRoutes from './routes/review.routes.js'
import configRoutes from './routes/config.routes.js'
import adminRoutes from './routes/admin.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import superadminRoutes from './routes/superadmin.routes.js'
import pageRoutes from './routes/page.routes.js'
import locationRoutes from './routes/location.routes.js'
import skillRequestRoutes from './routes/skillRequest.routes.js'
import subcategoryRoutes from './routes/subcategory.routes.js'

// Middleware imports
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()

// ─── Configure Passport Strategy ───
configurePassport()

// ---------------------
// Security Middleware
// ---------------------
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate limiting — skip for admin routes (already protected by JWT + role middleware)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Admin/superadmin/config routes are already protected by auth + role middleware
    const path = req.path
    return path.startsWith('/admin') ||
           path.startsWith('/superadmin') ||
           path.startsWith('/config')
  },
})
app.use('/api', limiter)

// Stricter rate limit for auth endpoints (public-facing login/OTP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
})
app.use('/api/auth', authLimiter)

// ---------------------
// Prevent API Caching
// ---------------------
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})

// ---------------------
// Body Parsing
// ---------------------
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ─── Passport (stateless, no sessions) ───
app.use(passport.initialize())

// ---------------------
// Static File Serving (uploads)
// ---------------------
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ---------------------
//  Logging
// ---------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// ---------------------
// Ignore Favicon
// ---------------------
app.get('/favicon.ico', (req, res) => res.status(204).end())

// ---------------------
// Health Check & Root
// ---------------------
app.get('/', (req, res) => {
  res.redirect('/api/health')
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Apna Catalyst API is running ⚡',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ---------------------
// API Routes
// ---------------------
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/electricians', electricianRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/config', configRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/superadmin', superadminRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/skill-requests', skillRequestRoutes)
app.use('/api', subcategoryRoutes)

// ---------------------
// Error Handling
// ---------------------
app.use(notFound)
app.use(errorHandler)

export default app
