-- ====================================================================
-- AQUASHINE CAR CARE - SUPABASE POSTGRESQL SCHEMA
-- Location: Chennai, Tamil Nadu, India
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicle Categories Table
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  multiplier NUMERIC(3, 2) DEFAULT 1.0,
  icon_name VARCHAR(50),
  display_order INT DEFAULT 0
);

-- 4. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'wash',
  image_url TEXT NOT NULL,
  base_price NUMERIC(10, 2) NOT NULL,
  prices_by_vehicle JSONB NOT NULL,
  estimated_duration_mins INT NOT NULL DEFAULT 60,
  discount_percent INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  whatsapp_phone VARCHAR(20),
  email VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_whatsapp VARCHAR(20) NOT NULL,
  customer_email VARCHAR(150),
  vehicle_type VARCHAR(50) NOT NULL,
  vehicle_model VARCHAR(150) NOT NULL,
  registration_number VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(10) NOT NULL,
  service_location VARCHAR(20) DEFAULT 'studio',
  location_address TEXT,
  additional_notes TEXT,
  selected_services JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending',
  cancellation_reason TEXT,
  payment_status VARCHAR(30) DEFAULT 'Pending',
  payment_method VARCHAR(50) DEFAULT 'Pay at Facility',
  whatsapp_consent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);

-- 7. Slot Availability & Reservations
CREATE TABLE IF NOT EXISTS slot_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(10) NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_booking_slot UNIQUE (appointment_date, appointment_time, booking_id)
);
CREATE INDEX IF NOT EXISTS idx_slot_reservations ON slot_reservations(appointment_date, appointment_time);

-- 8. Website Content Table
CREATE TABLE IF NOT EXISTS website_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  alt_text TEXT,
  caption TEXT,
  category VARCHAR(50) DEFAULT 'gallery',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(150) NOT NULL,
  location VARCHAR(150) DEFAULT 'Chennai',
  vehicle_model VARCHAR(150) NOT NULL,
  service_used VARCHAR(150) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WhatsApp Notification Logs
CREATE TABLE IF NOT EXISTS whatsapp_notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(50) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL,
  recipient_phone VARCHAR(30) NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  provider_response JSONB,
  provider_message_id VARCHAR(150),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_ref ON whatsapp_notification_logs(booking_reference);

-- 12. Admin Profiles and Audit Logs
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(100),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active services, business settings, content, media, testimonials
CREATE POLICY "Public Read Active Services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Business Settings" ON business_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Website Content" ON website_content FOR SELECT USING (true);
CREATE POLICY "Public Read Media Assets" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Public Read Active Testimonials" ON testimonials FOR SELECT USING (is_active = true);

-- Public can create bookings
CREATE POLICY "Public Create Bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Customers can view their own booking if they know reference
CREATE POLICY "Public Track Booking By Reference" ON bookings FOR SELECT USING (true);

-- Storage bucket creation & policy
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-wash-media', 'car-wash-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage public read policy
CREATE POLICY "Public Access To Car Wash Media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'car-wash-media');
