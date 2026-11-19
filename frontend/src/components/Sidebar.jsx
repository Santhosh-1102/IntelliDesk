import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        ? 'bg-gradient-to-r from-brand-50 to-indigo-50/50 text-brand-700 shadow-sm border border-brand-200/60'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
    }`;

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Employee Navigation */}
        {isEmployee && (
          <div>
            <p className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Self Service
            </p>
            <nav className="space-y-1">
              <NavLink to="/employee" end className={navClass}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
                  <span>Dashboard</span>
                </div>
              </NavLink>
              <NavLink to="/employee/chat" className={navClass}>
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-brand-600" />
                  <span>AI Troubleshooter</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-brand-100 text-brand-700 rounded-md">
                  AI
                </span>
              </NavLink>
              <NavLink to="/employee/tickets" className={navClass}>
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
                  <span>My Tickets</span>
                </div>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Engineer Navigation */}
        {(isEngineer || isAdmin) && (
          <div>
            <p className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              IT Support Desk
            </p>
            <nav className="space-y-1">
              <NavLink to="/engineer" end className={navClass}>
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  <span>Support Queue</span>
                </div>
              </NavLink>
              <NavLink to="/engineer/chat" className={navClass}>
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-brand-600" />
                  <span>Diagnostic Assistant</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 rounded-md">
                  RAG
                </span>
              </NavLink>
              <NavLink to="/knowledge" className={navClass}>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  <span>Knowledge Base</span>
                </div>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <p className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Administration & Governance
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={navClass}>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Analytics & SLA</span>
                </div>
              </NavLink>
              <NavLink to="/admin/documents" className={navClass}>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500 group-hover:text-purple-600 transition-colors" />
                  <span>Knowledge Ingestion</span>
                </div>
              </NavLink>
              <NavLink to="/admin/users" className={navClass}>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-500 group-hover:text-purple-600 transition-colors" />
                  <span>User Management</span>
                </div>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* System Status Card */}
      <div className="p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-slate-800">Engine Online</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">v1.0</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Spring AI • pgvector HNSW</p>
      </div>
    </aside>
  );
}
