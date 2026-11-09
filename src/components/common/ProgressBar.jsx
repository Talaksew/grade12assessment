import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  color = 'indigo',
  size = 'md',
  showPercent = true,
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorGradients = {
    indigo: 'from-indigo-500 to-blue-500',
    emerald: 'from-emerald-400 to-teal-500',
    rose: 'from-rose-500 to-pink-500',
    amber: 'from-amber-400 to-orange-500',
    purple: 'from-purple-500 to-indigo-500',
  }[color] || 'from-indigo-500 to-blue-500';

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size] || 'h-2.5';

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          {label && <span className="font-semibold text-slate-300">{label}</span>}
          {showPercent && (
            <span className="font-extrabold text-slate-200">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 ${heightClasses}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorGradients} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

