import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 py-16 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Data Protection & Trust
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-2">
            Last Updated: October 2026 • AquaShine Car Care (Chennai, Tamil Nadu)
          </p>
        </div>

        <div className="space-y-8 text-sm text-gray-700 dark:text-neutral-300 leading-relaxed bg-gray-50 dark:bg-neutral-900 p-8 sm:p-12 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <ShieldCheck className="w-5 h-5 text-sky-500 mr-2" />
              1. Information We Collect
            </h2>
            <p>
              AquaShine Car Care collects only essential details necessary to fulfill your car detailing appointments in Chennai:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li>Customer contact details: Full Name, Mobile Phone Number, WhatsApp Number, and optional Email Address.</li>
              <li>Vehicle identification: Vehicle Category (Hatchback/Sedan/SUV/Luxury/Bike), Model Name, and Registration Number (e.g. TN 07 BZ 4521).</li>
              <li>Appointment information: Preferred Date, Time Slot, and Service Location (Detailing Studio or Chennai Doorstep Address).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Lock className="w-5 h-5 text-emerald-500 mr-2" />
              2. How We Use WhatsApp Notifications
            </h2>
            <p>
              When you opt-in to WhatsApp alerts during booking, we use the official Meta WhatsApp Business Cloud API exclusively for service-related communications:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li>Instant booking confirmation and reference vouchers.</li>
              <li>Detailing progress alerts (e.g., Wash In-Progress, Ready for Pickup).</li>
              <li>Digital tax invoices and warranty certificates.</li>
              <li>We strictly respect your privacy: your WhatsApp number is never sold, leased, or used for spam.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Eye className="w-5 h-5 text-amber-500 mr-2" />
              3. Data Security & Storage
            </h2>
            <p>
              All customer bookings, registration details, and notification records are securely stored in our PostgreSQL database protected by Row Level Security (RLS) policies. Only authenticated AquaShine administrative personnel have access to manage and review customer appointments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 text-cyan-500 mr-2" />
              4. Contact for Privacy Matters
            </h2>
            <p>
              If you wish to review, update, or request the deletion of your booking records, please contact our data officer at:
            </p>
            <p className="font-semibold text-sky-600 dark:text-sky-400">
              Email: contact@aquashinecarcare.in • WhatsApp: +91 86681 81232
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
