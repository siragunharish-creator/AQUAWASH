import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';

import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp.js';

// Public Pages
import { Home } from './pages/Home.js';
import { Services } from './pages/Services.js';
import { ServiceDetail } from './pages/ServiceDetail.js';
import { Booking } from './pages/Booking.js';
import { BookingConfirmation } from './pages/BookingConfirmation.js';
import { TrackBooking } from './pages/TrackBooking.js';
import { Gallery } from './pages/Gallery.js';
import { About } from './pages/About.js';
import { Contact } from './pages/Contact.js';
import { Privacy } from './pages/Privacy.js';
import { Terms } from './pages/Terms.js';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin.js';
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { DashboardOverview } from './pages/admin/DashboardOverview.js';
import { BookingsManager } from './pages/admin/BookingsManager.js';
import { ServicesManager } from './pages/admin/ServicesManager.js';
import { ContentManager } from './pages/admin/ContentManager.js';
import { GalleryManager } from './pages/admin/GalleryManager.js';
import { BusinessSettingsManager } from './pages/admin/BusinessSettingsManager.js';
import { WhatsAppManager } from './pages/admin/WhatsAppManager.js';
import { AccountManager } from './pages/admin/AccountManager.js';

// Layout wrapper for Public Pages
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/book" element={<Booking />} />
              <Route path="/booking-confirmation/:reference" element={<BookingConfirmation />} />
              <Route path="/track" element={<TrackBooking />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="bookings" element={<BookingsManager />} />
              <Route path="services" element={<ServicesManager />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="settings" element={<BusinessSettingsManager />} />
              <Route path="whatsapp" element={<WhatsAppManager />} />
              <Route path="account" element={<AccountManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
