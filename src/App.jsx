import React, { useState, useEffect } from 'react';

// REPLACE WITH YOUR PUBLISHED GOOGLE APPS SCRIPT WEB APP EXEC URL
const API_URL = "https://script.google.com/macros/s/AKfycbyH7i_m-wG62ir3xLvQLqH7TDH98OO6bM6cCh4Tx7OuxayGEUJUNEb8MeZSKM1yh_wFGQ/exec";

export default function App() {
  const [allTasks, setAllTasks] = useState([]);
  const [rosterList, setRosterList] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  
  // Navigation & Session States
  const [activeTab, setActiveTab] = useState('Tasks'); // 'Tasks', 'Practical', 'Missing', 'Portal'
  const [selectedTask, setSelectedTask] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Teacher Batch Grader States
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [batchSection, setBatchSection] = useState('12');
  const [batchActivityType, setBatchActivityType] = useState('Practical');
  const [batchTopic, setBatchTopic] = useState('');
  const [batchScore, setBatchScore] = useState(3);
  const [checkedStudents, setCheckedStudents] = useState({});

  // Submission States
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState({});
  const [textSubmission, setTextSubmission] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [loading, setLoading] = useState(true);

  const tg = window.Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : "Web_User";

  useEffect(() => {
    const savedName = localStorage.getItem('portal_student_name');
    if (savedName) {
      setStudentName(savedName);
      setIsNameSet(true);
    }
  }, []);

  const fetchTasksAndStats = (nameToQuery) => {
    setLoading(true);
    const targetName = nameToQuery || studentName;
    const url = targetName ? `${API_URL}?studentName=${encodeURIComponent(targetName)}` : API_URL;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAllTasks(data.tasks || []);
        setRosterList(data.rosterList || []);
        setStudentStats(data.studentStats || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchTasksAndStats();
  }, [isNameSet]);

  const handleSubmit = (finalScoreOverride = null, customSubmissionText = null) => {
    if (!selectedTask) return;
    setLoading(true);

    const isQuiz = selectedTask.type.toLowerCase().includes('quiz');
    const score = finalScoreOverride !== null ? finalScoreOverride : null;
    
    let submissionVal = customSubmissionText !== null ? customSubmissionText : textSubmission;
    if (isQuiz) {
      submissionVal = `Quiz Score Achieved: ${finalScoreOverride}%`;
    } else {
      if (groupMembers.trim()) {
        submissionVal = `${submissionVal} [Group Members: ${groupMembers.trim()}]`;
      }
    }

    const payload = {
      userId: userId,
      userName: studentName,
      taskId: selectedTask.taskId,
      taskType: selectedTask.type,
      submission: submissionVal,
      score: score
    };

    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        setTextSubmission('');
        setGroupMembers('');
        setSelectedOption(null);
        setSelectedIndexes({});
        setSelectedTask(null);
        fetchTasksAndStats(studentName);
      })
      .catch((err) => {
        console.error("Submit Error:", err);
        setLoading(false);
      });
  };

  const handleBatchSubmit = () => {
    const selectedNames = Object.keys(checkedStudents).filter(name => checkedStudents[name]);
    if (selectedNames.length === 0) {
      alert("Please select at least one student!");
      return;
    }

    setLoading(true);
    const payload = {
      isBatch: true,
      students: selectedNames,
      section: batchSection,
      activityType: batchActivityType,
      topic: batchTopic || `${batchActivityType} Session`,
      score: Number(batchScore)
    };

    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        alert(`🎉 Marks logged for ${selectedNames.length} students!`);
        setCheckedStudents({});
        setBatchTopic('');
        setLoading(false);
      })
      .catch((err) => {
        console.error("Batch Error:", err);
        setLoading(false);
      });
  };

  // 1. Teacher Batch Grader View
  if (isTeacherMode) {
    const sectionStudents = rosterList.filter(s => s.section.includes(batchSection));

    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 max-w-lg mx-auto font-sans">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-600 rounded-lg text-lg">⚡</span>
            <div>
              <h2 className="text-base font-bold">Teacher Batch Grader</h2>
              <p className="text-[10px] text-slate-400">Computer Lab & Attendance Evaluation</p>
            </div>
          </div>
          <button 
            onClick={() => setIsTeacherMode(false)}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold text-slate-300 border border-slate-700"
          >
            Exit
          </button>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-3 mb-4 text-xs backdrop-blur-md">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Target Section:</label>
            <select 
              value={batchSection} 
              onChange={(e) => setBatchSection(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
            >
              <option value="12">All Grade 12 Sections</option>
              <option value="B">Section 12-B</option>
              <option value="C">Section 12-C</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Activity Category:</label>
              <select 
                value={batchActivityType} 
                onChange={(e) => setBatchActivityType(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              >
                <option value="Practical">💻 Practical (Lab)</option>
                <option value="Participation">🙋 Participation</option>
                <option value="ClassWork">📝 ClassWork</option>
                <option value="Exam">📄 Exam</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Score Points:</label>
              <input 
                type="number" 
                value={batchScore} 
                onChange={(e) => setBatchScore(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Topic / Practical Title:</label>
            <input 
              type="text" 
              placeholder="e.g. CSS Grid Portfolio Layout" 
              value={batchTopic} 
              onChange={(e) => setBatchTopic(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Students ({sectionStudents.length})
          </span>
          <div className="space-x-3 text-xs">
            <button 
              onClick={() => {
                const all = {};
                sectionStudents.forEach(s => all[s.name] = true);
                setCheckedStudents(all);
              }}
              className="text-indigo-400 font-bold hover:underline"
            >
              Select All
            </button>
            <button 
              onClick={() => setCheckedStudents({})}
              className="text-rose-400 font-bold hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60 divide-y divide-slate-700/40 max-h-64 overflow-y-auto mb-4">
          {sectionStudents.map((st, idx) => (
            <label key={idx} className="flex items-center justify-between p-3 text-xs hover:bg-slate-700/30 cursor-pointer transition-colors">
              <span className="font-medium text-slate-200">{st.name}</span>
              <input 
                type="checkbox"
                checked={!!checkedStudents[st.name]}
                onChange={(e) => {
                  setCheckedStudents({ ...checkedStudents, [st.name]: e.target.checked });
                }}
                className="w-4 h-4 text-indigo-600 rounded border-slate-600 bg-slate-900 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>

        <button 
          onClick={handleBatchSubmit}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.99] transition-all"
        >
          Save Batch Marks Now 🚀
        </button>
      </div>
    );
  }

  // 2. Student Login Onboarding
  if (!isNameSet) {
    const filteredRoster = searchQuery.trim() === '' ? [] : rosterList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const urlParams = new URLSearchParams(window.location.search);
    const isTeacherUrl = urlParams.get('mode') === 'teacher';

    const handleTeacherAccess = () => {
      const pin = prompt("Enter Teacher Security PIN:");
      if (pin === "1234") {
        setIsTeacherMode(true);
      } else if (pin !== null) {
        alert("Incorrect PIN. Access denied.");
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 font-sans">
        <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 w-full max-w-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎨</span>
              <h2 className="text-lg font-extrabold text-slate-800">Grade 12 Web Dev</h2>
            </div>
            {isTeacherUrl && (
              <button 
                onClick={handleTeacherAccess}
                className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold border border-amber-300 shadow-sm"
              >
                🔒 Teacher
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4 font-medium">Type your official name to enter your studio portal:</p>

          <input
            type="text"
            placeholder="Search your name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedStudent(null); }}
            className="w-full p-3.5 border-2 border-slate-200 rounded-2xl text-sm bg-slate-50/50 mb-3 outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-800"
          />

          {filteredRoster.length > 0 && !selectedStudent && (
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl bg-white mb-4 divide-y divide-slate-100 shadow-inner">
              {filteredRoster.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedStudent(st); setSearchQuery(st.name); }}
                  className="w-full p-3 text-left text-xs flex justify-between items-center hover:bg-indigo-50/80 transition-colors"
                >
                  <span className="font-semibold text-slate-700">{st.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-indigo-100 text-indigo-700">Sec {st.section}</span>
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 p-3.5 rounded-2xl mb-4 text-xs">
              <span className="text-indigo-400 block text-[9px] uppercase font-bold tracking-wider">Account Found:</span>
              <span className="font-extrabold text-indigo-950 text-sm">{selectedStudent.name}</span>
            </div>
          )}

          <button
            disabled={!selectedStudent}
            onClick={() => {
              setStudentName(selectedStudent.name);
              setIsNameSet(true);
              localStorage.setItem('portal_student_name', selectedStudent.name);
              fetchTasksAndStats(selectedStudent.name);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl text-sm disabled:opacity-40 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            Launch Portal 🚀
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-400 tracking-wide">Syncing Portal Data...</p>
      </div>
    );
  }

  // 3. Selected Task Detail View (Link & Multi-Question JSON Quiz Support)
  if (selectedTask) {
    const isQuiz = selectedTask.type.toLowerCase().includes('quiz');
    
    const opts = selectedTask.options || [];
    const isMultiQuestion = opts.length > 0 && typeof opts[0] === 'object' && opts[0] !== null && 'q' in opts[0];
    const isReadyToSubmit = isQuiz 
      ? (isMultiQuestion ? Object.keys(selectedIndexes).length > 0 : selectedOption !== null)
      : textSubmission.trim().length > 0;

    return (
      <div className="min-h-screen bg-slate-100 p-4 max-w-lg mx-auto font-sans">
        <button onClick={() => { setSelectedTask(null); setSelectedOption(null); setSelectedIndexes({}); }} className="text-xs text-indigo-600 font-bold mb-3 flex items-center space-x-1">
          <span>←</span> <span>Back to Dashboard</span>
        </button>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              {selectedTask.type}
            </span>
            {selectedTask.deadline && (
              <span className="text-[10px] text-slate-400 font-medium">
                Due: {new Date(selectedTask.deadline).toLocaleDateString()}
              </span>
            )}
          </div>

          <h2 className="text-base font-extrabold text-slate-800 mb-1">{selectedTask.topic}</h2>
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">{selectedTask.prompt}</p>

          {selectedTask.status === "COMPLETED" ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center space-x-2">
              <span>✓</span> <span>Task Completed & Submitted</span>
            </div>
          ) : isQuiz ? (
            <div className="space-y-4">
              {(() => {
                const questionsList = isMultiQuestion 
                  ? opts 
                  : [{ q: selectedTask.prompt, opts: opts, ans: selectedTask.correctIndex }];

                return questionsList.map((item, qIndex) => (
                  <div key={qIndex} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-xs font-extrabold text-slate-800 mb-2">
                      {qIndex + 1}. {item.q}
                    </p>
                    <div className="space-y-2">
                      {item.opts.map((opt, oIndex) => (
                        <button
                          key={oIndex}
                          onClick={() => {
                            if (isMultiQuestion) {
                              setSelectedIndexes(prev => ({ ...prev, [qIndex]: oIndex }));
                            } else {
                              setSelectedOption(oIndex);
                            }
                          }}
                          className={`w-full p-3 text-left rounded-xl border text-xs transition-all ${
                            (isMultiQuestion ? selectedIndexes[qIndex] === oIndex : selectedOption === oIndex)
                              ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 shadow-sm' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-extrabold mr-2 text-indigo-600">{String.fromCharCode(65 + oIndex)}.</span> {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              })()}

              <button 
                disabled={!isReadyToSubmit} 
                onClick={() => {
                  const questionsList = isMultiQuestion 
                    ? opts 
                    : [{ q: selectedTask.prompt, opts: opts, ans: selectedTask.correctIndex }];

                  let correctCount = 0;
                  questionsList.forEach((item, idx) => {
                    const studentAns = isMultiQuestion ? selectedIndexes[idx] : selectedOption;
                    if (studentAns === item.ans) {
                      correctCount++;
                    }
                  });

                  const finalScorePercent = Math.round((correctCount / questionsList.length) * 100);
                  handleSubmit(finalScorePercent);
                }} 
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl disabled:opacity-40 text-xs shadow-md active:scale-[0.98] transition-all"
              >
                Submit All Quiz Answers ✨
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Link (GitHub / Vercel / Imgur Link):</label>
                  <textarea
                    rows="3"
                    value={textSubmission}
                    onChange={(e) => setTextSubmission(e.target.value)}
                    placeholder="https://github.com/... or https://vercel.app/..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Group Teammates (If group project):</label>
                  <input
                    type="text"
                    value={groupMembers}
                    onChange={(e) => setGroupMembers(e.target.value)}
                    placeholder="e.g. Chaltu Lemma, Dawit Bekele"
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
              </div>

              <button 
                disabled={!isReadyToSubmit} 
                onClick={() => handleSubmit(null, null)} 
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl disabled:opacity-40 text-xs shadow-md active:scale-[0.98] transition-all"
              >
                Submit Project Link 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4-Tab Menu Options
  const tabs = [
    { key: 'Tasks', label: '📚 All Tasks' },
    { key: 'Practical', label: '💻 Practical' },
    { key: 'Missing', label: '⚠️ Missing' },
    { key: 'Portal', label: '🎓 Gradebook' }
  ];

  // Filtering & Sorting (Pending -> Missing -> Completed)
  const statusOrder = { "PENDING": 1, "MISSING": 2, "COMPLETED": 3 };

  const filteredTasks = allTasks
    .filter(t => {
      if (activeTab === 'Tasks') return true;
      if (activeTab === 'Practical') return t.type.toLowerCase().includes('practical');
      if (activeTab === 'Missing') return t.status === 'MISSING';
      return true;
    })
    .sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));

  // 4. Main Student Dashboard View
  return (
    <div className="min-h-screen bg-slate-100 p-4 max-w-lg mx-auto font-sans pb-12">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl mb-4 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Grade 12 Web Dev</span>
            <h1 className="text-lg font-extrabold flex items-center space-x-1.5 mt-0.5">
              <span>{studentName}</span>
              <span className="text-xs">👋</span>
            </h1>
            <button 
              onClick={() => { setIsNameSet(false); localStorage.removeItem('portal_student_name'); }} 
              className="text-[10px] text-indigo-300 hover:text-white underline font-semibold mt-1 block"
            >
              Switch Account
            </button>
          </div>

          <div className="text-right bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
            <span className="text-[9px] uppercase font-extrabold text-indigo-200 block">Overall Score</span>
            <span className="text-lg font-black text-emerald-400">{studentStats?.totalScore || 0}%</span>
          </div>
        </div>
      </div>

      {/* Modern Pill Navigation Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl mb-4 text-xs font-bold backdrop-blur-sm">
        {tabs.map(tab => (
          <button 
            key={tab.key} 
            onClick={() => setActiveTab(tab.key)} 
            className={`flex-1 py-2.5 px-2 text-center rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.key 
                ? 'bg-white text-indigo-600 shadow-sm font-extrabold' 
                : tab.key === 'Missing'
                ? 'text-rose-600 hover:bg-rose-50/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'Portal' ? (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
            <span>Assessment Breakdown</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">Term Mark</span>
          </h2>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-100">
              <span className="block text-[9px] text-blue-600 font-extrabold">ClassWork (5%)</span>
              <span className="text-base font-extrabold text-blue-900">{studentStats?.classworkAvg}%</span>
            </div>
            <div className="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-100">
              <span className="block text-[9px] text-indigo-600 font-extrabold">HomeWork (5%)</span>
              <span className="text-base font-extrabold text-indigo-900">{studentStats?.homeworkAvg}%</span>
            </div>            
            <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-100">
              <span className="block text-[9px] text-blue-600 font-extrabold">Quiz (20%)</span>
              <span className="text-base font-extrabold text-blue-900">{studentStats?.quizAvg}%</span>
            </div>
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100">
              <span className="block text-[9px] text-emerald-600 font-extrabold">Practical (20%)</span>
              <span className="text-base font-extrabold text-emerald-900">{studentStats?.practicalAvg}%</span>
            </div>
            <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-100">
              <span className="block text-[9px] text-purple-600 font-extrabold">Lab Ind. Exam (10%)</span>
              <span className="text-base font-extrabold text-purple-900">{studentStats?.labIndvExamAvg}%</span>
            </div>
            <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-100">
              <span className="block text-[9px] text-purple-600 font-extrabold">Lab Gru. Exam (10%)</span>
              <span className="text-base font-extrabold text-purple-900">{studentStats?.labGruExamAvg}%</span>
            </div>
            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-100">
              <span className="block text-[9px] text-amber-600 font-extrabold">Project (20%)</span>
              <span className="text-base font-extrabold text-amber-900">{studentStats?.project}%</span>
            </div>
            <div className="bg-rose-50/80 p-3 rounded-2xl border border-rose-100">
              <span className="block text-[9px] text-rose-600 font-extrabold">Ex. Book (10%)</span>
              <span className="text-base font-extrabold text-rose-900">{studentStats?.exBook}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center">
              <span className="text-2xl block mb-2">🎉</span>
              <p className="text-xs font-bold text-slate-600">
                {activeTab === 'Missing' ? 'No missing tasks! You are all caught up.' : `No tasks found for ${activeTab}.`}
              </p>
            </div>
          ) : (
            filteredTasks.map(t => (
              <div 
                key={t.taskId} 
                onClick={() => setSelectedTask(t)} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 cursor-pointer flex justify-between items-center hover:border-indigo-400 transition-all active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t.type}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">{t.topic}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{t.prompt}</p>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  t.status === 'COMPLETED' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : t.status === 'MISSING' 
                    ? 'bg-rose-100 text-rose-800' 
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {t.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
