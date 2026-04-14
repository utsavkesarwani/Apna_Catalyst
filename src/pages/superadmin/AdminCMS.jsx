import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, Save, Loader2, Type, Image, FileText, Phone,
  Mail, MapPin, CheckCircle2, AlertCircle, Sparkles, Layout
} from 'lucide-react'
import { getPublicConfig, bulkUpdateConfig } from '../../api/admin.api.js'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const defaultConfig = {
  site_name: 'Apna Electro',
  site_tagline: 'Expert Electricians at Your Doorstep',
  site_description: 'India\'s #1 platform for trusted, verified electrical service professionals.',
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
  featured_electricians: '',
}

export default function AdminCMS() {
  const [config, setConfig] = useState({ ...defaultConfig })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const { refreshConfig } = useSiteConfig()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const res = await getPublicConfig()
      setConfig(prev => ({ ...prev, ...(res.config || {}) }))
    } catch {
      // Keep defaults
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const configs = Object.entries(config).map(([key, value]) => ({
        key,
        value: String(value),
        type: 'string',
        group: getGroup(key),
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }))
      await bulkUpdateConfig(configs)
      // Refresh global config so all components update instantly
      await refreshConfig()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const getGroup = (key) => {
    if (key.startsWith('site_')) return 'general'
    if (key.startsWith('contact_')) return 'contact'
    if (key.startsWith('hero_')) return 'hero'
    if (key.startsWith('banner_')) return 'banners'
    if (key.startsWith('meta_')) return 'seo'
    if (key.startsWith('featured_')) return 'featured'
    return 'general'
  }

  const updateField = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { key: 'general', label: 'Site Settings', icon: Globe },
    { key: 'hero', label: 'Hero Section', icon: Sparkles },
    { key: 'banners', label: 'Banners', icon: Layout },
    { key: 'seo', label: 'SEO', icon: FileText },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Content Management</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your site content and settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle2 size={16} /> Saved!</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'text-surface-400 border border-surface-700/50 hover:text-white hover:border-surface-600'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Globe size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Site Settings</h3>
              <p className="text-sm text-surface-500">Basic site information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5">
                <Type size={14} className="inline mr-1.5" />Site Name
              </label>
              <input
                type="text"
                value={config.site_name}
                onChange={(e) => updateField('site_name', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5">
                <Type size={14} className="inline mr-1.5" />Tagline
              </label>
              <input
                type="text"
                value={config.site_tagline}
                onChange={(e) => updateField('site_tagline', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-1.5">
              <FileText size={14} className="inline mr-1.5" />Site Description
            </label>
            <textarea
              value={config.site_description}
              onChange={(e) => updateField('site_description', e.target.value)}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="border-t border-surface-800/50 pt-5">
            <h4 className="text-sm font-semibold text-white mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">
                  <Mail size={14} className="inline mr-1.5" />Email
                </label>
                <input
                  type="email"
                  value={config.contact_email}
                  onChange={(e) => updateField('contact_email', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">
                  <Phone size={14} className="inline mr-1.5" />Phone
                </label>
                <input
                  type="text"
                  value={config.contact_phone}
                  onChange={(e) => updateField('contact_phone', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">
                  <MapPin size={14} className="inline mr-1.5" />Address
                </label>
                <input
                  type="text"
                  value={config.contact_address}
                  onChange={(e) => updateField('contact_address', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section Editor */}
      {activeTab === 'hero' && (
        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Hero Section</h3>
              <p className="text-sm text-surface-500">Customize the homepage hero section</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-1.5">Headline</label>
            <input
              type="text"
              value={config.hero_headline}
              onChange={(e) => updateField('hero_headline', e.target.value)}
              className="input-field text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-1.5">Sub-headline</label>
            <input
              type="text"
              value={config.hero_subheadline}
              onChange={(e) => updateField('hero_subheadline', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5">Primary CTA Text</label>
              <input
                type="text"
                value={config.hero_cta_primary}
                onChange={(e) => updateField('hero_cta_primary', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5">Secondary CTA Text</label>
              <input
                type="text"
                value={config.hero_cta_secondary}
                onChange={(e) => updateField('hero_cta_secondary', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-1.5">
              <Image size={14} className="inline mr-1.5" />Background Image URL
            </label>
            <input
              type="url"
              value={config.hero_bg_image}
              onChange={(e) => updateField('hero_bg_image', e.target.value)}
              placeholder="https://example.com/hero-image.jpg"
              className="input-field"
            />
          </div>

          {/* Preview Card */}
          <div className="border-t border-surface-800/50 pt-5">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-3">Preview</p>
            <div className="rounded-2xl bg-hero-gradient p-8 border border-surface-800/50 relative overflow-hidden">
              {config.hero_bg_image && (
                <div className="absolute inset-0 opacity-20">
                  <img src={config.hero_bg_image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative z-10 text-center max-w-xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-white mb-2">{config.hero_headline}</h2>
                <p className="text-sm text-surface-400 mb-5">{config.hero_subheadline}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-electric-500 text-white text-sm font-semibold rounded-xl">
                    {config.hero_cta_primary}
                  </span>
                  <span className="px-4 py-2 border border-primary-500/30 text-primary-400 text-sm font-semibold rounded-xl">
                    {config.hero_cta_secondary}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Banners */}
      {activeTab === 'banners' && (
        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Layout size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Promotional Banners</h3>
              <p className="text-sm text-surface-500">Manage announcement banners</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-1.5">Banner Text</label>
            <input
              type="text"
              value={config.banner_text}
              onChange={(e) => updateField('banner_text', e.target.value)}
              placeholder="🎉 Your promotional text here"
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-surface-400">Banner Active</label>
            <button
              onClick={() => updateField('banner_active', config.banner_active === 'true' ? 'false' : 'true')}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                config.banner_active === 'true' ? 'bg-emerald-500' : 'bg-surface-700'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                config.banner_active === 'true' ? 'left-[26px]' : 'left-0.5'
              }`} />
            </button>
            <span className={`text-xs font-medium ${config.banner_active === 'true' ? 'text-emerald-400' : 'text-surface-500'}`}>
              {config.banner_active === 'true' ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Preview */}
          {config.banner_active === 'true' && config.banner_text && (
            <div className="border-t border-surface-800/50 pt-5">
              <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-3">Preview</p>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 text-center">
                <span className="text-sm text-white font-medium">{config.banner_text}</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* SEO Settings */}
      {activeTab === 'seo' && (
        <motion.div variants={item} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <FileText size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">SEO Settings</h3>
              <p className="text-sm text-surface-500">Search engine optimization</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-1.5">Meta Title</label>
            <input
              type="text"
              value={config.meta_title}
              onChange={(e) => updateField('meta_title', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-surface-500 mt-1">{config.meta_title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-1.5">Meta Description</label>
            <textarea
              value={config.meta_description}
              onChange={(e) => updateField('meta_description', e.target.value)}
              rows={3}
              className="input-field resize-none"
            />
            <p className="text-xs text-surface-500 mt-1">{config.meta_description.length}/160 characters</p>
          </div>

          {/* Preview */}
          <div className="border-t border-surface-800/50 pt-5">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-3">Search Preview</p>
            <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
              <p className="text-blue-400 text-base font-medium mb-1 truncate">{config.meta_title || 'Page Title'}</p>
              <p className="text-emerald-400 text-xs mb-1">https://apnaelectro.com</p>
              <p className="text-surface-400 text-sm line-clamp-2">{config.meta_description || 'Meta description preview...'}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
