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
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
    icon: AlertCircle,
    pulse: true,
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-purple-50 text-purple-700 border-purple-200/80',
    icon: UserCheck,
    pulse: false,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: Clock,
    pulse: true,
  },
  WAITING_FOR_USER: {
    label: 'Waiting on User',
    className: 'bg-orange-50 text-orange-700 border-orange-200/80',
    icon: Clock,
    pulse: false,
  },
  ESCALATED: {
    label: 'Escalated',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold',
    icon: ArrowUpRight,
    pulse: true,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: CheckCircle2,
    pulse: false,
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle,
    pulse: false,
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
    pulse: false,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className} transition-all`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.pulse ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
}
