# ⚡ Apna Catalyst — Full Development Roadmap

> **Tech Stack:** Frontend: Vite + React.js + Tailwind CSS | Backend: Node.js + Express.js + MongoDB

---

## Overview

**Apna Catalyst** is a service marketplace platform (starting with electricians, scalable to plumbers, painters, and more) inspired by Urban Company. The platform has three panels:

- **User Panel** — book electricians, track orders, make payments
- **Electrician Panel** — manage profile, availability, and bookings
- **Super Admin Panel** — full CMS to control everything without coding

---

## Phase 1 — React UI: User Panel

> **Tech:** Vite + React.js + Tailwind CSS | Use mock/static data for now

### Navbar
- Logo (Apna Catalyst)
- Links: Home | Services | Electricians | Join as Electrician | Login
- Right side: Search button + **Book Now** CTA button (prominent, colored)

### Search Bar
- Unified search: electrician name / location / service type
- Catchy design with icon and placeholder text
- Filter chips: By Location | By Rating | By Service

### Hero Section
- Full-width, premium look
- Trust-building headline (e.g., *"Expert Electricians at Your Doorstep"*)
- Sub-headline with social proof (e.g., *"10,000+ happy customers | Verified professionals"*)
- Primary CTA: **Book Now** | Secondary CTA: **Explore Services**
- Background: high-quality electrician work imagery

### Services Section
- Category grid of all electrical problem types:
  - Wiring, Fan installation, Switchboard repair, MCB/Fuse, Inverter, AC wiring, CCTV, Full home wiring, etc.
- Each category card: icon + title + short description
- Horizontal scroll on mobile

### Electrician Listing Page
- Category-wise horizontal scroll sections (by service type, rating, location)
- Each electrician card shows:
  - Profile photo
  - Name
  - Star rating (e.g., ⭐ 4.8)
  - Experience (e.g., 6 years)
  - Location
  - Top skill badge (e.g., "Best in Home Wiring")
  - **Book Now** button
- **View All Electricians** option per category
- Pagination / infinite scroll for 100s of electricians

### Electrician Profile Page
- Auto-play work demo video (how they work)
- Image gallery of completed work
- Details:
  - Name, photo, rating, experience, location
  - Availability status (Available Now / Next Available: Date)
  - Services offered (with Hinglish support)
  - Most recommended for (highlighted tags)
  - Customer reviews section
- **Book Now** button (sticky on scroll)

### Full Home Wiring & Renovation Page
- Dedicated landing page
- Breakdown of services included
- Pricing packages (Affordable / Standard / Premium)
- Top electricians for home wiring (filtered list)
- Before/after work images
- CTA: **Get Free Quote**

### Book Now Flow (Cart-style)
1. Select problem type / service
2. Describe the issue (text input)
3. Choose date & time slot
4. If electrician unavailable → show alternatives with availability
5. Review booking summary
6. Proceed to checkout

### Checkout Section
- Order summary
- Payment options:
  - UPI (with QR code scanner)
  - Card (Debit/Credit)
  - Cash on Service
- Apply coupon/promo code field
- **Confirm Booking** button

### Authentication (Low priority — last step)
- Triggered only at checkout or explicit login click
- Options: Mobile OTP | Email/Password
- New users can browse and book, sign in only when needed

### Booking Tracker
- Live booking status updates:
  - Booking confirmed → Electrician assigned → On the way → Work started → Completed
- Electrician contact details shown after assignment
- Rating & review prompt after completion

### Location Filter
- City → State → Country hierarchy (for global scaling)
- Sub-groups: Zone / District / Pincode
- "Detect my location" button

### Join as Electrician Page
- Registration form fields:
  - Full name
  - Mobile number
  - Location (City, State)
  - Experience (years)
  - Work categories (multi-select, Hinglish input allowed)
  - Aadhar number (optional)
  - Profile photo upload
  - Work sample images/videos upload
  - Brief bio / about
- Submit for review → Admin approves

---

## Phase 2 — Backend Setup & MongoDB Schemas

> **Tech:** Node.js + Express.js + MongoDB + Mongoose | JWT Auth | Dotenv

