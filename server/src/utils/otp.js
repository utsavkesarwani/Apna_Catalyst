/**
 * OTP generation and verification utility
 * In development, uses a mock service that always generates '123456'
 * In production, integrate Twilio / MSG91
 */

// In-memory OTP store for mock service (dev only)
const otpStore = new Map()

/**
 * Generate a 6-digit OTP
 */
const generateOTPCode = () => {
  if (process.env.OTP_SERVICE === 'mock') {
    return '123456' // Fixed OTP for development
  }
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP to a mobile number
 * @param {string} mobile - 10-digit Indian mobile number
 * @returns {Object} { success, message, otp (only in dev) }
 */
export const sendOTP = async (mobile) => {
  const otp = generateOTPCode()
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '5') * 60 * 1000))

  if (process.env.OTP_SERVICE === 'mock') {
    // Store in memory for mock
    otpStore.set(mobile, { code: otp, expiresAt })
    console.log(`📱 [Mock OTP] ${mobile}: ${otp}`)
    return {
      success: true,
      message: 'OTP sent successfully (mock)',
      otp, // Only include in dev for testing
      expiresAt,
    }
  }

  // --- Twilio Integration (uncomment when ready) ---
  // try {
  //   const twilio = await import('twilio')
  //   const client = twilio.default(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  //   await client.messages.create({
  //     body: `Your Apna Electro verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.`,
  //     from: process.env.TWILIO_PHONE,
  //     to: `+91${mobile}`,
  //   })
  // } catch (err) {
  //   console.error('Twilio OTP error:', err)
  //   throw new Error('Failed to send OTP')
  // }

  return {
    success: true,
    message: 'OTP sent successfully',
    expiresAt,
  }
}

/**
 * Verify an OTP code
 * @param {string} mobile
 * @param {string} code
 * @param {Object} storedOtp - { code, expiresAt } from database
 * @returns {boolean}
 */
export const verifyOTP = (mobile, code, storedOtp = null) => {
  if (process.env.OTP_SERVICE === 'mock') {
    // Check in-memory store
    const entry = otpStore.get(mobile)
    console.log('[Mock Verify]', { mobile, code, entryFound: !!entry })
    if (!entry) return false
    if (new Date() > entry.expiresAt) {
      console.log('[Mock Verify] Expired!')
      otpStore.delete(mobile)
      return false
    }
    const valid = entry.code === code
    console.log('[Mock Verify] result:', valid)
    // Do not delete immediately. The two-step registration requires the OTP to be valid twice 
    // (first to check if they are new, second to actually create the account).
    // It will be purged automatically after 5 minutes anyway.
    return valid
  }

  // Check stored OTP from database
  if (!storedOtp || !storedOtp.code) return false
  if (new Date() > new Date(storedOtp.expiresAt)) return false
  return storedOtp.code === code
}

/**
 * Get OTP data to store in database
 */
export const getOTPData = (mobile) => {
  const otp = generateOTPCode()
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '5') * 60 * 1000))
  return { code: otp, expiresAt }
}
