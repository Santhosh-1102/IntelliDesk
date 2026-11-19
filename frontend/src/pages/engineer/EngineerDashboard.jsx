import React, { useState, useEffect } from 'react';
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
  Play 
} from 'lucide-react';

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, MINE, UNASSIGNED, CRITICAL
  const [searchQuery, setSearchQuery] = useState('');

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
      loadTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, {
        status: newStatus,
        comment: `Status updated to ${newStatus} by engineer`,
      });
      loadTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    }
  };

  const myTicketsCount = tickets.filter((t) => t.assignedEngineerId === user?.id).length;
  const unassignedCount = tickets.filter((t) => !t.assignedEngineerId).length;
  const criticalCount = tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const openCount = tickets.filter((t) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.requesterName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'MINE') return t.assignedEngineerId === user?.id;
    if (filterTab === 'UNASSIGNED') return !t.assignedEngineerId;
    if (filterTab === 'CRITICAL') return t.priority === 'CRITICAL';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Support Engineer Queue
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Triage open incidents, review diagnostic transcripts, and assign tickets
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Queue</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{openCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned to Me</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{myTicketsCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unassigned</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{unassignedCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Priority</p>
                <p className="text-2xl font-bold text-rose-600 mt-0.5">{criticalCount}</p>
              </div>
            </div>
          </div>

          {/* Tickets Queue Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter Tabs and Search */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilterTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Tickets ({tickets.length})
                </button>
                <button
                  onClick={() => setFilterTab('MINE')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === 'MINE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Assigned to Me ({myTicketsCount})
                </button>
                <button
                  onClick={() => setFilterTab('UNASSIGNED')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === 'UNASSIGNED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unassigned ({unassignedCount})
                </button>
                <button
                  onClick={() => setFilterTab('CRITICAL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === 'CRITICAL' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Critical ({criticalCount})
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title, ticket #, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs w-full sm:w-72"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                <span className="text-xs">Loading queue...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">No tickets found in this view</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Ticket #</th>
                      <th className="px-6 py-3.5">Issue Title</th>
                      <th className="px-6 py-3.5">Requester</th>
                      <th className="px-6 py-3.5">Priority</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Assigned To</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-brand-600">
                          {ticket.ticketNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 max-w-xs truncate">{ticket.title}</div>
                          {ticket.aiSummary && (
                            <div className="text-[11px] text-purple-600 font-medium truncate max-w-xs mt-0.5">
                              🤖 AI Summary: {ticket.aiSummary}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-800">{ticket.requesterName}</div>
                          <div className="text-[11px] text-slate-400">{ticket.requesterDepartment}</div>
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">
                          {ticket.assignedEngineerName ? (
                            <span className="text-slate-800 font-semibold">{ticket.assignedEngineerName}</span>
                          ) : (
                            <span className="text-amber-600 font-bold">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {!ticket.assignedEngineerId && (
                            <button
                              onClick={() => handleAssignToMe(ticket.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                            >
                              Assign to me
                            </button>
                          )}
                          {ticket.status === 'ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" /> Start
                            </button>
                          )}
                          {ticket.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> Resolve
                            </button>
                          )}
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
    </div>
  );
}
