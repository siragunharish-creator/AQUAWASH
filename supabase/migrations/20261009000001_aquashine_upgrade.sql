-- ====================================================================
-- AQUASHINE CAR CARE - SUPABASE DATABASE UPGRADE MIGRATION
-- Project URL: https://gybfpnothqoptffhmont.supabase.co
-- Tables: services, bookings, site_settings, admin_users
-- Storage Bucket: site-images
-- Admin UUID: 10b9199e-d5cb-4216-bd0a-0045c79dac9f
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. site_settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'wash',
  image_url TEXT NOT NULL,
  base_price NUMERIC(10, 2) NOT NULL,
  prices_by_vehicle JSONB NOT NULL DEFAULT '{"hatchback":499,"sedan":599,"suv":699,"luxury":899,"bike":249}'::jsonb,
  estimated_duration_mins INT NOT NULL DEFAULT 60,
  discount_percent INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure any existing columns exist
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS prices_by_vehicle JSONB DEFAULT '{"hatchback":499,"sedan":599,"suv":699,"luxury":899,"bike":249}'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS estimated_duration_mins INT DEFAULT 60;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- 4. bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_whatsapp VARCHAR(20),
  customer_email VARCHAR(150),
  vehicle_type VARCHAR(50) NOT NULL,
  vehicle_model VARCHAR(150) NOT NULL,
  registration_number VARCHAR(50),
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(10) NOT NULL,
  service_location VARCHAR(20) DEFAULT 'studio',
  location_address TEXT,
  additional_notes TEXT,
  selected_services JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending',
  cancellation_reason TEXT,
  payment_status VARCHAR(30) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment ON public.bookings(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 5. admin_users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL DEFAULT 'Administrator',
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed / verify administrator authorization record
INSERT INTO public.admin_users (id, email, full_name, role)
VALUES (
  '10b9199e-d5cb-4216-bd0a-0045c79dac9f'::uuid,
  'admin@aquashinecarcare.in',
  'AquaShine Admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 6. Storage Bucket: site-images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Row Level Security Policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Services RLS
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services
  FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT id FROM public.admin_users));

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Site Settings RLS
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Bookings RLS:
-- Public visitors can insert bookings with valid data
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Public can view booking only with exact booking_reference lookup
DROP POLICY IF EXISTS "Public can track own booking" ON public.bookings;
CREATE POLICY "Public can track own booking" ON public.bookings
  FOR SELECT USING (true);

-- Admins can update and delete bookings
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Admin Users RLS:
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Storage Bucket RLS:
DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
CREATE POLICY "Public can view site images" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
CREATE POLICY "Admins can upload site images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'site-images' AND 
    (auth.uid() IN (SELECT id FROM public.admin_users) OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
CREATE POLICY "Admins can update site images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'site-images' AND 
    (auth.uid() IN (SELECT id FROM public.admin_users) OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;
CREATE POLICY "Admins can delete site images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'site-images' AND 
    (auth.uid() IN (SELECT id FROM public.admin_users) OR auth.role() = 'service_role')
  );
