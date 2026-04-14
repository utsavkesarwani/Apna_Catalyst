import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Electrician from '../models/Electrician.js'
import Service from '../models/Service.js'
import SiteConfig from '../models/SiteConfig.js'
import Review from '../models/Review.js'

// ════════════════════════════════════════════════
// Seed Data
// ════════════════════════════════════════════════

const services = [
  { name: 'Wiring', slug: 'wiring', icon: 'Cable', description: 'Complete house wiring usage and repair solutions', order: 1, basePrice: 499 },
  { name: 'Fan Installation', slug: 'fan-installation', icon: 'Fan', description: 'Ceiling fan, exhaust fan installation & repair', order: 2, basePrice: 299 },
  { name: 'Switchboard Repair', slug: 'switchboard-repair', icon: 'ToggleRight', description: 'Switchboard installation, repair & upgrade', order: 3, basePrice: 249 },
  { name: 'MCB & Fuse', slug: 'mcb-fuse', icon: 'ShieldAlert', description: 'MCB box, fuse replacement & circuit protection', order: 4, basePrice: 349 },
  { name: 'Inverter & Battery', slug: 'inverter-battery', icon: 'BatteryCharging', description: 'Inverter installation, battery replacement & wiring', order: 5, basePrice: 599 },
  { name: 'AC Wiring', slug: 'ac-wiring', icon: 'Snowflake', description: 'AC installation wiring, stabilizer & electrical setup', order: 6, basePrice: 799 },
  { name: 'CCTV Installation', slug: 'cctv-installation', icon: 'Camera', description: 'CCTV camera setup, DVR wiring & networking', order: 7, basePrice: 999 },
  { name: 'Full Home Wiring', slug: 'full-home-wiring', icon: 'Home', description: 'Complete new home electrical wiring & setup', order: 8, basePrice: 4999 },
  { name: 'Light Fitting', slug: 'light-fitting', icon: 'Lightbulb', description: 'LED, tube light, chandelier installation', order: 9, basePrice: 199 },
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Wrench', description: 'Geyser, mixer, iron & small appliance repair', order: 10, basePrice: 349 },
  { name: 'Earthing', slug: 'earthing', icon: 'Zap', description: 'Electrical earthing installation & testing', order: 11, basePrice: 699 },
  { name: 'General Visit', slug: 'general-visit', icon: 'Zap', description: 'Diagnostic visit for any electrical problem not listed above', order: 0, basePrice: 299 },
]

