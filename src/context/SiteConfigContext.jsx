import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getPublicConfig } from '../api/admin.api.js'

const SiteConfigContext = createContext(null)

const defaultConfig = {
  site_name: 'Apna Electro',
  site_tagline: 'Expert Electricians at Your Doorstep',
  site_description: "India's #1 platform for trusted, verified electrical service professionals.",
  contact_email: 'support@apnaelectro.com',
  contact_phone: '+91 98765 43210',
  contact_address: 'New Delhi, India',
  hero_headline: 'Expert Electricians at Your Doorstep',
  hero_subheadline: '10,000+ happy customers | Verified professionals | Same day service',
  hero_cta_primary: 'Book Now',
  hero_cta_secondary: 'Explore Services',
  hero_bg_image: '',
  banner_text: '🎉 Get 20% off on your first booking! Use code FIRST20',
  banner_active: 'true',
  meta_title: 'Apna Electro — Trusted Electrical Services',
  meta_description: 'Book trusted, verified electricians for all your electrical needs. Fast service, fair prices.',
}

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState({ ...defaultConfig })
  const [loading, setLoading] = useState(true)

  const loadConfig = useCallback(async () => {
    try {
      const res = await getPublicConfig()
      setConfig(prev => ({ ...prev, ...(res.config || {}) }))
    } catch {
      // Keep defaults on error — the site still works
    } finally {
      setLoading(false)
    }
  }, [])

  // Load config on mount
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  /**
   * Refresh config from server — called after CMS saves
   */
  const refreshConfig = useCallback(async () => {
    try {
      const res = await getPublicConfig()
      setConfig(prev => ({ ...prev, ...(res.config || {}) }))
    } catch {
      // Silently fail — UI keeps current values
    }
  }, [])

  /**
   * Get a config value with optional fallback
   */
  const getConfigValue = useCallback(
    (key, fallback = '') => config[key] ?? fallback,
    [config],
  )

  const value = {
    config,
    loading,
    refreshConfig,
    getConfigValue,
  }

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext)
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider')
  }
  return context
}

export default SiteConfigContext
