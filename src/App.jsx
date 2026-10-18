import React, { useState, useEffect } from 'react';

// REPLACE WITH YOUR PUBLISHED GOOGLE APPS SCRIPT WEB APP EXEC URL
const API_URL = "https://script.google.com/macros/s/AKfycbxL938suJ_y69vkVJc1UV_TfE6expOM8zw-OPeZKmFSTc8LvCam3Xpk2vXTnp0tVnZS-A/exec";

export default function App() {
  const [allTasks, setAllTasks] = useState([]);
  const [rosterList, setRosterList] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  
  // Navigation & Session States
  const [activeTab, setActiveTab] = useState('Quiz'); 
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

  // Form Inputs
  const [selectedOption, setSelectedOption] = useState(null);
  const [textSubmission, setTextSubmission] = useState('');
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

  const handleSubmit = () => {
    if (!selectedTask) return;
    setLoading(true);

    const isQuiz = selectedTask.type.toLowerCase().includes('quiz');
    const isCorrect = selectedOption === selectedTask.correctIndex;
    const score = isQuiz ? (isCorrect ? 100 : 0) : null;
    const submissionVal = isQuiz ? `Selected Option: ${selectedOption}` : textSubmission;

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
        setSelectedOption(null);
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
        alert(`Successfully logged marks for ${selectedNames.length} students!`);
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
      <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-gray-800">⚡ Teacher Batch Grader</h2>
          <button 
            onClick={() => setIsTeacherMode(false)}
            className="text-xs bg-gray-200 px-3 py-1 rounded-lg font-bold text-gray-700"
          >
            Exit to Portal
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3 mb-4 text-xs">
          <div>
            <label className="block font-bold text-gray-600 mb-1">Section:</label>
            <select 
              value={batchSection} 
              onChange={(e) => setBatchSection(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 font-bold"
            >
              <option value="12">All / Section 12</option>
              <option value="A">Section 12-A</option>
              <option value="B">Section 12-B</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-gray-600 mb-1">Activity Type:</label>
              <select 
                value={batchActivityType} 
                onChange={(e) => setBatchActivityType(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50"
              >
                <option value="Practical">Practical (Lab)</option>
                <option value="Participation">Participation</option>
                <option value="ClassWork">ClassWork</option>
                <option value="Exam">Exam</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-1">Score / Points:</label>
              <input 
                type="number" 
                value={batchScore} 
                onChange={(e) => setBatchScore(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1">Topic / Exercise Name:</label>
            <input 
              type="text" 
              placeholder="e.g. Flexbox Navbar Layout" 
              value={batchTopic} 
              onChange={(e) => setBatchTopic(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-xs font-bold text-gray-500 uppercase">
            Select Students ({sectionStudents.length} available)
          </span>
          <div className="space-x-2">
            <button 
              onClick={() => {
                const all = {};
                sectionStudents.forEach(s => all[s.name] = true);
                setCheckedStudents(all);
              }}
              className="text-[10px] text-blue-600 font-bold underline"
            >
              Select All
            </button>
            <button 
              onClick={() => setCheckedStudents({})}
              className="text-[10px] text-red-600 font-bold underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border divide-y max-h-64 overflow-y-auto mb-4">
          {sectionStudents.map((st, idx) => (
            <label key={idx} className="flex items-center justify-between p-3 text-xs hover:bg-blue-50 cursor-pointer">
              <span className="font-medium text-gray-800">{st.name}</span>
              <input 
                type="checkbox"
                checked={!!checkedStudents[st.name]}
                onChange={(e) => {
                  setCheckedStudents({ ...checkedStudents, [st.name]: e.target.checked });
                }}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>

        <button 
          onClick={handleBatchSubmit}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-green-700 transition-colors"
        >
          Save Grades for Selected Students
        </button>
      </div>
    );
  }

  // 2. Student Login Onboarding
  if (!isNameSet) {
    const filteredRoster = searchQuery.trim() === '' ? [] : rosterList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-sm border w-full max-w-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800">Grade 12 Portal Login</h2>
            <button 
              onClick={() => setIsTeacherMode(true)}
              className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-200"
            >
              ⚙️ Teacher Mode
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Search and select your official name:</p>

          <input
            type="text"
            placeholder="Type your name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedStudent(null); }}
            className="w-full p-3 border rounded-lg text-sm bg-gray-50 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {filteredRoster.length > 0 && !selectedStudent && (
            <div className="max-h-48 overflow-y-auto border rounded-lg bg-white mb-4 divide-y">
              {filteredRoster.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedStudent(st); setSearchQuery(st.name); }}
                  className="w-full p-3 text-left text-xs flex justify-between items-center hover:bg-blue-50"
                >
                  <span className="font-medium">{st.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">Sec {st.section}</span>
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-xs">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Selected Student:</span>
              <span className="font-bold text-blue-900 text-sm">{selectedStudent.name}</span>
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
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-gray-600">Loading Portal...</p>
      </div>
    );
  }

  // 3. Selected Task Detail View
  if (selectedTask) {
    const isQuiz = selectedTask.type.toLowerCase().includes('quiz');

    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
        <button onClick={() => setSelectedTask(null)} className="text-xs text-blue-600 font-bold mb-4">← Back</button>
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">{selectedTask.type}</span>
          <h2 className="text-lg font-bold text-gray-800 mt-2 mb-4">{selectedTask.prompt}</h2>

          {selectedTask.status === "COMPLETED" ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center text-xs text-green-800 font-bold">
              ✓ Task Already Submitted
            </div>
          ) : isQuiz ? (
            <div className="space-y-2">
              {selectedTask.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full p-3 text-left rounded-lg border text-sm ${selectedOption === idx ? 'border-blue-500 bg-blue-50 font-medium' : 'border-gray-200'}`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                </button>
              ))}
              <button disabled={selectedOption === null} onClick={handleSubmit} className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50">
                Submit Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows="6"
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                placeholder="Paste your GitHub URL, Vercel deployment link, or project notes here..."
                className="w-full p-3 text-xs bg-gray-50 rounded-lg border focus:outline-none"
              />
              <button disabled={!textSubmission.trim()} onClick={handleSubmit} className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50">
                Submit Assignment / Project Link
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const tabs = ['Quiz', 'ClassWork', 'Practical', 'Exam', 'Assignment', 'Portal'];
  const filteredTasks = allTasks.filter(t => activeTab === 'Portal' || t.type.toLowerCase().includes(activeTab.toLowerCase()));

  // 4. Main Student Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Grade 12 Portal</h1>
          <p className="text-xs text-gray-500">
            Student: <span className="font-bold text-gray-700">{studentName}</span> 
            <button onClick={() => { setIsNameSet(false); localStorage.removeItem('portal_student_name'); }} className="text-[10px] text-blue-600 underline ml-1">(Switch)</button>
          </p>
        </div>
        {studentStats && (
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Total Grade</span>
            <span className="text-base font-extrabold text-blue-600">{studentStats.totalScore}%</span>
          </div>
        )}
      </header>

      <div className="flex bg-gray-200 p-1 rounded-xl mb-4 text-[10px] font-semibold overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-2 text-center rounded-lg whitespace-nowrap ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
            {tab === 'Portal' ? '🎓 Grades' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'Portal' ? (
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
          <h2 className="text-base font-bold text-gray-800">Assessment Breakdown</h2>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-blue-50 p-2 rounded border"><span className="block text-[9px] text-blue-600 font-bold">Quiz (15%)</span><span className="text-sm font-bold">{studentStats?.quizAvg}%</span></div>
            <div className="bg-indigo-50 p-2 rounded border"><span className="block text-[9px] text-indigo-600 font-bold">ClassWork (10%)</span><span className="text-sm font-bold">{studentStats?.classworkAvg}%</span></div>
            <div className="bg-green-50 p-2 rounded border"><span className="block text-[9px] text-green-600 font-bold">Practical (25%)</span><span className="text-sm font-bold">{studentStats?.practicalAvg}%</span></div>
            <div className="bg-purple-50 p-2 rounded border"><span className="block text-[9px] text-purple-600 font-bold">Exam (30%)</span><span className="text-sm font-bold">{studentStats?.examAvg}%</span></div>
            <div className="bg-amber-50 p-2 rounded border"><span className="block text-[9px] text-amber-600 font-bold">Assign (15%)</span><span className="text-sm font-bold">{studentStats?.assignmentAvg}%</span></div>
            <div className="bg-rose-50 p-2 rounded border"><span className="block text-[9px] text-rose-600 font-bold">H/W (5%)</span><span className="text-sm font-bold">{studentStats?.homeworkAvg}%</span></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-8">No tasks found for {activeTab}.</p>
          ) : (
            filteredTasks.map(t => (
              <div key={t.taskId} onClick={() => setSelectedTask(t)} className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer flex justify-between items-center hover:border-blue-300">
                <div>
                  <span className="text-xs font-bold text-gray-700 block">{t.topic}</span>
                  <span className="text-xs text-gray-400 line-clamp-1">{t.prompt}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{t.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
