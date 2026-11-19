import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import CreateTicketModal from './CreateTicketModal';
import { 
  Bot, 
  Plus, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowRight, 
  Loader2, 
  Zap,
  Sparkles
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getMyTickets(0, 50);
      setTickets(data.content || []);
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_USER'].includes(t.status)).length;
  const resolvedTickets = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-hidden">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Welcome, {user?.firstName}!
                </h1>
                <span className="text-xl">👋</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {user?.department} Team • AI-assisted IT support and incident resolution
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Report Issue
            </button>
          </motion.div>

          {/* AI Troubleshooter Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-cyan-600 via-brand-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-cyan-500/15 relative overflow-hidden"
          >
            <div className="max-w-xl relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Instant Technical Diagnostics
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Need technical help right now?</h2>
              <p className="text-sm text-cyan-50 leading-relaxed font-medium">
                Chat with our AI diagnostic assistant before filing a ticket. It analyzes verified internal SOPs to troubleshoot VPN, Wi-Fi, Outlook, and system errors in seconds.
              </p>
              <div className="pt-2">
                <Link
                  to="/employee/chat"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-black text-sm hover:bg-slate-50 shadow-md transition-all hover:scale-105"
                >
                  Start Diagnostic Chat <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-15 pointer-events-none">
              <Bot className="w-72 h-72 text-white animate-pulse" />
            </div>
          </motion.div>

          {/* Metric KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="bg-white dark:bg-[#0d1322] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Ticket className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="text-emerald-500 font-bold">Lifetime</span> support activity
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress / Open</p>
                  <p className="text-3xl font-black text-amber-500 mt-1">{openTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                Active investigation with IT engineers
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Tickets</p>
                  <p className="text-3xl font-black text-emerald-500 mt-1">{resolvedTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Successfully closed with root cause
              </div>
            </div>
          </motion.div>

          {/* Tickets Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#0d1322] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Support Incidents</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time status updates and engineer notes</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs w-full sm:w-60 transition-all font-medium"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-cyan-500" />
                <span className="text-xs font-semibold">Loading support tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <Ticket className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No support tickets found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  When you report an issue or escalate an AI troubleshooting conversation, your ticket will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Ticket #</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">
                          {ticket.ticketNumber}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 dark:text-white block max-w-sm truncate">
                            {ticket.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {ticket.categoryName || 'General'}
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={loadTickets}
      />
    </div>
  );
}
