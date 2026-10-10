export type VehicleType = 'hatchback' | 'sedan' | 'suv' | 'luxury' | 'bike';

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Partial';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'simulated';

export interface VehicleCategory {
  id: VehicleType;
  name: string;
  displayName: string;
  description: string;
  multiplier: number;
  iconName: string;
}

export interface ServicePrice {
  vehicleType: VehicleType;
  price: number;
}

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: 'wash' | 'detailing' | 'protection' | 'specialty';
  imageUrl: string;
  basePrice: number;
  pricesByVehicle: Record<VehicleType, number>;
  estimatedDurationMins: number;
  discountPercent?: number;
  isActive: boolean;
  displayOrder: number;
  isPopular?: boolean;
  features: string[];
}

export interface BookingCustomer {
  name: string;
  phone: string;
  whatsappPhone: string;
  email?: string;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail?: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  registrationNumber: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  serviceLocation: 'studio' | 'doorstep';
  locationAddress?: string;
  additionalNotes?: string;
  selectedServices: {
    serviceId: string;
    serviceName: string;
    price: number;
    durationMins: number;
  }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: BookingStatus;
  cancellationReason?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  whatsappConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  time: string; // "09:00", "10:30", etc.
  available: boolean;
  currentBookings: number;
  maxCapacity: number;
  reason?: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  openingTime: string;
  closingTime: string;
  weeklyHolidays: string[]; // e.g., ["Tuesday"]
  slotDurationMins: number;
  maxBookingsPerSlot: number;
  taxPercentage: number;
  currency: string;
  currencySymbol: string;
  timezone: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  cancellationPolicy: string;
}

export interface WebsiteContent {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    bgImageUrl: string;
  };
  about: {
    title: string;
    subtitle: string;
    description: string;
    experienceYears: number;
    carsDetailedCount: number;
    teamExpertsCount: number;
    satisfactionRate: number;
  };
  features: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  altText: string;
  caption: string;
  category: 'services' | 'gallery' | 'branding' | 'hero';
  createdAt: string;
}

export interface TestimonialItem {
  id: string;
  customerName: string;
  location: string;
  vehicleModel: string;
  serviceUsed: string;
  rating: number;
  comment: string;
  isDemo: boolean;
  isActive: boolean;
  date: string;
}

export interface WhatsAppNotificationLog {
  id: string;
  bookingReference: string;
  recipientType: 'customer' | 'owner';
  recipientPhone: string;
  messageType: 'booking_created' | 'booking_confirmed' | 'booking_rescheduled' | 'booking_cancelled' | 'booking_completed';
  status: NotificationStatus;
  providerResponse?: any;
  providerMessageId?: string;
  errorMessage?: string;
  retryCount: number;
  lastAttemptAt: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
}
