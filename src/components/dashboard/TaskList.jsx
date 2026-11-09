import React, { useState } from 'react';
import Badge from '../common/Badge';

export default function TaskList({
  tasks = [],
  activeTab,
  onSelectTask,
  isDark = true,
}) {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    return (
      t.topic?.toLowerCase().includes(query) ||
      t.prompt?.toLowerCase().includes(query) ||
      t.type?.toLowerCase().includes(query)
    );
  });

  const getRelativeDue = (deadlineStr) => {
    if (!deadlineStr) return null;
    try {
      const deadline = new Date(deadlineStr);
      const diffMs = deadline - new Date();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { label: 'Overdue', isLate: true };
      if (diffDays === 0) return { label: 'Due today', isLate: false };
      if (diffDays === 1) return { label: 'Due tomorrow', isLate: false };
      return { label: `Due in ${diffDays} days`, isLate: false };
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {tasks.length > 3 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Filter tasks by topic..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-2xl text-xs outline-none border transition-all font-medium ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
            }`}
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className={`rounded-3xl p-8 text-center border backdrop-blur-xl ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <span className="text-3xl block mb-2">🎉</span>
          <h3 className="text-sm font-bold">
            {activeTab === 'Missing'
              ? 'No Missing Tasks!'
              : `No Tasks Found in ${activeTab}`}
          </h3>
          <p className={`text-xs mt-1 max-w-xs mx-auto ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {activeTab === 'Missing'
              ? 'You are completely caught up with all assignments, labs, and quizzes.'
              : 'Tasks assigned to this section will appear here automatically.'}
          </p>
        </div>
      ) : (
        filteredTasks.map((t) => {
          const dueInfo = getRelativeDue(t.deadline);
          const isComplete = t.status === 'COMPLETED';
          const isMissing = t.status === 'MISSING';

          let cardStyle = isDark
            ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 text-white shadow-md'
            : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-900 shadow-sm';

          if (isComplete) {
            cardStyle = isDark
              ? 'bg-slate-900/50 border-slate-800/80 hover:border-emerald-500/40 text-slate-300'
              : 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300 text-slate-700';
          } else if (isMissing) {
            cardStyle = isDark
              ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/50 text-white'
              : 'bg-rose-50/50 border-rose-200 hover:border-rose-400 text-slate-900';
          }

          return (
            <div
              key={t.taskId}
              onClick={() => onSelectTask(t)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex justify-between items-center group active:scale-[0.99] ${cardStyle}`}
            >
              <div className="pr-3 flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                  <Badge variant={t.type?.toLowerCase() || 'default'} size="xs">
                    {t.type}
                  </Badge>
                  {dueInfo && !isComplete && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        dueInfo.isLate
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {dueInfo.label}
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold group-hover:text-indigo-400 transition-colors truncate">
                  {t.topic}
                </h3>
                <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t.prompt}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Badge
                  variant={
                    isComplete
                      ? 'completed'
                      : isMissing
                      ? 'missing'
                      : 'pending'
                  }
                  size="sm"
                >
                  {t.status}
                </Badge>
                <span className={`text-sm font-bold transition-transform group-hover:translate-x-0.5 ${
                  isDark ? 'text-slate-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'
                }`}>
                  →
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
