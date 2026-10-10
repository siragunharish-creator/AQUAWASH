# AquaShine Car Care - Chennai, Tamil Nadu

> **Drive Clean. Shine Bright.**

AquaShine Car Care is a full-stack, production-ready car wash and luxury auto detailing web application tailored for Chennai, Tamil Nadu, India.

---

## 🌟 Key Features

- **Luxury Automotive Brand Experience:** Deep black, electric cyan, and clean white design with dark/light theme switching, responsive micro-interactions, and automotive photography.
- **6-Step Customer Booking Wizard:**
  1. Vehicle Category Selection (Hatchback, Sedan, SUV, Luxury Car, Motorbike)
  2. Multi-Service Selection with vehicle-specific pricing & instant discount calculation
  3. Real-time Slot Reservation respecting Chennai opening hours, holiday closures, and bay capacity limits
  4. Customer Information (Name, Mobile with +91 country code, WhatsApp, Chennai Doorstep vs OMR Studio Hub)
  5. Itemized Summary & Review with 18% GST breakdown
  6. Instant Booking Confirmation with Unique Reference (e.g. `AQ-2610-8491`)
- **Automated WhatsApp Business Cloud API Integration:**
  - Automated confirmation dispatch to the customer's WhatsApp
  - Automated new booking alert to the business owner (+91 8668181232)
  - Diagnostic logging and manual one-click retry in the admin portal
- **Native Local Computer Image Uploads:**
  - Administrator can select images directly from Windows/Mac using the native file picker
  - Uploads to the `car-wash-media` Supabase Storage bucket
  - Validates MIME types (JPG, JPEG, PNG, WebP) and 5MB size limit
- **Full Administrator Management Suite:**
  - Protected Admin Icon in header (`/admin/login`)
  - Live Analytics (Total, Today's, Pending, Confirmed, Completed, Cancelled, Realized Revenue)
  - Booking Manager: Search, filter, status change, rescheduling, cancellation reasons, payment recording, CSV export
  - Services Manager: Create, edit, vehicle-specific pricing matrix, active toggles, soft-archiving
  - Website Content Manager: Hero copy, About Us metrics, FAQ accordion, SEO metadata
  - Business Settings: Hours, WhatsApp lines, slot capacity, GST percentage
  - WhatsApp Logs: Real Meta provider delivery receipts & retry controls
  - Account Manager: Password updates, session controls, and immutable audit logs
- **Floating WhatsApp Widget:** Quick inquiry presets linked to the business WhatsApp number on all public pages.
- **Vercel & Supabase Ready:** Database migrations, RLS policies, storage bucket configurations, and seed data included.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the automated test suite
npm run test

# 3. Start development server
npm run dev
```

Open `http://localhost:3000`.

### Admin Credentials
- **URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@aquashinecarcare.in`
- **Password:** `AquaShineAdmin2026!`

---

## 📁 Repository Structure

```
├── data/
│   └── db.json                        # Persistent local database store
├── server/
│   ├── db.ts                          # Database layer (Supabase + Local Fallback)
│   └── whatsapp.ts                    # WhatsApp Business Cloud API integration
├── src/
│   ├── components/
│   │   ├── common/FloatingWhatsApp.tsx # Floating WhatsApp chat widget
│   │   └── layout/
│   │       ├── Navbar.tsx             # Header with admin shield & theme toggle
│   │       └── Footer.tsx             # Chennai footer with business info
│   ├── context/
│   │   ├── AuthContext.tsx            # Admin authentication state
│   │   └── ThemeContext.tsx           # Working light/dark theme provider
│   ├── lib/
│   │   └── api.ts                     # API client for frontend operations
│   ├── pages/
│   │   ├── Home.tsx                   # 10-section automotive homepage
│   │   ├── Services.tsx               # Service catalog with vehicle selector
│   │   ├── ServiceDetail.tsx          # Service details & pricing calculator
│   │   ├── Booking.tsx                # 5-step booking reservation wizard
│   │   ├── BookingConfirmation.tsx    # Confirmation receipt & reference copy
│   │   ├── TrackBooking.tsx           # Live status timeline tracker
│   │   ├── Gallery.tsx                # Portfolio with lightbox
│   │   ├── About.tsx                  # Detailing heritage & Chennai facility
│   │   ├── Contact.tsx                # Hub address & direct inquiry
│   │   ├── Privacy.tsx                # Data privacy policy
│   │   ├── Terms.tsx                  # Terms of service
│   │   └── admin/
│   │       ├── AdminLogin.tsx         # Split-screen admin sign-in
│   │       ├── AdminLayout.tsx        # Protected dashboard sidebar & navbar
│   │       ├── DashboardOverview.tsx  # Analytics & revenue charts
│   │       ├── BookingsManager.tsx    # Booking management, reschedule & CSV
│   │       ├── ServicesManager.tsx    # Service & vehicle pricing manager
│   │       ├── ContentManager.tsx     # Copy & SEO metadata manager
│   │       ├── GalleryManager.tsx     # Native local computer file uploader
│   │       ├── BusinessSettingsManager.tsx # Hours, capacity & WhatsApp
│   │       ├── WhatsAppManager.tsx    # WhatsApp Cloud API log & retry
│   │       └── AccountManager.tsx     # Credentials & audit trail
│   ├── types/index.ts                 # TypeScript data contracts
│   ├── App.tsx                        # React router tree
│   └── main.tsx                       # React DOM entry point
├── supabase/
│   ├── migrations/
│   │   └── 20261009000000_aquashine_schema.sql # PostgreSQL schema & RLS
│   └── seed.sql                       # Initial seed data for Chennai studio
├── server.ts                          # Express server with Vite dev middleware
├── test-suite.ts                      # Automated integration test runner
├── SETUP_GUIDE.md                     # Complete deployment & setup instructions
├── vercel.json                        # Vercel deployment routing
└── package.json
```
