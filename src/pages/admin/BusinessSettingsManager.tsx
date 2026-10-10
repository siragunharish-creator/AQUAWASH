import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { BusinessSettings } from '../../types/index.js';

export const BusinessSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings()
      .then(res => {
        setSettings(res);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const updated = await api.adminUpdateSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update business settings');
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-gray-400">Loading business settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Business Settings & Slot Engine
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Configure contact lines, Chennai hub hours, slot capacity limits, and tax percentage.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Settings saved successfully!
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Contact & Brand Information */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-neutral-800">
            Brand Identity & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={e => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Support Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Owner WhatsApp (+91)</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-emerald-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase text-gray-500 mb-1">Chennai Detailing Studio Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Operating Hours & Slot Capacity */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-neutral-800">
            Appointment Scheduling & Slot Capacity
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Facility Open Time</label>
              <input
                type="text"
                value={settings.openingTime}
                onChange={e => setSettings({ ...settings, openingTime: e.target.value })}
                placeholder="08:00"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Facility Close Time</label>
              <input
                type="text"
                value={settings.closingTime}
                onChange={e => setSettings({ ...settings, closingTime: e.target.value })}
                placeholder="20:00"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Slot Duration (Mins)</label>
              <input
                type="number"
                value={settings.slotDurationMins}
                onChange={e => setSettings({ ...settings, slotDurationMins: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Max Bookings Per Slot</label>
              <input
                type="number"
                value={settings.maxBookingsPerSlot}
                onChange={e => setSettings({ ...settings, maxBookingsPerSlot: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">GST Tax Percentage (%)</label>
              <input
                type="number"
                value={settings.taxPercentage}
                onChange={e => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Currency Code</label>
              <input
                type="text"
                disabled
                value={`${settings.currency} (${settings.currencySymbol})`}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800 text-gray-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Business Timezone</label>
              <input
                type="text"
                disabled
                value={settings.timezone}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800 text-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Business Settings
          </button>
        </div>
      </form>
    </div>
  );
};
