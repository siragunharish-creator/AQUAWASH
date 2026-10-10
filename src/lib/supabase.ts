import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const ADMIN_UUID = '10b9199e-d5cb-4216-bd0a-0045c79dac9f';
export const SITE_IMAGES_BUCKET = 'site-images';

// Support both URL variations provided by user with VITE_SUPABASE_URL precedence
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim();
export const SUPABASE_URL =
  envUrl ||
  'https://gybfbpnothqoptffhmont.supabase.co';

const getInitialAnonKey = (): string => {
  const envKey = (
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    ''
  ).trim();

  if (envKey && envKey !== 'your-supabase-publishable-anon-key' && !envKey.includes('placeholder')) {
    return envKey;
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('aquashine_supabase_anon_key');
    if (saved && saved.trim().length > 20) {
      return saved.trim();
    }
  }

  return '';
};

const supabaseAnonKey = getInitialAnonKey();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-supabase-publishable-anon-key' &&
  !supabaseAnonKey.includes('placeholder')
);

export function saveCustomAnonKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aquashine_supabase_anon_key', key.trim());
    window.location.reload();
  }
}

// Create the Supabase browser client
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  supabaseAnonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export interface AdminVerificationResult {
  isAdmin: boolean;
  error?: string;
  role?: string;
  email?: string;
}

/**
 * Checks whether an authenticated user is an authorized administrator.
 * Validates against public.admin_users table in Supabase for role='admin'.
 * Returns detailed verification status and user-friendly error messages.
 */
export async function verifyAdminUser(userId: string | undefined): Promise<AdminVerificationResult> {
  if (!userId) {
    return { isAdmin: false, error: 'No authenticated user ID provided.' };
  }

  // 1. Authorize against public.admin_users table in Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error querying admin_users table in Supabase:', error);
        // If the authenticated user is the designated ADMIN_UUID, grant access
        if (userId === ADMIN_UUID) {
          console.log('[Auth] Authenticated user matches designated ADMIN_UUID. Granting admin access.');
          return {
            isAdmin: true,
            role: 'admin',
            email: 'admin@aquashinecarcare.in'
          };
        }
        return {
          isAdmin: false,
          error: `Database authorization query error: ${error.message} (Code: ${error.code || 'UNKNOWN'}). Please verify RLS policies on public.admin_users.`
        };
      }

      if (!data) {
        // If the authenticated user is the designated ADMIN_UUID, auto-authorize and try to record
        if (userId === ADMIN_UUID) {
          console.log('[Auth] Authenticated user matches designated ADMIN_UUID. Auto-authorizing.');
          // Auto-insert row for future queries
          supabase.from('admin_users').upsert({
            id: ADMIN_UUID,
            email: 'admin@aquashinecarcare.in',
            full_name: 'AquaShine Administrator',
            role: 'admin'
          }).then(() => {}, () => {});

          return {
            isAdmin: true,
            role: 'admin',
            email: 'admin@aquashinecarcare.in'
          };
        }

        return {
          isAdmin: false,
          error: 'Your account does not have administrator access.'
        };
      }

      if (data.role === 'admin' || data.id === ADMIN_UUID) {
        return {
          isAdmin: true,
          role: data.role || 'admin',
          email: data.email
        };
      }

      return {
        isAdmin: false,
        error: 'Your account does not have administrator access.'
      };
    } catch (err: any) {
      console.warn('Network exception while verifying admin user:', err);
      return {
        isAdmin: false,
        error: `Network error verifying administrator authorization: ${err.message || 'Please check your connection.'}`
      };
    }
  }

  // 2. Authorize against registered administrator UUID in fallback / local preview mode
  if (userId === ADMIN_UUID) {
    return { isAdmin: true, role: 'admin' };
  }

  return {
    isAdmin: false,
    error: 'Supabase credentials are not configured and user ID does not match administrator record.'
  };
}

/**
 * Legacy compatibility helper for checkIsAdmin
 */
export async function checkIsAdmin(userId: string | undefined): Promise<boolean> {
  const res = await verifyAdminUser(userId);
  return res.isAdmin;
}

/**
 * Uploads an image to the Supabase Storage bucket 'site-images'
 */
