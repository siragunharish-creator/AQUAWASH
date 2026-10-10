-- ====================================================================
-- AQUASHINE CAR CARE - INITIAL SEED DATA
-- Location: Chennai, Tamil Nadu, India
-- ====================================================================

-- 1. Initial Business Settings
INSERT INTO business_settings (setting_key, setting_value)
VALUES 
('general', '{
  "businessName": "AquaShine Car Care",
  "tagline": "Drive Clean. Shine Bright.",
  "phone": "+91 86681 81232",
  "whatsappNumber": "+91 86681 81232",
  "email": "contact@aquashinecarcare.in",
  "address": "No. 42, Rajiv Gandhi Salai (OMR), Kandanchavadi, Perungudi",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600096",
  "openingTime": "08:00",
  "closingTime": "20:00",
  "weeklyHolidays": [],
  "slotDurationMins": 60,
  "maxBookingsPerSlot": 3,
  "taxPercentage": 18,
  "currency": "INR",
  "currencySymbol": "₹",
  "timezone": "Asia/Kolkata",
  "instagramUrl": "https://instagram.com/aquashinecarcare",
  "facebookUrl": "https://facebook.com/aquashinecarcare",
  "youtubeUrl": "https://youtube.com/@aquashinecarcare",
  "cancellationPolicy": "Free cancellation or rescheduling up to 2 hours before the scheduled slot."
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Vehicle Categories
INSERT INTO vehicle_categories (id, name, display_name, description, multiplier, icon_name, display_order)
VALUES
('hatchback', 'Hatchback', 'Hatchback / Compact', 'Swift, i20, Altroz, Tiago, Polo', 1.0, 'Car', 1),
('sedan', 'Sedan', 'Executive Sedan', 'City, Verna, Ciaz, Slavia, Virtus', 1.15, 'CarFront', 2),
('suv', 'SUV', 'Compact & Mid-size SUV', 'Creta, Seltos, Nexon, Harrier, XUV700', 1.35, 'Truck', 3),
('luxury', 'Luxury Car', 'Luxury & Premium German/British', 'Mercedes, BMW, Audi, Porsche, Jaguar', 1.60, 'Sparkles', 4),
('bike', 'Bike', 'Motorcycles & Superbikes', 'Royal Enfield, Duke, Ninja, Street Triple', 0.50, 'Bike', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Services Catalog
INSERT INTO services (slug, name, short_description, full_description, category, image_url, base_price, prices_by_vehicle, estimated_duration_mins, discount_percent, is_active, display_order, is_popular, features)
VALUES
(
  'exterior-car-wash',
  'Exterior Car Wash',
  'High-pressure pre-rinse, pH-neutral contact wash, wheel decontamination, and streak-free microfibre dry.',
  'Our signature exterior wash removes Chennai dust, road salt, and traffic film safely without scratching delicate clear coats. Includes wheel arch cleaning, rim face degreasing, tyre dressing with UV satin sheen, and exterior glass crystal finish.',
  'wash',
  'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
  499.00,
  '{"hatchback": 499, "sedan": 599, "suv": 699, "luxury": 899, "bike": 249}'::jsonb,
  45,
  10,
  true,
  1,
  false,
  '["Dual-bucket scratch-free hand wash", "pH-neutral snow foam rinse", "Alloy wheel face & rim barrel de-greasing", "Tyre dressing with non-sling UV dressing", "Streak-free crystal glass cleaning"]'::jsonb
),
(
  'foam-wash',
  'Foam Wash',
  'Dense high-adhesion ceramic snow foam bath, gentle mitt agitation, and hydrophobic rinse gloss boost.',
  'A rich, lubricating foam bath that lifts stubborn Chennai grime without swirl marks. Perfect for routine maintenance, offering intense gloss restoration and water-beading performance.',
  'wash',
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
  699.00,
  '{"hatchback": 699, "sedan": 799, "suv": 949, "luxury": 1199, "bike": 349}'::jsonb,
  50,
  15,
  true,
  2,
  true,
  '["High-density German foam cannon application", "Ultra-soft microfibre mitt agitation", "Underbody chassis high-pressure blast", "Micro-bead gloss drying aid spray", "Door jambs wipe down"]'::jsonb
),
(
  'interior-cleaning',
  'Interior Deep Cleaning',
  'High-suction vacuum, deep upholstery extraction, dashboard UV protection, and hospital-grade sanitization.',
  'Chennai humidity and traffic dust make car interiors prone to allergens and stains. We sanitize every corner, treat fabric or leather seats, vacuum boot floor, and apply anti-static dashboard conditioning.',
  'detailing',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  1199.00,
  '{"hatchback": 1199, "sedan": 1399, "suv": 1699, "luxury": 2199, "bike": 499}'::jsonb,
  75,
  0,
  true,
  3,
  false,
  '["3-stage deep cabin vacuum including trunk", "Fabric/leather hot water stain extraction", "AC vent steam sanitization & odor neutralizing", "Dashboard, console & door card UV conditioner", "Headliner dry foam spot clean"]'::jsonb
),
(
  'interior-exterior-deep-cleaning',
  'Interior and Exterior Deep Cleaning',
  'Complete inside-out transformation. Deep foam wash combined with complete cabin sanitization and steam treatment.',
  'Our most popular complete package. Blends external snow foam decontamination with comprehensive cabin steam sanitization. Returns your vehicle to pristine showroom elegance inside and out.',
  'detailing',
  'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
  1799.00,
  '{"hatchback": 1799, "sedan": 2099, "suv": 2499, "luxury": 3299, "bike": 699}'::jsonb,
  110,
  10,
  true,
  4,
  true,
  '["Complete Exterior Foam Wash & Wheel De-greasing", "Underbody & Engine Bay Dressing", "Deep Interior Steam & Extraction Sanitization", "Leather Conditioning / Fabric Shampoo", "Long-lasting Carnauba Spray Wax Finish"]'::jsonb
),
(
  'premium-car-detailing',
  'Premium Car Detailing',
  'Multi-stage single-cut machine paint correction, swirl elimination, gloss enhancement, and engine bay detailing.',
  'Designed for enthusiasts who demand perfection. Removes up to 85% of swirl marks, light scratches, and oxidation caused by automated washes and Chennai monsoon weather. Finished with ultra-deep mirror gloss sealant.',
  'detailing',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  3499.00,
  '{"hatchback": 3499, "sedan": 4299, "suv": 5299, "luxury": 6999, "bike": 1499}'::jsonb,
  180,
  5,
  true,
  5,
  true,
  '["Chemical iron fallout & clay bar paint decontamination", "Rotary/DA Dual-action machine compound & polish", "Engine bay degreasing and non-conductive dressing", "Headlight clarity restoration", "6-month synthetic polymer sealant coat"]'::jsonb
),
(
  'ceramic-coating',
  '9H Ceramic Coating Protection',
  'True 9H nano-ceramic quartz shield. 2 to 3 years guaranteed hydrophobic repelling against acid rain, UV rays, and scratches.',
  'Ultimate protection for automotive paint against Chennai blistering sun, coastal salt air, and bird droppings. Bonds chemically to clear coats, imparting candy-like reflective gloss and extreme hydrophobicity.',
  'protection',
  'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=800&q=80',
  9999.00,
  '{"hatchback": 9999, "sedan": 12499, "suv": 15999, "luxury": 21999, "bike": 4499}'::jsonb,
  360,
  15,
  true,
  6,
  false,
  '["2-stage precision paint correction prior to coating", "Certified 9H Nano-Ceramic 2-layer body application", "Windshield & glass hydrophobic ceramic coating", "Alloy wheel ceramic heat-shield coat", "2-Year official AquaShine warranty & warranty card"]'::jsonb
),
(
  'bike-wash',
  'Superbike & Motorcycle Wash',
  'Specialized two-wheeler safe foam wash, chain degrease & lube with Motul, engine fin cleaning, and exhaust polish.',
  'Tailored care for daily commuters and high-performance superbikes. We use pH-neutral cleaners safe for exposed wiring, anodized parts, chains, and matte paints.',
  'specialty',
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  349.00,
  '{"hatchback": 349, "sedan": 349, "suv": 349, "luxury": 349, "bike": 349}'::jsonb,
  35,
  0,
  true,
  7,
  false,
  '["Safe low-pressure foam wash on electronics", "Chain cleaning with grunge brush & Motul lube", "Engine fin & radiator bug removal", "Silencer heat-resistant polish", "Matte/Gloss tank wax protection"]'::jsonb
),
(
  'suv-wash',
  'SUV Heavy Duty Wash & Mud De-con',
  'Designed specifically for SUVs, 4x4s, and crossovers tackling highway runs and off-road grit.',
  'Comprehensive mud removal, chassis underside flushing, roof rack scrubbing, oversized wheel wells wash, and interior dog hair/sand vacuuming.',
  'wash',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  899.00,
  '{"hatchback": 899, "sedan": 899, "suv": 899, "luxury": 1299, "bike": 349}'::jsonb,
  60,
  10,
  true,
  8,
  false,
  '["Heavy-duty mud dissolver & high-volume rinse", "Chassis flush nozzle system", "Roof luggage rails & spare wheel scrub", "Step-bar degrease and skid-plate clean", "All-weather rubber mats pressure wash"]'::jsonb
),
(
  'luxury-car-detailing',
  'Luxury Car Concierge Detailing',
  'Bespoke white-glove treatment for Mercedes, BMW, Audi, Porsche, Range Rover, and exotic vehicles.',
  'Our master detailers pamper your prized automobile with Swissvax carnauba wax, Connolly leather balms, ultrasonic crevice purging, and uncompromised precision.',
  'specialty',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  4999.00,
  '{"hatchback": 4999, "sedan": 5499, "suv": 6499, "luxury": 7999, "bike": 2499}'::jsonb,
  210,
  10,
  true,
  9,
  true,
  '["Dedicated Master Detailer with 10+ yrs experience", "Swissvax hand-rubbed carnauba organic wax", "Alcantara & Connolly leather nourishing balm", "Ultrasonic air purger & ionized air sanitization", "Scratch inspection report with digital paint depth meter"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Demo Customer Testimonials (Identified as Demo Content)
INSERT INTO testimonials (customer_name, location, vehicle_model, service_used, rating, comment, is_demo, is_active)
VALUES
('Karthik Ramanathan', 'Adyar, Chennai', 'BMW 3 Series Gran Limousine', '9H Ceramic Coating Protection', 5, 'AquaShine transformed my BMW after months of coastal Chennai humidity. The swirl marks are completely gone and the water beading during rain is unbelievable! [Demo Testimonial]', true, true),
('Priya Sundar', 'OMR, Chennai', 'Hyundai Creta SX', 'Interior & Exterior Deep Cleaning', 5, 'Booked an appointment online and got instant WhatsApp confirmation. The team at their Kandanchavadi hub was polite, timely, and my Creta looks brand new inside! [Demo Testimonial]', true, true),
('Venkatesh S.', 'Anna Nagar, Chennai', 'Tata Safari', 'SUV Heavy Duty Wash & Mud De-con', 5, 'The high-pressure chassis wash removed weeks of highway red mud thoroughly. Exceptional attention to detail in Chennai. Highly recommended! [Demo Testimonial]', true, true),
('Ashwin Natarajan', 'Velachery, Chennai', 'Mercedes-Benz E-Class', 'Luxury Car Concierge Detailing', 5, 'True white-glove service. Leather felt supple, engine bay was spotless, and the car smelled wonderful without harsh artificial scents. [Demo Testimonial]', true, true)
ON CONFLICT DO NOTHING;
