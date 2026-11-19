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
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: AlertCircle,
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: UserCheck,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  WAITING_FOR_USER: {
    label: 'Waiting on User',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Clock,
  },
  ESCALATED: {
    label: 'Escalated',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ArrowUpRight,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle,
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
