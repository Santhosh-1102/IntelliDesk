import React from 'react';

const priorityConfig = {
  LOW: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  HIGH: {
    label: 'High',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500 animate-pulse',
  },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
