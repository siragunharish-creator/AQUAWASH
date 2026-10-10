import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(
      `Hi AquaShine Chennai,\nName: ${name}\nPhone: ${phone}\nTopic: ${subject}\nMessage: ${message}`
    );
    window.open(`https://wa.me/918668181232?text=${encoded}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Reach Out to Us
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            Contact AquaShine Chennai
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-neutral-400">
            Whether you need a consultation on 9H Ceramic Coatings or want to inquire about doorstep mobile detailing, we're ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Cards & Chennai Hub Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Detailing Hub Information
              </h2>

              <div className="flex items-start space-x-3.5 text-sm text-gray-700 dark:text-neutral-300">
                <MapPin className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">Main Detailing Facility:</strong>
                  No. 42, Rajiv Gandhi Salai (OMR), Kandanchavadi, Perungudi, Chennai, Tamil Nadu 600096
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-gray-700 dark:text-neutral-300">
                <Phone className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">Call for Appointments:</strong>
                  <a href="tel:+918668181232" className="hover:text-sky-500 transition-colors">
                    +91 86681 81232
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-gray-700 dark:text-neutral-300">
                <Mail className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">Email Address:</strong>
                  <span>contact@aquashinecarcare.in</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-gray-700 dark:text-neutral-300">
                <Clock className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 dark:text-white">Facility Operating Hours:</strong>
                  Monday to Sunday: 8:00 AM – 8:00 PM (IST)
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                <span>Immediate WhatsApp Concierge</span>
              </div>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                Send photos of swirl marks or scratch damage for a free preliminary evaluation from our lead detailing technician.
              </p>
              <a
                href="https://wa.me/918668181232?text=Hello%20AquaShine%20Chennai,%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
              >
                Chat with Owner (+91 86681 81232)
              </a>
            </div>

            {/* Service Areas */}
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Chennai Doorstep Service Coverage:
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                OMR Expressway (Kandanchavadi to Siruseri), ECR (Palavakkam to Kovalam), Velachery, Adyar, Besant Nagar, Thoraipakkam, Sholinganallur, Medavakkam, and Anna Nagar.
              </p>
            </div>
          </div>

          {/* Right Column: Direct Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Send an Inquiry
              </h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mb-6">
                Fill out the form below to connect instantly with our workshop manager.
              </p>

              {submitted ? (
                <div className="p-8 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                    Inquiry Dispatched!
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400">
                    Your inquiry has been forwarded to our WhatsApp desk. We typically reply within 5 minutes.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-white dark:bg-neutral-900 rounded-lg border border-emerald-300"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Chandran"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98400 12345"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                      Inquiry Category
                    </label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="General Enquiry">General Car Wash Inquiry</option>
                      <option value="9H Ceramic Coating">9H Ceramic Coating Packages & Warranty</option>
                      <option value="Doorstep Detailing">Doorstep Detailing Van Availability</option>
                      <option value="Fleet / Corporate">Corporate Fleet Detailing Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                      Message / Vehicle Model *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us your car model, current paint condition, or questions..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/25 flex items-center justify-center transition-all hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Inquiry (Direct WhatsApp Desk)
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
