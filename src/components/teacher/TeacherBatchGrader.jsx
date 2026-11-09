import React, { useState, useMemo } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export default function TeacherBatchGrader({
  rosterList = [],
  teacherPin,
  onExit,
  onSubmitBatch,
  isSubmitting,
  isDark = true,
}) {
  const [batchSection, setBatchSection] = useState('ALL');
  const [batchActivityType, setBatchActivityType] = useState('Practical');
  const [batchTopic, setBatchTopic] = useState('');
  const [batchScore, setBatchScore] = useState(3);
  const [studentSearch, setStudentSearch] = useState('');
  const [checkedStudents, setCheckedStudents] = useState({});

  // Dynamically extract unique sections from the roster
  const availableSections = useMemo(() => {
    const set = new Set(rosterList.map((s) => s.section).filter(Boolean));
    return Array.from(set).sort();
  }, [rosterList]);

  // Filter students by section & search text
  const sectionStudents = useMemo(() => {
    return rosterList.filter((s) => {
      const matchSec = batchSection === 'ALL' || s.section === batchSection;
      const matchSearch =
        studentSearch.trim() === '' ||
        s.name.toLowerCase().includes(studentSearch.toLowerCase());
      return matchSec && matchSearch;
    });
  }, [rosterList, batchSection, studentSearch]);

  const selectedCount = Object.values(checkedStudents).filter(Boolean).length;

  const handleSelectAll = () => {
    const all = { ...checkedStudents };
    sectionStudents.forEach((s) => {
      all[s.name] = true;
    });
    setCheckedStudents(all);
  };

  const handleClearAll = () => {
    setCheckedStudents({});
  };

  const handleToggleStudent = (name) => {
    setCheckedStudents((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const quickScores = [1, 2, 3, 5, 10];

  const handleSubmit = () => {
    const selectedNames = Object.keys(checkedStudents).filter(
      (name) => checkedStudents[name]
    );

    if (selectedNames.length === 0) return;

    onSubmitBatch({
      students: selectedNames,
      section: batchSection,
      activityType: batchActivityType,
      topic: batchTopic,
      score: batchScore,
      teacherPin,
      onSuccess: () => {
        setCheckedStudents({});
        setBatchTopic('');
      },
    });
  };

  return (
    <div className={`min-h-screen p-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto font-sans animate-fade-in pb-12 transition-colors ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20 text-white">
            <span className="text-base">⚡</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold">Teacher Batch Grader</h2>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Bulk Lab Marks, Classwork & Attendance
            </p>
          </div>
        </div>
        <button
          onClick={onExit}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
          }`}
        >
          Exit Grader
        </button>
      </div>

      {/* Grader Form Controls */}
      <div className={`p-4 rounded-3xl space-y-3 mb-4 text-xs border backdrop-blur-xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Dynamic Target Section */}
        <div>
          <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Target Section:
          </label>
          <select
            value={batchSection}
            onChange={(e) => {
              setBatchSection(e.target.value);
              setCheckedStudents({});
            }}
            className={`w-full p-2.5 rounded-xl font-bold outline-none border transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
            }`}
          >
            <option value="ALL">All Sections (Entire Roster)</option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Category:
            </label>
            <select
              value={batchActivityType}
              onChange={(e) => setBatchActivityType(e.target.value)}
              className={`w-full p-2.5 rounded-xl outline-none border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
            >
              <option value="Practical">💻 Practical (Lab)</option>
              <option value="Participation">🙋 Participation</option>
              <option value="ClassWork">📝 ClassWork</option>
              <option value="Exam">📄 Exam</option>
            </select>
          </div>
          <div>
            <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Score Points:
            </label>
            <input
              type="number"
              value={batchScore}
              onChange={(e) => setBatchScore(e.target.value)}
              className={`w-full p-2.5 rounded-xl font-bold outline-none border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Quick point chips */}
        <div className="flex items-center space-x-1.5">
          <span className={`text-[10px] font-semibold mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Quick points:
          </span>
          {quickScores.map((scoreVal) => (
            <button
              key={scoreVal}
              type="button"
              onClick={() => setBatchScore(scoreVal)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                Number(batchScore) === scoreVal
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              +{scoreVal}
            </button>
          ))}
        </div>

        <div>
          <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Topic / Activity Title:
          </label>
          <input
            type="text"
            placeholder="e.g. CSS Grid Portfolio Layout"
            value={batchTopic}
            onChange={(e) => setBatchTopic(e.target.value)}
            className={`w-full p-2.5 rounded-xl outline-none border transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* Student List Toolbar */}
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Students ({sectionStudents.length})
          {selectedCount > 0 && ` • ${selectedCount} selected`}
        </span>
        <div className="space-x-3 text-xs">
          <button
            onClick={handleSelectAll}
            className="text-indigo-500 font-bold hover:underline"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="text-rose-500 font-bold hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Student live filter input */}
      <input
        type="text"
        placeholder="Filter student list..."
        value={studentSearch}
        onChange={(e) => setStudentSearch(e.target.value)}
        className={`w-full px-3 py-2 rounded-xl text-xs outline-none mb-2 border transition ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
            : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
        }`}
      />

      {/* Student Multi-Select Cards */}
      <div className={`rounded-2xl border divide-y max-h-64 overflow-y-auto mb-4 ${
        isDark
          ? 'bg-slate-900/70 border-slate-800 divide-slate-800/80'
          : 'bg-white border-slate-200 divide-slate-100 shadow-inner'
      }`}>
        {sectionStudents.map((st, idx) => {
          const isChecked = !!checkedStudents[st.name];
          return (
            <label
              key={st.id || `${st.name}-${idx}`}
              className={`flex items-center justify-between p-2.5 text-xs cursor-pointer transition ${
                isChecked
                  ? isDark ? 'bg-indigo-950/40' : 'bg-indigo-50/80'
                  : isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Avatar name={st.name} size="sm" />
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {st.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {st.section && <Badge variant="section" size="xs">Sec {st.section}</Badge>}
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleStudent(st.name)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 focus:ring-indigo-500"
                />
              </div>
            </label>
          );
        })}
      </div>

      <button
        disabled={selectedCount === 0 || isSubmitting}
        onClick={handleSubmit}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-900/30 active:scale-[0.99] disabled:opacity-40 transition-all"
      >
        {isSubmitting
          ? 'Logging Marks to Sheet...'
          : selectedCount === 0
          ? 'Select at least one student'
          : `Log Marks for ${selectedCount} Student${selectedCount > 1 ? 's' : ''} 🚀`}
      </button>
    </div>
  );
}
