import React from 'react';
import ProgressBar from '../common/ProgressBar';
import { APP_CONFIG } from '../../config/appConfig';

export default function Gradebook({ studentStats, isDark = true }) {
  const weights = APP_CONFIG.defaultAssessmentWeights;

  const formatStat = (val) => {
    if (val === null || val === undefined || val === '') return null;
    return Number(val);
  };

  return (
    <div className={`rounded-3xl p-5 shadow-xl space-y-4 backdrop-blur-xl border transition-colors ${
      isDark
        ? 'bg-slate-900/90 border-slate-800 text-white'
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold flex items-center space-x-1.5">
            <span>Assessment Breakdown</span>
          </h2>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Continuous evaluation weightings and component averages
          </p>
        </div>
        <span className={`text-[10px] border px-3 py-1 rounded-full font-black ${
          isDark
            ? 'bg-indigo-950 text-indigo-300 border-indigo-700/60'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}>
          100% Total
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {weights.map((cat) => {
          const rawVal = studentStats ? formatStat(studentStats[cat.key]) : null;
          const displayVal = rawVal !== null ? `${rawVal}%` : '--%';

          return (
            <div
              key={cat.key}
              className={`rounded-2xl p-3 flex flex-col justify-between border transition ${
                isDark
                  ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-extrabold ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {cat.label}
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-slate-700/60 text-indigo-300 border-slate-600/40'
                    : 'bg-white text-indigo-700 border-slate-200'
                }`}>
                  {cat.weight}%
                </span>
              </div>

              <div>
                <span className="text-base font-black block mb-1.5">
                  {displayVal}
                </span>
                <ProgressBar
                  value={rawVal !== null ? rawVal : 0}
                  max={100}
                  color={
                    cat.weight >= 20
                      ? 'indigo'
                      : rawVal && rawVal >= 80
                      ? 'emerald'
                      : 'purple'
                  }
                  size="sm"
                  showPercent={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`p-3 rounded-2xl text-[10px] flex items-center justify-between border ${
        isDark
          ? 'bg-slate-800/40 border-slate-700/40 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        <span>💡 Need help improving a mark?</span>
        <span className="text-indigo-500 font-bold">Contact your instructor</span>
      </div>
    </div>
  );
}
