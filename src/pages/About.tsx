import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Droplets,
  Award,
  Users,
  CheckCircle2,
  CalendarCheck,
  Phone,
  MessageCircle,
  MapPin
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Our Detailing Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            About AquaShine Car Care
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-neutral-400">
            Pioneering premium automotive aesthetics and eco-friendly car detailing across Chennai since 2018.
          </p>
        </div>

        {/* Narrative Section with Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Crafted for Chennai’s Demanding Climate
            </h2>
            <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
              Chennai automobiles face an aggressive combination of coastal saline humidity from the Bay of Bengal, blazing UV exposure, and heavy expressway red dirt. Traditional roadside car washes using alkaline soaps and rough cotton cloths cause severe swirl marks that permanently damage automotive clear coats.
            </p>
            <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
              AquaShine Car Care was established in Kandanchavadi on Rajiv Gandhi Salai (OMR) to bring surgical precision to automotive detailing. We combine German pH-neutral chemical snow foam, ultrasonic interior air purgers, and true 9H nano-ceramic quartz coatings to keep your vehicle looking as pristine as the day it rolled out of the showroom.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <div>
                <p className="text-3xl font-black text-sky-500">14,500+</p>
                <p className="text-xs text-gray-500 uppercase mt-1">Cars Detailed</p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-500">99.8%</p>
                <p className="text-xs text-gray-500 uppercase mt-1">Customer Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-neutral-800 bg-neutral-950 aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80"
              alt="AquaShine Detailing Facility"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-xs font-bold uppercase text-sky-400">OMR Flagship Facility</span>
              <h3 className="text-xl font-bold mt-1">Multi-Bay High-Clearance Detailing Hub</h3>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              The Four Pillars of AquaShine
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800">
              <Award className="w-8 h-8 text-sky-500 mb-4" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">IDA Certified Detailers</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 leading-relaxed">
                Every technician undergoes extensive training in paint depth gauging, dual-action rotary polishing, and leather conditioning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800">
              <Droplets className="w-8 h-8 text-cyan-500 mb-4" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Eco Water Reclamation</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 leading-relaxed">
                We believe in sustainability. Our closed-loop water treatment plant recycles over 80% of wash water without polluting Chennai waterways.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Genuine Ceramic Warranties</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 leading-relaxed">
                All 9H ceramic coating applications come with official physical and digital warranty cards with free semi-annual maintenance checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800">
              <Users className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Instant WhatsApp Transparency</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 leading-relaxed">
                Real-time appointment vouchers, bay progress photos, and digital invoices delivered straight to your phone.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-900 via-neutral-900 to-black p-8 sm:p-12 text-center text-white border border-neutral-800 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold">Ready to Experience Showroom Shine?</h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-3 max-w-xl mx-auto">
            Book an appointment online in under 60 seconds with instant slot reservation and WhatsApp confirmation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/book"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25"
            >
              Book an Appointment
            </Link>
            <a
              href="https://wa.me/918668181232"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Contact Workshop Manager
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
