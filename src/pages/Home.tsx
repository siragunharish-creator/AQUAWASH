import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CalendarCheck,
  MessageCircle,
  ShieldCheck,
  Droplets,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronDown,
  Phone,
  MapPin,
  Car,
  Layers,
  Award
} from 'lucide-react';
import { api } from '../lib/api.js';
import { ServiceItem, WebsiteContent, TestimonialItem, VehicleType } from '../types/index.js';

export const Home: React.FC = () => {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('sedan');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api.getContent().then(setContent).catch(() => {});
    api.getServices().then(setServices).catch(() => {});
    api.getTestimonials().then(setTestimonials).catch(() => {});
  }, []);

  const hero = content?.hero || {
    badge: 'Chennai’s Premier Auto Detailing & Wash Studio',
    headline: 'Your Car Deserves a Premium Clean.',
    subheadline: 'Professional car washing and detailing, booked at your convenience.',
    ctaPrimaryText: 'Book Your Wash',
    ctaSecondaryText: 'Explore Services',
    bgImageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=85'
  };

  const vehicleTabs: { id: VehicleType; label: string }[] = [
    { id: 'hatchback', label: 'Hatchback' },
    { id: 'sedan', label: 'Sedan' },
    { id: 'suv', label: 'SUV' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'bike', label: 'Bike' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 transition-colors duration-200">
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION                                                  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background photo with luxury automotive overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={hero.bgImageUrl}
            alt="AquaShine Detailing Facility"
            className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-sky-500/10 border border-sky-400/30 text-sky-400 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 mr-2 animate-spin" />
            {hero.badge}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto drop-shadow-md">
            {hero.headline}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
            {hero.subheadline}
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              to="/book"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
            >
              <CalendarCheck className="w-5 h-5 mr-2.5" />
              {hero.ctaPrimaryText}
            </Link>

            <Link
              to="/services"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-white bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-700/80 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
            >
              {hero.ctaSecondaryText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <a
              href="https://wa.me/918668181232?text=Hi%20AquaShine%20Chennai,%20I%20would%20like%20to%20inquire%20about%20booking%20a%20car%20wash."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp Enquiry
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10 max-w-4xl mx-auto">
            <div>
              <p className="text-3xl font-extrabold text-white">14,500+</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1 font-medium">Cars Detailed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-sky-400">99.8%</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1 font-medium">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">45 Mins</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1 font-medium">Express Turnaround</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-cyan-400">100%</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1 font-medium">Scratch-Free Method</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 1. OUR SERVICES WITH VEHICLE CATEGORY SWITCHER                */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Professional Treatments
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            Engineered Detailing For Every Vehicle
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-neutral-400">
            Select your car category below to view vehicle-specific pricing with transparent taxes and zero hidden charges.
          </p>

          {/* Vehicle Switcher Tabs */}
          <div className="inline-flex p-1.5 mt-8 bg-gray-100 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800">
            {vehicleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedVehicle(tab.id)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedVehicle === tab.id
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 6).map(service => {
            const vehiclePrice = service.pricesByVehicle?.[selectedVehicle] || service.basePrice;
            const discountedPrice = service.discountPercent
              ? Math.round(vehiclePrice * (1 - service.discountPercent / 100))
              : vehiclePrice;

            return (
              <div
                key={service.id}
                className="group relative rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden bg-neutral-950">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {service.isPopular && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-neutral-950 shadow-md">
                        Popular Choice
                      </span>
                    )}

                    {service.discountPercent && service.discountPercent > 0 && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500 text-white shadow-md">
                        {service.discountPercent}% OFF
                      </span>
                    )}

                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="inline-flex items-center text-xs font-medium text-neutral-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 mr-1 text-sky-400" />
                        ~{service.estimatedDurationMins} Mins
                      </span>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-sky-500 transition-colors">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
                      {service.shortDescription}
                    </p>

                    <ul className="mt-4 space-y-1.5">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start text-xs text-gray-600 dark:text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="p-6 pt-0 border-t border-gray-100 dark:border-neutral-800/80 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500">
                      Price for {selectedVehicle.toUpperCase()}
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">
                        ₹{discountedPrice}
                      </span>
                      {service.discountPercent ? (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{vehiclePrice}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <Link
                    to={`/book?service=${service.id}&vehicle=${selectedVehicle}`}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 hover:scale-[1.03] transition-all"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center font-bold text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500"
          >
            Explore all detailing packages, ceramic coatings & paint protection
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. WHY CHOOSE US                                              */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-gray-50 dark:bg-neutral-950 border-y border-gray-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
              The AquaShine Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
              Why Discerning Car Owners in Chennai Choose Us
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-neutral-400">
              Chennai's coastal saline breeze and heavy highway dust require specialized chemical care, not coarse wash cloths.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-sky-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Zero Swirl Mark Guarantee
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                We use 2-bucket wash systems with dirt-trapping grit guards and 1200 GSM plush microfibre towels imported from Germany.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-sky-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Eco-Friendly Water Recycling
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                Our OMR studio uses multi-stage sand & carbon water filtration to recycle 80% of wash water sustainably.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-sky-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Certified Master Detailers
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                Technicians trained under IDA (International Detailing Association) guidelines for safe paint restoration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-sky-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Automated WhatsApp Alerts
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                Instant confirmation, live stage updates, and digital payment receipts dispatched straight to WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. HOW IT WORKS                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Seamless 3-Step Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            How AquaShine Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 relative z-10 shadow-sm">
            <span className="text-4xl font-black text-sky-500/20 dark:text-sky-400/20">01</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              Select Vehicle & Service
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
              Pick your car type (Hatchback, Sedan, SUV, Luxury) and choose from our snow foam wash, deep interior sanitization, or ceramic packages.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 relative z-10 shadow-sm">
            <span className="text-4xl font-black text-sky-500/20 dark:text-sky-400/20">02</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              Choose Time Slot & Location
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
              Book a guaranteed appointment slot at our OMR detailing center or opt for our doorstep mobile detailing van across Chennai.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 relative z-10 shadow-sm">
            <span className="text-4xl font-black text-sky-500/20 dark:text-sky-400/20">03</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              Receive WhatsApp Alert & Drive Clean
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
              Receive your immediate WhatsApp booking voucher, track status live, and pick up your vehicle in sparkling showroom condition.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/book"
            className="inline-flex items-center px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/25"
          >
            Start Your Booking Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. FEATURED LUXURY VEHICLES IN CHENNAI                        */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                Pristine Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
                Trusted by Chennai’s Luxury Fleet
              </h2>
            </div>
            <Link
              to="/gallery"
              className="mt-4 md:mt-0 text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center"
            >
              View Full Gallery <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative rounded-2xl overflow-hidden h-80 group">
              <img
                src="https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=800&q=80"
                alt="Audi R8 Detailing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold text-sky-400 uppercase">9H Ceramic Shield</span>
                <h3 className="text-lg font-bold text-white mt-1">Audi R8 V10 Plus</h3>
                <p className="text-xs text-neutral-300">Detailed at OMR Hub, Chennai</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-80 group">
              <img
                src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80"
                alt="BMW M3 Foam Wash"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold text-cyan-400 uppercase">High-Adhesion Foam Bath</span>
                <h3 className="text-lg font-bold text-white mt-1">BMW 3 Series Gran Limousine</h3>
                <p className="text-xs text-neutral-300">Swirl elimination & paint sealant</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-80 group">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"
                alt="Porsche Interior Clean"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold text-amber-400 uppercase">Hospital-Grade Sanitization</span>
                <h3 className="text-lg font-bold text-white mt-1">Mercedes-Benz E-Class</h3>
                <p className="text-xs text-neutral-300">Leather conditioning & AC vent purge</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. BEFORE AND AFTER HIGHLIGHT                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Visible Transformation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            Before & After Precision
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-neutral-400">
            Compare dull, swirl-marred clear coats before detailing with our mirror-reflective 9H ceramic finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg">
            <div className="relative h-64 sm:h-80">
              <img
                src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80"
                alt="Before and After Detailing"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                Before: Swirl Marks & Water Spots
              </div>
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-emerald-600/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                After: 99% Flawless Mirror Gloss
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Multi-Stage Machine Paint Correction
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 mt-2">
                Tata Safari Dark Edition rescued from automatic wash buffer marks and water etching caused by Chennai hard water.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg">
            <div className="relative h-64 sm:h-80">
              <img
                src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80"
                alt="Engine Bay Transformation"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-neutral-900/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                Engine Bay Steam Degreased
              </div>
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-sky-600/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                OEM Satin Finish UV Shield
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Underhood & Engine Bay Concierge Treatment
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 mt-2">
                Non-conductive steam cleaning, safe for modern automotive ECUs and exposed sensors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. CUSTOMER TESTIMONIALS (LABELED AS DEMO CONTENT)            */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-gray-50 dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
              Customer Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
              Loved by Automobile Enthusiasts
            </h2>
            <p className="mt-2 text-xs text-amber-500 font-semibold tracking-wider uppercase">
              Notice: Verified Demo Testimonials for Preview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map(item => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 text-amber-400 mb-3">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-neutral-300 italic leading-relaxed">
                    "{item.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800/80">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {item.customerName}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    {item.vehicleModel} • {item.location}
                  </p>
                  <span className="inline-block mt-1 text-[10px] text-sky-500 font-medium">
                    {item.serviceUsed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. SPECIAL OFFERS                                             */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-sky-900 via-neutral-900 to-black p-8 sm:p-12 text-white border border-sky-800/50 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Chennai Detailing Promo
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-4 text-white">
              Get Flat 15% OFF on 9H Ceramic Coating Protection
            </h3>
            <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
              Shield your vehicle against Chennai monsoon oxidation and UV fading. Includes free 6-month inspection and complimentary interior steam sanitization.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/book?service=srv-6"
                className="px-6 py-3 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30"
              >
                Claim Ceramic Offer
              </Link>
              <a
                href="https://wa.me/918668181232?text=Hi%20AquaShine,%20I%20want%20to%20avail%20the%2015%25%20Ceramic%20Coating%20Offer."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Inquire via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ)                           */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {(content?.faq || []).map((faqItem, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between text-gray-900 dark:text-white hover:text-sky-500"
              >
                <span>{faqItem.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 text-gray-400 ${
                    openFaq === idx ? 'rotate-180 text-sky-500' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed border-t border-gray-100 dark:border-neutral-800/60 pt-3">
                  {faqItem.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. CONTACT & CHENNAI HUB LOCATION                             */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-gray-50 dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
                Visit or Book
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
                AquaShine Auto Detailing Hub
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                Located right off the Rajiv Gandhi IT Expressway (OMR) in Kandanchavadi with high-clearance bays and customer lounge with high-speed Wi-Fi.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start space-x-3 text-sm text-gray-700 dark:text-neutral-300">
                  <MapPin className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                  <span>
                    No. 42, Rajiv Gandhi Salai (OMR), Kandanchavadi, Perungudi, Chennai, Tamil Nadu 600096
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700 dark:text-neutral-300">
                  <Phone className="w-5 h-5 text-sky-500 flex-shrink-0" />
                  <span>+91 86681 81232 (Direct Booking Line)</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700 dark:text-neutral-300">
                  <Clock className="w-5 h-5 text-sky-500 flex-shrink-0" />
                  <span>Monday – Sunday: 8:00 AM – 8:00 PM (IST)</span>
                </div>
              </div>

              <div className="mt-8 flex items-center space-x-4">
                <Link
                  to="/book"
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20"
                >
                  Book Slot Online
                </Link>
                <a
                  href="https://maps.google.com/?q=OMR+Kandanchavadi+Chennai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-semibold text-sm bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white hover:border-sky-500"
                >
                  Get Directions
                </a>
              </div>
            </div>

            {/* Visual Location Card */}
            <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900 p-2">
              <div className="relative h-80 rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
                  alt="AquaShine Chennai Detailing Hub"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Multi-Bay Detailing Facility Open</span>
                  </div>
                  <h4 className="text-xl font-bold mt-1">OMR Express Facility</h4>
                  <p className="text-xs text-neutral-300 mt-1">
                    Serving OMR, ECR, Velachery, Adyar, Besant Nagar & Thoraipakkam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
