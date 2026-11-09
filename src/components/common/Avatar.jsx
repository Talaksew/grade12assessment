import React from 'react';

const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-amber-400 to-orange-600',
  'from-cyan-400 to-blue-600',
  'from-violet-500 to-fuchsia-600',
];

export default function Avatar({ name = 'User', size = 'md', className = '' }) {
  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getGradient = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs font-bold',
    lg: 'w-12 h-12 text-sm font-extrabold',
    xl: 'w-16 h-16 text-lg font-black',
  }[size] || 'w-10 h-10 text-xs font-bold';

  const initials = getInitials(name);
  const gradient = getGradient(name);

  return (
    <div
      className={`rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${gradient} ${sizeClasses} ${className}`}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
}

