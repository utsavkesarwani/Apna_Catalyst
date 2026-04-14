import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Axios instance with JWT interceptors for the Apna Electro API
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
    const token = localStorage.getItem('apna_electro_token')
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
    const token = localStorage.getItem('apna_electro_token')
    const isDemoToken = token && token.startsWith('demo_token_')
    
    if (status === 401 && !isDemoToken) {
      localStorage.removeItem('apna_electro_token')
      localStorage.removeItem('apna_electro_user')

      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/electrician/login')) {
        // Dispatch custom event so auth context can react
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { message } }))
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
