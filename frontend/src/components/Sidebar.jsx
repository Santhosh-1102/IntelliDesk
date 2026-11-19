import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Bot, 
  Ticket, 
  Inbox, 
  BookOpen, 
  BarChart3, 
  Users, 
  FileText,
  Activity,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { roles } = useAuth();

  const isEmployee = roles.includes('ROLE_EMPLOYEE') && !roles.includes('ROLE_SUPPORT_ENGINEER') && !roles.includes('ROLE_ADMIN');
  const isEngineer = roles.includes('ROLE_SUPPORT_ENGINEER');
  const isAdmin = roles.includes('ROLE_ADMIN');

  const navClass = ({ isActive }) =>
    `group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all relative ${
      isActive
        ? 'bg-gradient-to-r from-brand-50 to-cyan-50/50 dark:from-brand-950/60 dark:to-cyan-950/30 text-brand-700 dark:text-cyan-300 shadow-sm border border-brand-200/60 dark:border-cyan-500/30'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border border-transparent'
    }`;

  return (
    <aside className="w-64 bg-white/70 dark:bg-[#070b14]/75 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex transition-colors duration-300">
      <div className="space-y-6">
        {/* Employee Navigation */}
        {isEmployee && (
          <div>
            <p className="px-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Self Service
            </p>
            <nav className="space-y-1">
              <NavLink to="/employee" end className={navClass}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors" />
                  <span>Dashboard</span>
                </div>
              </NavLink>
              <NavLink to="/employee/chat" className={navClass}>
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-cyan-500" />
                  <span>AI Troubleshooter</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-brand-100 dark:bg-cyan-950/80 text-brand-700 dark:text-cyan-300 border border-brand-200/50 dark:border-cyan-500/30 rounded-md">
                  AI
                </span>
              </NavLink>
              <NavLink to="/employee/tickets" className={navClass}>
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors" />
                  <span>My Tickets</span>
                </div>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Engineer Navigation */}
        {(isEngineer || isAdmin) && (
          <div>
            <p className="px-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              IT Support Desk
            </p>
            <nav className="space-y-1">
              <NavLink to="/engineer" end className={navClass}>
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 transition-colors" />
                  <span>Support Queue</span>
                </div>
              </NavLink>
              <NavLink to="/engineer/chat" className={navClass}>
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-cyan-500" />
                  <span>Diagnostic Assistant</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/30 rounded-md">
                  RAG
                </span>
              </NavLink>
              <NavLink to="/knowledge" className={navClass}>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 transition-colors" />
                  <span>Knowledge Base</span>
                </div>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <p className="px-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Administration & Governance
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={navClass}>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-violet-500" />
                  <span>Analytics & SLA</span>
                </div>
              </NavLink>
              <NavLink to="/admin/documents" className={navClass}>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-violet-500 transition-colors" />
                  <span>Knowledge Ingestion</span>
                </div>
              </NavLink>
              <NavLink to="/admin/users" className={navClass}>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-violet-500 transition-colors" />
                  <span>User Management</span>
                </div>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* System Status Card */}
      <div className="p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-900/80 dark:to-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Engine Online</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">v1.0</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Spring AI • pgvector HNSW</p>
      </div>
    </aside>
  );
}
