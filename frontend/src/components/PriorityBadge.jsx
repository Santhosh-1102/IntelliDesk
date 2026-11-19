import React from 'react';

const priorityConfig = {
  LOW: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-700 border-slate-200/80',
    dot: 'bg-slate-500',
    ring: 'ring-slate-300',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-sky-50 text-sky-800 border-sky-200/80 shadow-sm shadow-sky-500/5',
    dot: 'bg-sky-500',
    ring: 'ring-sky-300',
  },
  HIGH: {
    label: 'High',
    className: 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-sm shadow-amber-500/5',
    dot: 'bg-amber-500',
    ring: 'ring-amber-300',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-rose-50 text-rose-800 border-rose-200/80 shadow-sm shadow-rose-500/10',
    dot: 'bg-rose-600',
    ring: 'ring-rose-400',
  },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.className} transition-all`}
    >
      <span className="relative flex h-2 w-2">
        {priority === 'CRITICAL' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
}
