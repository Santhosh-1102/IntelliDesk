import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { 
  Inbox, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  Search, 
  Loader2, 
  CheckCircle, 
  Play, 
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Copy,
  ExternalLink,
  X,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, MINE, UNASSIGNED, CRITICAL
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets({ page: 0, size: 100 });
      setTickets(data.content || []);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToMe = async (ticketId) => {
    try {
      await ticketService.assignTicket(ticketId, {
        engineerId: user.id,
        notes: 'Assigned via Engineer quick-action',
      });
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({
          ...prev,
          assignedEngineerId: user.id,
          assignedEngineerName: `${user.firstName} ${user.lastName}`,
          status: 'ASSIGNED',
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, {
        status: newStatus,
        comment: `Status updated to ${newStatus} by ${user.firstName} ${user.lastName}`,
      });
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const myTicketsCount = tickets.filter((t) => t.assignedEngineerId === user?.id).length;
  const unassignedCount = tickets.filter((t) => !t.assignedEngineerId).length;
  const criticalCount = tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const openCount = tickets.filter((t) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.requesterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'MINE') return t.assignedEngineerId === user?.id;
    if (filterTab === 'UNASSIGNED') return !t.assignedEngineerId;
    if (filterTab === 'CRITICAL') return t.priority === 'CRITICAL';
    return true;
  });

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
                  Support Engineering Queue
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Live Desk
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Triage open incidents, review AI diagnostic summaries, and manage SLA workflows
              </p>
            </div>

            <button
              onClick={loadTickets}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all"
            >
              ↻ Refresh Queue
            </button>
          </motion.div>

          {/* Metric KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Queue</p>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Inbox className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">{openCount}</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Requires engineer attention</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned to Me</p>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">{myTicketsCount}</p>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">Your active triage list</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unassigned</p>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-amber-600 mt-2">{unassignedCount}</p>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">Awaiting ownership</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical SLA</p>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-rose-600 mt-2">{criticalCount}</p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">Urgent work-stoppage</p>
            </div>
          </motion.div>

          {/* Ticket Queue Main Container */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
          >
            {/* Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl text-xs font-bold">
                {[
                  { key: 'ALL', label: `All Tickets (${tickets.length})` },
                  { key: 'MINE', label: `Assigned to Me (${myTicketsCount})` },
                  { key: 'UNASSIGNED', label: `Unassigned (${unassignedCount})` },
                  { key: 'CRITICAL', label: `Critical (${criticalCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all relative ${
                      filterTab === tab.key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title, ticket #, or requester..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs w-full sm:w-72 font-medium bg-slate-50/50"
                />
              </div>
            </div>

            {/* Table or Empty State */}
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <span className="text-xs font-semibold">Loading ticket queue...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-700">No tickets found</p>
                <p className="text-xs text-slate-400 mt-1">There are no tickets matching the current filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/75 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Title & AI Summary</th>
                      <th className="px-6 py-4">Requester</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Assigned Engineer</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-xs text-brand-600">
                          <div className="flex items-center gap-1.5">
                            <span>{ticket.ticketNumber}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(ticket.ticketNumber, ticket.id);
                              }}
                              className="text-slate-300 hover:text-slate-600 p-1 rounded"
                            >
                              {copiedId === ticket.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                            {ticket.categoryName || 'General IT'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 max-w-sm truncate group-hover:text-brand-600 transition-colors">
                            {ticket.title}
                          </div>
                          {ticket.aiSummary && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1 border border-purple-200/60 max-w-sm truncate">
                              <Sparkles className="w-3 h-3 text-purple-600 flex-shrink-0" />
                              <span className="truncate">{ticket.aiSummary}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-800">{ticket.requesterName}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{ticket.requesterDepartment || 'General'}</div>
                        </td>

                        <td className="px-6 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>

                        <td className="px-6 py-4 text-xs font-medium">
                          {ticket.assignedEngineerName ? (
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              {ticket.assignedEngineerName}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          {!ticket.assignedEngineerId && (
                            <button
                              onClick={() => handleAssignToMe(ticket.id)}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors border border-brand-200/60"
                            >
                              Assign to me
                            </button>
                          )}
                          {ticket.status === 'ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 border border-amber-200/60"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" /> Start
                            </button>
                          )}
                          {ticket.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 border border-emerald-200/60"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Resolve
                            </button>
                          )}
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

      {/* Slide-out Ticket Inspection Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto z-10"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-brand-600 text-sm">
                      {selectedTicket.ticketNumber}
                    </span>
                    <PriorityBadge priority={selectedTicket.priority} />
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-snug">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted by <strong className="text-slate-700">{selectedTicket.requesterName}</strong> ({selectedTicket.requesterDepartment || 'General'})
                    </p>
                  </div>

                  {/* AI Summary Box */}
                  {selectedTicket.aiSummary && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/60 border border-purple-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>AI Diagnostic Summary</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {selectedTicket.aiSummary}
                      </p>
                    </div>
                  )}

                  {/* Full Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Full Description & Diagnostic Transcripts
                    </h3>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* Metadata Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{selectedTicket.categoryName || 'General IT'}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Engineer</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">
                        {selectedTicket.assignedEngineerName || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                {!selectedTicket.assignedEngineerId && (
                  <button
                    onClick={() => handleAssignToMe(selectedTicket.id)}
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all text-center"
                  >
                    Assign to Me
                  </button>
                )}

                {selectedTicket.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Begin Troubleshooting
                  </button>
                )}

                {selectedTicket.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as Resolved
                  </button>
                )}

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
