import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { z } from 'zod';
import dotenv from 'dotenv';
import { dbService } from './server/db.js';
import { whatsAppService } from './server/whatsapp.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage setup for local computer image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// Admin Session Token Cache (In-Memory Session Store)
const activeAdminSessions = new Map<string, { email: string; expiresAt: number }>();

function generateSessionToken(): string {
  return `aq_adm_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
}

// Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized. Admin credentials required.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const session = activeAdminSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeAdminSessions.delete(token);
    return res.status(401).json({ error: 'Admin session expired. Please log in again.' });
  }

  // Extend session on activity
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  (req as any).adminEmail = session.email;
  next();
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Health & Diagnostic Check
app.get('/api/health', async (_req, res) => {
  const settings = await dbService.getSettings();
  const isSupabase = dbService.isSupabaseConnected();
  const waConfig = whatsAppService.getConfigStatus();

  res.json({
    status: 'ok',
    businessName: settings.businessName,
    location: `${settings.city}, ${settings.state}`,
    supabaseConnected: isSupabase,
    whatsApp: waConfig,
    timestamp: new Date().toISOString()
  });
});

// Public Settings
app.get('/api/settings', async (_req, res) => {
  try {
    const settings = await dbService.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Website Content
app.get('/api/content', async (_req, res) => {
  try {
    const content = await dbService.getContent();
    res.json(content);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vehicle Categories
app.get('/api/vehicle-categories', async (_req, res) => {
  try {
    const cats = await dbService.getVehicleCategories();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Services
app.get('/api/services', async (_req, res) => {
  try {
    const services = await dbService.getServices(false);
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Service by ID or Slug
app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await dbService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Availability Slots for Booking Calendar
app.get('/api/availability', async (req, res) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const availability = await dbService.getAvailabilitySlots(dateStr);
    res.json(availability);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Testimonials
app.get('/api/testimonials', async (_req, res) => {
  try {
    const list = await dbService.getTestimonials(false);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Gallery
app.get('/api/gallery', async (_req, res) => {
  try {
    const media = await dbService.getMediaAssets();
    res.json(media);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Booking Validation Schema (Zod)
const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(10, 'Valid 10-digit mobile number required'),
  customerWhatsapp: z.string().min(10, 'Valid WhatsApp number required').optional().or(z.literal('')),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  vehicleType: z.enum(['hatchback', 'sedan', 'suv', 'luxury', 'bike']),
  vehicleModel: z.string().min(2, 'Vehicle model is required'),
  registrationNumber: z.string().min(4, 'Registration number is required (e.g. TN 07 BZ 4521)'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time format must be HH:MM'),
  serviceLocation: z.enum(['studio', 'doorstep']).default('studio'),
  locationAddress: z.string().optional(),
  additionalNotes: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, 'Please select at least one service'),
  whatsappConsent: z.boolean().default(true)
});

// Create Customer Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const parsed = bookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues.map((e: any) => e.message)
      });
    }

    const { booking, message } = await dbService.createBooking(parsed.data as any);
    const settings = await dbService.getSettings();

    // Trigger WhatsApp Notifications asynchronously so booking confirmation responds immediately
    (async () => {
      try {
        // 1. Customer WhatsApp Notification
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
          recipientType: 'customer',
          recipientPhone: booking.customerWhatsapp || booking.customerPhone,
          messageType: 'booking_created',
          status: custResult.success ? (custResult.isSimulated ? 'simulated' : 'sent') : 'failed',
          providerResponse: custResult.providerResponse,
          providerMessageId: custResult.providerMessageId,
          errorMessage: custResult.error
        });

        // 2. Owner WhatsApp Notification (+91 8668181232)
        const ownerPhone = settings.whatsappNumber || '+918668181232';
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
          recipientType: 'owner',
          recipientPhone: ownerPhone,
          messageType: 'booking_created',
          status: ownerResult.success ? (ownerResult.isSimulated ? 'simulated' : 'sent') : 'failed',
          providerResponse: ownerResult.providerResponse,
          providerMessageId: ownerResult.providerMessageId,
          errorMessage: ownerResult.error
        });
      } catch (waErr) {
        console.error('Error during WhatsApp dispatch:', waErr);
      }
    })();

    res.status(201).json({
      success: true,
      bookingReference: booking.bookingReference,
      booking,
      message
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to place booking' });
  }
});

// Track Booking (Public)
app.get('/api/bookings/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const phone = req.query.phone as string | undefined;

    const booking = await dbService.getBookingByReference(reference, phone);
    if (!booking) {
      return res.status(404).json({ error: 'No booking found with this reference number.' });
    }

    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Meta WhatsApp Webhook Verification
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'aquashine_webhook_verify_token';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsApp Webhook] Verification successful.');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Meta WhatsApp Webhook Event Handler (Delivery & Read receipts)
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
    if (entry?.statuses?.[0]) {
      const statusObj = entry.statuses[0];
      const messageId = statusObj.id;
      const status = statusObj.status; // delivered, read, failed

      const logs = await dbService.getWhatsAppLogs();
      const matched = logs.find(l => l.providerMessageId === messageId);
      if (matched) {
        await dbService.updateWhatsAppLog(matched.id, {
          status: status === 'read' ? 'read' : status === 'delivered' ? 'delivered' : 'failed'
        });
      }
    }
  } catch (e) {
    console.error('Webhook error:', e);
  }
  res.status(200).send('EVENT_RECEIVED');
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION ROUTES
// -------------------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Accept admin email or default admin username
  const validEmail = 'admin@aquashinecarcare.in';
  const providedIdentifier = (username || '').trim().toLowerCase();

  const isPasswordValid = dbService.verifyAdminPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid administrator credentials. Access denied.' });
  }

  const token = generateSessionToken();
  activeAdminSessions.set(token, {
    email: providedIdentifier || validEmail,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  dbService.logAudit(
    providedIdentifier || validEmail,
    'ADMIN_LOGIN',
    'auth',
    'session',
    'Administrator logged in successfully'
  );

  res.json({
    success: true,
    token,
    user: {
      email: providedIdentifier || validEmail,
      name: 'AquaShine SuperAdmin',
      role: 'admin'
    }
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  activeAdminSessions.delete(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  const adminEmail = (req as any).adminEmail;
  res.json({
    email: adminEmail,
    name: 'AquaShine SuperAdmin',
    role: 'admin'
  });
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminEmail = (req as any).adminEmail;

  if (!dbService.verifyAdminPassword(currentPassword)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  dbService.updateAdminPassword(newPassword, adminEmail);
  res.json({ success: true, message: 'Password updated successfully' });
});

// -------------------------------------------------------------
// ADMIN PROTECTED MANAGEMENT ROUTES
// -------------------------------------------------------------

// Admin Overview Stats
app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
  try {
    const stats = await dbService.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Bookings List
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  try {
    const { search, status, date, limit } = req.query;
    const bookings = await dbService.getBookings({
      search: search as string,
      status: status as string,
      date: date as string,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Booking Status
app.patch('/api/admin/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, cancellationReason, paymentStatus, sendWhatsappUpdate } = req.body;
    const adminEmail = (req as any).adminEmail;

    const updated = await dbService.updateBookingStatus(req.params.id, status, {
      cancellationReason,
      paymentStatus,
      adminEmail
    });

    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Optional status update WhatsApp message
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
        console.warn('Status update WhatsApp dispatch failed:', err);
      }
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reschedule Booking
app.post('/api/admin/bookings/:id/reschedule', requireAdmin, async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const adminEmail = (req as any).adminEmail;

    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'New appointment date and time are required' });
    }

    const updated = await dbService.rescheduleBooking(req.params.id, appointmentDate, appointmentTime, adminEmail);
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Services (All Services including inactive)
app.get('/api/admin/services', requireAdmin, async (_req, res) => {
  try {
    const services = await dbService.getServices(true);
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Create Service
app.post('/api/admin/services', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req as any).adminEmail;
    const created = await dbService.createService(req.body, adminEmail);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Service
app.put('/api/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req as any).adminEmail;
    const updated = await dbService.updateService(req.params.id, req.body, adminEmail);
    if (!updated) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Delete/Archive Service
app.delete('/api/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req as any).adminEmail;
    const success = await dbService.deleteService(req.params.id, adminEmail);
    if (!success) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service removed or archived' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Website Content
app.put('/api/admin/content', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req as any).adminEmail;
    const content = await dbService.updateContent(req.body, adminEmail);
    res.json(content);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Business Settings
app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req as any).adminEmail;
    const settings = await dbService.updateSettings(req.body, adminEmail);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Local Computer Image Upload Endpoint
app.post('/api/upload', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { altText, caption, category } = req.body;
    const adminEmail = (req as any).adminEmail;

    let finalUrl = `/uploads/${req.file.filename}`;
    let storagePath = `uploads/${req.file.filename}`;

    // If Supabase Storage is connected, upload to Supabase Storage bucket 'site-images'
    const supabase = dbService.getSupabaseClient();
    if (supabase) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const supabaseStoragePath = `uploads/${req.file.filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(supabaseStoragePath, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('site-images')
            .getPublicUrl(supabaseStoragePath);

          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
            storagePath = supabaseStoragePath;
            console.log('[Supabase Storage] Uploaded to site-images:', finalUrl);
          }
        } else {
          console.warn('[Supabase Storage Upload Warning]', uploadError);
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload error, using persistent upload:', storageErr);
      }
    }

    // Save metadata in database
    const asset = await dbService.addMediaAsset({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: finalUrl,
      storagePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      altText: altText || req.file.originalname,
      caption: caption || '',
      category: (category as any) || 'gallery'
    });

    dbService.logAudit(
      adminEmail,
      'UPLOAD_IMAGE',
      'media_assets',
      asset.id,
      `Uploaded ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`
    );

    res.status(201).json({
      success: true,
      asset,
      url: finalUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// Admin Delete Media Asset
app.delete('/api/admin/media/:id', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req as any).adminEmail;
    const ok = await dbService.deleteMediaAsset(req.params.id, adminEmail);
    if (!ok) {
      return res.status(404).json({ error: 'Media asset not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin WhatsApp Logs
app.get('/api/admin/notifications', requireAdmin, async (_req, res) => {
  try {
    const logs = await dbService.getWhatsAppLogs();
    const configStatus = whatsAppService.getConfigStatus();
    res.json({
      logs,
      config: configStatus
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Retry WhatsApp Notification
app.post('/api/admin/notifications/retry/:id', requireAdmin, async (req, res) => {
  try {
    const logs = await dbService.getWhatsAppLogs();
    const target = logs.find(l => l.id === req.params.id);

    if (!target) {
      return res.status(404).json({ error: 'Notification log not found' });
    }

    const booking = await dbService.getBookingByReference(target.bookingReference);
    if (!booking) {
      return res.status(404).json({ error: 'Associated booking record not found' });
    }

    let retryResult;
    const settings = await dbService.getSettings();

    if (target.recipientType === 'customer') {
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
      status: retryResult.success ? (retryResult.isSimulated ? 'simulated' : 'sent') : 'failed',
      retryCount: (target.retryCount || 0) + 1,
      errorMessage: retryResult.error,
      providerMessageId: retryResult.providerMessageId || target.providerMessageId,
      providerResponse: retryResult.providerResponse
    });

    res.json({
      success: retryResult.success,
      result: retryResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, async (_req, res) => {
  try {
    const logs = await dbService.getAuditLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FRONTEND SERVER / VITE INTEGRATION
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode with Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    // Production mode - serve pre-built dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` AquaShine Car Care Full-Stack Platform`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Business Location: Chennai, Tamil Nadu, India`);
    console.log(` Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
