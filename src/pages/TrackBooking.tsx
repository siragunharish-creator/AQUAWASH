import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Car,
  AlertCircle,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { api } from '../lib/api.js';
import { BookingRecord, BookingStatus } from '../types/index.js';

export const TrackBooking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const urlRef = searchParams.get('ref');
    if (urlRef) {
      setReference(urlRef);
      fetchBooking(urlRef);
    }
  }, [searchParams]);

  const fetchBooking = async (ref: string, phone?: string) => {
    if (!ref.trim()) {
      setErrorMsg('Please enter your booking reference.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.trackBooking(ref.trim(), phone?.trim() || undefined);
      setBooking(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'No booking found with this reference.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooking(reference, phoneLast4);
  };

  const statusSteps: BookingStatus[] = ['Pending', 'Confirmed', 'In Progress', 'Completed'];

  const getStepState = (step: BookingStatus, currentStatus: BookingStatus) => {
    if (currentStatus === 'Cancelled') return 'cancelled';
    const currentIndex = statusSteps.indexOf(currentStatus);
    const stepIndex = statusSteps.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-neutral-100 py-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Live Appointment Tracking
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">
            Track Your Car Detailing Status
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-2">
            Enter your booking reference from your SMS or WhatsApp confirmation voucher.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 shadow-lg mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1.5">
                  Booking Reference Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AQ-2610-8491"
                  value={reference}
                  onChange={e => setReference(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1.5">
                  Last 4 Digits of Phone
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 2345"
                  value={phoneLast4}
                  onChange={e => setPhoneLast4(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find My Booking
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Booking Details & Status Display */}
        {booking && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xl space-y-8">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-neutral-800 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Reference:</span>
                <h2 className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono tracking-wider">
                  {booking.bookingReference}
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Placed on {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-bold border">
                <span
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    booking.status === 'Completed'
                      ? 'bg-emerald-500'
                      : booking.status === 'In Progress'
                      ? 'bg-amber-500 animate-pulse'
                      : booking.status === 'Cancelled'
                      ? 'bg-red-500'
                      : 'bg-sky-500'
                  }`}
                ></span>
                <span className="text-gray-900 dark:text-white font-bold">
                  Status: {booking.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            {booking.status !== 'Cancelled' ? (
              <div className="relative">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {statusSteps.map((step, idx) => {
                    const state = getStepState(step, booking.status);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-500 text-white shadow-md'
                              : state === 'active'
                              ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-md animate-bounce'
                              : 'bg-gray-100 dark:bg-neutral-800 text-gray-400'
                          }`}
                        >
                          {state === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            state === 'active'
                              ? 'text-sky-600 dark:text-sky-400'
                              : state === 'completed'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-xs">
                This booking was cancelled. Reason: {booking.cancellationReason || 'Client request'}
              </div>
            )}

            {/* Detailed Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                  Vehicle & Customer
                </h4>
                <div><strong>Customer:</strong> {booking.customerName}</div>
                <div><strong>Phone:</strong> {booking.customerPhone}</div>
                <div><strong>Vehicle:</strong> {booking.vehicleModel} ({booking.registrationNumber})</div>
                <div><strong>Type:</strong> {booking.vehicleType.toUpperCase()}</div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                  Slot & Location
                </h4>
                <div><strong>Date:</strong> {booking.appointmentDate}</div>
                <div><strong>Slot:</strong> {booking.appointmentTime} (IST)</div>
                <div>
                  <strong>Location:</strong> {booking.serviceLocation === 'studio' ? 'OMR Detailing Facility' : `Doorstep: ${booking.locationAddress}`}
                </div>
                <div>
                  <strong>Payment Status:</strong> <span className="font-semibold text-sky-500">{booking.paymentStatus}</span> (₹{booking.totalAmount})
                </div>
              </div>
            </div>

            {/* Selected Services */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-2">
                Booked Services
              </h4>
              <div className="space-y-2">
                {booking.selectedServices.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{s.serviceName}</span>
                      <span className="text-gray-400 ml-2">(~{s.durationMins} mins)</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">₹{s.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href={`https://wa.me/918668181232?text=Hi%20AquaShine,%20checking%20status%20for%20booking%20${booking.bookingReference}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Contact Detailing Manager on WhatsApp
              </a>

              <Link
                to="/book"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-500 transition-colors flex items-center justify-center"
              >
                Book Another Car Wash
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
