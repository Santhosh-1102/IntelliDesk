import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Headset, 
  Shield, 
  Bot, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Inbox, 
  Play, 
  Users, 
  Sparkles, 
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';

export default function InteractiveRolePreview() {
  const [activeRole, setActiveRole] = useState('EMPLOYEE'); // EMPLOYEE, ENGINEER, ADMIN

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Role Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <button
            onClick={() => setActiveRole('EMPLOYEE')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeRole === 'EMPLOYEE'
                ? 'bg-white dark:bg-[#070b14] text-cyan-600 dark:text-cyan-400 shadow-md shadow-cyan-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Employee Experience</span>
          </button>

          <button
            onClick={() => setActiveRole('ENGINEER')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeRole === 'ENGINEER'
                ? 'bg-white dark:bg-[#070b14] text-violet-600 dark:text-violet-400 shadow-md shadow-violet-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Headset className="w-4 h-4" />
            <span>IT Engineer Cockpit</span>
          </button>

          <button
            onClick={() => setActiveRole('ADMIN')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeRole === 'ADMIN'
                ? 'bg-white dark:bg-[#070b14] text-purple-600 dark:text-purple-400 shadow-md shadow-purple-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Executive Governance</span>
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <AnimatePresence mode="wait">
        {activeRole === 'EMPLOYEE' && (
          <motion.div
            key="employee-preview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">
                  Role: Standard Employee
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Conversational Self-Service & Issue Tracking
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Employees get instant 24/7 technical answers or submit prioritized tickets with 1 click.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
              >
                Explore Employee Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Simulated Live UI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-500/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">AI Troubleshooter</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Step-by-step diagnostic dialogs grounded in SOP manuals.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">Live SLA Tracking</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time updates as engineers triage and resolve tickets.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">CSAT Feedback Loops</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rate resolution quality to constantly train and improve the SOPs.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeRole === 'ENGINEER' && (
          <motion.div
            key="engineer-preview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">
                  Role: IT Support Engineer
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  High-Velocity Triage Cockpit & AI Pre-Summaries
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Engineers review full diagnostic chat transcripts, root cause hypotheses, and one-click actions.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all self-start sm:self-auto"
              >
                Explore Support Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Simulated Live Queue Row */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">#TCK-202611-001</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800">
                    CRITICAL SLA (14m remaining)
                  </span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">Kubernetes Dev Cluster Pod Eviction Loop</p>
                <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                  🤖 AI Summary: Root volume reached 98% inode saturation. Suggested fix: Prune dangling containerd layers.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-xs">
                  Assign to Me
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {activeRole === 'ADMIN' && (
          <motion.div
            key="admin-preview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">
                  Role: Administrator
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Real-Time Telemetry & Vector Store Health
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Monitor SLA adherence rates, AI deflection efficiency, and knowledge base vector ingestion.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
              >
                Explore Admin Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <p className="text-2xl font-black text-cyan-500">52.4%</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">AI Deflection</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <p className="text-2xl font-black text-emerald-500">99.2%</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">SLA Adherence</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <p className="text-2xl font-black text-violet-500">18ms</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">HNSW Cosine Latency</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <p className="text-2xl font-black text-amber-500">100%</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Audit Trail</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
