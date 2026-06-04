import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Axios instance with JWT interceptors for the Apna Catalyst API
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor: Attach JWT token ───
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apna_catalyst_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor: Handle auth errors ───
apiClient.interceptors.response.use(
  (response) => response.data, // Unwrap response data
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    const status = error.response?.status

    // Token expired or invalid — force logout
    // (Skip this if we're using a demo testing token)
    const token = localStorage.getItem('apna_catalyst_token')
    const isDemoToken = token && token.startsWith('demo_token_')
    
    if (status === 401 && !isDemoToken) {
      localStorage.removeItem('apna_catalyst_token')
      localStorage.removeItem('apna_catalyst_user')

      const path = window.location.pathname
      // Only redirect if not already on an auth/login page
      if (!path.includes('/auth') && !path.includes('/electrician/login') && !path.includes('/superadmin/login')) {
        if (path.startsWith('/superadmin')) {
          // Redirect admin users to the admin login page
          window.location.href = '/superadmin/login'
        } else {
          // Dispatch custom event so auth context can react
          window.dispatchEvent(new CustomEvent('auth:logout', { detail: { message } }))
        }
      }
    }

    return Promise.reject({
      message,
      status,
      errors: error.response?.data?.errors || [],
      raw: error,
    })
  }
)

export default apiClient
