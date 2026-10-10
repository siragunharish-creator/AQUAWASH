import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AquaShine<span className="text-sky-400 ml-1">Care</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Drive Clean. Shine Bright. Chennai's premier automotive detailing studio offering scratch-free foam washing, ceramic coatings, and interior sanitization.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://wa.me/918668181232"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/aquashinecarcare"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/40 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/aquashinecarcare"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@aquashinecarcare"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Explore & Book
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="hover:text-sky-400 transition-colors">
                  Services & Pricing
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-sky-400 text-sky-400 font-medium transition-colors">
                  Book a Car Wash Online
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-sky-400 transition-colors">
                  Track Existing Booking
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-sky-400 transition-colors">
                  Before-and-After Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sky-400 transition-colors">
                  About AquaShine Chennai
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-400 transition-colors">
                  Contact & Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Services */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Signature Treatments
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link to="/services/ceramic-coating" className="hover:text-sky-400 transition-colors">
                  9H Ceramic Coating Protection
                </Link>
              </li>
              <li>
                <Link to="/services/interior-exterior-deep-cleaning" className="hover:text-sky-400 transition-colors">
                  Interior & Exterior Deep Cleaning
                </Link>
              </li>
              <li>
                <Link to="/services/foam-wash" className="hover:text-sky-400 transition-colors">
                  High-Adhesion Snow Foam Wash
                </Link>
              </li>
              <li>
                <Link to="/services/premium-car-detailing" className="hover:text-sky-400 transition-colors">
                  Multi-Stage Paint Correction
                </Link>
              </li>
              <li>
                <Link to="/services/bike-wash" className="hover:text-sky-400 transition-colors">
                  Superbike Wash & Chain Lube
                </Link>
              </li>
              <li>
                <Link to="/services/suv-wash" className="hover:text-sky-400 transition-colors">
                  SUV Heavy Mud Decontamination
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Chennai Facility & Operating Hours */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Chennai Detailing Hub
            </h3>
            <div className="flex items-start space-x-3 text-sm text-neutral-400">
              <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>
                No. 42, Rajiv Gandhi Salai (OMR), Kandanchavadi, Perungudi, Chennai 600096
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-400">
              <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <a href="tel:+918668181232" className="hover:text-white transition-colors">
                +91 86681 81232
              </a>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-400">
              <Clock className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Mon – Sun: 8:00 AM – 8:00 PM (IST)</span>
            </div>
            <div className="pt-2">
              <a
                href="https://wa.me/918668181232?text=Hi%20AquaShine%20Chennai,%20I%20want%20to%20book%20a%20slot."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/40 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Direct Owner WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Copyright, Legal & Admin Link */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} AquaShine Car Care. All rights reserved. Registered in Chennai, Tamil Nadu.</p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-neutral-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link
              to="/admin/login"
              className="p-1 text-neutral-500 hover:text-sky-400 transition-colors flex items-center"
              title="Admin"
              aria-label="Admin"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
