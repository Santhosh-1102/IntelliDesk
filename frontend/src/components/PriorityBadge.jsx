import React from 'react';

const priorityConfig = {
  LOW: {
    label: 'Low',
    className: 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/30 shadow-sm shadow-sky-500/5',
    dot: 'bg-sky-500',
  },
  HIGH: {
    label: 'High',
    className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30 shadow-sm shadow-amber-500/5',
    dot: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/30 shadow-sm shadow-rose-500/10',
    dot: 'bg-rose-600 dark:bg-rose-500',
  },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.className} transition-all`}
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
