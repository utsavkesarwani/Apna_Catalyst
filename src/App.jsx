import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ElectriciansPage from './pages/ElectriciansPage'
import ElectricianProfilePage from './pages/ElectricianProfilePage'
import HomeWiringPage from './pages/HomeWiringPage'
import BookingPage from './pages/BookingPage'
import CheckoutPage from './pages/CheckoutPage'
import BookingTrackerPage from './pages/BookingTrackerPage'
import JoinElectricianPage from './pages/JoinElectricianPage'
import AuthPage from './pages/AuthPage'
import GoogleAuthCallback from './pages/GoogleAuthCallback'
import UserProfilePage from './pages/UserProfilePage'
import ServicesPage from './pages/ServicesPage'
import ContentPage from './pages/ContentPage'
import BlogPage from './pages/BlogPage'
import ScrollToTop from './components/layout/ScrollToTop'
import UserProtectedRoute from './components/UserProtectedRoute'

// Electrician Panel (Phase 3 + Phase 4 integration)
import ElectricianLayout from './components/electrician-panel/ElectricianLayout'
import ProtectedRoute from './components/electrician-panel/ProtectedRoute'
import ElectricianLoginPage from './pages/electrician/ElectricianLoginPage'
import ElectricianDashboard from './pages/electrician/ElectricianDashboard'
import ElectricianProfile from './pages/electrician/ElectricianProfile'
import ElectricianBookings from './pages/electrician/ElectricianBookings'
import ElectricianEarnings from './pages/electrician/ElectricianEarnings'
import ElectricianReviews from './pages/electrician/ElectricianReviews'

// Super Admin Panel (Phase 6)
import AdminLayout from './components/admin-panel/AdminLayout'
import AdminProtectedRoute from './components/admin-panel/AdminProtectedRoute'
import AdminLoginPage from './pages/superadmin/AdminLoginPage'
import AdminDashboard from './pages/superadmin/AdminDashboard'
import AdminUsers from './pages/superadmin/AdminUsers'
import AdminElectricians from './pages/superadmin/AdminElectricians'
import AdminBookings from './pages/superadmin/AdminBookings'
import AdminCMS from './pages/superadmin/AdminCMS'
import AdminServices from './pages/superadmin/AdminServices'
import AdminAnalytics from './pages/superadmin/AdminAnalytics'
import AdminPages from './pages/superadmin/AdminPages'
import { useSiteConfig } from './context/SiteConfigContext.jsx'

function App() {
  const { config } = useSiteConfig()

  // Dynamically set page title & meta description from CMS config
  useEffect(() => {
    document.title = config.meta_title || config.site_name || 'Apna Electro'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', config.meta_description || '')
    } else if (config.meta_description) {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = config.meta_description
      document.head.appendChild(meta)
    }
  }, [config.meta_title, config.meta_description, config.site_name])

  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* User Panel Routes */}
      <Route path="/" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <HomePage />
          </main>
          <Footer />
        </div>
      } />
      <Route path="/services" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><ServicesPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/electricians" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><ElectriciansPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/electricians/:id" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><ElectricianProfilePage /></main>
          <Footer />
        </div>
      } />
      <Route path="/home-wiring" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><HomeWiringPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/booking" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><BookingPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/booking/:id" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><BookingPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/checkout" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><CheckoutPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/track/:id" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><BookingTrackerPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/join" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><JoinElectricianPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/auth" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><AuthPage /></main>
          <Footer />
        </div>
      } />

      {/* Google OAuth callback — full-screen redirect handler, no chrome */}
      <Route path="/auth/google/success" element={<GoogleAuthCallback />} />
      <Route path="/profile" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <UserProtectedRoute>
              <UserProfilePage />
            </UserProtectedRoute>
          </main>
          <Footer />
        </div>
      } />

      <Route path="/blog" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><BlogPage /></main>
          <Footer />
        </div>
      } />
      <Route path="/page/:slug" element={
        <div className="min-h-screen bg-surface-950 flex flex-col">
          <Navbar />
          <main className="flex-1"><ContentPage /></main>
          <Footer />
        </div>
      } />

      {/* Electrician Login (public) */}
      <Route path="/electrician/login" element={<ElectricianLoginPage />} />

      {/* Electrician Panel Routes (protected — requires auth) */}
      <Route path="/electrician" element={
        <ProtectedRoute>
          <ElectricianLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ElectricianDashboard />} />
        <Route path="profile" element={<ElectricianProfile />} />
        <Route path="bookings" element={<ElectricianBookings />} />
        <Route path="earnings" element={<ElectricianEarnings />} />
        <Route path="reviews" element={<ElectricianReviews />} />
      </Route>

      {/* Super Admin Login (public) */}
      <Route path="/superadmin/login" element={<AdminLoginPage />} />

      {/* Super Admin Panel Routes (protected — requires admin/superadmin role) */}
      <Route path="/superadmin" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="electricians" element={<AdminElectricians />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="cms" element={<AdminCMS />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="pages" element={<AdminPages />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
