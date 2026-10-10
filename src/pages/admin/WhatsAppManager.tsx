import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { WhatsAppNotificationLog } from '../../types/index.js';

export const WhatsAppManager: React.FC = () => {
  const [logs, setLogs] = useState<WhatsAppNotificationLog[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    api.adminGetNotifications()
      .then(res => {
        setLogs(res.logs);
        setConfig(res.config);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load WhatsApp logs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    try {
      const res = await api.adminRetryNotification(logId);
      if (res.success) {
        alert('WhatsApp dispatch re-attempted successfully.');
      } else {
        alert(`Retry completed with status: ${res.result?.error || 'failed'}`);
      }
      loadData();
    } catch (err: any) {
      alert(`Retry request failed: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            WhatsApp Business Cloud API Console
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Official Meta WhatsApp Cloud API monitoring, delivery status, and retry engine.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Refresh Logs
        </button>
      </div>

      {/* Meta API Configuration Status Diagnostic Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              config?.configured
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-amber-500/10 text-amber-500'
            }`}>
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Meta WhatsApp Business Cloud API Status
              </h2>
              <span className={`inline-flex items-center text-xs font-bold ${
                config?.configured ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {config?.configured ? '● Live Production Gateway' : '● In Sandbox / Diagnostic Logging Mode'}
              </span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-gray-400">Owner WhatsApp:</span>
            <p className="font-bold text-gray-900 dark:text-white">{config?.defaultOwnerNumber || '+91 8668181232'}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 text-xs space-y-2">
          <div className="flex items-center text-gray-700 dark:text-neutral-300">
            <Info className="w-4 h-4 text-sky-500 mr-2 flex-shrink-0" />
            <span>{config?.instructions}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200/50 dark:border-neutral-800/50 text-[11px] text-gray-500">
            <div>Access Token: {config?.hasAccessToken ? '✅ Provided' : '⚠️ Pending in .env'}</div>
            <div>Phone Number ID: {config?.hasPhoneNumberId ? '✅ Provided' : '⚠️ Pending in .env'}</div>
            <div>Business Account ID: {config?.hasBusinessAccountId ? '✅ Provided' : '⚠️ Optional'}</div>
          </div>
        </div>
      </div>

      {/* WhatsApp Logs Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="font-bold text-sm text-gray-900 dark:text-white">
            Dispatched Message Logs ({logs.length})
          </h2>
          <span className="text-[11px] text-gray-400">Chronological history with Meta Provider response IDs</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading notification records...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            No WhatsApp notification dispatches logged yet. When customers book car washes, automated notifications appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-neutral-950 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3">Booking Ref</th>
                  <th className="px-5 py-3">Recipient Role</th>
                  <th className="px-5 py-3">Recipient Phone</th>
                  <th className="px-5 py-3">Message Type</th>
                  <th className="px-5 py-3">Provider Status</th>
                  <th className="px-5 py-3">Last Attempt</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-950/50">
                    <td className="px-5 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                      {log.bookingReference}
                    </td>
                    <td className="px-5 py-3.5 capitalize font-semibold">
                      {log.recipientType}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-700 dark:text-neutral-300">
                      {log.recipientPhone}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-[10px] font-mono">
                        {log.messageType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'sent' || log.status === 'delivered' || log.status === 'read'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : log.status === 'simulated'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                      {log.providerMessageId && (
                        <span className="block text-[9px] text-gray-400 font-mono mt-0.5 truncate max-w-[140px]">
                          {log.providerMessageId}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(log.lastAttemptAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleRetry(log.id)}
                        disabled={retryingId === log.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 transition-colors"
                        title="Retry sending WhatsApp message"
                      >
                        <RotateCcw className={`w-3 h-3 mr-1 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
