import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Filter,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../lib/api.js';
import { fetchServicesFromSupabase } from '../lib/supabase.js';
import { FALLBACK_SERVICES } from '../data/fallbackServices.js';
import { ServiceItem, VehicleType } from '../types/index.js';

export const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('sedan');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadServices = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // 1. First attempt to load via backend API (or Supabase via server)
      const res = await api.getServices();
      if (res && res.length > 0) {
        setServices(res);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend /api/services error, attempting direct Supabase query:', err?.message);
    }

    // 2. Direct Supabase fallback in case of serverless routing issues on Vercel
    try {
      const supaServices = await fetchServicesFromSupabase();
      if (supaServices && supaServices.length > 0) {
        setServices(supaServices);
        setLoading(false);
        return;
      }
    } catch (supaErr: any) {
      console.warn('Direct Supabase fetch error:', supaErr?.message);
    }

    // 3. Fallback catalog so customer is never presented with an empty or broken screen
    setServices(FALLBACK_SERVICES);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const vehicleTabs: { id: VehicleType; label: string; desc: string }[] = [
    { id: 'hatchback', label: 'Hatchback', desc: 'Swift, i20, Altroz, Baleno' },
    { id: 'sedan', label: 'Sedan', desc: 'City, Verna, Ciaz, Slavia' },
    { id: 'suv', label: 'SUV', desc: 'Creta, Seltos, Harrier, XUV700' },
    { id: 'luxury', label: 'Luxury Car', desc: 'Mercedes, BMW, Audi, Porsche' },
    { id: 'bike', label: 'Motorbike', desc: 'Royal Enfield, Duke, Superbikes' }
  ];

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'wash', label: 'Foam & Body Washes' },
    { id: 'detailing', label: 'Cabin & Interior' },
    { id: 'protection', label: '9H Ceramic Shield' },
    { id: 'specialty', label: 'Specialty Care' }
  ];

  const filteredServices = services.filter(s => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            Car Detailing & Wash Packages
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-neutral-400">
            Tailored to your vehicle's exact body specifications in Chennai. All pricing includes premium microfibre hand-wash, alloy rim decontamination, and glass finishing.
          </p>
        </div>

        {/* Step 1: Vehicle Category Selector */}
        <div className="bg-gray-50 dark:bg-neutral-950 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 mb-10">
          <div className="text-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              Step 1: Choose Your Vehicle Type For Exact Pricing
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {vehicleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedVehicle(tab.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  selectedVehicle === tab.id
                    ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 shadow-sm ring-1 ring-sky-500'
                    : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
                  <span>{tab.label}</span>
                  {selectedVehicle === tab.id && (
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  )}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 mt-1 line-clamp-1">
                  {tab.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === c.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Error notification if fetch failed */}
        {fetchError && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fetchError} (Showing cached catalog).</span>
            </div>
            <button
              onClick={loadServices}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-white font-bold hover:opacity-90"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Services List / Loading / Empty States */}
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
              Loading AquaShine service catalog & pricing...
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-gray-50 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 space-y-3">
            <p className="text-base font-bold text-gray-800 dark:text-neutral-200">
              No services found for this category.
            </p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Try selecting another category above or view all treatments.
            </p>
            <button
              onClick={() => setCategoryFilter('all')}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500"
            >
              View All Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(service => {
              const vehiclePrice = service.pricesByVehicle?.[selectedVehicle] || service.basePrice;
              const discountedPrice = service.discountPercent
                ? Math.round(vehiclePrice * (1 - service.discountPercent / 100))
                : vehiclePrice;

              return (
                <div
                  key={service.id}
                  className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 bg-neutral-950 overflow-hidden">
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                      {service.isPopular && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950 shadow-md">
                          Most Popular
                        </span>
                      )}

                      {service.discountPercent && service.discountPercent > 0 && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500 text-white shadow-md">
                          {service.discountPercent}% OFF
                        </span>
                      )}

                      <div className="absolute bottom-3 left-3 text-white flex items-center space-x-2">
                        <span className="inline-flex items-center text-xs font-semibold text-neutral-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          <Clock className="w-3.5 h-3.5 mr-1 text-sky-400" />
                          ~{service.estimatedDurationMins} Mins
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <Link
                        to={`/services/${service.slug || service.id}`}
                        className="text-lg font-bold text-gray-900 dark:text-white hover:text-sky-500 transition-colors block"
                      >
                        {service.name}
                      </Link>
                      <p className="mt-2 text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
                        {service.shortDescription}
                      </p>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-2">
                          Treatment Inclusions:
                        </p>
                        <ul className="space-y-1.5">
                          {service.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start text-xs text-gray-600 dark:text-neutral-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-gray-100 dark:border-neutral-800 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        {selectedVehicle.toUpperCase()} Price
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

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/services/${service.slug || service.id}`}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/book?service=${service.id}&vehicle=${selectedVehicle}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 hover:scale-[1.02] transition-all"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
