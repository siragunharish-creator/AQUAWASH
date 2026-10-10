import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Clock,
  Car,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Share2,
  Info
} from 'lucide-react';
import { api } from '../lib/api.js';
import { BookingRecord } from '../types/index.js';
import {
  BUSINESS_WHATSAPP_NUMBER,
  normalizeIndianPhoneNumber,
  buildAquaShineMessage,
  buildCustomerSelfMessage,
  createWhatsAppLink
} from '../lib/whatsapp.js';

export const BookingConfirmation: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<BookingRecord | null>(
    (location.state as any)?.booking || null
  );
  const [copied, setCopied] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking && reference) {
      api.trackBooking(reference)
        .then(res => {
          setBooking(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [reference, booking]);

  const bookingRef = reference || booking?.bookingReference || 'AQ-CONFIRMED';

  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bookingDetailsForWhatsApp = booking
    ? {
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        vehicleType: booking.vehicleType,
        vehicleModel: booking.vehicleModel,
        registrationNumber: booking.registrationNumber,
        selectedServices: booking.selectedServices,
        totalAmount: booking.totalAmount,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        serviceLocation: booking.serviceLocation,
        status: booking.status
      }
    : {
        bookingReference: bookingRef,
        customerName: 'Customer',
        customerPhone: '',
        vehicleType: 'Car',
        vehicleModel: '',
        selectedServices: [],
        totalAmount: 0,
        appointmentDate: '',
        appointmentTime: ''
      };

  const aquaShineMsg = buildAquaShineMessage(bookingDetailsForWhatsApp);
  const customerSelfMsg = buildCustomerSelfMessage(bookingDetailsForWhatsApp);

  const normalizedCustomerPhone = normalizeIndianPhoneNumber(
    booking?.customerWhatsapp || booking?.customerPhone || ''
  );

  const aquaShineLink = createWhatsAppLink(BUSINESS_WHATSAPP_NUMBER, aquaShineMsg);
  const customerSelfLink = normalizedCustomerPhone
    ? createWhatsAppLink(normalizedCustomerPhone, customerSelfMsg)
    : null;

  const handleCopyFullDetails = () => {
    navigator.clipboard.writeText(aquaShineMsg);
    setCopiedDetails(true);
    setTimeout(() => setCopiedDetails(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-neutral-400">
        Retrieving your saved booking confirmation...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-neutral-100 py-16 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          {/* Top Badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Booking Saved in Database
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Your Car Wash Slot is Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-300 mt-2 max-w-lg mx-auto font-medium">
            Your booking has been saved successfully. Choose a WhatsApp option below to open your prefilled message and send it.
          </p>

          {/* Reference Box */}
          <div className="mt-8 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Booking Reference ID
              </span>
              <p className="font-mono text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 tracking-wider">
                {bookingRef}
              </p>
            </div>
            <button
              onClick={handleCopyRef}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-900 text-gray-600 dark:text-neutral-300 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
              title="Copy Reference Number"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Itemized Summary */}
          {booking && (
            <div className="mt-6 text-left space-y-2.5 p-5 rounded-2xl bg-gray-50/60 dark:bg-neutral-950/60 border border-gray-100 dark:border-neutral-800 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                <span className="text-gray-500 dark:text-neutral-400">Customer Name:</span>
                <span className="font-bold text-gray-900 dark:text-white">{booking.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                <span className="text-gray-500 dark:text-neutral-400">Mobile Phone:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{booking.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                <span className="text-gray-500 dark:text-neutral-400">Vehicle:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {booking.vehicleModel} ({booking.vehicleType.toUpperCase()})
                  {booking.registrationNumber ? ` • ${booking.registrationNumber}` : ''}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                <span className="text-gray-500 dark:text-neutral-400">Appointment Slot:</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {booking.appointmentDate} at {booking.appointmentTime} (IST)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                <span className="text-gray-500 dark:text-neutral-400">Service Location:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {booking.serviceLocation === 'studio' ? 'OMR Detailing Hub, Chennai' : `Doorstep: ${booking.locationAddress || 'Chennai'}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                <span className="text-gray-500 dark:text-neutral-400">Booking Status:</span>
                <span className="font-bold px-2 py-0.5 rounded-full text-xs bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  {booking.status}
                </span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span className="text-gray-700 dark:text-neutral-300 font-bold">Total Payable:</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-base">
                  ₹{booking.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* WHATSAPP CLICK-TO-CHAT BUTTONS (NO API DISPATCH)         */}
          {/* ======================================================== */}
          <div className="mt-8 space-y-3">
            {/* Button 1: Send Booking to AquaShine on WhatsApp */}
            <a
              href={aquaShineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/25 flex items-center justify-center transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 mr-2.5" />
              Send Booking to AquaShine on WhatsApp
            </a>

            {/* Button 2: Share Booking on My WhatsApp */}
            {customerSelfLink ? (
              <a
                href={customerSelfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl font-semibold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 flex items-center justify-center transition-all"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Booking on My WhatsApp (+{normalizedCustomerPhone})
              </a>
            ) : null}

            {/* Button 3: Fallback Copy Booking Details */}
            <button
              onClick={handleCopyFullDetails}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
            >
              {copiedDetails ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-500" />
                  Booking Details Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy Booking Details to Clipboard
                </>
              )}
            </button>
          </div>

          {/* Important Limitation Notice */}
          <div className="mt-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 text-left flex items-start space-x-2.5">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <strong>WhatsApp Note:</strong> Clicking the green button opens your WhatsApp app with all booking information prefilled. Press <strong>Send</strong> in WhatsApp to deliver it. Your booking is permanently secured in AquaShine's database regardless.
            </div>
          </div>

          {/* Links */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <Link
              to={`/track?ref=${bookingRef}`}
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center"
            >
              Track Booking Status Live <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>

            <Link
              to="/"
              className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Return to AquaShine Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
