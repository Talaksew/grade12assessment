import React, { useState, useMemo } from 'react';
import Badge from '../common/Badge';

export default function TutorialsList({
  tutorials = [],
  onOpenInPlayground,
  isDark = true,
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(tutorials.map((t) => t.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [tutorials]);

  const filteredTutorials = useMemo(() => {
    return tutorials.filter((t) => {
      const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tutorials, selectedCategory, searchQuery]);

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Banner */}
      <div className={`p-4 rounded-3xl border ${
        isDark
          ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-slate-800 text-white'
          : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 text-slate-800'
      }`}>
        <div className="flex items-center space-x-2.5 mb-1.5">
          <span className="text-xl">📖</span>
          <h2 className="text-sm font-black tracking-tight">Essential Web Dev Tutorials</h2>
        </div>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Bite-sized syntax cheat sheets, design patterns, and code snippets ready to run in the playground.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2">
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : isDark
                  ? 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? '🌟 All Guides' : cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search tutorials (e.g. Flexbox, Grid, DOM, Fetch)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-2xl text-xs outline-none border transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
          }`}
        />
      </div>

      {/* Tutorial List */}
      <div className="space-y-3">
        {filteredTutorials.length === 0 ? (
          <div className={`p-8 rounded-3xl border text-center ${
            isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <span className="text-2xl block mb-2">🔍</span>
            <p className="text-xs font-bold">No tutorials found matching your search.</p>
          </div>
        ) : (
          filteredTutorials.map((tut) => {
            const isExpanded = expandedId === tut.id;
            return (
              <div
                key={tut.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-indigo-200 shadow-sm'
                }`}
              >
                {/* Collapsed Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : tut.id)}
                  className="p-4 cursor-pointer flex justify-between items-start space-x-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                        {tut.category}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ⏱️ {tut.readTime}
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {tut.title}
                    </h3>
                    <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {tut.summary}
                    </p>
                  </div>

                  <span className={`text-xs font-bold p-1 rounded-lg ${
                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className={`p-4 pt-0 border-t mt-1 space-y-3 ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    {tut.keyPoints && tut.keyPoints.length > 0 && (
                      <div className={`p-3 rounded-xl mt-3 ${
                        isDark ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-50 text-slate-700'
                      }`}>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1.5">
                          💡 Key Takeaways:
                        </span>
                        <ul className="text-[11px] space-y-1 list-disc list-inside">
                          {tut.keyPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tut.codeSnippet && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                            Syntax Example:
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleCopyCode(tut.id, tut.codeSnippet)}
                              className="text-slate-400 hover:text-indigo-400"
                            >
                              {copiedId === tut.id ? '✓ Copied!' : '📋 Copy'}
                            </button>
                            {onOpenInPlayground && (
                              <button
                                type="button"
                                onClick={() => onOpenInPlayground(tut)}
                                className="text-emerald-400 hover:underline font-bold"
                              >
                                🚀 Try in Playground
                              </button>
                            )}
                          </div>
                        </div>

                        <pre className={`p-3 rounded-xl font-mono text-[10px] overflow-x-auto border ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-indigo-200'
                        }`}>
                          <code>{tut.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

