import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  UserCheck 
} from 'lucide-react';

const statusConfig = {
  OPEN: {
    label: 'Open',
    className: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-500/30',
    icon: AlertCircle,
    pulse: true,
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-500/30',
    icon: UserCheck,
    pulse: false,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30',
    icon: Clock,
    pulse: true,
  },
  WAITING_FOR_USER: {
    label: 'Waiting on User',
    className: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-500/30',
    icon: Clock,
    pulse: false,
  },
  ESCALATED: {
    label: 'Escalated',
    className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/30 font-bold',
    icon: ArrowUpRight,
    pulse: true,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30',
    icon: CheckCircle2,
    pulse: false,
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60',
    icon: XCircle,
    pulse: false,
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: AlertCircle,
    pulse: false,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className} transition-all`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.pulse ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
}
