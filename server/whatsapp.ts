import { WhatsAppNotificationLog } from '../src/types/index.js';

interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: any;
  error?: string;
  isSimulated?: boolean;
}

export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
  }

  public isConfigured(): boolean {
    return Boolean(
      this.accessToken &&
      this.accessToken !== 'your-whatsapp-cloud-api-permanent-token' &&
      this.phoneNumberId &&
      this.phoneNumberId !== 'your-whatsapp-phone-number-id'
    );
  }

  public getConfigStatus() {
    const configured = this.isConfigured();
    return {
      configured,
      hasAccessToken: Boolean(this.accessToken && this.accessToken !== 'your-whatsapp-cloud-api-permanent-token'),
      hasPhoneNumberId: Boolean(this.phoneNumberId && this.phoneNumberId !== 'your-whatsapp-phone-number-id'),
      hasBusinessAccountId: Boolean(this.businessAccountId && this.businessAccountId !== 'your-whatsapp-business-account-id'),
      defaultOwnerNumber: '+91 8668181232',
      graphApiUrl: `https://graph.facebook.com/v18.0/${this.phoneNumberId || '{PHONE_NUMBER_ID}'}/messages`,
      instructions: configured
        ? 'WhatsApp Business Cloud API is configured and live.'
        : 'To activate live automated WhatsApp messaging via Meta, set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your environment or .env file. The application safely handles bookings and logs full formatted WhatsApp payloads in the meantime.'
    };
  }

  /**
   * Normalizes phone number to international format (e.g. +91 8668181232 -> 918668181232)
   */
  public normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Send WhatsApp notification to Customer
   */
  public async sendCustomerBookingNotification(booking: {
    bookingReference: string;
    customerName: string;
    customerPhone: string;
    customerWhatsapp: string;
    vehicleModel: string;
    selectedServices: { serviceName: string; price: number }[];
    appointmentDate: string;
    appointmentTime: string;
    totalAmount: number;
    status: string;
    businessName: string;
  }): Promise<WhatsAppSendResult> {
    const recipient = this.normalizePhone(booking.customerWhatsapp || booking.customerPhone);
    const serviceList = booking.selectedServices.map(s => s.serviceName).join(', ');

    const messageText = 
      `🚗 *${booking.businessName} - Booking Confirmed!* \n\n` +
      `Hello ${booking.customerName},\n` +
      `Thank you for booking your car detailing with us in Chennai. Here are your booking details:\n\n` +
      `📌 *Booking Reference:* ${booking.bookingReference}\n` +
      `🚘 *Vehicle:* ${booking.vehicleModel}\n` +
      `🛠️ *Services:* ${serviceList}\n` +
      `📅 *Date & Time:* ${booking.appointmentDate} at ${booking.appointmentTime}\n` +
      `💰 *Total Amount:* ₹${booking.totalAmount.toLocaleString('en-IN')}\n` +
      `📍 *Location:* AquaShine Car Care Hub, OMR Kandanchavadi, Chennai\n` +
      `🚦 *Status:* ${booking.status}\n\n` +
      `Track your booking status live anytime on our website or reply to this message for assistance.\n` +
      `_AquaShine Car Care • Drive Clean. Shine Bright._`;

    return this.dispatchMessage(recipient, messageText, 'customer');
  }

  /**
   * Send WhatsApp notification to Business Owner (+91 8668181232)
   */
  public async sendOwnerNewBookingAlert(booking: {
    bookingReference: string;
    customerName: string;
    customerPhone: string;
    customerWhatsapp: string;
    vehicleModel: string;
    registrationNumber: string;
    selectedServices: { serviceName: string; price: number }[];
    appointmentDate: string;
    appointmentTime: string;
    totalAmount: number;
    serviceLocation: string;
    locationAddress?: string;
    status: string;
  }, ownerPhone: string = '+918668181232'): Promise<WhatsAppSendResult> {
    const recipient = this.normalizePhone(ownerPhone);
    const serviceList = booking.selectedServices.map(s => `${s.serviceName} (₹${s.price})`).join(', ');

    const messageText = 
      `🚨 *NEW BOOKING ALERT - AquaShine Chennai* \n\n` +
      `📌 *Ref:* ${booking.bookingReference}\n` +
      `👤 *Customer:* ${booking.customerName}\n` +
      `📞 *Phone:* ${booking.customerPhone} (WhatsApp: ${booking.customerWhatsapp})\n` +
      `🚘 *Vehicle:* ${booking.vehicleModel} [${booking.registrationNumber}]\n` +
      `🛠️ *Services:* ${serviceList}\n` +
      `📅 *Slot:* ${booking.appointmentDate} at ${booking.appointmentTime}\n` +
      `📍 *Type:* ${booking.serviceLocation === 'doorstep' ? `Doorstep Service: ${booking.locationAddress || 'Address on record'}` : 'Studio Facility (OMR Hub)'}\n` +
      `💰 *Amount:* ₹${booking.totalAmount.toLocaleString('en-IN')}\n` +
      `🚦 *Status:* ${booking.status}\n\n` +
      `Open Admin Console to confirm or assign detailing bay.`;

    return this.dispatchMessage(recipient, messageText, 'owner');
  }

  /**
   * Send booking status update
   */
  public async sendStatusUpdateNotification(
    customerPhone: string,
    customerName: string,
    bookingReference: string,
    newStatus: string,
    details?: string
  ): Promise<WhatsAppSendResult> {
    const recipient = this.normalizePhone(customerPhone);
    const messageText = 
      `✨ *AquaShine Car Care - Status Update*\n\n` +
      `Hello ${customerName},\n` +
      `Your booking *${bookingReference}* status is now: *${newStatus.toUpperCase()}*.\n` +
      (details ? `ℹ️ *Note:* ${details}\n\n` : '\n') +
      `Thank you for trusting AquaShine Chennai!`;

    return this.dispatchMessage(recipient, messageText, 'customer');
  }

  /**
   * Dispatches WhatsApp message via Meta Cloud API or logs detailed mock payload if API keys not set
   */
  private async dispatchMessage(to: string, bodyText: string, recipientRole: 'customer' | 'owner'): Promise<WhatsAppSendResult> {
    if (!this.isConfigured()) {
      console.log(`[WhatsApp Business Cloud API] [Credentials Pending - Simulating Dispatch]`);
      console.log(`To: +${to} (${recipientRole})`);
      console.log(`Message:\n${bodyText}`);
      
      return {
        success: true,
        isSimulated: true,
        providerMessageId: `wamid.simulated.${Date.now()}.${Math.floor(Math.random() * 10000)}`,
        providerResponse: {
          status: 'simulated_payload_logged',
          recipient: to,
          notice: 'Meta Cloud API credentials pending in environment variables.',
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: bodyText
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error('[WhatsApp Cloud API Error]:', data);
        return {
          success: false,
          error: data?.error?.message || `HTTP ${response.status}: Failed to dispatch WhatsApp message`,
          providerResponse: data
        };
      }

      const messageId = data?.messages?.[0]?.id || `wamid.${Date.now()}`;
      return {
        success: true,
        providerMessageId: messageId,
        providerResponse: data
      };
    } catch (err: any) {
      console.error('[WhatsApp API Exception]:', err);
      return {
        success: false,
        error: err.message || 'Network error communicating with WhatsApp Cloud API'
      };
    }
  }
}

export const whatsAppService = new WhatsAppService();
