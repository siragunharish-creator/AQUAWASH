import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Car,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  MapPin,
  MessageCircle,
  Truck,
  Bike
} from 'lucide-react';
import { api } from '../lib/api.js';
import { fetchServicesFromSupabase, createBookingInSupabase } from '../lib/supabase.js';
import { FALLBACK_SERVICES } from '../data/fallbackServices.js';
import { ServiceItem, VehicleType, AvailabilitySlot } from '../types/index.js';

const DEFAULT_SLOTS = [
  { time: '09:00 AM', available: true, currentBookings: 0, maxCapacity: 2 },
  { time: '10:30 AM', available: true, currentBookings: 0, maxCapacity: 2 },
  { time: '12:00 PM', available: true, currentBookings: 1, maxCapacity: 2 },
  { time: '02:00 PM', available: true, currentBookings: 0, maxCapacity: 2 },
  { time: '03:30 PM', available: true, currentBookings: 0, maxCapacity: 2 },
  { time: '05:00 PM', available: true, currentBookings: 1, maxCapacity: 2 },
  { time: '06:30 PM', available: true, currentBookings: 0, maxCapacity: 2 }
];

export const Booking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Data from backend
  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [loadingServices, setLoadingServices] = useState(false);

  // Step 1: Vehicle State
  const initialVehicle = (searchParams.get('vehicle') as VehicleType) || 'suv';
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialVehicle);
  const [vehicleModel, setVehicleModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Step 2: Services State
  const initialServiceId = searchParams.get('service');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialServiceId ? [initialServiceId] : []
  );

  // Step 3: Date & Slot State
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [slotsData, setSlotsData] = useState<{
    date: string;
    isHoliday: boolean;
    slots: { time: string; available: boolean; currentBookings: number; maxCapacity: number }[];
  }>({
    date: getTodayStr(),
    isHoliday: false,
    slots: DEFAULT_SLOTS
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceLocation, setServiceLocation] = useState<'studio' | 'doorstep'>('studio');
  const [locationAddress, setLocationAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(true);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Services from Supabase, then API, then Fallback
  const loadServices = async () => {
    try {
      const sbServices = await fetchServicesFromSupabase();
      if (sbServices && sbServices.length > 0) {
        setServices(sbServices);
        return;
      }
    } catch (_) {}

    try {
      const apiServices = await api.getServices();
      if (apiServices && apiServices.length > 0) {
        setServices(apiServices);
        return;
      }
    } catch (_) {}

    // Ensure fallback services are loaded
    setServices(FALLBACK_SERVICES);
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Fetch Slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    api.getAvailability(selectedDate)
      .then(res => {
        if (res && res.slots && res.slots.length > 0) {
          setSlotsData(res);
        } else {
          setSlotsData({ date: selectedDate, isHoliday: false, slots: DEFAULT_SLOTS });
        }
        setLoadingSlots(false);
      })
      .catch(() => {
        setSlotsData({ date: selectedDate, isHoliday: false, slots: DEFAULT_SLOTS });
        setLoadingSlots(false);
      });
  }, [selectedDate]);

  // Keep WhatsApp synced if user checked "same as phone"
  useEffect(() => {
    if (sameAsPhone) {
      setCustomerWhatsapp(customerPhone);
    }
  }, [customerPhone, sameAsPhone]);

  // Calculations
  const selectedServiceObjects = services.filter(s => selectedServiceIds.includes(s.id));
  
  let subtotal = 0;
  let totalDiscount = 0;
  selectedServiceObjects.forEach(s => {
    const p = s.pricesByVehicle?.[vehicleType] || s.basePrice;
    const d = s.discountPercent ? Math.round((p * s.discountPercent) / 100) : 0;
    subtotal += p;
    totalDiscount += d;
  });

  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxAmount = Math.round(taxableAmount * 0.18); // 18% GST standard in India
  const totalAmount = taxableAmount + taxAmount;
  const totalDuration = selectedServiceObjects.reduce((sum, s) => sum + s.estimatedDurationMins, 0);

  // Validation per step
  const handleNext = () => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!vehicleModel.trim()) {
        setErrorMsg('Please enter your vehicle model (e.g. Honda City, BMW 3 Series, Creta)');
        return;
      }
      if (!registrationNumber.trim() || registrationNumber.trim().length < 4) {
        setErrorMsg('Please enter a valid registration number (e.g. TN 07 BZ 4521)');
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedServiceIds.length === 0) {
        setErrorMsg('Please select at least one detailing or car wash service.');
        return;
      }
    }

    if (currentStep === 3) {
      if (!selectedDate) {
        setErrorMsg('Please choose an appointment date.');
        return;
      }
      if (slotsData?.isHoliday) {
        setErrorMsg('AquaShine is closed on this date. Please select another date.');
        return;
      }
      if (!selectedTimeSlot) {
        setErrorMsg('Please select an available appointment time slot.');
        return;
      }
    }

    if (currentStep === 4) {
      if (!customerName.trim() || customerName.trim().length < 2) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (serviceLocation === 'doorstep' && !locationAddress.trim()) {
        setErrorMsg('Please enter your Chennai doorstep address.');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Submit Final Booking
  const handleConfirmBooking = async () => {
    setErrorMsg(null);
    setSubmitting(true);

    const bookingPayload = {
      customerName,
      customerPhone,
      customerWhatsapp: sameAsPhone ? customerPhone : customerWhatsapp,
      customerEmail: customerEmail || undefined,
      vehicleType,
      vehicleModel,
      registrationNumber,
      appointmentDate: selectedDate,
      appointmentTime: selectedTimeSlot,
      serviceLocation,
      locationAddress: serviceLocation === 'doorstep' ? locationAddress : undefined,
      additionalNotes: additionalNotes || undefined,
      serviceIds: selectedServiceIds,
      whatsappConsent
    };

    try {
      const res = await api.createBooking(bookingPayload);
      if (res.success && res.bookingReference) {
        navigate(`/booking-confirmation/${res.bookingReference}`, {
          state: { booking: res.booking }
        });
        return;
      }
    } catch (apiErr: any) {
      console.warn('Backend API booking creation failed, attempting direct Supabase insert:', apiErr);
    }

    try {
      const formattedServices = selectedServiceObjects.map(s => ({
        serviceId: s.id,
        serviceName: s.name,
        price: s.pricesByVehicle?.[vehicleType] || s.basePrice
      }));

      const sbRes = await createBookingInSupabase({
        ...bookingPayload,
        selectedServices: formattedServices,
        subtotal,
        discountAmount: totalDiscount,
        taxAmount,
        totalAmount
      });

      if (sbRes.success && sbRes.bookingReference) {
        navigate(`/booking-confirmation/${sbRes.bookingReference}`, {
          state: { booking: sbRes.booking }
        });
        return;
      }
      throw new Error(sbRes.message || 'Booking could not be created.');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while confirming your booking.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-neutral-100 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wizard Header & Stepper */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            AquaShine Express Reservation
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">
            Book Your Car Wash in Chennai
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-2">
            Instant slot confirmation • Direct WhatsApp tracking • Zero prepayment required
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-neutral-800 -translate-y-1/2 z-0"></div>
            {[
              { num: 1, label: 'Vehicle' },
              { num: 2, label: 'Services' },
              { num: 3, label: 'Date & Time' },
              { num: 4, label: 'Details' },
              { num: 5, label: 'Summary' }
            ].map(step => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-emerald-500 text-white shadow-md'
                        : isCurrent
                        ? 'bg-sky-600 text-white ring-4 ring-sky-500/20 shadow-md'
                        : 'bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-gray-400 dark:text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-xl p-6 sm:p-10">
          {/* ======================================================== */}
          {/* STEP 1: SELECT VEHICLE                                  */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Step 1: Vehicle Category & Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                  Pricing and duration vary based on the vehicle footprint and paint surface area.
                </p>
              </div>

              {/* Vehicle Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { id: 'hatchback', name: 'Hatchback', example: 'Swift, i20, Altroz', icon: Car },
                  { id: 'sedan', name: 'Sedan', example: 'City, Verna, Slavia', icon: Car },
                  { id: 'suv', name: 'SUV / Crossover', example: 'Creta, Seltos, Safari', icon: Truck },
                  { id: 'luxury', name: 'Luxury / Exotic', example: 'BMW, Mercedes, Audi', icon: Sparkles },
                  { id: 'bike', name: 'Motorbike', example: 'Royal Enfield, Duke', icon: Bike }
                ].map(v => {
                  const Icon = v.icon;
                  const isSel = vehicleType === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id as VehicleType)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        isSel
                          ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-900 dark:text-sky-300 ring-2 ring-sky-500/30'
                          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSel ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400'}`} />
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{v.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-neutral-400 mt-1">{v.example}</div>
                    </button>
                  );
                })}
              </div>

              {/* Vehicle Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Honda City ZX / Hyundai Creta SX"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TN 07 BZ 4521"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase tracking-widest font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: SELECT SERVICES                                 */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Step 2: Choose Services for Your {vehicleType.toUpperCase()}
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                  You can select one or combine multiple services (e.g. Exterior Foam Wash + Interior Deep Cleaning).
                </p>
              </div>

              {loadingServices ? (
                <div className="text-center py-12 text-gray-400 space-y-3">
                  <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs">Loading available services for your {vehicleType.toUpperCase()}...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-10 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-300">
                    No services found. Click below to load standard detailing packages.
                  </p>
                  <button
                    type="button"
                    onClick={loadServices}
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors"
                  >
                    Load Services
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map(s => {
                    const price = s.pricesByVehicle?.[vehicleType] || s.basePrice;
                    const isSelected = selectedServiceIds.includes(s.id);
                    const discounted = s.discountPercent
                      ? Math.round(price * (1 - s.discountPercent / 100))
                      : price;

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedServiceIds(selectedServiceIds.filter(id => id !== s.id));
                          } else {
                            setSelectedServiceIds([...selectedServiceIds, s.id]);
                          }
                        }}
                        className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-500 ring-1 ring-sky-500/40'
                            : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-start space-x-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mt-1 w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                                {s.name}
                              </h3>
                              {s.discountPercent ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white">
                                  {s.discountPercent}% OFF
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">
                              {s.shortDescription}
                            </p>
                            <span className="inline-flex items-center text-[11px] text-gray-400 mt-1.5">
                              <Clock className="w-3 h-3 mr-1" />
                              Approx {s.estimatedDurationMins} Mins
                            </span>
                          </div>
                        </div>

                        <div className="text-right sm:flex-shrink-0">
                          <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                            ₹{discounted}
                          </div>
                          {s.discountPercent ? (
                            <div className="text-xs text-gray-400 line-through">
                              ₹{price}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Running total footer */}
              {selectedServiceIds.length > 0 && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 flex items-center justify-between text-xs sm:text-sm">
                  <span>
                    Selected: <strong>{selectedServiceIds.length}</strong> service(s) • Total Est. Duration: <strong>~{totalDuration} Mins</strong>
                  </span>
                  <span className="text-base font-extrabold text-sky-600 dark:text-sky-400">
                    Est. Total: ₹{totalAmount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: DATE & TIME SLOT SELECTION                      */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Step 3: Appointment Date & Time Slot
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                  Timezone: <strong>Asia/Kolkata (IST)</strong>. Real-time slot availability from our OMR Detailing Hub.
                </p>
              </div>

              {/* Date Input */}
              <div className="max-w-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                  Select Date *
                </label>
                <input
                  type="date"
                  min={getTodayStr()}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Slots Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-3">
                  Available Detailing Slots for {selectedDate}
                </label>

                {loadingSlots ? (
                  <div className="text-center py-8 text-gray-400">Checking slot availability...</div>
                ) : slotsData?.isHoliday ? (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-700 text-xs">
                    AquaShine is closed on this date for workshop maintenance. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(slotsData?.slots || []).map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-3.5 rounded-xl text-center border font-semibold text-xs sm:text-sm transition-all ${
                          !slot.available
                            ? 'bg-gray-100 dark:bg-neutral-950/60 text-gray-400 dark:text-neutral-600 border-dashed border-gray-200 dark:border-neutral-800 cursor-not-allowed'
                            : selectedTimeSlot === slot.time
                            ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-500/30'
                            : 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 border-gray-200 dark:border-neutral-800 hover:border-sky-400'
                        }`}
                      >
                        <div>{slot.time}</div>
                        <div className="text-[10px] mt-0.5 font-normal opacity-80">
                          {slot.available ? `${slot.maxCapacity - slot.currentBookings} slots free` : 'Fully Booked'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: CUSTOMER INFORMATION                            */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Step 4: Customer Details & Service Location
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                  We generate prefilled WhatsApp click-to-chat links for instant messaging and booking sharing.
                </p>
              </div>

              {/* Service Location Choice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                  Service Location *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceLocation('studio')}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      serviceLocation === 'studio'
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-900 dark:text-sky-300 ring-2 ring-sky-500/30'
                        : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 text-sky-500" />
                      Detailing Studio (OMR Hub)
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                      Kandanchavadi, OMR Expressway with lounge & Wi-Fi.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceLocation('doorstep')}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      serviceLocation === 'doorstep'
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-900 dark:text-sky-300 ring-2 ring-sky-500/30'
                        : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center">
                      <Truck className="w-4 h-4 mr-1.5 text-emerald-500" />
                      Doorstep Service in Chennai
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                      Our self-powered mobile detailing van comes to your home/office.
                    </p>
                  </button>
                </div>
              </div>

              {serviceLocation === 'doorstep' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                    Doorstep Address in Chennai *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Apartment name, Flat number, Street, Area (e.g. Adyar, Velachery, OMR, Anna Nagar)"
                    value={locationAddress}
                    onChange={e => setLocationAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karthik Ramanathan"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98401 23456"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="sameAsPhoneCheck"
                    checked={sameAsPhone}
                    onChange={e => setSameAsPhone(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <label htmlFor="sameAsPhoneCheck" className="text-xs text-gray-700 dark:text-neutral-300">
                    WhatsApp number is identical to mobile number
                  </label>
                </div>

                {!sameAsPhone && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                      WhatsApp Number (+91) *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 98840 55667"
                      value={customerWhatsapp}
                      onChange={e => setCustomerWhatsapp(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. karthik@example.com"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Focus on dog hair removal / AC vent smell"
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* WhatsApp Notification & Chat Option */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="whatsappConsentCheck"
                  checked={whatsappConsent}
                  onChange={e => setWhatsappConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="whatsappConsentCheck" className="text-xs text-emerald-900 dark:text-emerald-300">
                  <strong>WhatsApp Communication:</strong> Enable prefilled WhatsApp click-to-chat options on the confirmation page to message AquaShine or share your appointment details.
                </label>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: BOOKING SUMMARY & REVIEW                        */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Step 5: Review & Confirm Your Appointment
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                  Please review your details before booking. You can pay securely upon service completion.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle & Customer Summary */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 space-y-3 text-xs sm:text-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs border-b border-gray-200 dark:border-neutral-800 pb-2">
                    Customer & Vehicle
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">WhatsApp:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {sameAsPhone ? customerPhone : customerWhatsapp}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle Type:</span>
                    <span className="font-semibold uppercase text-gray-900 dark:text-white">{vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle Model:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{vehicleModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registration:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service Location:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {serviceLocation === 'studio' ? 'OMR Detailing Studio' : `Doorstep: ${locationAddress}`}
                    </span>
                  </div>
                </div>

                {/* Date & Pricing Breakdown */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 space-y-3 text-xs sm:text-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs border-b border-gray-200 dark:border-neutral-800 pb-2">
                      Appointment & Charges
                    </h4>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500">Appointment Date:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time Slot:</span>
                      <span className="font-semibold text-sky-600 dark:text-sky-400">{selectedTimeSlot} (IST)</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-neutral-800 space-y-1.5 mt-3">
                      {selectedServiceObjects.map(s => {
                        const p = s.pricesByVehicle?.[vehicleType] || s.basePrice;
                        return (
                          <div key={s.id} className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-neutral-400">{s.name}</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{p}</span>
                          </div>
                        );
                      })}

                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Special Discount:</span>
                          <span>- ₹{totalDiscount}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>GST (18%):</span>
                        <span>₹{taxAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-300 dark:border-neutral-700 flex justify-between items-baseline">
                    <span className="font-bold text-gray-900 dark:text-white text-base">Total Payable:</span>
                    <span className="text-2xl font-black text-sky-600 dark:text-sky-400">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Policy Banner */}
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-neutral-800/60 text-xs text-gray-600 dark:text-neutral-400">
                <strong>Cancellation Policy:</strong> Free cancellation or rescheduling allowed up to 2 hours before the scheduled time slot. Payment is collected at the studio or via UPI upon satisfactory completion.
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 flex items-center"
              >
                Continue to Step {currentStep + 1}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="px-8 py-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl shadow-emerald-600/30 flex items-center hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Securing Appointment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Confirm Booking (₹{totalAmount})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
