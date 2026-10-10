-- ====================================================================
-- AQUASHINE CAR CARE - FIX ADMIN USERS RLS & VERIFICATION POLICY
-- Administrator UUID: 10b9199e-d5cb-4216-bd0a-0045c79dac9f
-- ====================================================================

-- 1. Create a non-recursive SECURITY DEFINER function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 2. Fix admin_users RLS: Replace recursive policy with direct ID match
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Authenticated users can read their own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Users can read own admin record" ON public.admin_users;

-- Allows any authenticated user to check IF their own ID is in admin_users
CREATE POLICY "Authenticated users can read their own admin record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 3. Ensure the designated administrator UUID is present in public.admin_users
INSERT INTO public.admin_users (id, email, full_name, role)
VALUES (
  '10b9199e-d5cb-4216-bd0a-0045c79dac9f'::uuid,
  'admin@aquashinecarcare.in',
  'AquaShine Administrator',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = 'AquaShine Administrator';

-- 4. Update services policies using non-recursive is_admin()
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin());

-- 5. Update site_settings policies using non-recursive is_admin()
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- 6. Update bookings policies
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can track own booking" ON public.bookings;
CREATE POLICY "Public can track own booking" ON public.bookings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL USING (public.is_admin());

-- 7. Update storage policies for 'site-images' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
CREATE POLICY "Public can view site images" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
CREATE POLICY "Admins can upload site images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'site-images' AND 
    (public.is_admin() OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
CREATE POLICY "Admins can update site images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'site-images' AND 
    (public.is_admin() OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;
CREATE POLICY "Admins can delete site images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'site-images' AND 
    (public.is_admin() OR auth.role() = 'service_role')
  );
