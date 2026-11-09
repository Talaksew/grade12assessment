import React from 'react';

export default function ThemeToggle({ isDark, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`p-2 rounded-xl transition-all duration-200 border flex items-center justify-center text-xs font-bold ${
        isDark
          ? 'bg-slate-800/80 text-amber-300 border-slate-700/60 hover:bg-slate-700 hover:text-amber-200'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-indigo-600 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle color theme"
    >
      <span className="text-sm select-none transition-transform active:scale-90">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}

