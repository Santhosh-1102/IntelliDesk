import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { analyticsService } from '../../services/analyticsService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PriorityBadge from '../../components/PriorityBadge';
import { 
  BarChart3, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  Loader2,
  Database,
  Cpu,
  Layers,
  TrendingUp,
  Activity,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  RefreshCw,
  Zap,
  Flame,
  CheckCircle,
  Timer
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      if (!analytics) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const data = await analyticsService.getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError('Unable to fetch live IT governance metrics. Please verify backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Derived stats
  const totalTickets = analytics?.totalTickets || 0;
  const openTickets = analytics?.openTickets || 0;
  const inProgressTickets = analytics?.inProgressTickets || 0;
  const activeLoad = openTickets + inProgressTickets;
  const resolvedTickets = (analytics?.resolvedTickets || 0) + (analytics?.closedTickets || 0);

  const deflectionRate = analytics?.aiDeflectionRate ?? 0;
  const slaCompliance = analytics?.slaComplianceRate ?? 100;
  const slaBreachedCount = analytics?.slaBreachedCount || 0;
  const slaNearBreachCount = analytics?.slaNearBreachCount || 0;
  const formattedMttr = analytics?.formattedMttr || '0m';

  const categories = analytics?.categoryBreakdown || [];
  const priorities = analytics?.priorityBreakdown || {};
  const engineers = analytics?.engineerWorkloads || [];
  const urgentTickets = analytics?.urgentSlaTickets || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  IT Governance & Operational Analytics
                </h1>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  Live Executive BI
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Real-time ITSM telemetry, AI deflection performance, SLA breach radar, and engineer capacity
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all"
              >
                <Users className="w-4 h-4 text-violet-500" />
                Manage Users
              </Link>
              <button
                onClick={loadAnalytics}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
              </button>
            </div>
          </motion.div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Aggregating real-time ITSM telemetry & calculating deflection metrics...
              </p>
            </div>
          ) : (
            <>
              {/* Executive KPI Cards */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Total Incidents & Active Queue */}
                <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Incidents</p>
                    <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <Ticket className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{totalTickets}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold">
                      <Zap className="w-3.5 h-3.5" /> {activeLoad} active
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {resolvedTickets} resolved
                    </span>
                  </div>
                </div>

                {/* SLA Compliance Rate */}
                <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SLA Compliance Rate</p>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      slaCompliance >= 90
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : slaCompliance >= 75
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className={`text-3xl font-black mt-2 ${
                    slaCompliance >= 90
                      ? 'text-emerald-500'
                      : slaCompliance >= 75
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}>
                    {slaCompliance}%
                  </p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${
                        slaCompliance >= 90
                          ? 'bg-emerald-500'
                          : slaCompliance >= 75
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, slaCompliance))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
                    <span>{slaBreachedCount} breached</span>
                    <span className="text-amber-500">{slaNearBreachCount} near deadline</span>
                  </div>
                </div>

                {/* AI Deflection Rate */}
                <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Deflection Rate</p>
                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-cyan-500 mt-2">{deflectionRate}%</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.max(0, deflectionRate))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold mt-2">
                    {analytics?.aiSelfResolvedConversations || 0} of {analytics?.aiTotalConversations || 0} self-resolved via RAG
                  </p>
                </div>

                {/* Mean Time to Resolution (MTTR) */}
                <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mean Time to Resolve (MTTR)</p>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Timer className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-indigo-500 mt-2">{formattedMttr}</p>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Average incident turnaround</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                    Calculated from resolved lifecycle
                  </p>
                </div>
              </motion.div>

              {/* Real-Time SLA Breach Alert Radar */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-[#0d1322] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-7"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        Real-Time SLA Breach & Urgency Radar
                        {slaBreachedCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                            {slaBreachedCount} BREACHED
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Active incidents ranked by SLA expiration window and operational criticality
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/admin/queue"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                  >
                    <span>View all active tickets</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {urgentTickets.length === 0 ? (
                  <div className="py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      All Active Tickets Within SLA Windows
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      No active tickets are currently breached or at immediate risk of SLA expiration.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 px-3">Ticket</th>
                          <th className="pb-3 px-3">Category</th>
                          <th className="pb-3 px-3">Priority</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3">Assigned To</th>
                          <th className="pb-3 px-3 text-right">SLA Countdown</th>
                          <th className="pb-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {urgentTickets.map((t) => (
                          <tr 
                            key={t.ticketId}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <div className="font-mono font-bold text-violet-600 dark:text-violet-400">
                                {t.ticketNumber}
                              </div>
                              <div className="text-slate-900 dark:text-slate-200 font-semibold line-clamp-1 max-w-xs mt-0.5">
                                {t.title}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                                {t.categoryName}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <PriorityBadge priority={t.priority} />
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                              {t.assignedEngineerName}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {t.breached ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-black">
                                  <AlertOctagon className="w-3.5 h-3.5 animate-bounce" />
                                  {t.formattedTimeRemaining}
                                </span>
                              ) : t.minutesRemaining < 120 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                                  <Clock className="w-3.5 h-3.5" />
                                  {t.formattedTimeRemaining}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                  <Clock className="w-3.5 h-3.5" />
                                  {t.formattedTimeRemaining}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Link
                                to="/admin/queue"
                                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-all inline-block"
                              >
                                Review
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>

              {/* Incident Analytics & Priority Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Breakdown Bars */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2 bg-white dark:bg-[#0d1322] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Incident Taxonomy & Volume Distribution</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Categorical incident load across enterprise domains</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                      {categories.length} Active Domains
                    </span>
                  </div>

                  {categories.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No category metrics logged yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((cat, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{cat.categoryName}</span>
                            <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">
                              {cat.count} tickets ({cat.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(100, Math.max(4, cat.percentage))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Priority Breakdown Pills */}
                  <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Priority Distribution</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Critical</p>
                        <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{priorities.CRITICAL || 0}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">High</p>
                        <p className="text-xl font-black text-orange-600 dark:text-orange-400 mt-0.5">{priorities.HIGH || 0}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Medium</p>
                        <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{priorities.MEDIUM || 0}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Low</p>
                        <p className="text-xl font-black text-slate-700 dark:text-slate-200 mt-0.5">{priorities.LOW || 0}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Infrastructure & Vector Store Health */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white dark:bg-[#0d1322] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-7 space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">IT Infrastructure Health</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Underlying backend engine & vector store</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">PostgreSQL 16 (pgvector)</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Port 5433 • HNSW Index Active</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        Online
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Spring AI Core Engine</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Boot 3.3.5 • ChatClient Ready</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                        Active
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Apache Tika Parser</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">PDF, DOCX, TXT Ingestion</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                        Ready
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Redis Distributed Cache</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Port 6379 • In-memory Store</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        Healthy
                      </span>
                    </div>
                  </div>

                  {/* Action Banner */}
                  <div className="pt-2">
                    <Link
                      to="/admin/documents"
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Knowledge Base Ingestion Hub →</span>
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Support Engineer Workload & Capacity Table */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#0d1322] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-7"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Support Engineer Capacity & Velocity</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active queue allocations and historical resolution output</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                    {engineers.length} Support Engineers
                  </span>
                </div>

                {engineers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No support engineers currently registered in the system.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 px-3">Engineer</th>
                          <th className="pb-3 px-3">Department</th>
                          <th className="pb-3 px-3 text-center">Active Queue</th>
                          <th className="pb-3 px-3 text-center">Resolved Output</th>
                          <th className="pb-3 px-3 text-center">Lifetime Assigned</th>
                          <th className="pb-3 px-3 text-right">Workload Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {engineers.map((eng) => (
                          <tr key={eng.engineerId} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900 dark:text-white">{eng.name}</div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{eng.email}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                              {eng.department}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                                {eng.activeTickets}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                {eng.resolvedTickets}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-500 dark:text-slate-400">
                              {eng.totalAssigned}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {eng.activeTickets >= 4 ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                                  Heavy Load
                                </span>
                              ) : eng.activeTickets > 0 ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                                  Balanced ({eng.activeTickets})
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                                  Available
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
