import React from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 py-16 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Terms of Service
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-2">
            Applicable to all appointments booked with AquaShine Car Care (Chennai, Tamil Nadu)
          </p>
        </div>

        <div className="space-y-8 text-sm text-gray-700 dark:text-neutral-300 leading-relaxed bg-gray-50 dark:bg-neutral-900 p-8 sm:p-12 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 text-sky-500 mr-2" />
              1. Appointments & Slot Availability
            </h2>
            <p>
              AquaShine operates dedicated appointment slots from 8:00 AM to 8:00 PM IST across our detailing bays in Chennai. Customers are requested to arrive within 15 minutes of their scheduled time. If you anticipate a delay, please notify us via WhatsApp to avoid slot reallocation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
              2. Free Cancellation & Rescheduling
            </h2>
            <p>
              We understand that plans change. You may reschedule or cancel your appointment free of charge up to 2 hours prior to the scheduled slot time through our tracking portal or by messaging our WhatsApp line at +91 86681 81232.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <ShieldCheck className="w-5 h-5 text-cyan-500 mr-2" />
              3. Payments & Pricing Policy
            </h2>
            <p>
              Service prices are calculated dynamically based on vehicle category (Hatchback, Sedan, SUV, Luxury Car, Motorbike) and displayed transparently including applicable GST (18%). No advance payment is mandatory for standard appointments; payment may be settled via UPI, Cash, or Card at the studio facility upon inspection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
              4. Valuables & Pre-Existing Paint Flaws
            </h2>
            <p>
              Customers are advised to remove personal valuables, toll tags, and sensitive electronic items prior to vehicle handover. Our technicians conduct a multi-point paint inspection upon arrival to record existing deep stone chips or panel dents before initiating machine compounding.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
