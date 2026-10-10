import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  IndianRupee,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../lib/api.js';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.adminGetStats()
      .then(res => {
        setStats(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Calculating real-time analytics from database records...
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarCheck,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10'
    },
    {
      title: "Today's Appointments",
      value: stats?.todayBookings || 0,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Pending Action',
      value: stats?.pendingBookings || 0,
      icon: AlertCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Completed Washes',
      value: stats?.completedBookings || 0,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Cancelled',
      value: stats?.cancelledBookings || 0,
      icon: XCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      title: 'Realized Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Chennai Facility Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Real-time appointments, revenue reconciliation, and detailing operations.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Section: Upcoming Appointments + Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upcoming Appointments (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Upcoming Detailing Appointments
              </h2>
              <p className="text-xs text-gray-500">Live schedule from PostgreSQL</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-bold text-sky-500 hover:text-sky-400 flex items-center"
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.upcomingAppointments?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No upcoming appointments scheduled.</p>
            ) : (
              stats?.upcomingAppointments?.map((bk: any) => (
                <div
                  key={bk.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex flex-col items-center justify-center font-bold">
                      <span className="text-[10px] uppercase font-mono">{bk.appointmentTime}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {bk.customerName} • <span className="font-mono text-sky-500">{bk.bookingReference}</span>
                      </p>
                      <p className="text-gray-500 dark:text-neutral-400 mt-0.5">
                        {bk.vehicleModel} ({bk.registrationNumber}) • {bk.appointmentDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                      {bk.status}
                    </span>
                    <p className="font-bold text-gray-900 dark:text-white mt-1">₹{bk.totalAmount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Popular Services & Workshop Load (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-gray-100 dark:border-neutral-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Most Booked Treatments
            </h2>
            <p className="text-xs text-gray-500">Service demand distribution in Chennai</p>
          </div>

          <div className="space-y-3">
            {stats?.popularServices?.map((srv: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-800 dark:text-neutral-200 truncate pr-2">{srv.name}</span>
                  <span className="text-sky-500 font-bold">{srv.count} bookings</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, srv.count * 25)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Administrative Activity Log */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="pb-3 border-b border-gray-100 dark:border-neutral-800 mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Audit Activity Trail
          </h2>
          <p className="text-xs text-gray-500">Immutable security logs for admin modifications</p>
        </div>

        <div className="space-y-2">
          {stats?.recentActivity?.slice(0, 5).map((log: any) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-gray-900 dark:text-white uppercase mr-2">{log.action}:</span>
                <span className="text-gray-600 dark:text-neutral-300">{log.details}</span>
              </div>
              <span className="text-gray-400 text-[10px] flex-shrink-0 ml-4">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
