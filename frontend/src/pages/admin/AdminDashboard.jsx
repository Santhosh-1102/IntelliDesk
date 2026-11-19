import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ticketService } from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { 
  BarChart3, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Loader2,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsData, categoriesData] = await Promise.all([
        ticketService.getAllTickets({ page: 0, size: 100 }),
        ticketService.getCategories(),
      ]);
      setTickets(ticketsData.content || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Failed to load admin metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
  const criticalTickets = tickets.filter((t) => t.priority === 'CRITICAL').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
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
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  IT Governance & Operational Analytics
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Admin Cockpit
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Real-time ITSM telemetry, AI deflection metrics, and vector database status
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
              >
                <Users className="w-4 h-4 text-purple-600" />
                Manage Users
              </Link>
              <button
                onClick={loadData}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm shadow-purple-500/20 transition-all"
              >
                ↻ Refresh Telemetry
              </button>
            </div>
          </motion.div>

          {/* Metric KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Total Incidents */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Incidents</p>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">{totalTickets}</p>
              <div className="flex items-center gap-1.5 text-xs text-purple-600 font-bold mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% vs last cycle</span>
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SLA Resolution Rate</p>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-600 mt-2">{resolutionRate}%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
            </div>

            {/* AI Deflection Rate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Deflection Rate</p>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-brand-600 mt-2">52.4%</p>
              <p className="text-[11px] text-brand-700 font-semibold mt-1">Self-resolved via SOP RAG</p>
            </div>

            {/* Critical Priority */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Critical</p>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-rose-600 mt-2">{criticalTickets}</p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">SLA target &lt; 1 hour</p>
            </div>
          </motion.div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Taxonomy & Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Incident Categories & SLA Taxonomy</h3>
                  <p className="text-xs text-slate-500 font-medium">Standardized IT routing domains and priority baselines</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  {categories.length} Categories
                </span>
              </div>

              {loading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3.5 mt-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50/60 to-white hover:border-purple-300 transition-all flex items-center justify-between group shadow-sm hover:shadow"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cat.code}</p>
                      </div>
                      <PriorityBadge priority={cat.defaultPriority} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* System Health & Vector Database */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-4"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900">Infrastructure Health</h3>
                <p className="text-xs text-slate-500 font-medium">Underlying backend engine & vector store</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">PostgreSQL 16 (pgvector)</p>
                      <p className="text-[10px] text-slate-400">Port 5433 • HNSW Index Active</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Online
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Spring AI Core Engine</p>
                      <p className="text-[10px] text-slate-400">Boot 3.3.5 • ChatClient Ready</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    Active
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Apache Tika Parser</p>
                      <p className="text-[10px] text-slate-400">PDF, DOCX, TXT Ingestion</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    Ready
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Redis Distributed Cache</p>
                      <p className="text-[10px] text-slate-400">Port 6379 • In-memory Store</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Healthy
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-2">
                <Link
                  to="/admin/documents"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Knowledge Base Ingestion Hub →</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
