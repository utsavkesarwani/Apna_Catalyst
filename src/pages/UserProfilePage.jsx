import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, ClipboardList, Shield, LogOut, Loader2, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../api/user.api'
import Button from '../components/ui/Button'

export default function UserProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: {
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      pincode: user?.location?.pincode || '',
    }
  })

  // Sync with user data if it changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: {
          city: user.location?.city || '',
          state: user.location?.state || '',
          pincode: user.location?.pincode || '',
        }
      })
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await updateUserProfile(formData)
      updateUser(response.user)
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="py-12 md:py-20 min-h-[calc(100vh-80px)] bg-surface-950">
      <div className="section-container max-w-4xl">
        <header className="mb-8 md:mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-display font-bold text-white mb-2"
          >
            My <span className="gradient-text">Profile</span>
          </motion.h1>
          <p className="text-surface-400">Manage your account settings and preferences</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Card */}
            <div className="glass-card p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center shadow-glow-md">
                  <span className="text-2xl font-display font-bold text-white">{userInitials}</span>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 blur-xl opacity-20" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-sm text-surface-400 mb-6">{user?.role === 'admin' ? 'Administrator' : 'Verified Member'}</p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant={isEditing ? 'secondary' : 'primary'} 
                  size="sm" 
                  className="w-full" 
                  onClick={() => setIsEditing(!isEditing)}
                  icon={isEditing ? X : Edit2}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
                <button 
                  onClick={logout}
                  className="w-full mt-2 py-2 text-sm font-medium text-red-500/80 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Account Status</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-400 flex items-center gap-2"><Shield size={14} className="text-emerald-500" /> Identity</span>
                <span className="text-emerald-500 font-medium">Verified</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-400 flex items-center gap-2"><Calendar size={14} className="text-primary-500" /> Joined</span>
                <span className="text-surface-200">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {isEditing ? (
              <div className="glass-card p-6 md:p-8">
                <h3 className="text-xl font-display font-bold text-white mb-6">Edit Basic Information</h3>
                {error && <div className="p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-400 ml-1">Full Name</label>
                      <input 
                        className="input-field" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-400 ml-1">Email Address</label>
                      <input 
                        className="input-field" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-surface-400 ml-1 block">Location Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input 
                        className="input-field" 
                        placeholder="City" 
                        value={formData.location.city} 
                        onChange={e => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                      />
                      <input 
                        className="input-field" 
                        placeholder="State" 
                        value={formData.location.state} 
                        onChange={e => setFormData({...formData, location: {...formData.location, state: e.target.value}})}
                      />
                      <input 
                        className="input-field" 
                        placeholder="Pincode" 
                        value={formData.location.pincode} 
                        onChange={e => setFormData({...formData, location: {...formData.location, pincode: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                      icon={loading ? Loader2 : Check}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glass-card p-6 md:p-8 space-y-6">
                  <h3 className="text-xl font-display font-bold text-white mb-2">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-primary-500">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-0.5">Full Name</p>
                        <p className="text-surface-100 font-medium">{user?.name}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-primary-500">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-0.5">Mobile Number</p>
                        <p className="text-surface-100 font-medium">+91 {user?.mobile}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-primary-500">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-0.5">Email Address</p>
                        <p className="text-surface-100 font-medium">{user?.email || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-primary-500">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-0.5">Address</p>
                        <p className="text-surface-100 font-medium">
                          {user?.location?.city ? `${user.location.city}, ${user.location.state}` : 'Setup your address'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-display font-bold text-white">Recent Activities</h3>
                    <Button variant="ghost" size="sm" icon={ClipboardList}>View All</Button>
                  </div>
                  
                  {user?.bookings?.length > 0 ? (
                    <div className="space-y-4">
                      {/* Booking items would go here */}
                      <p className="text-surface-500 text-sm italic">You have {user.bookings.length} total bookings with us.</p>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-surface-800/20 rounded-2xl border border-dashed border-surface-700/50">
                      <ClipboardList size={40} className="mx-auto text-surface-600 mb-3" />
                      <p className="text-surface-400 font-medium mb-1">No bookings found</p>
                      <p className="text-xs text-surface-500">Book your first electrician today</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