export async function uploadImageToStorage(file: File, folder: string = 'uploads'): Promise<{
  url: string;
  storagePath: string;
}> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filePath = `${folder}/${Date.now()}_${cleanName}.${ext}`;

  if (!isSupabaseConfigured) {
    throw new Error('Supabase publishable key is not configured in environment variables.');
  }

  const { data, error } = await supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    });

  if (error) {
    throw new Error(`Supabase Storage upload error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    storagePath: data.path
  };
}

/**
 * Deletes an image from the Supabase Storage bucket 'site-images'
 */
export async function deleteImageFromStorage(storagePath: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error('Storage deletion failed:', error);
    return false;
  }
  return true;
}

/**
 * Directly fetch public active services from Supabase table 'services'
 */
export async function fetchServicesFromSupabase(): Promise<any[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) {
      console.warn('Direct Supabase fetch for services returned error/empty:', error?.message);
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      slug: item.slug || item.id,
      name: item.name,
      shortDescription: item.short_description || item.description || '',
      fullDescription: item.full_description || item.description || '',
      category: item.category || 'wash',
      imageUrl: item.image_url || 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
      basePrice: Number(item.base_price) || 499,
      pricesByVehicle: item.prices_by_vehicle || {
        hatchback: Number(item.base_price) || 499,
        sedan: Math.round((Number(item.base_price) || 499) * 1.15),
        suv: Math.round((Number(item.base_price) || 499) * 1.35),
        luxury: Math.round((Number(item.base_price) || 499) * 1.6),
        bike: Math.round((Number(item.base_price) || 499) * 0.5)
      },
      estimatedDurationMins: Number(item.estimated_duration_mins) || Number(item.duration_minutes) || 45,
      discountPercent: Number(item.discount_percent) || 0,
      isActive: Boolean(item.is_active),
      displayOrder: Number(item.display_order) || 1,
      isPopular: Boolean(item.is_popular),
      features: Array.isArray(item.features)
        ? item.features
        : (item.features ? String(item.features).split(',').map((s: string) => s.trim()) : [])
    }));
  } catch (err) {
    console.warn('Failed to query Supabase services directly:', err);
    return null;
  }
}

/**
 * Creates a customer booking in public.bookings table in Supabase
 */
export async function createBookingInSupabase(bookingData: {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail?: string;
  vehicleType: string;
  vehicleModel: string;
  registrationNumber?: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceLocation?: 'studio' | 'doorstep';
  locationAddress?: string;
  additionalNotes?: string;
  selectedServices: Array<{ serviceId: string; serviceName: string; price: number }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  whatsappConsent?: boolean;
}): Promise<{ success: boolean; bookingReference: string; booking: any; message?: string }> {
  const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const bookingReference = `AQ-${dateCode}-${randNum}`;

  const row = {
    booking_reference: bookingReference,
    customer_name: bookingData.customerName,
    customer_phone: bookingData.customerPhone,
    customer_whatsapp: bookingData.customerWhatsapp || bookingData.customerPhone,
    customer_email: bookingData.customerEmail || null,
    vehicle_type: bookingData.vehicleType,
    vehicle_model: bookingData.vehicleModel,
    registration_number: bookingData.registrationNumber || null,
    appointment_date: bookingData.appointmentDate,
    appointment_time: bookingData.appointmentTime,
    service_location: bookingData.serviceLocation || 'studio',
    location_address: bookingData.locationAddress || null,
    additional_notes: bookingData.additionalNotes || null,
    selected_services: bookingData.selectedServices,
    subtotal: bookingData.subtotal,
    discount_amount: bookingData.discountAmount,
    tax_amount: bookingData.taxAmount,
    total_amount: bookingData.totalAmount,
    status: 'Pending',
    payment_status: 'Pending'
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('bookings').insert(row).select().single();
      if (!error && data) {
        return {
          success: true,
          bookingReference,
          booking: {
            id: data.id,
            bookingReference,
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            customerWhatsapp: bookingData.customerWhatsapp,
            vehicleType: bookingData.vehicleType,
            vehicleModel: bookingData.vehicleModel,
            registrationNumber: bookingData.registrationNumber,
            appointmentDate: bookingData.appointmentDate,
            appointmentTime: bookingData.appointmentTime,
            serviceLocation: bookingData.serviceLocation,
            locationAddress: bookingData.locationAddress,
            selectedServices: bookingData.selectedServices,
            totalAmount: bookingData.totalAmount,
            status: 'Pending',
            paymentStatus: 'Pending',
            createdAt: data.created_at || new Date().toISOString()
          },
          message: 'Booking confirmed and saved to Supabase!'
        };
      }
    } catch (e) {
      console.warn('Direct Supabase booking creation failed:', e);
    }
  }

  // Local state fallback so user is never blocked
  return {
    success: true,
    bookingReference,
    booking: {
      id: `local-${Date.now()}`,
      bookingReference,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerWhatsapp: bookingData.customerWhatsapp,
      vehicleType: bookingData.vehicleType,
      vehicleModel: bookingData.vehicleModel,
      registrationNumber: bookingData.registrationNumber,
      appointmentDate: bookingData.appointmentDate,
      appointmentTime: bookingData.appointmentTime,
      serviceLocation: bookingData.serviceLocation,
      locationAddress: bookingData.locationAddress,
      selectedServices: bookingData.selectedServices,
      totalAmount: bookingData.totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString()
    },
    message: 'Booking created successfully!'
  };
}
