// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { z } from "zod";
import dotenv from "dotenv";

// server/db.ts
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
var DatabaseService = class {
  constructor() {
    this.supabase = null;
    this.isSupabaseActive = false;
    this.localState = null;
    this.dbPath = path.resolve(process.cwd(), "data", "db.json");
    this.initSupabase();
    this.initLocalStore();
  }
  initSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://gybfbpnothqoptffhmont.supabase.co";
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && !supabaseKey.includes("your-supabase") && !supabaseKey.includes("placeholder")) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false }
        });
        this.isSupabaseActive = true;
        console.log("[Database] Connected to Supabase PostgreSQL at", supabaseUrl);
      } catch (err) {
        console.warn("[Database] Failed to initialize Supabase client:", err);
        this.isSupabaseActive = false;
      }
    } else {
      this.isSupabaseActive = false;
      console.log("[Database] Supabase credentials not set; running with persistent database store.");
    }
  }
  isSupabaseConnected() {
    return this.isSupabaseActive && this.supabase !== null;
  }
  getSupabaseClient() {
    return this.supabase;
  }
  initLocalStore() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (e) {
    }
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, "utf8");
        this.localState = JSON.parse(raw);
        return;
      } catch (e) {
        console.error("Error reading existing local db.json, generating fresh seed:", e);
      }
    }
    this.localState = this.getSeedState();
    this.saveLocalStore();
  }
  saveLocalStore() {
    if (!this.localState) return;
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.localState, null, 2), "utf8");
    } catch (e) {
    }
  }
  getSeedState() {
    const defaultSettings = {
      businessName: "AquaShine Car Care",
      tagline: "Drive Clean. Shine Bright.",
      phone: "+91 86681 81232",
      whatsappNumber: "+91 86681 81232",
      email: "contact@aquashinecarcare.in",
      address: "No. 42, Rajiv Gandhi Salai (OMR), Kandanchavadi, Perungudi",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600096",
      openingTime: "08:00",
      closingTime: "20:00",
      weeklyHolidays: [],
      slotDurationMins: 60,
      maxBookingsPerSlot: 3,
      taxPercentage: 18,
      currency: "INR",
      currencySymbol: "\u20B9",
      timezone: "Asia/Kolkata",
      instagramUrl: "https://instagram.com/aquashinecarcare",
      facebookUrl: "https://facebook.com/aquashinecarcare",
      youtubeUrl: "https://youtube.com/@aquashinecarcare",
      cancellationPolicy: "Free cancellation or rescheduling up to 2 hours before the scheduled appointment."
    };
    const defaultContent = {
      hero: {
        badge: "Chennai\u2019s Premier Auto Detailing & Wash Studio",
        headline: "Your Car Deserves a Premium Clean.",
        subheadline: "Professional car washing and detailing, booked at your convenience with live slot reservation & instant WhatsApp confirmation.",
        ctaPrimaryText: "Book Your Wash",
        ctaSecondaryText: "Explore Services",
        bgImageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=85"
      },
      about: {
        title: "Master Detailing Built for Chennai Enthusiasts",
        subtitle: "Uncompromising precision, certified ceramic formulas, and eco-friendly water recovery systems.",
        description: "AquaShine Car Care was founded in Chennai with a singular vision: bringing world-class automotive detailing standards to South India. From dealing with harsh coastal saline moisture along the ECR corridor to stubborn city traffic dust, our IDA-certified technicians treat every vehicle with surgical precision.",
        experienceYears: 8,
        carsDetailedCount: 14500,
        teamExpertsCount: 18,
        satisfactionRate: 99
      },
      features: [
        {
          id: "1",
          icon: "ShieldCheck",
          title: "Certified Paint Masters",
          description: "IDA trained detailers using non-acidic formulas and German dual-action paint polishers."
        },
        {
          id: "2",
          icon: "Droplets",
          title: "Zero-Swirl Foam Technology",
          description: "High-lubricity pH-neutral foam canons prevent micro-marring and swirl marks on clear coats."
        },
        {
          id: "3",
          icon: "Clock",
          title: "Guaranteed On-Time Slots",
          description: "Dedicated multi-bay facility in OMR Kandanchavadi with zero waiting delays."
        },
        {
          id: "4",
          icon: "Sparkles",
          title: "Instant WhatsApp Updates",
          description: "Automated booking alerts, progress updates, and digital inspection receipts sent to your WhatsApp."
        }
      ],
      faq: [
        {
          question: "How long does a standard exterior foam wash take?",
          answer: "A thorough exterior foam wash takes approximately 45 minutes, covering wheel rim decontamination, snow foam bath, dual-bucket contact wash, and streak-free microfibre drying."
        },
        {
          question: "Do you offer doorstep car detailing in Chennai?",
          answer: 'Yes! We offer fully equipped mobile detailing units across OMR, Velachery, Adyar, Besant Nagar, ECR, and Anna Nagar. You can select "Doorstep Service" during the 4th step of booking.'
        },
        {
          question: "What is the difference between ceramic coating and regular wax?",
          answer: "Regular carnauba wax lasts 1 to 2 months and washes away easily. Our 9H nano-ceramic coating chemically bonds with your car\u2019s clear coat, offering 2 to 3 years of extreme hydrophobicity, scratch resistance, and UV sun protection."
        },
        {
          question: "Can I cancel or reschedule my booking?",
          answer: "Yes, you can easily reschedule or cancel your appointment free of charge up to 2 hours prior to your booked slot via your booking tracking page or by messaging us on WhatsApp."
        }
      ],
      seo: {
        metaTitle: "AquaShine Car Care | Premium Car Wash & Detailing Chennai",
        metaDescription: "Book premium car wash, ceramic coating & deep interior detailing in Chennai. Certified paint masters, instant WhatsApp updates, and doorstep service.",
        ogImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80"
      }
    };
    const vehicleCategories = [
      { id: "hatchback", name: "Hatchback", displayName: "Hatchback / Compact", description: "Swift, i20, Altroz, Tiago, Baleno, Polo", multiplier: 1, iconName: "Car" },
      { id: "sedan", name: "Sedan", displayName: "Executive Sedan", description: "City, Verna, Ciaz, Slavia, Virtus, Octavia", multiplier: 1.15, iconName: "CarFront" },
      { id: "suv", name: "SUV", displayName: "Compact & Mid-size SUV", description: "Creta, Seltos, Nexon, Brezza, Harrier, XUV700", multiplier: 1.35, iconName: "Truck" },
      { id: "luxury", name: "Luxury Car", displayName: "Luxury & Premium German/British", description: "Mercedes-Benz, BMW, Audi, Porsche, Jaguar, Range Rover", multiplier: 1.6, iconName: "Sparkles" },
      { id: "bike", name: "Bike", displayName: "Motorcycles & Superbikes", description: "Royal Enfield, Duke, Ninja, Street Triple, Triumph", multiplier: 0.5, iconName: "Bike" }
    ];
    const services = [
      {
        id: "srv-1",
        slug: "exterior-car-wash",
        name: "Exterior Car Wash",
        shortDescription: "High-pressure pre-rinse, pH-neutral contact wash, wheel decontamination, and streak-free microfibre dry.",
        fullDescription: "Our signature exterior wash removes Chennai dust, road salt, and traffic film safely without scratching delicate clear coats. Includes wheel arch cleaning, rim face degreasing, tyre dressing with UV satin sheen, and exterior glass crystal finish.",
        category: "wash",
        imageUrl: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80",
        basePrice: 499,
        pricesByVehicle: { hatchback: 499, sedan: 599, suv: 699, luxury: 899, bike: 249 },
        estimatedDurationMins: 45,
        discountPercent: 10,
        isActive: true,
        displayOrder: 1,
        isPopular: false,
        features: ["Dual-bucket scratch-free hand wash", "pH-neutral snow foam rinse", "Alloy wheel face & rim barrel de-greasing", "Tyre dressing with non-sling UV dressing", "Streak-free crystal glass cleaning"]
      },
      {
        id: "srv-2",
        slug: "foam-wash",
        name: "Foam Wash",
        shortDescription: "Dense high-adhesion ceramic snow foam bath, gentle mitt agitation, and hydrophobic rinse gloss boost.",
        fullDescription: "A rich, lubricating foam bath that lifts stubborn Chennai grime without swirl marks. Perfect for routine maintenance, offering intense gloss restoration and water-beading performance.",
        category: "wash",
        imageUrl: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80",
        basePrice: 699,
        pricesByVehicle: { hatchback: 699, sedan: 799, suv: 949, luxury: 1199, bike: 349 },
        estimatedDurationMins: 50,
        discountPercent: 15,
        isActive: true,
        displayOrder: 2,
        isPopular: true,
        features: ["High-density German foam cannon application", "Ultra-soft microfibre mitt agitation", "Underbody chassis high-pressure blast", "Micro-bead gloss drying aid spray", "Door jambs wipe down"]
      },
      {
        id: "srv-3",
        slug: "interior-cleaning",
        name: "Interior Deep Cleaning",
        shortDescription: "High-suction vacuum, deep upholstery extraction, dashboard UV protection, and hospital-grade sanitization.",
        fullDescription: "Chennai humidity and traffic dust make car interiors prone to allergens and stains. We sanitize every corner, treat fabric or leather seats, vacuum boot floor, and apply anti-static dashboard conditioning.",
        category: "detailing",
        imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
        basePrice: 1199,
        pricesByVehicle: { hatchback: 1199, sedan: 1399, suv: 1699, luxury: 2199, bike: 499 },
        estimatedDurationMins: 75,
        discountPercent: 0,
        isActive: true,
        displayOrder: 3,
        isPopular: false,
        features: ["3-stage deep cabin vacuum including trunk", "Fabric/leather hot water stain extraction", "AC vent steam sanitization & odor neutralizing", "Dashboard, console & door card UV conditioner", "Headliner dry foam spot clean"]
      },
      {
        id: "srv-4",
        slug: "interior-exterior-deep-cleaning",
        name: "Interior and Exterior Deep Cleaning",
        shortDescription: "Complete inside-out transformation. Deep foam wash combined with complete cabin sanitization and steam treatment.",
        fullDescription: "Our most popular complete package. Blends external snow foam decontamination with comprehensive cabin steam sanitization. Returns your vehicle to pristine showroom elegance inside and out.",
        category: "detailing",
        imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80",
        basePrice: 1799,
        pricesByVehicle: { hatchback: 1799, sedan: 2099, suv: 2499, luxury: 3299, bike: 699 },
        estimatedDurationMins: 110,
        discountPercent: 10,
        isActive: true,
        displayOrder: 4,
        isPopular: true,
        features: ["Complete Exterior Foam Wash & Wheel De-greasing", "Underbody & Engine Bay Dressing", "Deep Interior Steam & Extraction Sanitization", "Leather Conditioning / Fabric Shampoo", "Long-lasting Carnauba Spray Wax Finish"]
      },
      {
        id: "srv-5",
        slug: "premium-car-detailing",
        name: "Premium Car Detailing",
        shortDescription: "Multi-stage single-cut machine paint correction, swirl elimination, gloss enhancement, and engine bay detailing.",
        fullDescription: "Designed for enthusiasts who demand perfection. Removes up to 85% of swirl marks, light scratches, and oxidation caused by automated washes and Chennai monsoon weather. Finished with ultra-deep mirror gloss sealant.",
        category: "detailing",
        imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
        basePrice: 3499,
        pricesByVehicle: { hatchback: 3499, sedan: 4299, suv: 5299, luxury: 6999, bike: 1499 },
        estimatedDurationMins: 180,
        discountPercent: 5,
        isActive: true,
        displayOrder: 5,
        isPopular: true,
        features: ["Chemical iron fallout & clay bar paint decontamination", "Rotary/DA Dual-action machine compound & polish", "Engine bay degreasing and non-conductive dressing", "Headlight clarity restoration", "6-month synthetic polymer sealant coat"]
      },
      {
        id: "srv-6",
        slug: "ceramic-coating",
        name: "9H Ceramic Coating Protection",
        shortDescription: "True 9H nano-ceramic quartz shield. 2 to 3 years guaranteed hydrophobic repelling against acid rain, UV rays, and scratches.",
        fullDescription: "Ultimate protection for automotive paint against Chennai blistering sun, coastal salt air, and bird droppings. Bonds chemically to clear coats, imparting candy-like reflective gloss and extreme hydrophobicity.",
        category: "protection",
        imageUrl: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=800&q=80",
        basePrice: 9999,
        pricesByVehicle: { hatchback: 9999, sedan: 12499, suv: 15999, luxury: 21999, bike: 4499 },
        estimatedDurationMins: 360,
        discountPercent: 15,
        isActive: true,
        displayOrder: 6,
        isPopular: false,
        features: ["2-stage precision paint correction prior to coating", "Certified 9H Nano-Ceramic 2-layer body application", "Windshield & glass hydrophobic ceramic coating", "Alloy wheel ceramic heat-shield coat", "2-Year official AquaShine warranty & warranty card"]
      },
      {
        id: "srv-7",
        slug: "bike-wash",
        name: "Bike Wash & Chain Care",
        shortDescription: "Specialized two-wheeler safe foam wash, chain degrease & lube with Motul, engine fin cleaning, and exhaust polish.",
        fullDescription: "Tailored care for daily commuters and high-performance superbikes. We use pH-neutral cleaners safe for exposed wiring, anodized parts, chains, and matte paints.",
        category: "specialty",
        imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
        basePrice: 349,
        pricesByVehicle: { hatchback: 349, sedan: 349, suv: 349, luxury: 349, bike: 349 },
        estimatedDurationMins: 35,
        discountPercent: 0,
        isActive: true,
        displayOrder: 7,
        isPopular: false,
        features: ["Safe low-pressure foam wash on electronics", "Chain cleaning with grunge brush & Motul lube", "Engine fin & radiator bug removal", "Silencer heat-resistant polish", "Matte/Gloss tank wax protection"]
      },
      {
        id: "srv-8",
        slug: "suv-wash",
        name: "SUV Heavy Duty Wash & Mud De-con",
        shortDescription: "Designed specifically for SUVs, 4x4s, and crossovers tackling highway runs and off-road grit.",
        fullDescription: "Comprehensive mud removal, chassis underside flushing, roof rack scrubbing, oversized wheel wells wash, and interior dog hair/sand vacuuming.",
        category: "wash",
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        basePrice: 899,
        pricesByVehicle: { hatchback: 899, sedan: 899, suv: 899, luxury: 1299, bike: 349 },
        estimatedDurationMins: 60,
        discountPercent: 10,
        isActive: true,
        displayOrder: 8,
        isPopular: false,
        features: ["Heavy-duty mud dissolver & high-volume rinse", "Chassis flush nozzle system", "Roof luggage rails & spare wheel scrub", "Step-bar degrease and skid-plate clean", "All-weather rubber mats pressure wash"]
      },
      {
        id: "srv-9",
        slug: "luxury-car-detailing",
        name: "Luxury Car Concierge Detailing",
        shortDescription: "Bespoke white-glove treatment for Mercedes, BMW, Audi, Porsche, Range Rover, and exotic vehicles.",
        fullDescription: "Our master detailers pamper your prized automobile with Swissvax carnauba wax, Connolly leather balms, ultrasonic crevice purging, and uncompromised precision.",
        category: "specialty",
        imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        basePrice: 4999,
        pricesByVehicle: { hatchback: 4999, sedan: 5499, suv: 6499, luxury: 7999, bike: 2499 },
        estimatedDurationMins: 210,
        discountPercent: 10,
        isActive: true,
        displayOrder: 9,
        isPopular: true,
        features: ["Dedicated Master Detailer with 10+ yrs experience", "Swissvax hand-rubbed carnauba organic wax", "Alcantara & Connolly leather nourishing balm", "Ultrasonic air purger & ionized air sanitization", "Scratch inspection report with digital paint depth meter"]
      }
    ];
    const testimonials = [
      {
        id: "t-1",
        customerName: "Karthik Ramanathan",
        location: "Adyar, Chennai",
        vehicleModel: "BMW 3 Series Gran Limousine",
        serviceUsed: "9H Ceramic Coating Protection",
        rating: 5,
        comment: "AquaShine transformed my BMW after months of coastal Chennai humidity. The swirl marks are completely gone and the water beading during rain is unbelievable! [Demo Testimonial]",
        isDemo: true,
        isActive: true,
        date: "2026-09-15"
      },
      {
        id: "t-2",
        customerName: "Priya Sundar",
        location: "OMR, Chennai",
        vehicleModel: "Hyundai Creta SX",
        serviceUsed: "Interior & Exterior Deep Cleaning",
        rating: 5,
        comment: "Booked an appointment online and got instant WhatsApp confirmation. The team at their Kandanchavadi hub was polite, timely, and my Creta looks brand new inside! [Demo Testimonial]",
        isDemo: true,
        isActive: true,
        date: "2026-09-28"
      },
      {
        id: "t-3",
        customerName: "Venkatesh S.",
        location: "Anna Nagar, Chennai",
        vehicleModel: "Tata Safari Dark Edition",
        serviceUsed: "SUV Heavy Duty Wash & Mud De-con",
        rating: 5,
        comment: "The high-pressure chassis wash removed weeks of highway red mud thoroughly. Exceptional attention to detail in Chennai. Highly recommended! [Demo Testimonial]",
        isDemo: true,
        isActive: true,
        date: "2026-10-02"
      },
      {
        id: "t-4",
        customerName: "Ashwin Natarajan",
        location: "Velachery, Chennai",
        vehicleModel: "Mercedes-Benz E-Class",
        serviceUsed: "Luxury Car Concierge Detailing",
        rating: 5,
        comment: "True white-glove service. Leather felt supple, engine bay was spotless, and the car smelled wonderful without harsh artificial scents. [Demo Testimonial]",
        isDemo: true,
        isActive: true,
        date: "2026-10-06"
      }
    ];
    const initialBookings = [
      {
        id: "bk-101",
        bookingReference: "AQ-2610-8491",
        customerName: "Sanjay Kumar",
        customerPhone: "+91 98401 23456",
        customerWhatsapp: "+91 98401 23456",
        customerEmail: "sanjay.k@example.com",
        vehicleType: "sedan",
        vehicleModel: "Honda City ZX",
        registrationNumber: "TN 07 BZ 4521",
        appointmentDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        appointmentTime: "10:00",
        serviceLocation: "studio",
        selectedServices: [
          { serviceId: "srv-4", serviceName: "Interior and Exterior Deep Cleaning", price: 2099, durationMins: 110 }
        ],
        subtotal: 2099,
        discountAmount: 210,
        taxAmount: 340,
        totalAmount: 2229,
        status: "Confirmed",
        paymentStatus: "Paid",
        paymentMethod: "UPI / GPay",
        whatsappConsent: true,
        createdAt: new Date(Date.now() - 36e5 * 5).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "bk-102",
        bookingReference: "AQ-2610-9124",
        customerName: "Meera Krishnan",
        customerPhone: "+91 98840 55667",
        customerWhatsapp: "+91 98840 55667",
        customerEmail: "meera.krish@example.com",
        vehicleType: "suv",
        vehicleModel: "Kia Seltos GTX+",
        registrationNumber: "TN 14 AQ 9988",
        appointmentDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        appointmentTime: "14:00",
        serviceLocation: "doorstep",
        locationAddress: "Flat 4B, Ceebros Boulevard, Thoraipakkam, OMR, Chennai",
        selectedServices: [
          { serviceId: "srv-2", serviceName: "Foam Wash", price: 949, durationMins: 50 }
        ],
        subtotal: 949,
        discountAmount: 142,
        taxAmount: 145,
        totalAmount: 952,
        status: "In Progress",
        paymentStatus: "Pending",
        paymentMethod: "Pay at Facility",
        whatsappConsent: true,
        createdAt: new Date(Date.now() - 36e5 * 2).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    const mediaAssets = [
      {
        id: "med-1",
        filename: "ceramic_coating_audi.jpg",
        originalName: "Audi R8 Detailing Bay.jpg",
        url: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1200&q=80",
        storagePath: "car-wash-media/ceramic_coating_audi.jpg",
        fileSize: 245e4,
        mimeType: "image/jpeg",
        altText: "Audi sportscar undergoing 9H ceramic coating at AquaShine Chennai studio",
        caption: "Audi sportscar undergoing 9H ceramic coating in OMR facility",
        category: "gallery",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "med-2",
        filename: "foam_wash_bmw.jpg",
        originalName: "BMW Snow Foam.jpg",
        url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80",
        storagePath: "car-wash-media/foam_wash_bmw.jpg",
        fileSize: 182e4,
        mimeType: "image/jpeg",
        altText: "Dense snow foam bath application on BMW sedan",
        caption: "High-density snow foam pre-wash lifting road grime",
        category: "gallery",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "med-3",
        filename: "interior_steam_sanitization.jpg",
        originalName: "Interior Steam Detail.jpg",
        url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
        storagePath: "car-wash-media/interior_steam_sanitization.jpg",
        fileSize: 21e5,
        mimeType: "image/jpeg",
        altText: "Deep leather conditioning and interior steam sanitization",
        caption: "Hospital-grade interior steam extraction and leather nourishment",
        category: "gallery",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    const auditLogs = [
      {
        id: "aud-1",
        adminEmail: "admin@aquashinecarcare.in",
        action: "System Bootstrapped",
        targetType: "system",
        targetId: "all",
        details: "Initial seed services, pricing matrix, and business settings generated.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    return {
      settings: defaultSettings,
      content: defaultContent,
      vehicleCategories,
      services,
      bookings: initialBookings,
      mediaAssets,
      testimonials,
      whatsappLogs: [],
      auditLogs,
      adminPasswordHash: "AquaShineAdmin2026!"
      // In production verified against hash or env
    };
  }
  // --- Settings ---
  async getSettings() {
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabase.from("site_settings").select("setting_value").eq("setting_key", "general").maybeSingle();
        if (!error && data?.setting_value) {
          return data.setting_value;
        }
      } catch (err) {
        console.warn("Supabase getSettings error, falling back to local state:", err);
      }
    }
    return this.localState.settings;
  }
  async updateSettings(newSettings, adminEmail = "admin@aquashinecarcare.in") {
    this.localState.settings = { ...this.localState.settings, ...newSettings };
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        await this.supabase.from("site_settings").upsert(
          {
            setting_key: "general",
            setting_value: this.localState.settings,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          },
          { onConflict: "setting_key" }
        );
      } catch (e) {
        console.warn("Supabase upsert settings error:", e);
      }
    }
    this.logAudit(adminEmail, "UPDATE_SETTINGS", "site_settings", "general", "Updated business settings (hours, contact, or pricing rules)");
    return this.localState.settings;
  }
  // --- Content ---
  async getContent() {
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabase.from("site_settings").select("setting_value").eq("setting_key", "website_content").maybeSingle();
        if (!error && data?.setting_value) {
          return data.setting_value;
        }
      } catch (e) {
        console.warn("Supabase getContent error, fallback:", e);
      }
    }
    return this.localState.content;
  }
  async updateContent(newContent, adminEmail = "admin@aquashinecarcare.in") {
    this.localState.content = newContent;
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        await this.supabase.from("site_settings").upsert(
          {
            setting_key: "website_content",
            setting_value: newContent,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          },
          { onConflict: "setting_key" }
        );
      } catch (e) {
        console.warn("Supabase upsert content error:", e);
      }
    }
    this.logAudit(adminEmail, "UPDATE_CONTENT", "site_settings", "website_content", "Updated hero copy, about section, FAQ, or SEO metadata");
    return this.localState.content;
  }
  // --- Vehicle Categories ---
  async getVehicleCategories() {
    return this.localState.vehicleCategories;
  }
  // Helper: Map Supabase database service row to ServiceItem
  mapDbServiceToItem(row) {
    return {
      id: String(row.id || row.slug),
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description || "",
      fullDescription: row.full_description || "",
      category: row.category || "wash",
      imageUrl: row.image_url || "",
      basePrice: Number(row.base_price) || 0,
      pricesByVehicle: row.prices_by_vehicle || {
        hatchback: Number(row.base_price) || 499,
        sedan: Math.round((Number(row.base_price) || 499) * 1.15),
        suv: Math.round((Number(row.base_price) || 499) * 1.35),
        luxury: Math.round((Number(row.base_price) || 499) * 1.6),
        bike: Math.round((Number(row.base_price) || 499) * 0.5)
      },
      estimatedDurationMins: Number(row.estimated_duration_mins) || 60,
      discountPercent: Number(row.discount_percent) || 0,
      isActive: row.is_active !== false,
      displayOrder: Number(row.display_order) || 0,
      isPopular: Boolean(row.is_popular),
      features: Array.isArray(row.features) ? row.features : []
    };
  }
  // Helper: Map ServiceItem to Supabase row
  mapItemToDbService(item) {
    const row = {};
    if (item.slug) row.slug = item.slug;
    if (item.name) row.name = item.name;
    if (item.shortDescription !== void 0) row.short_description = item.shortDescription;
    if (item.fullDescription !== void 0) row.full_description = item.fullDescription;
    if (item.category) row.category = item.category;
    if (item.imageUrl !== void 0) row.image_url = item.imageUrl;
    if (item.basePrice !== void 0) row.base_price = item.basePrice;
    if (item.pricesByVehicle !== void 0) row.prices_by_vehicle = item.pricesByVehicle;
    if (item.estimatedDurationMins !== void 0) row.estimated_duration_mins = item.estimatedDurationMins;
    if (item.discountPercent !== void 0) row.discount_percent = item.discountPercent;
    if (item.isActive !== void 0) row.is_active = item.isActive;
    if (item.displayOrder !== void 0) row.display_order = item.displayOrder;
    if (item.isPopular !== void 0) row.is_popular = item.isPopular;
    if (item.features !== void 0) row.features = item.features;
    row.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    return row;
  }
  // --- Services ---
  async getServices(includeInactive = false) {
    if (this.isSupabaseConnected()) {
      try {
        let query = this.supabase.from("services").select("*").order("display_order", { ascending: true });
        if (!includeInactive) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((r) => this.mapDbServiceToItem(r));
        }
      } catch (err) {
        console.warn("Supabase getServices query failed, fallback to local store:", err);
      }
    }
    let services = this.localState.services;
    if (!includeInactive) {
      services = services.filter((s) => s.isActive);
    }
    return services.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  async getServiceById(id) {
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabase.from("services").select("*").or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
        if (!error && data) {
          return this.mapDbServiceToItem(data);
        }
      } catch (err) {
        console.warn("Supabase getServiceById error:", err);
      }
    }
    const s = this.localState.services.find((item) => item.id === id || item.slug === id);
    return s || null;
  }
  async createService(serviceData, adminEmail) {
    const newService = {
      ...serviceData,
      id: `srv-${Date.now()}`
    };
    this.localState.services.push(newService);
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        const row = this.mapItemToDbService(newService);
        const { data, error } = await this.supabase.from("services").insert(row).select().maybeSingle();
        if (!error && data) {
          newService.id = String(data.id);
        }
      } catch (err) {
        console.warn("Supabase createService error:", err);
      }
    }
    this.logAudit(adminEmail, "CREATE_SERVICE", "services", newService.id, `Created service: ${newService.name}`);
    return newService;
  }
  async updateService(id, updates, adminEmail) {
    const index = this.localState.services.findIndex((s) => s.id === id || s.slug === id);
    if (index === -1) return null;
    this.localState.services[index] = { ...this.localState.services[index], ...updates };
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        const row = this.mapItemToDbService(updates);
        await this.supabase.from("services").update(row).or(`id.eq.${id},slug.eq.${id}`);
      } catch (err) {
        console.warn("Supabase updateService error:", err);
      }
    }
    this.logAudit(adminEmail, "UPDATE_SERVICE", "services", id, `Updated service: ${this.localState.services[index].name}`);
    return this.localState.services[index];
  }
  async deleteService(id, adminEmail) {
    const index = this.localState.services.findIndex((s) => s.id === id || s.slug === id);
    if (index === -1) return false;
    const hasBookings = this.localState.bookings.some((b) => b.selectedServices.some((s) => s.serviceId === id));
    if (hasBookings) {
      this.localState.services[index].isActive = false;
      this.saveLocalStore();
      if (this.isSupabaseConnected()) {
        try {
          await this.supabase.from("services").update({ is_active: false, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).or(`id.eq.${id},slug.eq.${id}`);
        } catch (_) {
        }
      }
      this.logAudit(adminEmail, "ARCHIVE_SERVICE", "services", id, `Archived service (referenced by existing bookings): ${this.localState.services[index].name}`);
      return true;
    }
    const removed = this.localState.services.splice(index, 1);
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        await this.supabase.from("services").delete().or(`id.eq.${id},slug.eq.${id}`);
      } catch (_) {
      }
    }
    this.logAudit(adminEmail, "DELETE_SERVICE", "services", id, `Deleted service: ${removed[0].name}`);
    return true;
  }
  // --- Availability Slots ---
  async getAvailabilitySlots(dateStr) {
    const settings = await this.getSettings();
    const dateObj = new Date(dateStr);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const isHoliday = (settings.weeklyHolidays || []).includes(dayName);
    const slots = [];
    const [startHour, startMin] = settings.openingTime.split(":").map(Number);
    const [endHour, endMin] = settings.closingTime.split(":").map(Number);
    const stepMins = settings.slotDurationMins || 60;
    const maxCapacity = settings.maxBookingsPerSlot || 3;
    const activeBookings = this.localState.bookings.filter(
      (b) => b.appointmentDate === dateStr && b.status !== "Cancelled"
    );
    let current = startHour * 60 + (startMin || 0);
    const finish = endHour * 60 + (endMin || 0);
    while (current + stepMins <= finish) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeSlotStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const bookedCount = activeBookings.filter((b) => b.appointmentTime === timeSlotStr).length;
      const available = !isHoliday && bookedCount < maxCapacity;
      slots.push({
        time: timeSlotStr,
        available,
        currentBookings: bookedCount,
        maxCapacity
      });
      current += stepMins;
    }
    return {
      date: dateStr,
      isHoliday,
      slots
    };
  }
  // --- Bookings ---
  async createBooking(data) {
    const availability = await this.getAvailabilitySlots(data.appointmentDate);
    if (availability.isHoliday) {
      throw new Error(`The studio is closed on ${data.appointmentDate} (Weekly Holiday).`);
    }
    const slot = availability.slots.find((s) => s.time === data.appointmentTime);
    if (!slot) {
      throw new Error(`Selected time slot ${data.appointmentTime} is invalid.`);
    }
    if (!slot.available) {
      throw new Error(`Time slot ${data.appointmentTime} on ${data.appointmentDate} is already fully booked. Please select another slot.`);
    }
    const services = await this.getServices(true);
    const selectedServiceItems = services.filter((s) => data.serviceIds.includes(s.id));
    if (selectedServiceItems.length === 0) {
      throw new Error("Please select at least one valid service.");
    }
    let subtotal = 0;
    let totalDiscount = 0;
    const selectedServicesFormatted = selectedServiceItems.map((item) => {
      const price = item.pricesByVehicle?.[data.vehicleType] || item.basePrice;
      const discount = item.discountPercent ? Math.round(price * item.discountPercent / 100) : 0;
      subtotal += price;
      totalDiscount += discount;
      return {
        serviceId: item.id,
        serviceName: item.name,
        price,
        durationMins: item.estimatedDurationMins
      };
    });
    const settings = await this.getSettings();
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const taxAmount = Math.round(taxableAmount * (settings.taxPercentage || 18) / 100);
    const totalAmount = taxableAmount + taxAmount;
    const dateCode = data.appointmentDate.replace(/-/g, "").slice(2, 6);
    const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
    const bookingReference = `AQ-${dateCode}-${randomSuffix}`;
    const newBooking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookingReference,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerWhatsapp: (data.customerWhatsapp || data.customerPhone).trim(),
      customerEmail: data.customerEmail?.trim(),
      vehicleType: data.vehicleType,
      vehicleModel: data.vehicleModel.trim(),
      registrationNumber: data.registrationNumber.trim().toUpperCase(),
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      serviceLocation: data.serviceLocation,
      locationAddress: data.locationAddress?.trim(),
      additionalNotes: data.additionalNotes?.trim(),
      selectedServices: selectedServicesFormatted,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount,
      totalAmount,
      status: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "Pay at Facility",
      whatsappConsent: data.whatsappConsent !== false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.localState.bookings.unshift(newBooking);
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        await this.supabase.from("bookings").insert({
          booking_reference: newBooking.bookingReference,
          customer_name: newBooking.customerName,
          customer_phone: newBooking.customerPhone,
          customer_whatsapp: newBooking.customerWhatsapp,
          customer_email: newBooking.customerEmail,
          vehicle_type: newBooking.vehicleType,
          vehicle_model: newBooking.vehicleModel,
          registration_number: newBooking.registrationNumber,
          appointment_date: newBooking.appointmentDate,
          appointment_time: newBooking.appointmentTime,
          service_location: newBooking.serviceLocation,
          location_address: newBooking.locationAddress,
          additional_notes: newBooking.additionalNotes,
          selected_services: newBooking.selectedServices,
          subtotal: newBooking.subtotal,
          discount_amount: newBooking.discountAmount,
          tax_amount: newBooking.taxAmount,
          total_amount: newBooking.totalAmount,
          status: newBooking.status,
          payment_status: newBooking.paymentStatus,
          payment_method: newBooking.paymentMethod,
          whatsapp_consent: newBooking.whatsappConsent,
          created_at: newBooking.createdAt,
          updated_at: newBooking.updatedAt
        });
      } catch (err) {
        console.warn("Supabase booking insert error (saved locally):", err);
      }
    }
    return {
      booking: newBooking,
      message: "Booking created successfully."
    };
  }
  // Helper: Map Supabase bookings row to BookingRecord
  mapDbBookingToRecord(row) {
    return {
      id: String(row.id),
      bookingReference: row.booking_reference,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerWhatsapp: row.customer_whatsapp || row.customer_phone,
      customerEmail: row.customer_email || void 0,
      vehicleType: row.vehicle_type,
      vehicleModel: row.vehicle_model,
      registrationNumber: row.registration_number || "",
      appointmentDate: typeof row.appointment_date === "string" ? row.appointment_date.split("T")[0] : row.appointment_date,
      appointmentTime: row.appointment_time,
      serviceLocation: row.service_location || "studio",
      locationAddress: row.location_address || void 0,
      additionalNotes: row.additional_notes || void 0,
      selectedServices: row.selected_services || [],
      subtotal: Number(row.subtotal) || 0,
      discountAmount: Number(row.discount_amount) || 0,
      taxAmount: Number(row.tax_amount) || 0,
      totalAmount: Number(row.total_amount) || 0,
      status: row.status || "Pending",
      cancellationReason: row.cancellation_reason || void 0,
      paymentStatus: row.payment_status || "Pending",
      paymentMethod: row.payment_method || "Pay at Facility",
      whatsappConsent: row.whatsapp_consent !== false,
      createdAt: row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: row.updated_at || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async getBookings(params) {
    if (this.isSupabaseConnected()) {
      try {
        let query = this.supabase.from("bookings").select("*").order("created_at", { ascending: false });
        if (params?.status && params.status !== "All") {
          query = query.ilike("status", params.status);
        }
        if (params?.date) {
          query = query.eq("appointment_date", params.date);
        }
        if (params?.limit) {
          query = query.limit(params.limit);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data.map((r) => this.mapDbBookingToRecord(r));
          if (params?.search) {
            const q = params.search.toLowerCase().trim();
            list = list.filter(
              (b) => b.bookingReference.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q) || b.customerPhone.includes(q) || b.registrationNumber.toLowerCase().includes(q) || b.vehicleModel.toLowerCase().includes(q)
            );
          }
          return list;
        }
      } catch (err) {
        console.warn("Supabase getBookings query error, fallback to local store:", err);
      }
    }
    let result = [...this.localState.bookings];
    if (params?.status && params.status !== "All") {
      result = result.filter((b) => b.status.toLowerCase() === params.status?.toLowerCase());
    }
    if (params?.date) {
      result = result.filter((b) => b.appointmentDate === params.date);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (b) => b.bookingReference.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q) || b.customerPhone.includes(q) || b.registrationNumber.toLowerCase().includes(q) || b.vehicleModel.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (params?.limit) {
      return result.slice(0, params.limit);
    }
    return result;
  }
  async getBookingByReference(ref, phoneLast4) {
    const cleanRef = ref.trim().toUpperCase();
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabase.from("bookings").select("*").ilike("booking_reference", cleanRef).maybeSingle();
        if (!error && data) {
          const booking2 = this.mapDbBookingToRecord(data);
          if (phoneLast4) {
            const cleaned = booking2.customerPhone.replace(/[^0-9]/g, "");
            if (!cleaned.endsWith(phoneLast4)) {
              return null;
            }
          }
          return booking2;
        }
      } catch (err) {
        console.warn("Supabase getBookingByReference error:", err);
      }
    }
    const booking = this.localState.bookings.find((b) => b.bookingReference.toUpperCase() === cleanRef);
    if (!booking) return null;
    if (phoneLast4) {
      const cleaned = booking.customerPhone.replace(/[^0-9]/g, "");
      if (!cleaned.endsWith(phoneLast4)) {
        return null;
      }
    }
    return booking;
  }
  async updateBookingStatus(id, status, options) {
    const b = this.localState.bookings.find((item) => item.id === id || item.bookingReference === id);
    if (!b) return null;
    b.status = status;
    if (options?.cancellationReason) {
      b.cancellationReason = options.cancellationReason;
    }
    if (options?.paymentStatus) {
      b.paymentStatus = options.paymentStatus;
    }
    b.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        await this.supabase.from("bookings").update({
          status: b.status,
          cancellation_reason: b.cancellationReason,
          payment_status: b.paymentStatus,
          updated_at: b.updatedAt
        }).eq("booking_reference", b.bookingReference);
      } catch (err) {
        console.warn("Supabase status update error:", err);
      }
    }
    this.logAudit(
      options?.adminEmail || "admin@aquashinecarcare.in",
      "UPDATE_BOOKING_STATUS",
      "bookings",
      b.bookingReference,
      `Changed status to ${status} (Payment: ${b.paymentStatus || "unchanged"})`
    );
    return b;
  }
  async rescheduleBooking(id, newDate, newTime, adminEmail = "admin@aquashinecarcare.in") {
    const b = this.localState.bookings.find((item) => item.id === id || item.bookingReference === id);
    if (!b) return null;
    const prevDate = b.appointmentDate;
    const prevTime = b.appointmentTime;
    b.appointmentDate = newDate;
    b.appointmentTime = newTime;
    b.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveLocalStore();
    if (this.isSupabaseConnected()) {
      try {
        await this.supabase.from("bookings").update({
          appointment_date: b.appointmentDate,
          appointment_time: b.appointmentTime,
          updated_at: b.updatedAt
        }).eq("booking_reference", b.bookingReference);
      } catch (err) {
        console.warn("Supabase reschedule update error:", err);
      }
    }
    this.logAudit(
      adminEmail,
      "RESCHEDULE_BOOKING",
      "bookings",
      b.bookingReference,
      `Rescheduled from ${prevDate} ${prevTime} to ${newDate} ${newTime}`
    );
    return b;
  }
  // --- Admin User Verification in Supabase ---
  async verifyAdminUser(userId) {
    const ADMIN_UUID = "10b9199e-d5cb-4216-bd0a-0045c79dac9f";
    if (this.isSupabaseConnected()) {
      try {
        const { data, error } = await this.supabase.from("admin_users").select("id, role").eq("id", userId).maybeSingle();
        if (!error && data && data.role === "admin") {
          return true;
        }
      } catch (err) {
        console.warn("Supabase admin_users query error:", err);
      }
    }
    return userId === ADMIN_UUID;
  }
  // --- Statistics ---
  async getStats() {
    const bookings = this.localState.bookings;
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const totalBookings = bookings.length;
    const todayBookings = bookings.filter((b) => b.appointmentDate === todayStr).length;
    const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
    const confirmedBookings = bookings.filter((b) => b.status === "Confirmed").length;
    const completedBookings = bookings.filter((b) => b.status === "Completed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "Cancelled").length;
    const totalRevenue = bookings.filter((b) => b.paymentStatus === "Paid" || b.status === "Completed").reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const upcomingAppointments = bookings.filter((b) => b.appointmentDate >= todayStr && b.status !== "Cancelled").sort((a, b) => `${a.appointmentDate} ${a.appointmentTime}`.localeCompare(`${b.appointmentDate} ${b.appointmentTime}`)).slice(0, 5);
    const serviceCounts = {};
    for (const b of bookings) {
      for (const s of b.selectedServices) {
        if (!serviceCounts[s.serviceId]) {
          serviceCounts[s.serviceId] = { name: s.serviceName, count: 0 };
        }
        serviceCounts[s.serviceId].count += 1;
      }
    }
    const popularServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count);
    return {
      totalBookings,
      todayBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      upcomingAppointments,
      popularServices,
      recentActivity: this.localState.auditLogs.slice(0, 10)
    };
  }
  // --- Media Assets & Local Image Upload ---
  async getMediaAssets() {
    return this.localState.mediaAssets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async addMediaAsset(asset) {
    const newAsset = {
      ...asset,
      id: `med-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.localState.mediaAssets.unshift(newAsset);
    this.saveLocalStore();
    return newAsset;
  }
  async deleteMediaAsset(id, adminEmail) {
    const idx = this.localState.mediaAssets.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    const removed = this.localState.mediaAssets.splice(idx, 1);
    this.saveLocalStore();
    this.logAudit(adminEmail, "DELETE_MEDIA", "media_assets", id, `Deleted image: ${removed[0].originalName}`);
    return true;
  }
  // --- Testimonials ---
  async getTestimonials(includeInactive = false) {
    let t = this.localState.testimonials;
    if (!includeInactive) {
      t = t.filter((item) => item.isActive);
    }
    return t;
  }
  async addTestimonial(item, adminEmail) {
    const newItem = {
      ...item,
      id: `test-${Date.now()}`,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    this.localState.testimonials.unshift(newItem);
    this.saveLocalStore();
    this.logAudit(adminEmail, "ADD_TESTIMONIAL", "testimonials", newItem.id, `Added review for ${newItem.customerName}`);
    return newItem;
  }
  // --- WhatsApp Notification Logs ---
  async getWhatsAppLogs() {
    return this.localState.whatsappLogs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async logWhatsApp(log) {
    const newLog = {
      ...log,
      id: `walog-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      retryCount: 0,
      lastAttemptAt: (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.localState.whatsappLogs.unshift(newLog);
    this.saveLocalStore();
    return newLog;
  }
  async updateWhatsAppLog(id, update) {
    const log = this.localState.whatsappLogs.find((l) => l.id === id);
    if (!log) return null;
    Object.assign(log, update, { lastAttemptAt: (/* @__PURE__ */ new Date()).toISOString() });
    this.saveLocalStore();
    return log;
  }
  // --- Audit Logs ---
  logAudit(adminEmail, action, targetType, targetId = "", details = "") {
    const entry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      adminEmail,
      action,
      targetType,
      targetId,
      details,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.localState.auditLogs.unshift(entry);
    if (this.localState.auditLogs.length > 500) {
      this.localState.auditLogs.pop();
    }
    this.saveLocalStore();
  }
  async getAuditLogs() {
    return this.localState.auditLogs;
  }
  // --- Admin Authentication ---
  verifyAdminPassword(password) {
    const expected = process.env.ADMIN_DEFAULT_PASSWORD || this.localState.adminPasswordHash || "AquaShineAdmin2026!";
    return password === expected;
  }
  updateAdminPassword(newPassword, adminEmail) {
    this.localState.adminPasswordHash = newPassword;
    this.saveLocalStore();
    this.logAudit(adminEmail, "PASSWORD_CHANGE", "admin_profile", adminEmail, "Administrator password changed successfully.");
    return true;
  }
};
var dbService = new DatabaseService();

// server/whatsapp.ts
var WhatsAppService = class {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
  }
  isConfigured() {
    return Boolean(
      this.accessToken && this.accessToken !== "your-whatsapp-cloud-api-permanent-token" && this.phoneNumberId && this.phoneNumberId !== "your-whatsapp-phone-number-id"
    );
  }
  getConfigStatus() {
    const configured = this.isConfigured();
    return {
      configured,
      hasAccessToken: Boolean(this.accessToken && this.accessToken !== "your-whatsapp-cloud-api-permanent-token"),
      hasPhoneNumberId: Boolean(this.phoneNumberId && this.phoneNumberId !== "your-whatsapp-phone-number-id"),
      hasBusinessAccountId: Boolean(this.businessAccountId && this.businessAccountId !== "your-whatsapp-business-account-id"),
      defaultOwnerNumber: "+91 8668181232",
      graphApiUrl: `https://graph.facebook.com/v18.0/${this.phoneNumberId || "{PHONE_NUMBER_ID}"}/messages`,
      instructions: configured ? "WhatsApp Business Cloud API is configured and live." : "To activate live automated WhatsApp messaging via Meta, set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your environment or .env file. The application safely handles bookings and logs full formatted WhatsApp payloads in the meantime."
    };
  }
  /**
   * Normalizes phone number to international format (e.g. +91 8668181232 -> 918668181232)
   */
  normalizePhone(phone) {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  }
  /**
   * Send WhatsApp notification to Customer
   */
  async sendCustomerBookingNotification(booking) {
    const recipient = this.normalizePhone(booking.customerWhatsapp || booking.customerPhone);
    const serviceList = booking.selectedServices.map((s) => s.serviceName).join(", ");
    const messageText = `\u{1F697} *${booking.businessName} - Booking Confirmed!* 

Hello ${booking.customerName},
Thank you for booking your car detailing with us in Chennai. Here are your booking details:

\u{1F4CC} *Booking Reference:* ${booking.bookingReference}
\u{1F698} *Vehicle:* ${booking.vehicleModel}
\u{1F6E0}\uFE0F *Services:* ${serviceList}
\u{1F4C5} *Date & Time:* ${booking.appointmentDate} at ${booking.appointmentTime}
\u{1F4B0} *Total Amount:* \u20B9${booking.totalAmount.toLocaleString("en-IN")}
\u{1F4CD} *Location:* AquaShine Car Care Hub, OMR Kandanchavadi, Chennai
\u{1F6A6} *Status:* ${booking.status}

Track your booking status live anytime on our website or reply to this message for assistance.
_AquaShine Car Care \u2022 Drive Clean. Shine Bright._`;
    return this.dispatchMessage(recipient, messageText, "customer");
  }
  /**
   * Send WhatsApp notification to Business Owner (+91 8668181232)
   */
  async sendOwnerNewBookingAlert(booking, ownerPhone = "+918668181232") {
    const recipient = this.normalizePhone(ownerPhone);
    const serviceList = booking.selectedServices.map((s) => `${s.serviceName} (\u20B9${s.price})`).join(", ");
    const messageText = `\u{1F6A8} *NEW BOOKING ALERT - AquaShine Chennai* 

\u{1F4CC} *Ref:* ${booking.bookingReference}
\u{1F464} *Customer:* ${booking.customerName}
\u{1F4DE} *Phone:* ${booking.customerPhone} (WhatsApp: ${booking.customerWhatsapp})
\u{1F698} *Vehicle:* ${booking.vehicleModel} [${booking.registrationNumber}]
\u{1F6E0}\uFE0F *Services:* ${serviceList}
\u{1F4C5} *Slot:* ${booking.appointmentDate} at ${booking.appointmentTime}
\u{1F4CD} *Type:* ${booking.serviceLocation === "doorstep" ? `Doorstep Service: ${booking.locationAddress || "Address on record"}` : "Studio Facility (OMR Hub)"}
\u{1F4B0} *Amount:* \u20B9${booking.totalAmount.toLocaleString("en-IN")}
\u{1F6A6} *Status:* ${booking.status}

Open Admin Console to confirm or assign detailing bay.`;
    return this.dispatchMessage(recipient, messageText, "owner");
  }
  /**
   * Send booking status update
   */
  async sendStatusUpdateNotification(customerPhone, customerName, bookingReference, newStatus, details) {
    const recipient = this.normalizePhone(customerPhone);
    const messageText = `\u2728 *AquaShine Car Care - Status Update*

Hello ${customerName},
Your booking *${bookingReference}* status is now: *${newStatus.toUpperCase()}*.
` + (details ? `\u2139\uFE0F *Note:* ${details}

` : "\n") + `Thank you for trusting AquaShine Chennai!`;
    return this.dispatchMessage(recipient, messageText, "customer");
  }
  /**
   * Dispatches WhatsApp message via Meta Cloud API or logs detailed mock payload if API keys not set
   */
  async dispatchMessage(to, bodyText, recipientRole) {
    if (!this.isConfigured()) {
      console.log(`[WhatsApp Business Cloud API] [Credentials Pending - Simulating Dispatch]`);
      console.log(`To: +${to} (${recipientRole})`);
      console.log(`Message:
${bodyText}`);
      return {
        success: true,
        isSimulated: true,
        providerMessageId: `wamid.simulated.${Date.now()}.${Math.floor(Math.random() * 1e4)}`,
        providerResponse: {
          status: "simulated_payload_logged",
          recipient: to,
          notice: "Meta Cloud API credentials pending in environment variables.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    }
    try {
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: bodyText
        }
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("[WhatsApp Cloud API Error]:", data);
        return {
          success: false,
          error: data?.error?.message || `HTTP ${response.status}: Failed to dispatch WhatsApp message`,
          providerResponse: data
        };
      }
      const messageId = data?.messages?.[0]?.id || `wamid.${Date.now()}`;
      return {
        success: true,
        providerMessageId: messageId,
        providerResponse: data
      };
    } catch (err) {
      console.error("[WhatsApp API Exception]:", err);
      return {
        success: false,
        error: err.message || "Network error communicating with WhatsApp Cloud API"
      };
    }
  }
};
var whatsAppService = new WhatsAppService();

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
var isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var uploadsDir = isServerless ? path2.resolve("/tmp", "uploads") : path2.resolve(__dirname, "uploads");
try {
  if (!fs2.existsSync(uploadsDir)) {
    fs2.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
}
app.use("/uploads", express.static(uploadsDir));
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path2.extname(file.originalname).toLowerCase();
    const cleanBase = path2.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${ext}`);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed."));
    }
  }
});
var activeAdminSessions = /* @__PURE__ */ new Map();
function generateSessionToken() {
  return `aq_adm_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
}
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized. Admin credentials required." });
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const session = activeAdminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeAdminSessions.delete(token);
    return res.status(401).json({ error: "Admin session expired. Please log in again." });
  }
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1e3;
  req.adminEmail = session.email;
  next();
}
app.get("/api/health", async (_req, res) => {
  const settings = await dbService.getSettings();
  const isSupabase = dbService.isSupabaseConnected();
  const waConfig = whatsAppService.getConfigStatus();
  res.json({
    status: "ok",
    businessName: settings.businessName,
    location: `${settings.city}, ${settings.state}`,
    supabaseConnected: isSupabase,
    whatsApp: waConfig,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await dbService.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/content", async (_req, res) => {
  try {
    const content = await dbService.getContent();
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/vehicle-categories", async (_req, res) => {
  try {
    const cats = await dbService.getVehicleCategories();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/services", async (_req, res) => {
  try {
    const services = await dbService.getServices(false);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/services/:id", async (req, res) => {
  try {
    const service = await dbService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/availability", async (req, res) => {
  try {
    const dateStr = req.query.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const availability = await dbService.getAvailabilitySlots(dateStr);
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/testimonials", async (_req, res) => {
  try {
    const list = await dbService.getTestimonials(false);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/gallery", async (_req, res) => {
  try {
    const media = await dbService.getMediaAssets();
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Valid 10-digit mobile number required"),
  customerWhatsapp: z.string().min(10, "Valid WhatsApp number required").optional().or(z.literal("")),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  vehicleType: z.enum(["hatchback", "sedan", "suv", "luxury", "bike"]),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
  registrationNumber: z.string().min(4, "Registration number is required (e.g. TN 07 BZ 4521)"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Time format must be HH:MM"),
  serviceLocation: z.enum(["studio", "doorstep"]).default("studio"),
  locationAddress: z.string().optional(),
  additionalNotes: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, "Please select at least one service"),
  whatsappConsent: z.boolean().default(true)
});
app.post("/api/bookings", async (req, res) => {
  try {
    const parsed = bookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues.map((e) => e.message)
      });
    }
    const { booking, message } = await dbService.createBooking(parsed.data);
    const settings = await dbService.getSettings();
    (async () => {
      try {
        const custResult = await whatsAppService.sendCustomerBookingNotification({
          bookingReference: booking.bookingReference,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          customerWhatsapp: booking.customerWhatsapp,
          vehicleModel: booking.vehicleModel,
          selectedServices: booking.selectedServices,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          totalAmount: booking.totalAmount,
          status: booking.status,
          businessName: settings.businessName
        });
        await dbService.logWhatsApp({
          bookingReference: booking.bookingReference,
          recipientType: "customer",
          recipientPhone: booking.customerWhatsapp || booking.customerPhone,
          messageType: "booking_created",
          status: custResult.success ? custResult.isSimulated ? "simulated" : "sent" : "failed",
          providerResponse: custResult.providerResponse,
          providerMessageId: custResult.providerMessageId,
          errorMessage: custResult.error
        });
        const ownerPhone = settings.whatsappNumber || "+918668181232";
        const ownerResult = await whatsAppService.sendOwnerNewBookingAlert({
          bookingReference: booking.bookingReference,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          customerWhatsapp: booking.customerWhatsapp,
          vehicleModel: booking.vehicleModel,
          registrationNumber: booking.registrationNumber,
          selectedServices: booking.selectedServices,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          totalAmount: booking.totalAmount,
          serviceLocation: booking.serviceLocation,
          locationAddress: booking.locationAddress,
          status: booking.status
        }, ownerPhone);
        await dbService.logWhatsApp({
          bookingReference: booking.bookingReference,
          recipientType: "owner",
          recipientPhone: ownerPhone,
          messageType: "booking_created",
          status: ownerResult.success ? ownerResult.isSimulated ? "simulated" : "sent" : "failed",
          providerResponse: ownerResult.providerResponse,
          providerMessageId: ownerResult.providerMessageId,
          errorMessage: ownerResult.error
        });
      } catch (waErr) {
        console.error("Error during WhatsApp dispatch:", waErr);
      }
    })();
    res.status(201).json({
      success: true,
      bookingReference: booking.bookingReference,
      booking,
      message
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to place booking" });
  }
});
app.get("/api/bookings/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const phone = req.query.phone;
    const booking = await dbService.getBookingByReference(reference, phone);
    if (!booking) {
      return res.status(404).json({ error: "No booking found with this reference number." });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "aquashine_webhook_verify_token";
  if (mode === "subscribe" && token === expectedToken) {
    console.log("[WhatsApp Webhook] Verification successful.");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});
app.post("/api/whatsapp/webhook", async (req, res) => {
  try {
    const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
    if (entry?.statuses?.[0]) {
      const statusObj = entry.statuses[0];
      const messageId = statusObj.id;
      const status = statusObj.status;
      const logs = await dbService.getWhatsAppLogs();
      const matched = logs.find((l) => l.providerMessageId === messageId);
      if (matched) {
        await dbService.updateWhatsAppLog(matched.id, {
          status: status === "read" ? "read" : status === "delivered" ? "delivered" : "failed"
        });
      }
    }
  } catch (e) {
    console.error("Webhook error:", e);
  }
  res.status(200).send("EVENT_RECEIVED");
});
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  const validEmail = "admin@aquashinecarcare.in";
  const providedIdentifier = (username || "").trim().toLowerCase();
  const isPasswordValid = dbService.verifyAdminPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid administrator credentials. Access denied." });
  }
  const token = generateSessionToken();
  activeAdminSessions.set(token, {
    email: providedIdentifier || validEmail,
    expiresAt: Date.now() + 24 * 60 * 60 * 1e3
    // 24 hours
  });
  dbService.logAudit(
    providedIdentifier || validEmail,
    "ADMIN_LOGIN",
    "auth",
    "session",
    "Administrator logged in successfully"
  );
  res.json({
    success: true,
    token,
    user: {
      email: providedIdentifier || validEmail,
      name: "AquaShine SuperAdmin",
      role: "admin"
    }
  });
});
app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  activeAdminSessions.delete(token);
  res.json({ success: true, message: "Logged out successfully" });
});
app.get("/api/admin/me", requireAdmin, (req, res) => {
  const adminEmail = req.adminEmail;
  res.json({
    email: adminEmail,
    name: "AquaShine SuperAdmin",
    role: "admin"
  });
});
app.post("/api/admin/change-password", requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminEmail = req.adminEmail;
  if (!dbService.verifyAdminPassword(currentPassword)) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  dbService.updateAdminPassword(newPassword, adminEmail);
  res.json({ success: true, message: "Password updated successfully" });
});
app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const stats = await dbService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const { search, status, date, limit } = req.query;
    const bookings = await dbService.getBookings({
      search,
      status,
      date,
      limit: limit ? parseInt(limit, 10) : void 0
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/admin/bookings/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status, cancellationReason, paymentStatus, sendWhatsappUpdate } = req.body;
    const adminEmail = req.adminEmail;
    const updated = await dbService.updateBookingStatus(req.params.id, status, {
      cancellationReason,
      paymentStatus,
      adminEmail
    });
    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (sendWhatsappUpdate && updated.whatsappConsent) {
      try {
        await whatsAppService.sendStatusUpdateNotification(
          updated.customerWhatsapp || updated.customerPhone,
          updated.customerName,
          updated.bookingReference,
          status,
          cancellationReason
        );
      } catch (err) {
        console.warn("Status update WhatsApp dispatch failed:", err);
      }
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/bookings/:id/reschedule", requireAdmin, async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const adminEmail = req.adminEmail;
    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: "New appointment date and time are required" });
    }
    const updated = await dbService.rescheduleBooking(req.params.id, appointmentDate, appointmentTime, adminEmail);
    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/services", requireAdmin, async (_req, res) => {
  try {
    const services = await dbService.getServices(true);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/services", requireAdmin, async (req, res) => {
  try {
    const adminEmail = req.adminEmail;
    const created = await dbService.createService(req.body, adminEmail);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/services/:id", requireAdmin, async (req, res) => {
  try {
    const adminEmail = req.adminEmail;
    const updated = await dbService.updateService(req.params.id, req.body, adminEmail);
    if (!updated) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
  try {
    const adminEmail = req.adminEmail;
    const success = await dbService.deleteService(req.params.id, adminEmail);
    if (!success) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ success: true, message: "Service removed or archived" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/content", requireAdmin, async (req, res) => {
  try {
    const adminEmail = req.adminEmail;
    const content = await dbService.updateContent(req.body, adminEmail);
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/settings", requireAdmin, async (req, res) => {
  try {
    const adminEmail = req.adminEmail;
    const settings = await dbService.updateSettings(req.body, adminEmail);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/upload", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const { altText, caption, category } = req.body;
    const adminEmail = req.adminEmail;
    let finalUrl = `/uploads/${req.file.filename}`;
    let storagePath = `uploads/${req.file.filename}`;
    const supabase = dbService.getSupabaseClient();
    if (supabase) {
      try {
        const fileBuffer = fs2.readFileSync(req.file.path);
        const supabaseStoragePath = `uploads/${req.file.filename}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("site-images").upload(supabaseStoragePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from("site-images").getPublicUrl(supabaseStoragePath);
          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
            storagePath = supabaseStoragePath;
            console.log("[Supabase Storage] Uploaded to site-images:", finalUrl);
          }
        } else {
          console.warn("[Supabase Storage Upload Warning]", uploadError);
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload error, using persistent upload:", storageErr);
      }
    }
    const asset = await dbService.addMediaAsset({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: finalUrl,
      storagePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      altText: altText || req.file.originalname,
      caption: caption || "",
      category: category || "gallery"
    });
    dbService.logAudit(
      adminEmail,
      "UPLOAD_IMAGE",
      "media_assets",
      asset.id,
      `Uploaded ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`
    );
    res.status(201).json({
      success: true,
      asset,
      url: finalUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Image upload failed" });
  }
});
app.delete("/api/admin/media/:id", requireAdmin, async (req, res) => {
  try {
    const adminEmail = req.adminEmail;
    const ok = await dbService.deleteMediaAsset(req.params.id, adminEmail);
    if (!ok) {
      return res.status(404).json({ error: "Media asset not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/notifications", requireAdmin, async (_req, res) => {
  try {
    const logs = await dbService.getWhatsAppLogs();
    const configStatus = whatsAppService.getConfigStatus();
    res.json({
      logs,
      config: configStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/notifications/retry/:id", requireAdmin, async (req, res) => {
  try {
    const logs = await dbService.getWhatsAppLogs();
    const target = logs.find((l) => l.id === req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Notification log not found" });
    }
    const booking = await dbService.getBookingByReference(target.bookingReference);
    if (!booking) {
      return res.status(404).json({ error: "Associated booking record not found" });
    }
    let retryResult;
    const settings = await dbService.getSettings();
    if (target.recipientType === "customer") {
      retryResult = await whatsAppService.sendCustomerBookingNotification({
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerWhatsapp: booking.customerWhatsapp,
        vehicleModel: booking.vehicleModel,
        selectedServices: booking.selectedServices,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        totalAmount: booking.totalAmount,
        status: booking.status,
        businessName: settings.businessName
      });
    } else {
      retryResult = await whatsAppService.sendOwnerNewBookingAlert({
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerWhatsapp: booking.customerWhatsapp,
        vehicleModel: booking.vehicleModel,
        registrationNumber: booking.registrationNumber,
        selectedServices: booking.selectedServices,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        totalAmount: booking.totalAmount,
        serviceLocation: booking.serviceLocation,
        locationAddress: booking.locationAddress,
        status: booking.status
      }, target.recipientPhone);
    }
    await dbService.updateWhatsAppLog(target.id, {
      status: retryResult.success ? retryResult.isSimulated ? "simulated" : "sent" : "failed",
      retryCount: (target.retryCount || 0) + 1,
      errorMessage: retryResult.error,
      providerMessageId: retryResult.providerMessageId || target.providerMessageId,
      providerResponse: retryResult.providerResponse
    });
    res.json({
      success: retryResult.success,
      result: retryResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/audit-logs", requireAdmin, async (_req, res) => {
  try {
    const logs = await dbService.getAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path2.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=======================================================`);
    console.log(` AquaShine Car Care Full-Stack Platform`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Business Location: Chennai, Tamil Nadu, India`);
    console.log(` Mode: ${isProduction ? "Production" : "Development"}`);
    console.log(`=======================================================`);
  });
}
var server_default = app;
var isDirectCliExecution = Boolean(
  process.argv[1] && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js")) && !process.env.VERCEL && !process.env.VERCEL_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME
);
if (isDirectCliExecution) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
export {
  app,
  server_default as default
};
