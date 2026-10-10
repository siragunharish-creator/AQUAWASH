# AquaShine Car Care - Production Setup & Deployment Guide

AquaShine Car Care is an enterprise-grade car detailing and wash booking web platform built for Chennai, Tamil Nadu, India.

---

## 1. Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# 1. Clone repository
git clone <repo-url>
cd aquashine-car-care

# 2. Install all dependencies
npm install

# 3. Create your .env file
cp .env.example .env

# 4. Start full-stack development server (Express API + Vite Dev Server on port 3000)
npm run dev
```

Visit `http://localhost:3000` to view the website.

---

## 2. Administrator Access Credentials

- **Admin Portal URL:** `http://localhost:3000/admin/login` (or click the **Shield / Gear** icon in the website header)
- **Default Username / Email:** `admin@aquashinecarcare.in`
- **Default Password:** `AquaShineAdmin2026!`

*(You can change the administrator password anytime under `/admin/account`)*

---

## 3. Supabase PostgreSQL & Storage Setup

AquaShine includes full SQL migrations and seed data for Supabase.

### Step 1: Supabase Project Details
- **Project URL:** `https://gybfpnothqoptffhmont.supabase.co`
- **Core Tables:** `services`, `bookings`, `site_settings`, `admin_users`
- **Administrator UUID:** `10b9199e-d5cb-4216-bd0a-0045c79dac9f`
- **Storage Bucket:** `site-images` (Public bucket for detailing vehicle photos & gallery media)

### Step 2: Apply Migrations & Seed Data
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open and execute the upgrade migration file:
   `/supabase/migrations/20261009000001_aquashine_upgrade.sql`
   *(Configures tables, RLS policies, admin authorization record, and site-images bucket)*
3. Verify administrator user registration in `admin_users` table with UUID `10b9199e-d5cb-4216-bd0a-0045c79dac9f`.

### Step 3: Configure Storage Bucket
1. Go to **Storage** in Supabase.
2. Verify that the bucket `site-images` exists and is marked **Public**.
3. Storage policies allow public reads and authorized admin uploads/deletions.

### Step 4: Configure Environment Variables
In your `.env` file (and in your Vercel Project Settings):
```env
VITE_SUPABASE_URL="https://gybfpnothqoptffhmont.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
SUPABASE_SECRET_KEY="your-service-role-key"
```

*Note: If Supabase keys are pending, AquaShine automatically runs with its built-in persistent storage engine (`data/db.json`), ensuring zero downtime during testing!*

---

## 4. Meta WhatsApp Business Cloud API Setup

AquaShine automatically sends booking receipts to customers and alerts to the business owner (+91 8668181232).

### Step 1: Create a Meta for Developers App
1. Visit [developers.facebook.com](https://developers.facebook.com) and create a **Business App**.
2. Add the **WhatsApp** product to your app.
3. In **WhatsApp > API Setup**, copy:
   - **Temporary Access Token** (or create a System User Permanent Token in Business Manager)
   - **Phone number ID**
   - **WhatsApp Business Account ID**

### Step 2: Set Environment Variables
Add to `.env`:
```env
WHATSAPP_ACCESS_TOKEN="your-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your-account-id"
WHATSAPP_VERIFY_TOKEN="aquashine_webhook_verify_token"
```

### Step 3: Webhook Verification (Optional for Delivery Receipts)
- In the Meta App dashboard under **WhatsApp > Configuration**:
  - Callback URL: `https://your-domain.vercel.app/api/whatsapp/webhook`
  - Verify Token: `aquashine_webhook_verify_token`
  - Subscribe to: `messages`

---

## 5. Local Computer Image Uploads

Administrators can upload detailing and car wash photos directly from their Windows or Mac computer:
1. Log into `/admin`.
2. Go to **Media & Gallery** in the sidebar.
3. Click **Upload Image from Computer**.
4. The native file picker opens; select one or multiple `.jpg`, `.png`, or `.webp` files (up to 5MB each).
5. Add an optional caption and alt text, then click **Save to Permanent Media Library**.
6. The file is uploaded to the `car-wash-media` Supabase Storage bucket and registered in PostgreSQL.

---

## 6. Vercel Deployment Guide

AquaShine is optimized for zero-configuration Vercel deployment:

1. Push your repository to GitHub.
2. Import the repository in [vercel.com](https://vercel.com).
3. Set the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - `WHATSAPP_VERIFY_TOKEN`
   - `ADMIN_DEFAULT_PASSWORD`
4. Click **Deploy**. Vercel will build the frontend with `npm run build` and route API traffic according to `vercel.json`.

---

## 7. Automated Test Suite

Run the full end-to-end test suite:
```bash
npm test
```
The test suite validates:
- Database connections & initial seed values
- Vehicle category multipliers & pricing calculations
- Time slot capacity & holiday blocking
- Booking reference uniqueness & slot reservation
- Phone normalization for international WhatsApp delivery
- Administrator credential security & password verification
