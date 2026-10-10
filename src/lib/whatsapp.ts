/**
 * WhatsApp Click-to-Chat Utilities
 * Pure client-side link generator — ABSOLUTELY NO API / EXTERNAL DISPATCH
 */

export const BUSINESS_WHATSAPP_NUMBER = '918668181232';

/**
 * Normalizes an Indian phone number to international E.164 format without '+'
 * Handles numbers with/without +91, with spaces, dashes, or parentheses.
 */
export function normalizeIndianPhoneNumber(input: string): string | null {
  if (!input) return null;

  // Remove all non-numeric characters
  let digits = input.replace(/\D/g, '');

  // If number starts with 0 and has 11 digits (e.g. 09840123456), drop the leading 0
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // If 10 digits (standard Indian mobile like 9840123456), prepend 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  // If 12 digits and starts with 91, it's already well-formatted
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  // If valid length between 10 and 15 digits
  if (digits.length >= 10 && digits.length <= 15) {
    return digits;
  }

  return null;
}

export interface BookingWhatsAppDetails {
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  vehicleType: string;
  vehicleModel: string;
  registrationNumber?: string;
  selectedServices: { serviceName: string; price: number }[];
  totalAmount: number;
  appointmentDate: string;
  appointmentTime: string;
  serviceLocation?: string;
  status?: string;
}

/**
 * Builds prefilled message for AquaShine Business Desk (Button 1)
 */
export function buildAquaShineMessage(booking: BookingWhatsAppDetails): string {
  const serviceNames = booking.selectedServices.map(s => s.serviceName).join(', ');
  const regNumber = booking.registrationNumber ? ` [${booking.registrationNumber}]` : '';

  return (
    `Hello AquaShine Car Care,\n\n` +
    `I have booked an appointment on your website. Here are my details:\n\n` +
    `📌 *Booking Reference:* ${booking.bookingReference}\n` +
    `👤 *Name:* ${booking.customerName}\n` +
    `📞 *Phone:* ${booking.customerPhone}\n` +
    `🚘 *Vehicle:* ${booking.vehicleModel} (${booking.vehicleType.toUpperCase()})${regNumber}\n` +
    `🛠️ *Service(s):* ${serviceNames}\n` +
    `💰 *Total Amount:* ₹${booking.totalAmount.toLocaleString('en-IN')}\n` +
    `📅 *Date:* ${booking.appointmentDate}\n` +
    `⏰ *Time Slot:* ${booking.appointmentTime} IST\n` +
    `📍 *Location:* ${booking.serviceLocation === 'doorstep' ? 'Doorstep Service (Chennai)' : 'OMR Studio Detailing Hub'}\n\n` +
    `Please confirm my detailing slot. Thank you!`
  );
}

/**
 * Builds prefilled message for Customer to share/save on their own WhatsApp (Button 2)
 */
export function buildCustomerSelfMessage(booking: BookingWhatsAppDetails): string {
  const serviceNames = booking.selectedServices.map(s => s.serviceName).join(', ');
  const regNumber = booking.registrationNumber ? ` (${booking.registrationNumber})` : '';

  return (
    `🚗 *AquaShine Car Care — Booking Confirmation*\n\n` +
    `Hi ${booking.customerName}, your car detailing appointment has been scheduled!\n\n` +
    `📌 *Reference ID:* ${booking.bookingReference}\n` +
    `🚘 *Vehicle:* ${booking.vehicleModel}${regNumber}\n` +
    `🛠️ *Service:* ${serviceNames}\n` +
    `📅 *Date:* ${booking.appointmentDate}\n` +
    `⏰ *Time:* ${booking.appointmentTime} IST\n` +
    `💰 *Amount:* ₹${booking.totalAmount.toLocaleString('en-IN')}\n` +
    `🚦 *Status:* ${booking.status || 'Confirmed'}\n` +
    `📍 *Venue:* AquaShine Car Care, OMR Kandanchavadi, Chennai\n` +
    `📞 *Helpline:* +91 86681 81232\n\n` +
    `_Drive Clean. Shine Bright._`
  );
}

/**
 * Builds prefilled message for Admin to message Customer
 */
export function buildAdminToCustomerMessage(booking: BookingWhatsAppDetails): string {
  return (
    `Hello ${booking.customerName},\n\n` +
    `This is AquaShine Car Care (Chennai Hub) regarding your booking *${booking.bookingReference}* for *${booking.vehicleModel}*.\n\n` +
    `📅 *Appointment:* ${booking.appointmentDate} at ${booking.appointmentTime}\n` +
    `🚦 *Status:* ${(booking.status || 'Confirmed').toUpperCase()}\n\n` +
    `Our detailing bay is getting ready for your vehicle. Please let us know if you need any directions to our OMR Kandanchavadi studio or have special requests.\n\n` +
    `AquaShine Car Care • +91 86681 81232`
  );
}

/**
 * Creates wa.me URL
 */
export function createWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
