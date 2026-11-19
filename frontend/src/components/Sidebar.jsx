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
  FileText 
} from 'lucide-react';

export default function Sidebar() {
  const { roles } = useAuth();

  const isEmployee = roles.includes('ROLE_EMPLOYEE') && !roles.includes('ROLE_SUPPORT_ENGINEER') && !roles.includes('ROLE_ADMIN');
  const isEngineer = roles.includes('ROLE_SUPPORT_ENGINEER');
  const isAdmin = roles.includes('ROLE_ADMIN');

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Employee Navigation */}
        {isEmployee && (
          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Self Service</p>
            <nav className="space-y-1">
              <NavLink to="/employee" end className={navClass}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </NavLink>
              <NavLink to="/employee/chat" className={navClass}>
                <Bot className="w-4 h-4 text-brand-600" /> AI Troubleshooter
              </NavLink>
              <NavLink to="/employee/tickets" className={navClass}>
                <Ticket className="w-4 h-4" /> My Tickets
              </NavLink>
            </nav>
          </div>
        )}

        {/* Engineer Navigation */}
        {(isEngineer || isAdmin) && (
          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Support Desk</p>
            <nav className="space-y-1">
              <NavLink to="/engineer" end className={navClass}>
                <Inbox className="w-4 h-4" /> Support Queue
              </NavLink>
              <NavLink to="/engineer/chat" className={navClass}>
                <Bot className="w-4 h-4 text-brand-600" /> AI Diagnostic Assistant
              </NavLink>
              <NavLink to="/knowledge" className={navClass}>
                <BookOpen className="w-4 h-4" /> Knowledge Base
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Administration</p>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={navClass}>
                <BarChart3 className="w-4 h-4 text-purple-600" /> Analytics & SLA
              </NavLink>
              <NavLink to="/admin/documents" className={navClass}>
                <FileText className="w-4 h-4" /> Knowledge Ingestion
              </NavLink>
              <NavLink to="/admin/users" className={navClass}>
                <Users className="w-4 h-4" /> User Management
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs font-semibold text-slate-700">IntelliDesk Enterprise</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Version 1.0 • Spring AI + pgvector</p>
      </div>
    </aside>
  );
}
