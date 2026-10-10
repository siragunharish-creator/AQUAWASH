import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  CalendarCheck,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Phone
} from 'lucide-react';
import { api } from '../lib/api.js';
import { ServiceItem, VehicleType } from '../types/index.js';

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('sedan');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getService(id)
      .then(res => {
        setService(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading service details...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Service Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">The requested car detailing package does not exist.</p>
        <Link to="/services" className="mt-6 inline-flex items-center text-sky-500 font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
        </Link>
      </div>
    );
  }

  const currentPrice = service.pricesByVehicle?.[selectedVehicle] || service.basePrice;
  const discountedPrice = service.discountPercent
    ? Math.round(currentPrice * (1 - service.discountPercent / 100))
    : currentPrice;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 py-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/services"
          className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-neutral-400 hover:text-sky-500 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image & In-depth Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-neutral-950 aspect-video shadow-2xl">
              <img
                src={service.imageUrl}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500">
                  {service.category.toUpperCase()}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold mt-2 text-white">
                  {service.name}
                </h1>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Treatment Description & Process
              </h3>
              <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                {service.fullDescription}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                What's Included in This Package
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start text-xs sm:text-sm text-gray-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2.5 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Calculator & Direct Booking Card */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-500">
                  Select Vehicle Category
                </span>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {(['hatchback', 'sedan', 'suv', 'luxury', 'bike'] as VehicleType[]).map(vt => (
                    <button
                      key={vt}
                      onClick={() => setSelectedVehicle(vt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                        selectedVehicle === vt
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-neutral-400 mb-1">
                  <span>Estimated Duration</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-sky-500" />
                    {service.estimatedDurationMins} Minutes
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-200/50 dark:border-neutral-800/50">
                  <div>
                    <span className="text-xs text-gray-400">Total Price for {selectedVehicle.toUpperCase()}:</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      ₹{discountedPrice}
                    </span>
                    {service.discountPercent ? (
                      <span className="block text-xs text-gray-400 line-through">
                        ₹{currentPrice}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/book?service=${service.id}&vehicle=${selectedVehicle}`}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/30 flex items-center justify-center transition-all hover:scale-[1.02]"
                >
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  Book This Service Now
                </Link>

                <a
                  href={`https://wa.me/918668181232?text=Hi%20AquaShine,%20I%20have%20questions%20about%20the%20${encodeURIComponent(service.name)}%20package.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl font-semibold text-xs text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Inquire on WhatsApp
                </a>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 text-xs text-gray-500 dark:text-neutral-400 space-y-2">
                <p className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                  Includes free multi-point paint inspection
                </p>
                <p className="flex items-center">
                  <Sparkles className="w-4 h-4 text-sky-500 mr-2 flex-shrink-0" />
                  IDA certified detailing standards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
