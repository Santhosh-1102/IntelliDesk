import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Sparkles, LogOut, User, Shield, Headset } from 'lucide-react';

export default function Navbar() {
  const { user, roles, logout } = useAuth();

  const getRoleBadge = () => {
    if (roles.includes('ROLE_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30 shadow-sm shadow-purple-500/10">
          <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Admin
        </span>
      );
    }
    if (roles.includes('ROLE_SUPPORT_ENGINEER')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-500/30 shadow-sm shadow-cyan-500/10">
          <Headset className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> IT Engineer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/10">
        <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Employee
      </span>
    );
  };

  const getDashboardHome = () => {
    if (roles.includes('ROLE_ADMIN')) return '/admin';
    if (roles.includes('ROLE_SUPPORT_ENGINEER')) return '/engineer';
    return '/employee';
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/80 dark:bg-[#070b14]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={getDashboardHome()} className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-brand-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Intelli<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-400 to-violet-400">Desk</span>
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/30">
                ITSM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5 hidden sm:block">
              AI-Powered Technical Support Platform
            </p>
          </div>
        </Link>

        {/* Right Section / Theme Toggle & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-3 pl-2 sm:border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  {getRoleBadge()}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{user.department || user.email}</p>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-300/80 dark:border-slate-600/80 flex items-center justify-center text-slate-700 dark:text-slate-200 font-black text-sm shadow-sm ring-2 ring-white dark:ring-slate-900">
                {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                title="Log out of IntelliDesk"
                className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
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
