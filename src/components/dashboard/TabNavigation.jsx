import React from 'react';

export default function TabNavigation({
  activeTab,
  onTabChange,
  missingCount = 0,
  isDark = true,
}) {
  const tabs = [
    { key: 'Tasks', label: 'Tasks', icon: '📚' },
    { key: 'Practical', label: 'Labs', icon: '💻' },
    { key: 'Sandbox', label: 'Code Lab', icon: '⚡' },
    { key: 'Tutorials', label: 'Learn', icon: '📖' },
    { 
      key: 'Missing', 
      label: 'Missing', 
      icon: '⚠️', 
      badge: missingCount > 0 ? missingCount : null 
    },
    { key: 'Portal', label: 'Gradebook', icon: '🎓' },
  ];

  return (
    <div className={`flex p-1 rounded-2xl mb-4 text-xs font-bold shadow-md border overflow-x-auto scrollbar-none transition-colors ${
      isDark
        ? 'bg-slate-900/90 border-slate-800'
        : 'bg-white border-slate-200'
    }`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const isMissingTab = tab.key === 'Missing';

        let buttonStyle = isDark
          ? 'text-slate-400 hover:text-slate-200'
          : 'text-slate-600 hover:text-slate-900';

        if (isActive) {
          buttonStyle = 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30';
        } else if (isMissingTab && tab.badge) {
          buttonStyle = isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-700';
        }

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 min-w-[70px] py-2 px-1 text-center rounded-xl whitespace-nowrap transition-all duration-200 flex items-center justify-center space-x-1 ${buttonStyle}`}
          >
            <span className="text-[11px]">{tab.icon}</span>
            <span className="text-[11px] font-bold">{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.2 text-[9px] rounded-full bg-rose-500 text-white font-extrabold animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