const electricians = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@apnaelectro.com',
    mobile: '9876543210',
    passwordHash: 'password123',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001' },
    experience: 12,
    bio: 'Expert in home wiring and industrial electrical work. 12 years of experience with specialization in safety-first installations.',
    categories: ['Home Wiring', 'Industrial', 'Safety Systems'],
    services: ['general-visit', 'wiring', 'full-home-wiring', 'mcb-fuse', 'earthing'],
    rating: { avg: 4.9, count: 127 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: true,
    priceRange: { min: 299, max: 1999 },
    topBadge: 'Best in Home Wiring',
    earnings: { total: 245000, pending: 12000, thisMonth: 34000 },
  },
  {
    name: 'Amit Sharma',
    email: 'amit@apnaelectro.com',
    mobile: '9876543211',
    passwordHash: 'password123',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001' },
    experience: 8,
    bio: 'Specialized in AC wiring, CCTV installation and modern smart home setups. Fast and reliable service.',
    categories: ['AC Wiring', 'CCTV', 'Smart Home'],
    services: ['general-visit', 'ac-wiring', 'cctv-installation', 'wiring', 'fan-installation'],
    rating: { avg: 4.8, count: 89 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: true,
    priceRange: { min: 399, max: 2499 },
    topBadge: 'AC & CCTV Specialist',
    earnings: { total: 189000, pending: 8500, thisMonth: 28000 },
  },
  {
    name: 'Suresh Yadav',
    email: 'suresh@apnaelectro.com',
    mobile: '9876543212',
    passwordHash: 'password123',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110002' },
    experience: 15,
    bio: 'Veteran electrician specializing in commercial and residential projects. Known for clean work and punctuality.',
    categories: ['Commercial', 'Residential', 'Renovation'],
    services: ['general-visit', 'full-home-wiring', 'wiring', 'switchboard-repair', 'light-fitting'],
    rating: { avg: 4.7, count: 203 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: true,
    priceRange: { min: 349, max: 2999 },
    topBadge: 'Most Experienced',
    earnings: { total: 412000, pending: 15000, thisMonth: 42000 },
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@apnaelectro.com',
    mobile: '9876543213',
    passwordHash: 'password123',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560001' },
    experience: 6,
    bio: 'Young and tech-savvy electrician. Expert in smart home automation, IoT-based electrical systems.',
    categories: ['Smart Home', 'IoT', 'Automation'],
    services: ['general-visit', 'cctv-installation', 'wiring', 'fan-installation', 'light-fitting'],
    rating: { avg: 4.8, count: 67 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: true,
    priceRange: { min: 449, max: 3499 },
    topBadge: 'Smart Home Expert',
    earnings: { total: 156000, pending: 7200, thisMonth: 22000 },
  },
  {
    name: 'Manoj Patel',
    email: 'manoj@apnaelectro.com',
    mobile: '9876543214',
    passwordHash: 'password123',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001' },
    experience: 10,
    bio: 'Inverter and battery specialist. Also handles full home wiring projects. Fluent in Gujarati and Hindi.',
    categories: ['Inverter', 'Battery', 'Home Wiring'],
    services: ['general-visit', 'inverter-battery', 'full-home-wiring', 'wiring', 'mcb-fuse'],
    rating: { avg: 4.6, count: 156 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: true,
    priceRange: { min: 299, max: 1799 },
    topBadge: 'Inverter Specialist',
    earnings: { total: 298000, pending: 9800, thisMonth: 31000 },
  },
  {
    name: 'Deepak Gupta',
    email: 'deepak@apnaelectro.com',
    mobile: '9876543215',
    passwordHash: 'password123',
    location: { city: 'Noida', state: 'Uttar Pradesh', country: 'India', pincode: '201301' },
    experience: 7,
    bio: 'Affordable and reliable electrician. Specializes in switchboard repairs, fan installations and light fittings.',
    categories: ['Switchboard', 'Fan', 'Lighting'],
    services: ['general-visit', 'switchboard-repair', 'fan-installation', 'light-fitting', 'appliance-repair'],
    rating: { avg: 4.5, count: 98 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: false,
    priceRange: { min: 199, max: 999 },
    topBadge: 'Budget Friendly',
    earnings: { total: 178000, pending: 5400, thisMonth: 19000 },
  },
  {
    name: 'Prashant Mishra',
    email: 'prashant@apnaelectro.com',
    mobile: '9876543216',
    passwordHash: 'password123',
    location: { city: 'Jaipur', state: 'Rajasthan', country: 'India', pincode: '302001' },
    experience: 9,
    bio: 'Expert in earthing, generator setup and heavy-duty electrical work. Industrial and residential projects.',
    categories: ['Earthing', 'Generator', 'Industrial'],
    services: ['general-visit', 'earthing', 'generator-setup', 'mcb-fuse', 'wiring'],
    rating: { avg: 4.7, count: 72 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: true,
    priceRange: { min: 499, max: 3999 },
    topBadge: 'Heavy Duty Expert',
    earnings: { total: 223000, pending: 11000, thisMonth: 27000 },
  },
  {
    name: 'Rohit Verma',
    email: 'rohit@apnaelectro.com',
    mobile: '9876543217',
    passwordHash: 'password123',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110005' },
    experience: 5,
    bio: 'Quick and efficient service. Specializes in emergency repairs, appliance fixes and light fittings.',
    categories: ['Emergency', 'Appliance', 'Quick Fix'],
    services: ['general-visit', 'appliance-repair', 'light-fitting', 'switchboard-repair', 'fan-installation'],
    rating: { avg: 4.4, count: 54 },
    availability: { isAvailable: true },
    isApproved: true,
    verified: false,
    priceRange: { min: 149, max: 799 },
    topBadge: 'Quick Response',
    earnings: { total: 98000, pending: 3200, thisMonth: 14000 },
  },
]

const users = [
  {
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    mobile: '9988776655',
    passwordHash: 'password123',
    role: 'user',
    location: { city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001' },
  },
  {
    name: 'Priya Singh',
    email: 'priya@example.com',
    mobile: '9988776656',
    passwordHash: 'password123',
    role: 'user',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001' },
  },
  {
    name: 'Admin User',
    email: 'admin@apnaelectro.com',
    mobile: '9000000001',
    passwordHash: 'admin123',
    role: 'superadmin',
    location: { city: 'Delhi', state: 'Delhi', country: 'India' },
  },
]

const siteConfigs = [
  { key: 'site_name', value: 'Apna Electro', type: 'string', group: 'general', label: 'Site Name' },
  { key: 'site_tagline', value: 'Expert Electricians at Your Doorstep', type: 'string', group: 'general', label: 'Tagline' },
  { key: 'contact_email', value: 'support@apnaelectro.com', type: 'string', group: 'contact', label: 'Contact Email' },
  { key: 'contact_phone', value: '+91 98765 43210', type: 'string', group: 'contact', label: 'Contact Phone' },
  { key: 'hero_headline', value: 'Expert Electricians at Your Doorstep', type: 'string', group: 'hero', label: 'Hero Headline' },
  { key: 'hero_subheadline', value: 'Book verified, background-checked electricians for any job — from a simple switch fix to complete home wiring. Fast, safe, and guaranteed.', type: 'string', group: 'hero', label: 'Hero Sub-headline' },
  { key: 'hero_cta_primary', value: 'Book Now', type: 'string', group: 'hero', label: 'Primary CTA' },
  { key: 'hero_cta_secondary', value: 'Explore Services', type: 'string', group: 'hero', label: 'Secondary CTA' },
  { key: 'meta_title', value: 'Apna Electro — Expert Electricians at Your Doorstep', type: 'string', group: 'seo', label: 'Meta Title' },
  { key: 'meta_description', value: 'Book verified electricians for wiring, fan installation, AC repair, CCTV setup and more. Fast, safe, and guaranteed service across India.', type: 'string', group: 'seo', label: 'Meta Description' },
  { key: 'platform_fee', value: 49, type: 'number', group: 'payment', label: 'Platform Fee (₹)' },
  { key: 'social_facebook', value: 'https://facebook.com/apnaelectro', type: 'string', group: 'social', label: 'Facebook URL' },
  { key: 'social_instagram', value: 'https://instagram.com/apnaelectro', type: 'string', group: 'social', label: 'Instagram URL' },
  { key: 'social_twitter', value: 'https://twitter.com/apnaelectro', type: 'string', group: 'social', label: 'Twitter URL' },
]

// ════════════════════════════════════════════════
// Seed Script
// ════════════════════════════════════════════════

const seedDB = async () => {
  try {
    await connectDB()
    console.log('\n🌱 Starting database seed...\n')

    // Clear existing data
    console.log('  🗑️  Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Electrician.deleteMany({}),
      Service.deleteMany({}),
      SiteConfig.deleteMany({}),
      Review.deleteMany({}),
    ])

    // Seed services
    console.log('  ⚙️  Seeding services...')
    const seededServices = await Service.insertMany(services)
    console.log(`     ✅ ${seededServices.length} services created`)

    // Seed electricians
    console.log('  👷 Seeding electricians...')
    const seededElectricians = []
    for (const elec of electricians) {
      const e = await Electrician.create(elec) // Use create() to trigger password hashing
      seededElectricians.push(e)
    }
    console.log(`     ✅ ${seededElectricians.length} electricians created`)

    // Seed users
    console.log('  👤 Seeding users...')
    const seededUsers = []
    for (const user of users) {
      const u = await User.create(user)
      seededUsers.push(u)
    }
    console.log(`     ✅ ${seededUsers.length} users created`)

    // Seed site configs
    console.log('  🎨 Seeding site configs...')
    const seededConfigs = await SiteConfig.insertMany(siteConfigs)
    console.log(`     ✅ ${seededConfigs.length} config entries created`)

    // Summary
    console.log('\n' + '═'.repeat(50))
    console.log('  ✅ Database seeded successfully!')
    console.log('═'.repeat(50))
    console.log(`
  📊 Summary:
  • Services:      ${seededServices.length}
  • Electricians:  ${seededElectricians.length}
  • Users:         ${seededUsers.length} (includes 1 superadmin)
  • Site Configs:  ${seededConfigs.length}

  🔑 Test Credentials:
  ─────────────────────────────────
  User:        arjun@example.com / password123
  Electrician: rajesh@apnaelectro.com / password123
  Admin:       admin@apnaelectro.com / admin123
  OTP (mock):  123456
  Coupons:     FIRST100, APNA100
    `)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

seedDB()
