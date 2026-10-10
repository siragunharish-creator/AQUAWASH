import {
  BookingRecord,
  BusinessSettings,
  ServiceItem,
  VehicleCategory,
  WebsiteContent,
  MediaAsset,
  TestimonialItem,
  WhatsAppNotificationLog,
  AuditLogItem,
  VehicleType
} from '../types/index.js';

const ADMIN_TOKEN_KEY = 'aquashine_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options?.headers);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errObj = await res.json();
      errMsg = errObj.error || errMsg;
      if (errObj.details) {
        errMsg += ` (${errObj.details.join(', ')})`;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // Public
  getSettings: () => fetchJson<BusinessSettings>('/api/settings'),
  getContent: () => fetchJson<WebsiteContent>('/api/content'),
  getVehicleCategories: () => fetchJson<VehicleCategory[]>('/api/vehicle-categories'),
  getServices: () => fetchJson<ServiceItem[]>('/api/services'),
  getService: (id: string) => fetchJson<ServiceItem>(`/api/services/${id}`),
  getAvailability: (date: string) => fetchJson<{
    date: string;
    isHoliday: boolean;
    slots: { time: string; available: boolean; currentBookings: number; maxCapacity: number }[];
  }>(`/api/availability?date=${date}`),
  getTestimonials: () => fetchJson<TestimonialItem[]>('/api/testimonials'),
  getGallery: () => fetchJson<MediaAsset[]>('/api/gallery'),
  
  createBooking: (data: {
    customerName: string;
    customerPhone: string;
    customerWhatsapp: string;
    customerEmail?: string;
    vehicleType: VehicleType;
    vehicleModel: string;
    registrationNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceLocation: 'studio' | 'doorstep';
    locationAddress?: string;
    additionalNotes?: string;
    serviceIds: string[];
    whatsappConsent: boolean;
  }) => fetchJson<{ success: boolean; bookingReference: string; booking: BookingRecord; message: string }>('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  trackBooking: (reference: string, phoneLast4?: string) => {
    const q = phoneLast4 ? `?phone=${phoneLast4}` : '';
    return fetchJson<BookingRecord>(`/api/bookings/${reference}${q}`);
  },

  // Admin Auth
  adminLogin: async (username: string, password: string) => {
    const data = await fetchJson<{ success: boolean; token: string; user: any }>('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      setAdminToken(data.token);
    }
    return data;
  },
  adminLogout: async () => {
    try {
      await fetchJson('/api/admin/logout', { method: 'POST' });
    } finally {
      clearAdminToken();
    }
  },
  adminGetMe: () => fetchJson<{ email: string; name: string; role: string }>('/api/admin/me'),
  adminChangePassword: (currentPassword: string, newPassword: string) => fetchJson<{ success: boolean; message: string }>('/api/admin/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword })
  }),

  // Admin Dashboard Management
  adminGetStats: () => fetchJson<{
    totalBookings: number;
    todayBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    upcomingAppointments: BookingRecord[];
    popularServices: { name: string; count: number }[];
    recentActivity: AuditLogItem[];
  }>('/api/admin/stats'),

  adminGetBookings: (params?: { search?: string; status?: string; date?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.date) query.set('date', params.date);
    if (params?.limit) query.set('limit', params.limit.toString());
    return fetchJson<BookingRecord[]>(`/api/admin/bookings?${query.toString()}`);
  },

  adminUpdateBookingStatus: (id: string, status: string, options?: { cancellationReason?: string; paymentStatus?: string; sendWhatsappUpdate?: boolean }) =>
    fetchJson<BookingRecord>(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...options })
    }),

  adminRescheduleBooking: (id: string, appointmentDate: string, appointmentTime: string) =>
    fetchJson<BookingRecord>(`/api/admin/bookings/${id}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentDate, appointmentTime })
    }),

  adminGetServices: () => fetchJson<ServiceItem[]>('/api/admin/services'),
  adminCreateService: (data: Partial<ServiceItem>) =>
    fetchJson<ServiceItem>('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  adminUpdateService: (id: string, data: Partial<ServiceItem>) =>
    fetchJson<ServiceItem>(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  adminDeleteService: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/admin/services/${id}`, { method: 'DELETE' }),

  adminUpdateSettings: (settings: Partial<BusinessSettings>) =>
    fetchJson<BusinessSettings>('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }),

  adminUpdateContent: (content: WebsiteContent) =>
    fetchJson<WebsiteContent>('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    }),

  adminUploadImage: async (file: File, meta?: { altText?: string; caption?: string; category?: string }) => {
    const formData = new FormData();
    formData.append('image', file);
    if (meta?.altText) formData.append('altText', meta.altText);
    if (meta?.caption) formData.append('caption', meta.caption);
    if (meta?.category) formData.append('category', meta.category);

    const token = getAdminToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }

    return res.json() as Promise<{ success: boolean; asset: MediaAsset; url: string }>;
  },

  adminDeleteMedia: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/media/${id}`, { method: 'DELETE' }),

  adminGetNotifications: () =>
    fetchJson<{
      logs: WhatsAppNotificationLog[];
      config: {
        configured: boolean;
        hasAccessToken: boolean;
        hasPhoneNumberId: boolean;
        hasBusinessAccountId: boolean;
        defaultOwnerNumber: string;
        instructions: string;
      };
    }>('/api/admin/notifications'),

  adminRetryNotification: (id: string) =>
    fetchJson<{ success: boolean; result: any }>(`/api/admin/notifications/retry/${id}`, {
      method: 'POST'
    }),

  adminGetAuditLogs: () => fetchJson<AuditLogItem[]>('/api/admin/audit-logs')
};
