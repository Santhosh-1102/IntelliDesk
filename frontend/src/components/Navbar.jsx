import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Shield, Headset } from 'lucide-react';

export default function Navbar() {
  const { user, roles, logout } = useAuth();

  const getRoleBadge = () => {
    if (roles.includes('ROLE_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (roles.includes('ROLE_SUPPORT_ENGINEER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <Headset className="w-3 h-3" /> Engineer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <User className="w-3 h-3" /> Employee
      </span>
    );
  };

  const getDashboardHome = () => {
    if (roles.includes('ROLE_ADMIN')) return '/admin';
    if (roles.includes('ROLE_SUPPORT_ENGINEER')) return '/engineer';
    return '/employee';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={getDashboardHome()} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">Intelli<span className="text-brand-600">Desk</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">ITSM</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-1 hidden sm:block">AI-Powered IT Support</p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-sm font-semibold text-slate-800 leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  {getRoleBadge()}
                </div>
                <p className="text-xs text-slate-400 mt-1">{user.department || user.email}</p>
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
