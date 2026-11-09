import React from 'react';
import Avatar from '../common/Avatar';
import ProgressBar from '../common/ProgressBar';
import ThemeToggle from '../common/ThemeToggle';
import { APP_CONFIG } from '../../config/appConfig';

export default function HeaderCard({
  studentName,
  totalScore,
  courseTitle = APP_CONFIG.defaultCourseTitle,
  onSwitchAccount,
  onOpenChangePin,
  isDark = true,
  onToggleTheme,
}) {
  const scoreNum = typeof totalScore === 'number' ? totalScore : 0;
  const displayScore = totalScore !== undefined && totalScore !== null ? `${totalScore}%` : '--%';

  const getScoreRating = (val) => {
    if (val >= 90) return { text: 'Outstanding 🌟', color: 'text-emerald-400', bar: 'emerald' };
    if (val >= 75) return { text: 'Proficient 🚀', color: 'text-indigo-300', bar: 'indigo' };
    if (val >= 60) return { text: 'Progressing 📈', color: 'text-amber-300', bar: 'amber' };
    return { text: 'Needs Attention ⚠️', color: 'text-rose-400', bar: 'rose' };
  };

  const rating = getScoreRating(scoreNum);

  return (
    <div className={`rounded-3xl p-5 shadow-xl mb-4 relative overflow-hidden backdrop-blur-xl border transition-all ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-slate-800 text-white'
        : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border-indigo-500 text-white shadow-indigo-500/20'
    }`}>
      {/* Background radial glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <Avatar name={studentName} size="lg" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">
                {courseTitle}
              </span>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center space-x-1.5 mt-0.5">
                <span>{studentName}</span>
              </h1>
              
              <div className="flex items-center space-x-2 mt-1 text-[10px]">
                <button
                  type="button"
                  onClick={onSwitchAccount}
                  className="text-indigo-200 hover:text-white underline font-semibold transition-colors"
                >
                  Switch Account
                </button>
                <span className="text-indigo-300">•</span>
                <button
                  type="button"
                  onClick={onOpenChangePin}
                  className="text-amber-300 hover:text-amber-200 font-bold flex items-center space-x-1 transition-colors"
                >
                  <span>🔑</span> <span>Change PIN</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            )}

            {/* Score Box */}
            <div className="text-right bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
              <span className="text-[9px] uppercase font-extrabold text-indigo-200 block">
                Cumulative
              </span>
              <span className="text-lg font-black text-emerald-400 leading-tight block">
                {displayScore}
              </span>
              <span className={`text-[9px] font-bold block ${rating.color}`}>
                {rating.text}
              </span>
            </div>
          </div>
        </div>

        {/* Linear progress display */}
        <div className="pt-2 border-t border-white/10">
          <ProgressBar
            value={scoreNum}
            max={100}
            label="Term Standing"
            color={rating.bar}
            size="sm"
            showPercent={false}
          />
        </div>
      </div>
    </div>
  );
}
