import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  User, Camera, MapPin, Phone, Mail, Shield, FileText,
  Plus, X, Upload, CheckCircle2, Clock, Award, Save,
  Briefcase, Edit3, Eye, Loader2, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateProfile as updateProfileAPI, uploadMedia } from '../../api/electrician.api.js'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ElectricianProfile() {
  const { user, updateUser, refreshProfile } = useAuth()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    experience: user?.experience || 0,
    bio: user?.bio || '',
    location: user?.location || { city: '', state: '', pincode: '' },
    categories: user?.categories || [],
    topBadge: user?.topBadge || '',
    completedJobs: user?.stats?.completedBookings || 0,
    aadhar: user?.aadhar || { verified: false },
    isApproved: user?.isApproved ?? false,
    workImages: user?.workImages || [],
    workVideo: user?.workVideo || '',
    profilePhoto: user?.profilePhoto || '',
  })

  const [editing, setEditing] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleLocationChange = (field, value) => {
    setProfile(prev => ({ ...prev, location: { ...prev.location, [field]: value } }))
  }

  const addCategory = () => {
    if (newCategory.trim() && !profile.categories.includes(newCategory.trim())) {
      setProfile(prev => ({ ...prev, categories: [...prev.categories, newCategory.trim()] }))
      setNewCategory('')
    }
  }

  const removeCategory = (cat) => {
    setProfile(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const isDemo = localStorage.getItem('apna_electro_token') === 'demo_token_electrician_preview'

    if (isDemo) {
      setTimeout(() => {
        const payload = {
          name: profile.name,
          bio: profile.bio,
          categories: profile.categories,
          location: profile.location,
        }
        updateUser(payload)
        setSuccess('Profile updated successfully! (Demo Mode)')
        setEditing(false)
        setSaving(false)
        setTimeout(() => setSuccess(null), 3000)
      }, 600)
      return
    }

    try {
      const payload = {
        name: profile.name,
        bio: profile.bio,
        categories: profile.categories,
        location: profile.location,
      }
      const response = await updateProfileAPI(payload)
      updateUser(response.electrician)
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    setError(null)

    const isDemo = localStorage.getItem('apna_electro_token') === 'demo_token_electrician_preview'

    if (isDemo) {
      setTimeout(() => {
        const newImages = Array.from(files).map(f => URL.createObjectURL(f))
        const updatedImages = [...(profile.workImages || []), ...newImages]
        setProfile(prev => ({ ...prev, workImages: updatedImages }))
        updateUser({ workImages: updatedImages })
        setSuccess('Images uploaded! (Demo Mode)')
        setUploading(false)
        setTimeout(() => setSuccess(null), 3000)
      }, 800)
      return
    }

    try {
      const formData = new FormData()
      for (const file of files) {
        formData.append('workImages', file)
      }
      const result = await uploadMedia(formData)
      setProfile(prev => ({ ...prev, workImages: result.electrician?.workImages || prev.workImages }))
      updateUser({ workImages: result.electrician?.workImages })
      setSuccess('Images uploaded!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    const isDemo = localStorage.getItem('apna_electro_token') === 'demo_token_electrician_preview'

    if (isDemo) {
      setTimeout(() => {
        const videoUrl = URL.createObjectURL(file)
        setProfile(prev => ({ ...prev, workVideo: videoUrl }))
        updateUser({ workVideo: videoUrl })
        setSuccess('Video uploaded! (Demo Mode)')
        setUploading(false)
        setTimeout(() => setSuccess(null), 3000)
      }, 800)
      return
    }

    try {
      const formData = new FormData()
      formData.append('workVideo', file)
      const result = await uploadMedia(formData)
      setProfile(prev => ({ ...prev, workVideo: result.electrician?.workVideo || prev.workVideo }))
      updateUser({ workVideo: result.electrician?.workVideo })
      setSuccess('Video uploaded!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Profile</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your profile information and settings</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-50 ${
            editing
              ? 'btn-primary'
              : 'bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20'
          }`}
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : editing ? (
            <><Save size={16} /> Save Changes</>
          ) : (
            <><Edit3 size={16} /> Edit Profile</>
          )}
        </button>
      </motion.div>

      {/* Feedback Messages */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} /> {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 size={16} /> {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <motion.div variants={item} className="glass-card p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center text-white text-4xl font-bold shadow-glow-md overflow-hidden">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              {editing && (
                <button className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-white mt-4">{profile.name}</h2>
            <p className="text-sm text-surface-500">{profile.location.city}, {profile.location.state}</p>
            {profile.topBadge && (
              <div className="flex items-center gap-2 mt-2">
                <span className="badge-accent">
                  <Award size={12} /> {profile.topBadge}
                </span>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Verification</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 border border-surface-700/30">
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-surface-400" />
                  <span className="text-sm text-surface-300">Aadhar</span>
                </div>
                {profile.aadhar.verified ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 size={14} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
                    <Clock size={14} /> Pending
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 border border-surface-700/30">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-surface-400" />
                  <span className="text-sm text-surface-300">Admin Approval</span>
                </div>
                {profile.isApproved ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 size={14} /> Approved
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
                    <Clock size={14} /> Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center">
              <p className="text-lg font-display font-bold text-white">{profile.experience}</p>
              <p className="text-xs text-surface-500">Years Exp.</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-800/30 border border-surface-700/30 text-center">
              <p className="text-lg font-display font-bold text-white">{profile.completedJobs.toLocaleString()}</p>
              <p className="text-xs text-surface-500">Jobs Done</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Editable Fields */}
        <motion.div variants={item} className="xl:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
              <User size={20} className="text-primary-400" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!editing}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> Email</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">
                  <span className="flex items-center gap-1.5"><Phone size={14} /> Mobile</span>
                </label>
                <input
                  type="tel"
                  value={profile.mobile}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">
                  <span className="flex items-center gap-1.5"><Briefcase size={14} /> Experience (years)</span>
                </label>
                <input
                  type="number"
                  value={profile.experience}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-surface-400 mb-1.5">Bio / About</label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                disabled={!editing}
                rows={3}
                className="input-field disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
              <MapPin size={20} className="text-electric-400" /> Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">City</label>
                <input
                  type="text"
                  value={profile.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  disabled={!editing}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">State</label>
                <input
                  type="text"
                  value={profile.location.state}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  disabled={!editing}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-400 mb-1.5">Pincode</label>
                <input
                  type="text"
                  value={profile.location.pincode}
                  onChange={(e) => handleLocationChange('pincode', e.target.value)}
                  disabled={!editing}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Work Categories */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
              <Award size={20} className="text-accent-400" /> Work Categories
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm font-medium"
                >
                  {cat}
                  {editing && (
                    <button onClick={() => removeCategory(cat)} className="hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  placeholder="Add category (e.g., AC Repair, Inverter)"
                  className="input-field flex-1"
                />
                <button onClick={addCategory} className="px-4 py-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-all">
                  <Plus size={20} />
                </button>
              </div>
            )}
            <p className="text-xs text-surface-500 mt-2">Hinglish input supported (e.g., "Pankha lagana", "Bijli ka kaam")</p>
          </div>

          {/* Work Samples */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
              <Camera size={20} className="text-emerald-400" /> Work Samples
              {uploading && <Loader2 size={16} className="animate-spin text-primary-400 ml-2" />}
            </h3>

            {/* Work Images Grid */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-400 mb-2">Work Images</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {profile.workImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-surface-700/50">
                    <img src={img} alt={`Work ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {editing && (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="aspect-square rounded-xl bg-surface-800/30 border-2 border-dashed border-surface-700/50 flex flex-col items-center justify-center text-surface-500 hover:text-surface-400 hover:border-surface-600 transition-all cursor-pointer group"
                  >
                    <Upload size={24} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs">Upload</span>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Work Video */}
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">Demo Video</label>
              {profile.workVideo ? (
                <video
                  src={profile.workVideo}
                  controls
                  className="aspect-video max-w-md rounded-xl border border-surface-700/50"
                />
              ) : (
                <div
                  onClick={() => editing && videoInputRef.current?.click()}
                  className={`aspect-video max-w-md rounded-xl bg-surface-800/30 border-2 border-dashed border-surface-700/50 flex flex-col items-center justify-center text-surface-500 hover:text-surface-400 hover:border-surface-600 transition-all ${editing ? 'cursor-pointer' : ''} group`}
                >
                  <Upload size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">{editing ? 'Upload demo video' : 'No video uploaded'}</span>
                  {editing && <span className="text-xs mt-1">MP4, max 50MB</span>}
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </div>
          </div>

          {/* Cancel Button when editing */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <button
                onClick={() => {
                  setEditing(false)
                  // Reset to original
                  setProfile({
                    name: user?.name || '',
                    email: user?.email || '',
                    mobile: user?.mobile || '',
                    experience: user?.experience || 0,
                    bio: user?.bio || '',
                    location: user?.location || { city: '', state: '', pincode: '' },
                    categories: user?.categories || [],
                    topBadge: user?.topBadge || '',
                    completedJobs: user?.stats?.completedBookings || 0,
                    aadhar: user?.aadhar || { verified: false },
                    isApproved: user?.isApproved ?? false,
                    workImages: user?.workImages || [],
                    workVideo: user?.workVideo || '',
                    profilePhoto: user?.profilePhoto || '',
                  })
                }}
                className="px-6 py-3 rounded-xl text-surface-400 border border-surface-700 hover:bg-surface-800/40 transition-all font-medium"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
