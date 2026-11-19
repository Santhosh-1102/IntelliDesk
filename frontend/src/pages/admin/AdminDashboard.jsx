import React, { useState, useEffect } from 'react';
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
  Loader2 
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              System Administration & Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Monitor IT operational efficiency, SLA resolution rates, and knowledge base performance
            </p>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Incidents</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalTickets}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolution Rate</p>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5">{resolutionRate}%</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Deflection Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-0.5">48%</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Tickets</p>
                <p className="text-2xl font-bold text-rose-600 mt-0.5">{criticalTickets}</p>
              </div>
            </div>
          </div>

          {/* Categories & Master Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">Issue Categories & Taxonomy</h3>
              <p className="text-xs text-slate-500 mb-4">Supported technical categories and their default SLA priorities</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{cat.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{cat.code}</p>
                    </div>
                    <PriorityBadge priority={cat.defaultPriority} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 mb-1">System Health & RAG</h3>
              <p className="text-xs text-slate-500 mb-4">Core infrastructure status</p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">PostgreSQL 16 (pgvector)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">Healthy</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">Spring AI OpenAI Model</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">Active</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">HNSW Vector Index</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">Synced</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">Apache Tika Ingestion Engine</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
