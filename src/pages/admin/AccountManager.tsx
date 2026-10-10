import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  UserCheck
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { AuditLogItem } from '../../types/index.js';

export const AccountManager: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    api.adminGetAuditLogs()
      .then(res => {
        setAuditLogs(res);
        setLoadingLogs(false);
      })
      .catch(() => setLoadingLogs(false));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    try {
      await api.adminChangePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update administrator password.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Administrator Account & Security Audit
        </h1>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
          Manage administrator credentials, session lifetimes, and view immutable audit trail records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-neutral-800 flex items-center">
            <UserCheck className="w-4 h-4 text-sky-500 mr-2" />
            Active Administrator Session
          </h2>

          <div className="space-y-2">
            <div>
              <span className="text-gray-400">Account Identity:</span>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{user?.email || 'admin@aquashinecarcare.in'}</p>
            </div>
            <div>
              <span className="text-gray-400">Privilege Level:</span>
              <p className="font-bold text-emerald-500 uppercase">Super Administrator (Full RBAC)</p>
            </div>
            <div>
              <span className="text-gray-400">Session Protection:</span>
              <p className="text-gray-600 dark:text-neutral-300">24-hour token with automatic rolling renewal</p>
            </div>
            <div>
              <span className="text-gray-400">Authentication Scheme:</span>
              <p className="text-gray-600 dark:text-neutral-300">Bearer Token Header + Server-Side Validation</p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-neutral-800 flex items-center">
            <KeyRound className="w-4 h-4 text-amber-500 mr-2" />
            Change Administrator Password
          </h2>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 text-xs flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Password updated successfully!
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm mt-2"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="font-bold text-sm text-gray-900 dark:text-white">
            Administrative Audit Trail ({auditLogs.length} Records)
          </h2>
          <p className="text-[11px] text-gray-400">
            Immutable log of booking state transitions, price updates, image uploads, and parameter adjustments.
          </p>
        </div>

        {loadingLogs ? (
          <div className="py-16 text-center text-gray-400 text-xs">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-neutral-950 text-[11px] uppercase tracking-wider text-gray-500 sticky top-0 border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">Administrator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-950/50">
                    <td className="px-5 py-3 text-gray-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-900 dark:text-white uppercase font-mono">
                      {log.action}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {log.targetType} {log.targetId ? `(${log.targetId})` : ''}
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-neutral-300">
                      {log.details}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-[11px]">
                      {log.adminEmail}
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
