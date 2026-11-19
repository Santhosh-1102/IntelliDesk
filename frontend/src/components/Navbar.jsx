import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Shield, Headset, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, roles, logout } = useAuth();

  const getRoleBadge = () => {
    if (roles.includes('ROLE_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-sm shadow-purple-500/10">
          <Shield className="w-3.5 h-3.5 text-purple-600" /> Admin
        </span>
      );
    }
    if (roles.includes('ROLE_SUPPORT_ENGINEER')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm shadow-blue-500/10">
          <Headset className="w-3.5 h-3.5 text-blue-600" /> IT Engineer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm shadow-emerald-500/10">
        <User className="w-3.5 h-3.5 text-emerald-600" /> Employee
      </span>
    );
  };

  const getDashboardHome = () => {
    if (roles.includes('ROLE_ADMIN')) return '/admin';
    if (roles.includes('ROLE_SUPPORT_ENGINEER')) return '/engineer';
    return '/employee';
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={getDashboardHome()} className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25"
          >
            <Sparkles className="w-5 h-5 text-brand-100" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Intelli<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Desk</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                ITSM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
              AI-Powered IT Support Platform
            </p>
          </div>
        </Link>

        {/* Right Section / Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-sm font-bold text-slate-800 leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  {getRoleBadge()}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{user.department || user.email}</p>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-700 font-black text-sm shadow-sm ring-2 ring-white">
                {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                title="Log out of IntelliDesk"
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
