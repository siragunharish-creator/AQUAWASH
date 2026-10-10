import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const ADMIN_UUID = '10b9199e-d5cb-4216-bd0a-0045c79dac9f';
export const SITE_IMAGES_BUCKET = 'site-images';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://gybfpnothqoptffhmont.supabase.co';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-supabase-publishable-anon-key' &&
  !supabaseAnonKey.includes('placeholder')
);

// Create the Supabase browser client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Checks whether an authenticated user is an authorized administrator.
 * Validates against public.admin_users table in Supabase for role='admin'.
 */
export async function checkIsAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;

  // 1. Authorize against public.admin_users table in Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data && data.role === 'admin') {
        return true;
      }
    } catch (err) {
      console.warn('Error querying admin_users table:', err);
    }
  }

  // 2. Authorize against registered administrator UUID in fallback / offline mode
  return userId === ADMIN_UUID;
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