### Server Setup
- Express app with middleware (cors, helmet, morgan, body-parser)
- MongoDB connection via Mongoose
- `.env` config: DB URI, JWT secret, payment keys, OTP service

### MongoDB Schemas

#### `User`
```js
{
  name, email, mobile, passwordHash,
  role: ['user'],
  location: { city, state, country, pincode },
  bookings: [ref: Booking],
  createdAt
}
```

#### `Electrician`
```js
{
  name, mobile, email, passwordHash,
  role: ['electrician'],
  location: { city, state, country, pincode },
  experience, bio, profilePhoto, workImages, workVideo,
  categories: [String],  // Hinglish supported
  rating: { avg, count },
  availability: { isAvailable, nextAvailableAt },
  aadhar: { number (optional), verified },
  isApproved: Boolean,
  earnings, bookings: [ref: Booking],
  createdAt
}
```

#### `Booking`
```js
{
  user: ref(User), electrician: ref(Electrician),
  service, problemDescription, scheduledAt,
  status: ['pending','confirmed','assigned','in-progress','completed','cancelled'],
  payment: { method, amount, status, transactionId },
  review: { rating, comment },
  createdAt
}
```

#### `Service / Category`
```js
{
  name, slug, icon, description,
  parentCategory,  // for sub-categories
  isActive, order
}
```

#### `SiteConfig` *(for CMS)*
```js
{
  key: String,   // e.g. 'site_name', 'hero_headline', 'banner_image'
  value: Mixed,
  updatedBy: ref(Admin),
  updatedAt
}
```

#### `Review`
```js
{
  user: ref(User), electrician: ref(Electrician), booking: ref(Booking),
  rating, comment, createdAt
}
```

### Auth
- JWT-based authentication
- Mobile OTP (Twilio / MSG91)
- Email/password with bcrypt hashing
- Role middleware: `user` | `electrician` | `admin` | `superadmin`

---

## Phase 3 — Admin UI: Electrician Panel

> **Tech:** Vite + React.js + Tailwind CSS | Separate app or sub-route `/electrician`

### Electrician Dashboard
- Overview: Today's bookings, pending requests, earnings summary
- Availability toggle (Available / Busy / Off)

### Profile Management
- Edit name, photo, bio, location
- Update work categories (Hinglish input allowed)
- Upload/replace work images and demo video
- View verification status (Aadhar, admin approval)

### Booking Management
- Incoming requests: Accept / Reject with reason
- Active bookings: Update status (On the way / Work started / Completed)
- Booking history with filters

### Earnings
- Total earned, this month, pending payout
- Transaction history

### Reviews
- All customer reviews and ratings
- Average rating display

---

## Phase 4 — APIs for Electrician Panel + Integration

> **Build REST APIs and connect to Phase 3 UI**

### Electrician Auth APIs
- `POST /api/electrician/register`
- `POST /api/electrician/login`
- `GET /api/electrician/me` *(protected)*

### Profile APIs
- `PUT /api/electrician/profile`
- `POST /api/electrician/upload-media` (images, video — Multer + Cloudinary)
- `PUT /api/electrician/availability`

### Booking APIs (Electrician side)
- `GET /api/electrician/bookings` (filter: pending/active/history)
- `PUT /api/electrician/bookings/:id/accept`
- `PUT /api/electrician/bookings/:id/reject`
- `PUT /api/electrician/bookings/:id/status`

### Earnings API
- `GET /api/electrician/earnings`

### Integration
- Replace all mock data in Phase 3 UI with live API calls
- Axios interceptors with JWT token

---

## Phase 5 — APIs for User Panel + Integration

> **Build REST APIs and connect to Phase 1 UI**

### User Auth APIs
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Electrician Discovery APIs
- `GET /api/electricians` (filters: city, category, rating, availability)
- `GET /api/electricians/:id`
- `GET /api/electricians/top` (top rated per category)

### Booking APIs (User side)
- `POST /api/bookings` (create booking)
- `GET /api/bookings/:id` (track booking)
- `GET /api/user/bookings` (booking history)
- `PUT /api/bookings/:id/cancel`

### Payment APIs
- `POST /api/payments/initiate` (Razorpay / Stripe)
- `POST /api/payments/verify`
- UPI QR code generation

