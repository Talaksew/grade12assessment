import React from 'react';

export default function Badge({ variant = 'default', children, size = 'sm', icon = null }) {
  const sizeClasses = {
    xs: 'text-[9px] px-2 py-0.5',
    sm: 'text-[10px] px-2.5 py-1',
    md: 'text-xs px-3 py-1.5',
  }[size] || 'text-[10px] px-2.5 py-1';

  const vKey = variant.toLowerCase().replace(/\s+/g, '');

  const variantClasses = {
    // Task Statuses
    completed: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
    pending: 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30',
    missing: 'bg-rose-500/15 text-rose-500 border border-rose-500/30',
    
    // Task Types
    quiz: 'bg-sky-500/15 text-sky-500 border border-sky-500/30',
    practical: 'bg-violet-500/15 text-violet-500 border border-violet-500/30',
    codinglab: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
    coding: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
    exam: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
    classwork: 'bg-blue-500/15 text-blue-500 border border-blue-500/30',
    
    // Neutrals
    default: 'bg-slate-500/15 text-slate-500 border border-slate-500/30',
    section: 'bg-indigo-600/15 text-indigo-500 border border-indigo-500/30',
    teacher: 'bg-amber-500/15 text-amber-500 border border-amber-500/40',
  }[vKey] || 'bg-slate-500/15 text-slate-500 border border-slate-500/30';

  const defaultIcons = {
    completed: '✓',
    pending: '⏳',
    missing: '⚠️',
    quiz: '📝',
    practical: '💻',
    codinglab: '⚡',
    coding: '⚡',
    exam: '📄',
    teacher: '🔒',
  };

  const activeIcon = icon !== null ? icon : defaultIcons[vKey] || null;

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm ${sizeClasses} ${variantClasses}`}
    >
      {activeIcon && <span className="text-[10px]">{activeIcon}</span>}
      <span>{children}</span>
    </span>
  );
}
