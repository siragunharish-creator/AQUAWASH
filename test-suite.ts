import { dbService } from './server/db.js';
import { whatsAppService } from './server/whatsapp.js';

async function runTestSuite() {
  console.log('====================================================');
  console.log(' AQUASHINE CAR CARE - AUTOMATED TEST SUITE');
  console.log(' Location: Chennai, Tamil Nadu, India');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Database Seed & Initial Settings Test
  console.log('\n--- 1. Testing Database & Initial Settings ---');
  const settings = await dbService.getSettings();
  assert(settings.businessName === 'AquaShine Car Care', 'Default business name is AquaShine Car Care');
  assert(settings.currency === 'INR', 'Currency is configured as INR (₹)');
  assert(settings.timezone === 'Asia/Kolkata', 'Timezone is Asia/Kolkata');
  assert(settings.whatsappNumber.includes('8668181232') || settings.whatsappNumber.includes('86681 81232'), 'Owner WhatsApp number is +91 8668181232');

  // 2. Services Catalog & Pricing Multipliers
  console.log('\n--- 2. Testing Services & Vehicle Pricing ---');
  const services = await dbService.getServices(false);
  assert(services.length >= 8, `Services catalog contains active services (found ${services.length})`);

  const foamWash = services.find(s => s.slug === 'foam-wash' || s.name.includes('Foam Wash'));
  assert(!!foamWash, 'Foam wash service exists');
  if (foamWash) {
    assert(foamWash.pricesByVehicle.sedan > foamWash.pricesByVehicle.hatchback, 'Sedan wash price is higher than Hatchback');
    assert(foamWash.pricesByVehicle.luxury > foamWash.pricesByVehicle.sedan, 'Luxury car wash price is higher than Sedan');
  }

  // 3. Availability Slots Generation
  console.log('\n--- 3. Testing Slot Availability & Holidays ---');
  const testDate = new Date().toISOString().split('T')[0];
  const availability = await dbService.getAvailabilitySlots(testDate);
  assert(availability.slots.length > 0, `Availability slots generated for ${testDate} (found ${availability.slots.length} slots)`);
  assert(availability.slots.some(s => s.time === '10:00'), 'Time slot 10:00 AM exists in slot list');

  // 4. Booking Creation & Unique Reference
  console.log('\n--- 4. Testing Customer Booking Engine ---');
  const availableSlot = availability.slots.find(s => s.available);
  if (availableSlot && foamWash) {
    const bookingRes = await dbService.createBooking({
      customerName: 'Karthik Raja',
      customerPhone: '+91 98401 11223',
      customerWhatsapp: '+91 98401 11223',
      customerEmail: 'karthik@example.com',
      vehicleType: 'sedan',
      vehicleModel: 'Honda City ZX',
      registrationNumber: 'TN 09 BX 7788',
      appointmentDate: testDate,
      appointmentTime: availableSlot.time,
      serviceLocation: 'studio',
      serviceIds: [foamWash.id],
      whatsappConsent: true
    });

    assert(bookingRes.booking.bookingReference.startsWith('AQ-'), `Booking reference generated with AQ prefix: ${bookingRes.booking.bookingReference}`);
    assert(bookingRes.booking.totalAmount > 0, `Total amount calculated correctly: ₹${bookingRes.booking.totalAmount}`);

    // Verify lookup by reference
    const retrieved = await dbService.getBookingByReference(bookingRes.booking.bookingReference);
    assert(retrieved?.customerName === 'Karthik Raja', 'Booking retrieved by reference matches customer name');

    // Test Status Transition & Audit Logging
    const updated = await dbService.updateBookingStatus(bookingRes.booking.id, 'In Progress');
    assert(updated?.status === 'In Progress', 'Booking status successfully transitioned to In Progress');

    const auditLogs = await dbService.getAuditLogs();
    assert(auditLogs.some(a => a.targetId === bookingRes.booking.bookingReference), 'Audit log entry recorded for booking status change');
  } else {
    assert(false, 'Unable to run booking test due to missing slot or service');
  }

  // 5. WhatsApp Service Normalization & Payload Generation
  console.log('\n--- 5. Testing WhatsApp Service Integration ---');
  const normalized = whatsAppService.normalizePhone('+91 86681 81232');
  assert(normalized === '918668181232', `Phone number normalized to E.164 without plus: ${normalized}`);

  const waConfig = whatsAppService.getConfigStatus();
  assert(typeof waConfig.configured === 'boolean', 'WhatsApp config status returned');
  assert(waConfig.defaultOwnerNumber === '+91 8668181232', 'Default owner notification number is +91 8668181232');

  // 6. Admin Authentication & Password Validation
  console.log('\n--- 6. Testing Admin Security Authentication ---');
  const validPass = dbService.verifyAdminPassword('AquaShineAdmin2026!');
  assert(validPass === true, 'Default admin password validated successfully');

  const invalidPass = dbService.verifyAdminPassword('wrongpassword123');
  assert(invalidPass === false, 'Invalid admin password rejected properly');

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite crashed with error:', err);
  process.exit(1);
});
