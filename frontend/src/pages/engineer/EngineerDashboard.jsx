import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import MarkdownMessage from '../../components/MarkdownMessage';
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
  Check,
  Copy,
  X,
  Hourglass,
  Activity,
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

  const formatSlaCountdown = (slaDeadline) => {
    if (!slaDeadline) return null;
    const deadline = new Date(slaDeadline).getTime();
    const now = Date.now();
    const diffMinutes = Math.round((deadline - now) / 60000);
    if (diffMinutes <= 0) return { text: 'SLA Breached', breached: true };
    if (diffMinutes < 60) return { text: `${diffMinutes}m left`, breached: false };
    const diffHours = (diffMinutes / 60).toFixed(1);
    return { text: `${diffHours}h left`, breached: false };
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
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Support Engineering Queue
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  Live Operations
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Triage open incidents, review AI diagnostic summaries, and manage SLA workflows
              </p>
            </div>

            <button
              onClick={loadTickets}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition-all"
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
            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Queue</p>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Inbox className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{openCount}</p>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold mt-1">Requires engineer attention</p>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned to Me</p>
                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{myTicketsCount}</p>
              <p className="text-[11px] text-violet-600 dark:text-violet-400 font-bold mt-1">Your active triage list</p>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unassigned</p>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-amber-500 mt-2">{unassignedCount}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">Awaiting ownership</p>
            </div>

            <div className="bg-white dark:bg-[#0d1322] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical SLA</p>
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-rose-500 mt-2">{criticalCount}</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">Urgent work-stoppage</p>
            </div>
          </motion.div>

          {/* Ticket Queue Main Container */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#0d1322] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
          >
            {/* Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl text-xs font-bold">
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
                        ? 'bg-white dark:bg-[#070b14] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title, ticket #, or requester..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs w-full sm:w-72 font-medium"
                />
              </div>
            </div>

            {/* Table or Empty State */}
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="text-xs font-semibold">Loading ticket queue...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tickets found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">There are no tickets matching the current filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/75 dark:bg-slate-900/60 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">
                          <div className="flex items-center gap-1.5">
                            <span>{ticket.ticketNumber}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(ticket.ticketNumber, ticket.id);
                              }}
                              className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded"
                            >
                              {copiedId === ticket.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block mt-0.5">
                            {ticket.categoryName || 'General IT'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white max-w-sm truncate group-hover:text-cyan-500 transition-colors">
                            {ticket.title}
                          </div>
                          {ticket.aiSummary && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md mt-1 border border-violet-200/60 dark:border-violet-500/30 max-w-sm truncate">
                              <Sparkles className="w-3 h-3 text-violet-500 flex-shrink-0" />
                              <span className="truncate">{ticket.aiSummary}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{ticket.requesterName}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{ticket.requesterDepartment || 'General'}</div>
                        </td>

                        <td className="px-6 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>

                        <td className="px-6 py-4 text-xs font-medium">
                          {ticket.assignedEngineerName ? (
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              {ticket.assignedEngineerName}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          {!ticket.assignedEngineerId && (
                            <button
                              onClick={() => handleAssignToMe(ticket.id)}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors border border-cyan-200/60 dark:border-cyan-500/30"
                            >
                              Assign to me
                            </button>
                          )}
                          {ticket.status === 'ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors inline-flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-500/30"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" /> Start
                            </button>
                          )}
                          {ticket.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors inline-flex items-center gap-1.5 border border-emerald-200/60 dark:border-emerald-500/30"
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
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0d1322] h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto z-10"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">
                      {selectedTicket.ticketNumber}
                    </span>
                    <PriorityBadge priority={selectedTicket.priority} />
                    <StatusBadge status={selectedTicket.status} />
                    {selectedTicket.slaDeadline && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        formatSlaCountdown(selectedTicket.slaDeadline)?.breached
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>SLA: {formatSlaCountdown(selectedTicket.slaDeadline)?.text}</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Submitted by <strong className="text-slate-700 dark:text-slate-300">{selectedTicket.requesterName}</strong> ({selectedTicket.requesterDepartment || 'General'})
                    </p>
                  </div>

                  {/* AI Diagnostic Handover Card */}
                  {(selectedTicket.aiSummary || selectedTicket.rootCause || selectedTicket.sourceConversationId) && (
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-50/90 via-cyan-50/40 to-slate-50 dark:from-violet-950/40 dark:via-cyan-950/20 dark:to-slate-900/60 border border-violet-200/80 dark:border-violet-500/30 space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-violet-700 dark:text-cyan-300 font-extrabold text-xs tracking-wider uppercase">
                          <Sparkles className="w-4 h-4 text-violet-500" />
                          <span>AI Diagnostic Handover Package</span>
                        </div>
                        {selectedTicket.sourceConversationId && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                            Session #{selectedTicket.sourceConversationId}
                          </span>
                        )}
                      </div>

                      {selectedTicket.rootCause && (
                        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-500" />
                            <span>Root Cause Hypothesis</span>
                          </p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {selectedTicket.rootCause}
                          </p>
                        </div>
                      )}

                      {selectedTicket.aiSummary && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Executive Summary
                          </p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {selectedTicket.aiSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Full Description & Markdown Transcripts */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Diagnostic Handover & Action Plan
                    </h3>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <MarkdownMessage content={selectedTicket.description} />
                    </div>
                  </div>

                  {/* Metadata Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Category</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedTicket.categoryName || 'General IT'}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Assigned Engineer</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {selectedTicket.assignedEngineerName || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                {!selectedTicket.assignedEngineerId && (
                  <button
                    onClick={() => handleAssignToMe(selectedTicket.id)}
                    className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all text-center"
                  >
                    Assign to Me
                  </button>
                )}

                {selectedTicket.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Begin Troubleshooting
                  </button>
                )}

                {selectedTicket.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as Resolved
                  </button>
                )}

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