### Review APIs
- `POST /api/reviews`
- `GET /api/reviews/electrician/:id`

### Services/Category APIs
- `GET /api/services`
- `GET /api/services/:slug`

### Integration
- Connect all Phase 1 UI components to live APIs
- Real-time booking status (Socket.io or polling)
- Location-based filtering live

---

## Phase 6 — Super Admin UI: CMS Dashboard

> **Tech:** Vite + React.js + Tailwind CSS | Route: `/superadmin`

### Dashboard Overview
- Total users, electricians, bookings, revenue
- Charts: bookings per day/week, revenue graph
- Recent activity feed

### User Management
- List all users (search, filter, ban/unban)
- View individual user profile and booking history

### Electrician Management
- List all electricians (approve / reject / suspend)
- Edit any electrician profile
- View earnings and bookings
- Bulk operations

### Content Management (CMS)
- **Site Settings:** Edit site name (updates everywhere), logo, tagline, contact info
- **Hero Section Editor:** Headline, sub-headline, CTA text, background image
- **Banner Manager:** Add/remove promotional banners with scheduling
- **Services/Categories:** Add, edit, reorder, enable/disable service categories
- **Homepage Sections:** Toggle visibility of sections, reorder them
- **Featured Electricians:** Manually curate homepage featured list
- **SEO Settings:** Meta title, description per page

### Booking Management
- All bookings with filters (status, date, city)
- Force-assign electrician to a booking
- Dispute resolution

### Pricing & Packages
- Set base prices per service
- Create packages (e.g., Full Home Wiring — ₹5999)

### Analytics
- Revenue by city, service type, time period
- Top-performing electricians
- User retention metrics

---

## Phase 7 — Super Admin APIs + Full Integration

> **Build all CMS & admin APIs and integrate with Phase 6**

### Role-Based Auth
- Roles: `superadmin` > `admin` > `electrician` > `user`
- Protected routes with role middleware
- `POST /api/superadmin/login`

### CMS / Site Config APIs
- `GET /api/config` (public — fetched by frontend on load)
- `PUT /api/config/:key` (protected — superadmin only)
- `POST /api/config/bulk` (update multiple keys at once)

### Electrician Admin APIs
- `PUT /api/admin/electricians/:id/approve`
- `PUT /api/admin/electricians/:id/suspend`
- `GET /api/admin/electricians` (with full filters)

### User Admin APIs
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/ban`

### Booking Admin APIs
- `GET /api/admin/bookings`
- `PUT /api/admin/bookings/:id/assign`

### Services Admin APIs
- `POST /api/admin/services`
- `PUT /api/admin/services/:id`
- `DELETE /api/admin/services/:id`
- `PUT /api/admin/services/reorder`

### Analytics APIs
- `GET /api/admin/analytics/overview`
- `GET /api/admin/analytics/revenue`
- `GET /api/admin/analytics/bookings`

### Integration
- Connect all Phase 6 UI to live APIs
- Site config loaded globally on app start (React Context)
- Any site name/logo/content change via dashboard reflects instantly everywhere
- Full platform live and production-ready ✅

---

## Summary Table

| Phase | What's Built | Tech |
|-------|-------------|------|
| 1 | User Panel — Full React UI (mock data) | Vite, React, Tailwind |
| 2 | Backend server + all MongoDB schemas | Node.js, Express, MongoDB |
| 3 | Electrician Panel — React UI (mock data) | Vite, React, Tailwind |
| 4 | Electrician APIs + connect to Phase 3 | Express REST APIs |
| 5 | User APIs + connect to Phase 1 | Express REST APIs |
| 6 | Super Admin CMS UI (mock data) | Vite, React, Tailwind |
| 7 | Super Admin APIs + full integration | Express REST APIs |

---

## Future Scope

- Add more services: Plumber, Painter, Carpenter, AC Repair
- Mobile app (React Native)
- Real-time tracking (Google Maps API)
- Multi-language support (Hindi, English)
- Subscription plans for electricians
- Global expansion (location hierarchy already built in)

---

*Built for Apna Catalyst — Powered by expertise, trust, and technology.*
