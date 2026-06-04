import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, MapPin, Home, Calendar, ClipboardList, Shield, LogOut, Loader2, Edit2, Check, X, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, addUserAddress, updateUserAddress, deleteUserAddress } from '../api/user.api'
import Button from '../components/ui/Button'

export default function UserProfilePage() {
  const { user, logout, updateUser } = useAuth()
  
  // Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
  })

  // Address State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [addressData, setAddressData] = useState({
    flatNo: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  })

  // Sync with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
      })
    }
  }, [user])

  const isProfileValid = profileData.name.trim()

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!isProfileValid) return
    setProfileLoading(true)
    setProfileError(null)
    try {
      const response = await updateUserProfile(profileData)
      updateUser(response.user)
      setIsEditingProfile(false)
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const openAddAddress = () => {
    setAddressData({ flatNo: '', locality: '', landmark: '', city: '', state: '', pincode: '' })
    setEditingAddressId(null)
    setAddressError(null)
    setIsAddressModalOpen(true)
  }

  const openEditAddress = (addr) => {
    setAddressData({
      flatNo: addr.flatNo,
      locality: addr.locality,
      landmark: addr.landmark,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    })
    setEditingAddressId(addr._id)
    setAddressError(null)
    setIsAddressModalOpen(true)
  }

  const isAddressValid = addressData.flatNo.trim() &&
    addressData.locality.trim() &&
    addressData.landmark.trim() &&
    addressData.city.trim() &&
    addressData.state.trim() &&
    addressData.pincode.trim()

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    if (!isAddressValid) return
    setAddressLoading(true)
    setAddressError(null)
    try {
      let response
      if (editingAddressId) {
        response = await updateUserAddress(editingAddressId, addressData)
      } else {
        response = await addUserAddress(addressData)
      }
      updateUser(response.user) // user returned from backend will have updated addresses
      setIsAddressModalOpen(false)
    } catch (err) {
      setAddressError(err.message || 'Failed to save address')
    } finally {
      setAddressLoading(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      const response = await deleteUserAddress(id)
      updateUser(response.user)
    } catch (err) {
      alert(err.message || 'Failed to delete address')
    }
  }

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Consolidate addresses (handle legacy detailedAddress if present but no addresses)
  const displayAddresses = user?.addresses?.length > 0 
    ? user.addresses 
    : user?.detailedAddress?.flatNo 
      ? [{ ...user.detailedAddress, _id: 'legacy', isLegacy: true }] 
      : []

  return (
    <div className="py-12 md:py-20 min-h-[calc(100vh-80px)] bg-surface-950">
      <div className="section-container max-w-5xl">
        <header className="mb-8 md:mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-display font-bold text-white mb-2"
          >
            My <span className="gradient-text">Profile</span>
          </motion.h1>
          <p className="text-surface-400">Manage your account settings and addresses</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 space-y-6"
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
                <button 
                  onClick={logout}
                  className="w-full mt-2 py-2 text-sm font-medium text-red-500/80 hover:text-red-400 transition-colors flex items-center justify-center gap-2 bg-surface-900 rounded-lg"
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
                <span className="text-surface-200">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Profile Info Section */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-white">Personal Information</h3>
                {!isEditingProfile && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)} icon={Edit2}>Edit</Button>
                )}
              </div>
              
              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {profileError && (
                    <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> {profileError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-400 ml-1">Full Name</label>
                      <input 
                        className="input-field" 
                        value={profileData.name} 
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-400 ml-1">Email Address</label>
                      <input 
                        className="input-field" 
                        value={profileData.email} 
                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-surface-400 ml-1">Mobile Number</label>
                      <input 
                        className="input-field" 
                        value={profileData.mobile} 
                        onChange={e => setProfileData({...profileData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                        placeholder="Add your mobile number"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="ghost" onClick={() => setIsEditingProfile(false)} disabled={profileLoading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={profileLoading || !isProfileValid} icon={profileLoading ? Loader2 : Check}>
                      {profileLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              ) : (
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
                      <p className="text-surface-100 font-medium">{user?.mobile ? `+91 ${user.mobile}` : <span className="text-surface-400 italic">Not provided</span>}</p>
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
                </div>
              )}
            </div>

            {/* Manage Addresses Section */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Manage Addresses</h3>
                  <p className="text-sm text-surface-400">Add multiple addresses for easy booking</p>
                </div>
                <Button variant="primary" size="sm" onClick={openAddAddress} icon={Plus}>Add New Address</Button>
              </div>

              {isAddressModalOpen ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-surface-800/30 p-5 rounded-xl border border-surface-700/50 mb-6">
                  <h4 className="text-md font-display font-bold text-white mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h4>
                  {addressError && (
                    <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> {addressError}
                    </div>
                  )}
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium text-surface-400 ml-1">Flat / House No. / Building Name <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="e.g. Flat 302, Sunrise Towers" value={addressData.flatNo} onChange={e => setAddressData({...addressData, flatNo: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-surface-400 ml-1">Street / Colony / Area <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="e.g. MG Road, Sector 12" value={addressData.locality} onChange={e => setAddressData({...addressData, locality: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-surface-400 ml-1">Landmark <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="e.g. Near City Mall" value={addressData.landmark} onChange={e => setAddressData({...addressData, landmark: e.target.value})} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-surface-400 ml-1">City <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="City" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-surface-400 ml-1">State <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="State" value={addressData.state} onChange={e => setAddressData({...addressData, state: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-surface-400 ml-1">Pincode <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="Pincode" value={addressData.pincode} onChange={e => setAddressData({...addressData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} required />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <Button variant="ghost" onClick={() => setIsAddressModalOpen(false)} disabled={addressLoading} type="button">Cancel</Button>
                      <Button type="submit" variant="primary" disabled={addressLoading || !isAddressValid} icon={addressLoading ? Loader2 : Check}>
                        {addressLoading ? 'Saving...' : 'Save Address'}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              ) : null}

              <div className="space-y-4">
                {displayAddresses.length > 0 ? (
                  displayAddresses.map((addr, idx) => (
                    <div key={addr._id || idx} className="p-4 rounded-xl bg-surface-800/40 border border-surface-700/50 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-primary-500 shrink-0">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-surface-100 font-medium">{addr.flatNo}</p>
                          <p className="text-surface-400 text-sm">{[addr.locality, addr.landmark].filter(Boolean).join(', ')}</p>
                          <p className="text-surface-400 text-sm">{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                          {addr.isLegacy && <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Legacy Address</span>}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 shrink-0">
                        {!addr.isLegacy && (
                          <>
                            <button onClick={() => openEditAddress(addr)} className="p-2 text-surface-400 hover:text-primary-400 bg-surface-800 rounded-lg transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-surface-400 hover:text-red-400 bg-surface-800 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {addr.isLegacy && (
                          <p className="text-xs text-surface-500 italic mt-1 sm:mt-0">Cannot delete legacy address directly. Please migrate by adding a new address.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center bg-surface-800/20 rounded-2xl border border-dashed border-surface-700/50">
                    <Home size={40} className="mx-auto text-surface-600 mb-3" />
                    <p className="text-surface-400 font-medium mb-1">No addresses found</p>
                    <p className="text-xs text-surface-500">Add an address to start booking</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities Section */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-white">Recent Activities</h3>
                <Button variant="ghost" size="sm" icon={ClipboardList}>View All</Button>
              </div>
              
              {user?.bookings?.length > 0 ? (
                <div className="space-y-4">
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

          </motion.div>
        </div>
      </div>
    </div>
  )
}
