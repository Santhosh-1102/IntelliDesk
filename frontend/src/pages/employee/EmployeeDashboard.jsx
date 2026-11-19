import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Loader2 
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          {/* Welcome & Actions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Report technical problems, track support requests, or get instant AI troubleshooting
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Report Issue
            </button>
          </div>

          {/* AI Troubleshooter Banner */}
          <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/15 relative overflow-hidden">
            <div className="max-w-xl relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                <Bot className="w-3.5 h-3.5" /> Instant AI Support Assistant
              </div>
              <h2 className="text-2xl font-bold">Have a technical problem?</h2>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Before submitting a ticket, chat with our AI Troubleshooter. It searches company SOPs to guide you through quick fixes for VPN, Wi-Fi, Outlook, and system errors in seconds.
              </p>
              <div className="pt-2">
                <Link
                  to="/employee/chat"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-indigo-50 shadow-md transition-all hover:translate-x-0.5"
                >
                  Start Diagnostic Chat <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
              <Bot className="w-72 h-72 text-white" />
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalTickets}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress / Open</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{openTickets}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{resolvedTickets}</p>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Support Tickets</h3>
                <p className="text-xs text-slate-500">Track status and review engineer comments</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs w-full sm:w-60"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                <span className="text-xs">Loading tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Ticket className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No support tickets found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you report an issue or escalate an AI troubleshooting conversation, it will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Ticket #</th>
                      <th className="px-6 py-3.5">Subject</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Priority</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-brand-600">
                          {ticket.ticketNumber}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">
                          {ticket.title}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {ticket.categoryName || 'General'}
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
