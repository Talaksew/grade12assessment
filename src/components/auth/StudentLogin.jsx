import React, { useState, useMemo, useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import ThemeToggle from '../common/ThemeToggle';
import { APP_CONFIG } from '../../config/appConfig';

export default function StudentLogin({
  rosterList = [],
  courseTitle = APP_CONFIG.defaultCourseTitle,
  onSelectStudent,
  onEnterTeacherMode,
  isDark = true,
  onToggleTheme,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Student PIN & Shared device states
  const [studentPin, setStudentPin] = useState('');
  const [studentPinError, setStudentPinError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false); // default unchecked for school labs

  // Hidden Teacher Mode states
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherPin, setTeacherPin] = useState('');
  const [teacherPinError, setTeacherPinError] = useState('');
  const logoClickCountRef = useRef(0);
  const logoTimerRef = useRef(null);

  // Check if URL has ?mode=teacher or ?admin=true, or keyboard shortcut (Alt+T or Ctrl+Shift+T)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'teacher' || params.get('admin') === 'true') {
      setShowTeacherModal(true);
    }

    const handleKeyDown = (e) => {
      // Secret teacher shortcut: Alt+T or Ctrl+Shift+T
      if ((e.altKey && e.key?.toLowerCase() === 't') || (e.ctrlKey && e.shiftKey && e.key?.toLowerCase() === 't')) {
        e.preventDefault();
        setShowTeacherModal(true);
        setTeacherPin('');
        setTeacherPinError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret Easter egg: tap the logo 5 times in 3 seconds to unlock hidden teacher access
  const handleSecretLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 2500);

    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      setShowTeacherModal(true);
      setTeacherPin('');
      setTeacherPinError('');
    }
  };

  // Extract all unique sections dynamically from the roster
  const availableSections = useMemo(() => {
    const set = new Set(rosterList.map((s) => s.section).filter(Boolean));
    return Array.from(set).sort();
  }, [rosterList]);

  // Filter roster by search and section
  const filteredRoster = useMemo(() => {
    return rosterList.filter((st) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        st.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection =
        selectedSectionFilter === 'ALL' || st.section === selectedSectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [rosterList, searchQuery, selectedSectionFilter]);

  const handleStudentLogin = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    // Check PIN: if student has a custom PIN in roster, check that, otherwise fallback to default PIN
    const expectedPin = selectedStudent.pin || APP_CONFIG.studentDefaultPin || '1234';
    if (studentPin.trim() === expectedPin) {
      setStudentPinError('');
      onSelectStudent(selectedStudent, rememberDevice);
    } else {
      setStudentPinError('Incorrect PIN. Please try again or ask your teacher for help.');
    }
  };

  const handleVerifyTeacherPin = (e) => {
    e.preventDefault();
    if (teacherPin.trim() === APP_CONFIG.teacherDefaultPin) {
      setTeacherPinError('');
      setShowTeacherModal(false);
      onEnterTeacherMode(teacherPin);
    } else {
      setTeacherPinError('Incorrect teacher security PIN. Access denied.');
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 font-sans transition-colors ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white'
        : 'bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 text-slate-800'
    }`}>
      {/* Absolute top right theme toggle */}
      {onToggleTheme && (
        <div className="fixed top-4 right-4 z-40">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      )}

      <div className={`p-6 rounded-3xl shadow-2xl border w-full max-w-sm backdrop-blur-2xl transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/60'
          : 'bg-white/95 border-slate-200'
      }`}>
        
        {/* App Header with Secret Easter Egg Trigger on Logo */}
        <div className="text-center mb-5">
          <button
            type="button"
            onClick={handleSecretLogoClick}
            className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25 mb-3 select-none active:scale-95 transition-transform cursor-default"
            title="Student Studio"
          >
            <span className="text-2xl">🎓</span>
          </button>
          <h1 className="text-lg font-black tracking-tight">
            {courseTitle}
          </h1>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {APP_CONFIG.defaultCourseSubtitle}
          </p>
        </div>

        {/* 100% Student View - Hidden Teacher Entry */}
        <div>
          {!selectedStudent ? (
            <>
              <p className={`text-xs font-semibold mb-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Select your name to sign in:
              </p>

              {/* Section Filter Chips */}
              {availableSections.length > 1 && (
                <div className="flex space-x-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedSectionFilter('ALL')}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      selectedSectionFilter === 'ALL'
                        ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/50'
                        : isDark
                        ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    All Sections
                  </button>
                  {availableSections.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSectionFilter(sec)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        selectedSectionFilter === sec
                          ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/50'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                      }`}
                    >
                      Sec {sec}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search name (e.g. Alex, Carlos)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-3.5 pr-8 py-3 rounded-2xl text-xs outline-none border transition-all font-medium ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Student Search List */}
              {filteredRoster.length > 0 && (
                <div className={`max-h-56 overflow-y-auto rounded-2xl mb-3 border divide-y ${
                  isDark
                    ? 'border-slate-700/60 bg-slate-800/50 divide-slate-700/40'
                    : 'border-slate-200 bg-white divide-slate-100 shadow-inner'
                }`}>
                  {filteredRoster.map((st, idx) => (
                    <button
                      key={st.id || `${st.name}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(st);
                        setStudentPin('');
                        setStudentPinError('');
                      }}
                      className={`w-full p-2.5 text-left flex items-center justify-between transition-colors ${
                        isDark ? 'hover:bg-slate-700/40' : 'hover:bg-indigo-50/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Avatar name={st.name} size="sm" />
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {st.name}
                        </span>
                      </div>
                      {st.section && <Badge variant="section" size="xs">Sec {st.section}</Badge>}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Step 2: Student PIN Verification */
            <form onSubmit={handleStudentLogin} className="space-y-4 animate-fade-in">
              <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                isDark
                  ? 'bg-indigo-950/60 border-indigo-500/40'
                  : 'bg-indigo-50 border-indigo-200'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <Avatar name={selectedStudent.name} size="md" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-indigo-400 block">
                      Student Account
                    </span>
                    <span className="text-xs font-extrabold">
                      {selectedStudent.name}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-[10px] text-indigo-500 hover:underline font-bold"
                >
                  Change
                </button>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Enter Student 4-Digit PIN:
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  value={studentPin}
                  onChange={(e) => setStudentPin(e.target.value)}
                  maxLength={6}
                  autoFocus
                  className={`w-full text-center tracking-widest text-lg py-3 rounded-2xl outline-none font-bold border transition ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'
                  }`}
                />
                {studentPinError && (
                  <p className="text-[11px] text-rose-500 font-semibold text-center mt-1">
                    {studentPinError}
                  </p>
                )}
              </div>

              {/* Shared Lab PC / Family Phone Safety Toggle */}
              <label className={`flex items-start space-x-2 cursor-pointer p-2.5 rounded-xl border ${
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <div className="text-[11px] leading-snug">
                  <span className={`font-bold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Keep me logged in on this device
                  </span>
                  <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Uncheck if on a shared school computer or family phone
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold border transition ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="py-3 px-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
                >
                  Enter Portal 🚀
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Hidden Teacher Authorization Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`p-6 rounded-3xl border w-full max-w-xs shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="text-center mb-4">
              <span className="text-3xl block mb-2">🔐</span>
              <h3 className="text-base font-bold">Teacher Authorization</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter your security PIN to access the batch grader studio
              </p>
            </div>

            <form onSubmit={handleVerifyTeacherPin} className="space-y-3">
              <input
                type="password"
                placeholder="Teacher PIN"
                value={teacherPin}
                onChange={(e) => setTeacherPin(e.target.value)}
                maxLength={8}
                autoFocus
                className={`w-full text-center tracking-widest text-lg p-3 rounded-xl outline-none font-bold border ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                }`}
              />

              {teacherPinError && (
                <p className="text-[11px] text-rose-500 text-center font-semibold">
                  {teacherPinError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
