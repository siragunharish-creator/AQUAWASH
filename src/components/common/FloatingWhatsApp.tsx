import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { api } from '../../lib/api.js';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ownerNumber, setOwnerNumber] = useState('918668181232');
  const [customMsg, setCustomMsg] = useState('');

  useEffect(() => {
    api.getSettings()
      .then(settings => {
        if (settings.whatsappNumber) {
          const cleaned = settings.whatsappNumber.replace(/[^0-9]/g, '');
          setOwnerNumber(cleaned || '918668181232');
        }
      })
      .catch(() => {});
  }, []);

  const quickOptions = [
    { label: '📅 Book a car wash slot today', text: 'Hi AquaShine Chennai! I would like to book a car wash slot today.' },
    { label: '✨ Inquire about 9H Ceramic Coating', text: 'Hi AquaShine, can you please share the packages and warranty details for 9H Ceramic Coating?' },
    { label: '🚗 Doorstep wash inquiry in Chennai', text: 'Hello, do you offer doorstep detailing in my area in Chennai?' },
    { label: '💬 General question', text: 'Hi AquaShine team, I have a quick question about your detailing services.' }
  ];

  const handleSend = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${ownerNumber}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">AquaShine WhatsApp Desk</h4>
                <p className="text-xs text-emerald-100 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse mr-1"></span>
                  Typically replies within 5 mins
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-gray-50/50 dark:bg-neutral-950/50">
            <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300">
              <p className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
                AquaShine Car Care Chennai
              </p>
              Vanakkam! Choose a quick message below or type your inquiry to connect directly with our workshop manager.
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                Quick Options
              </p>
              {quickOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(opt.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-gray-100 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700 text-xs text-gray-800 dark:text-neutral-200 transition-colors flex items-center justify-between group"
                >
                  <span>{opt.label}</span>
                  <Send className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customMsg.trim()) handleSend(customMsg.trim());
              }}
              className="pt-2 flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-600/20"
                title="Send on WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open WhatsApp conversation"
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all duration-200 group"
      >
        <MessageCircle className="w-7 h-7 group-hover:rotate-6 transition-transform" />
      </button>
    </div>
  );
};
