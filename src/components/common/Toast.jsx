import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white shadow-emerald-900/30',
    error: 'bg-rose-600 text-white shadow-rose-900/30',
    info: 'bg-indigo-600 text-white shadow-indigo-900/30',
  }[type] || 'bg-slate-800 text-white shadow-slate-900/30';

  const icons = {
    success: '🎉',
    error: '⚠️',
    info: 'ℹ️',
  }[type] || '📢';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm transition-all animate-bounce-in">
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md ${bgStyles}`}>
        <div className="flex items-center space-x-2.5">
          <span className="text-base">{icons}</span>
          <p className="text-xs font-bold leading-snug">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-white/80 hover:text-white text-xs font-bold p-1"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
