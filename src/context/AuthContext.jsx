import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  electricianLogin as electricianLoginAPI,
  getMyProfile as getElectricianProfile,
} from '../api/electrician.api.js'
import {
  userLogin as userLoginAPI,
  userRegister as userRegisterAPI,
  sendOTP as sendOTPAPI,
  verifyOTP as verifyOTPAPI,
  getMe,
} from '../api/user.api.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'apna_electro_token'
const USER_KEY = 'apna_electro_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isAuthenticated = !!token && !!user
  const isElectrician = user?.role === 'electrician'
  const isUser = user?.role === 'user'
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // ─── Persist to localStorage ───
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  // ─── Listen for forced logouts (from interceptor) ───
  useEffect(() => {
    const handleForceLogout = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  // ─── Electrician Login ───
  const electricianLogin = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await electricianLoginAPI({ email, password })
      setToken(response.token)
      setUser({ ...response.user, role: response.user.role || 'electrician' })
      return response
    } catch (err) {
      const msg = err.message || 'Login failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── User Login (Email/Password) ───
  const userLogin = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userLoginAPI({ email, password })
      setToken(response.token)
      setUser({ ...response.user, role: response.user.role || 'user' })
      return response
    } catch (err) {
      const msg = err.message || 'Login failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── User Register ───
  const userRegister = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userRegisterAPI(data)
      setToken(response.token)
      setUser({ ...response.user, role: response.user.role || 'user' })
      return response
    } catch (err) {
      const msg = err.message || 'Registration failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Send OTP ───
  const sendOTP = useCallback(async (mobile) => {
    setLoading(true)
    setError(null)
    try {
      const response = await sendOTPAPI(mobile)
      return response
    } catch (err) {
      const msg = err.message || 'Failed to send OTP'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Verify OTP ───
  const verifyOTP = useCallback(async (mobile, otp, name) => {
    setLoading(true)
    setError(null)
    try {
      const response = await verifyOTPAPI({ mobile, otp, name })
      if (response.isNewUser) {
        // Need name to complete registration
        return response
      }
      setToken(response.token)
      setUser({ ...response.user, role: response.user.role || 'user' })
      return response
    } catch (err) {
      const msg = err.message || 'OTP verification failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Admin Login ───
  const adminLogin = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userLoginAPI({ email, password })
      const role = response.user?.role
      if (role !== 'admin' && role !== 'superadmin') {
        throw new Error('Access denied: Admin credentials required')
      }
      setToken(response.token)
      setUser({ ...response.user, role })
      return response
    } catch (err) {
      const msg = err.message || 'Admin login failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Legacy login alias (for electrician panel backward compat) ───
  const login = electricianLogin

  // ─── Logout ───
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  // ─── Refresh profile ───
  const refreshProfile = useCallback(async () => {
    if (!token) return null
    try {
      if (user?.role === 'electrician') {
        const response = await getElectricianProfile()
        const updated = { ...response.electrician, role: 'electrician' }
        setUser(updated)
        return updated
      } else {
        const response = await getMe()
        const updated = { ...response.user, role: response.user.role || 'user' }
        setUser(updated)
        return updated
      }
    } catch {
      // Token might be expired
      return null
    }
  }, [token, user?.role])

  // ─── Update user data in context (after profile save) ───
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isElectrician,
    isUser,
    isAdmin,
    // Auth methods
    login,            // backward compat (electrician panel)
    electricianLogin,
    userLogin,
    userRegister,
    adminLogin,
    sendOTP,
    verifyOTP,
    logout,
    refreshProfile,
    updateUser,
    setError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
