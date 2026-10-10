import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  MessageCircle,
  X,
  CreditCard
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { BookingRecord, BookingStatus, PaymentStatus } from '../../types/index.js';
import {
  BUSINESS_WHATSAPP_NUMBER,
  normalizeIndianPhoneNumber,
  buildAquaShineMessage,
  buildAdminToCustomerMessage,
  createWhatsAppLink
} from '../../lib/whatsapp.js';

export const BookingsManager: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Selected Booking for Modal / Actions
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadBookings = () => {
    setLoading(true);
    api.adminGetBookings({
      search: search || undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      date: dateFilter || undefined
    })
      .then(res => {
        setBookings(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const handleStatusChange = async (id: string, newStatus: BookingStatus, reason?: string, payment?: PaymentStatus) => {
    try {
      const updated = await api.adminUpdateBookingStatus(id, newStatus, {
        cancellationReason: reason,
        paymentStatus: payment,
        sendWhatsappUpdate: false
      });
      setBookings(prev => prev.map(b => (b.id === id ? updated : b)));
      if (selectedBooking?.id === id) {
        setSelectedBooking(updated);
      }
      setShowCancelModal(false);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !rescheduleDate || !rescheduleTime) return;
    try {
      const updated = await api.adminRescheduleBooking(selectedBooking.id, rescheduleDate, rescheduleTime);
      setBookings(prev => prev.map(b => (b.id === selectedBooking.id ? updated : b)));
      setSelectedBooking(updated);
      setShowRescheduleModal(false);
    } catch (err: any) {
      alert(`Failed to reschedule: ${err.message}`);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('No booking records to export.');
      return;
    }

    const headers = [
      'Reference',
      'Customer Name',
      'Phone',
      'WhatsApp',
      'Vehicle Type',
      'Vehicle Model',
      'Registration',
      'Date',
      'Time Slot',
      'Location',
      'Amount (INR)',
      'Status',
      'Payment Status',
      'Created At'
    ];

    const rows = bookings.map(b => [
      b.bookingReference,
      `"${b.customerName}"`,
      b.customerPhone,
      b.customerWhatsapp,
      b.vehicleType,
      `"${b.vehicleModel}"`,
      b.registrationNumber,
      b.appointmentDate,
      b.appointmentTime,
      b.serviceLocation,
      b.totalAmount,
      b.status,
      b.paymentStatus,
      b.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aquashine_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<BookingStatus, string> = {
    'Pending': 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300',
    'Confirmed': 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300',
    'In Progress': 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 animate-pulse',
    'Completed': 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300',
    'Cancelled': 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300'
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Booking Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Search, confirm, reschedule, update bay progression, and export records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2 text-emerald-500" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Reference, Customer Name, Phone, or Registration (e.g. TN 07)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs font-semibold text-gray-900 dark:text-white"
            />

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading bookings from database...</div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs sm:text-sm">
            No bookings match the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-950 text-[11px] uppercase tracking-wider text-gray-500 dark:text-neutral-400 border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Reference & Customer</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Slot Date & Time</th>
                  <th className="px-5 py-3.5">Amount & Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {bookings.map(bk => (
                  <tr key={bk.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-950/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-sky-600 dark:text-sky-400">
                        {bk.bookingReference}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-0.5">
                        {bk.customerName}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {bk.customerPhone}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {bk.vehicleModel}
                      </div>
                      <div className="font-mono font-bold text-[11px] text-gray-500 uppercase">
                        {bk.registrationNumber} • {bk.vehicleType}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {bk.appointmentDate}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {bk.appointmentTime} IST ({bk.serviceLocation === 'studio' ? 'OMR Studio' : 'Doorstep'})
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        ₹{bk.totalAmount}
                      </div>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        bk.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {bk.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[bk.status]}`}>
                        {bk.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedBooking(bk)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300"
                        title="View & Edit Booking Details"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Booking Management</span>
                <h3 className="text-xl font-bold font-mono text-sky-500">
                  {selectedBooking.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Changers */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Update Appointment Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Pending', 'Confirmed', 'In Progress', 'Completed'] as BookingStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedBooking.id, st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedBooking.status === st
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>

            {/* Payment Status */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">Payment Status:</span>
                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                  ₹{selectedBooking.totalAmount} ({selectedBooking.paymentStatus})
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStatusChange(selectedBooking.id, selectedBooking.status, undefined, 'Paid')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white"
                >
                  Mark Paid
                </button>
                <button
                  onClick={() => handleStatusChange(selectedBooking.id, selectedBooking.status, undefined, 'Pending')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                >
                  Mark Pending
                </button>
              </div>
            </div>

            {/* Customer & Slot Information */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div><strong>Customer:</strong> {selectedBooking.customerName}</div>
                <div><strong>Phone:</strong> {selectedBooking.customerPhone}</div>
                <div><strong>WhatsApp:</strong> {selectedBooking.customerWhatsapp}</div>
                <div><strong>Email:</strong> {selectedBooking.customerEmail || 'N/A'}</div>
              </div>
              <div className="space-y-1.5">
                <div><strong>Vehicle:</strong> {selectedBooking.vehicleModel}</div>
                <div><strong>Reg No:</strong> {selectedBooking.registrationNumber}</div>
                <div><strong>Date & Slot:</strong> {selectedBooking.appointmentDate} at {selectedBooking.appointmentTime}</div>
                <div><strong>Location:</strong> {selectedBooking.serviceLocation === 'studio' ? 'OMR Detailing Hub' : `Doorstep: ${selectedBooking.locationAddress}`}</div>
              </div>
            </div>

            {/* Selected Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Booked Services</h4>
              <div className="space-y-1.5 text-xs">
                {selectedBooking.selectedServices.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-950 flex justify-between">
                    <span>{s.serviceName} (~{s.durationMins} mins)</span>
                    <span className="font-bold">₹{s.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons & Manual WhatsApp Links */}
            <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setRescheduleDate(selectedBooking.appointmentDate);
                    setRescheduleTime(selectedBooking.appointmentTime);
                    setShowRescheduleModal(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-sky-600 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                >
                  Reschedule Slot
                </button>

                <div className="flex items-center space-x-2">
                  {/* WhatsApp Action 1: AquaShine Hub */}
                  <a
                    href={createWhatsAppLink(
                      BUSINESS_WHATSAPP_NUMBER,
                      buildAquaShineMessage({
                        bookingReference: selectedBooking.bookingReference,
                        customerName: selectedBooking.customerName,
                        customerPhone: selectedBooking.customerPhone,
                        vehicleType: selectedBooking.vehicleType,
                        vehicleModel: selectedBooking.vehicleModel,
                        registrationNumber: selectedBooking.registrationNumber,
                        selectedServices: selectedBooking.selectedServices,
                        totalAmount: selectedBooking.totalAmount,
                        appointmentDate: selectedBooking.appointmentDate,
                        appointmentTime: selectedBooking.appointmentTime,
                        serviceLocation: selectedBooking.serviceLocation,
                        status: selectedBooking.status
                      })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 flex items-center"
                    title="Open booking details in AquaShine Hub WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    AquaShine Hub
                  </a>

                  {/* WhatsApp Action 2: Customer */}
                  {normalizeIndianPhoneNumber(selectedBooking.customerWhatsapp || selectedBooking.customerPhone) ? (
                    <a
                      href={createWhatsAppLink(
                        normalizeIndianPhoneNumber(selectedBooking.customerWhatsapp || selectedBooking.customerPhone)!,
                        buildAdminToCustomerMessage({
                          bookingReference: selectedBooking.bookingReference,
                          customerName: selectedBooking.customerName,
                          customerPhone: selectedBooking.customerPhone,
                          vehicleType: selectedBooking.vehicleType,
                          vehicleModel: selectedBooking.vehicleModel,
                          registrationNumber: selectedBooking.registrationNumber,
                          selectedServices: selectedBooking.selectedServices,
                          totalAmount: selectedBooking.totalAmount,
                          appointmentDate: selectedBooking.appointmentDate,
                          appointmentTime: selectedBooking.appointmentTime,
                          serviceLocation: selectedBooking.serviceLocation,
                          status: selectedBooking.status
                        })
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center shadow-sm"
                      title="Open prefilled WhatsApp message addressed to customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      Chat with Customer
                    </a>
                  ) : null}
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-neutral-400 italic">
                * Note: WhatsApp buttons open prefilled click-to-chat links. Review and send manually in WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Reschedule Appointment</h3>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Time Slot (HH:MM)</label>
              <input
                type="text"
                placeholder="e.g. 11:00 or 15:30"
                value={rescheduleTime}
                onChange={e => setRescheduleTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white"
              >
                Save & Update Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-lg text-rose-600">Cancel Booking</h3>
            <p className="text-xs text-gray-500">
              Provide a cancellation reason. A WhatsApp cancellation notice will be delivered to the client.
            </p>
            <textarea
              rows={3}
              placeholder="Reason for cancellation (e.g. Customer requested cancellation / Vehicle not available)"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs text-gray-900 dark:text-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Back
              </button>
              <button
                onClick={() => handleStatusChange(selectedBooking.id, 'Cancelled', cancelReason)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
