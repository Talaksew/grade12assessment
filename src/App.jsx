import React, { useState, useEffect } from 'react';

// REPLACE WITH YOUR PUBLISHED GOOGLE APPS SCRIPT WEB APP EXEC URL
const API_URL = "https://script.google.com/macros/s/AKfycbxL938suJ_y69vkVJc1UV_TfE6expOM8zw-OPeZKmFSTc8LvCam3Xpk2vXTnp0tVnZS-A/exec";

export default function App() {
  const [allTasks, setAllTasks] = useState([]);
  const [rosterList, setRosterList] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  
  // Navigation & Session States
  const [activeTab, setActiveTab] = useState('Quiz'); // Quiz, Assignment, Homework, Missing, Portal
  const [selectedTask, setSelectedTask] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form Inputs
  const [selectedOption, setSelectedOption] = useState(null);
  const [codeSubmission, setCodeSubmission] = useState('');
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;
  const userId = tgUser?.id ? String(tgUser.id) : "Web_User";

  // Load saved session if returning on same device
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
    const url = targetName 
      ? `${API_URL}?studentName=${encodeURIComponent(targetName)}`
      : API_URL;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAllTasks(data.tasks || []);
        setRosterList(data.rosterList || []);
        setStudentStats(data.studentStats || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Fetch Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
    fetchTasksAndStats();
  }, [isNameSet]);

  // Draft local storage
  useEffect(() => {
    if (selectedTask) {
      const savedCode = localStorage.getItem(`draft_${selectedTask.taskId}`);
      if (savedCode) setCodeSubmission(savedCode);
    }
  }, [selectedTask]);

  const handleCodeChange = (val) => {
    setCodeSubmission(val);
    if (selectedTask) localStorage.setItem(`draft_${selectedTask.taskId}`, val);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File size limit is 10MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileData({ fileName: file.name, mimeType: file.type, fileBase64: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!selectedTask) return;
    setLoading(true);

    const isQuiz = selectedTask.type.toLowerCase() === 'quiz';
    const isCorrect = selectedOption === selectedTask.correctIndex;
    const score = isQuiz ? (isCorrect ? 100 : 0) : null;

    // Use file name if uploaded, otherwise use code text
    const submissionVal = isQuiz 
      ? `Selected Option: ${selectedOption}` 
      : (fileData ? `Uploaded File: ${fileData.fileName}` : codeSubmission);

    const payload = {
      userId: userId,
      userName: studentName,
      taskId: selectedTask.taskId,
      taskType: selectedTask.type,
      submission: submissionVal,
      score: score,
      fileBase64: fileData ? fileData.fileBase64 : null,
      fileName: fileData ? fileData.fileName : null,
      mimeType: fileData ? fileData.mimeType : null
    };

    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        if (selectedTask) localStorage.removeItem(`draft_${selectedTask.taskId}`);
        setFileData(null);
        setCodeSubmission('');
        setSelectedOption(null);
        setSelectedTask(null);
        fetchTasksAndStats(studentName);
      })
      .catch((err) => {
        console.error("Submission Error:", err);
        setLoading(false);
      });
  };

  // Client-Side Syntax Check for Assignments
  const validateCode = (code) => {
    const checks = [];
    if (!code.includes('<') || !code.includes('>')) checks.push("Missing HTML tags.");
    if (selectedTask?.prompt.toLowerCase().includes("flex") && !code.includes("flex")) {
      checks.push("Task mentions Flexbox, but 'flex' property was not found in CSS.");
    }
    return checks;
  };

  // 1. Session Onboarding (Search Roster Autocomplete)
  if (!isNameSet) {
    const filteredRoster = searchQuery.trim() === ''
      ? []
      : rosterList.filter(student =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-sm border w-full max-w-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Grade 12 Portal Login</h2>
          <p className="text-xs text-gray-500 mb-4">Search and select your official name to begin:</p>

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Type your name (e.g. Abebe)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedStudent(null);
              }}
              className="w-full p-3 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {filteredRoster.length > 0 && !selectedStudent && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white mb-4 shadow-inner divide-y">
              {filteredRoster.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedStudent(st);
                    setSearchQuery(st.name);
                  }}
                  className="w-full p-3 text-left text-xs flex justify-between items-center hover:bg-blue-50 text-gray-800 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{st.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                    Section {st.section}
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-xs">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Selected Student:</span>
              <span className="font-bold text-blue-900 text-sm block">{selectedStudent.name}</span>
              <span className="text-blue-700">Section: {selectedStudent.section}</span>
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
            Continue as {selectedStudent ? selectedStudent.name.split(' ')[0] : 'Student'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-medium text-gray-600">Loading Assessment Portal...</p>
      </div>
    );
  }

  // 2. Selected Task Screen
  if (selectedTask) {
    const codeWarnings = selectedTask.type.toLowerCase() === 'assignment' ? validateCode(codeSubmission) : [];

    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
        <button
          onClick={() => setSelectedTask(null)}
          className="text-xs text-blue-600 font-bold mb-4 inline-block"
        >
          ← Back to Task Dashboard
        </button>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
            {selectedTask.type} • {selectedTask.topic}
          </span>
          <h2 className="text-lg font-bold text-gray-800 mt-2 mb-4">{selectedTask.prompt}</h2>

          {selectedTask.status === "COMPLETED" ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <span className="text-2xl">✓</span>
              <h3 className="font-bold text-green-800 mt-1">Already Submitted</h3>
              <p className="text-xs text-green-700 mt-1">
                {selectedTask.previousSubmission
                  ? `Logged Record: ${selectedTask.previousSubmission.submission}`
                  : "Your response is securely stored in the gradebook."}
              </p>
            </div>
          ) : (
            <div>
              {(selectedTask.type.toLowerCase() === 'quiz' || selectedTask.type.toLowerCase() === 'homework') && (
                <div className="space-y-2">
                  {selectedTask.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-3 text-left rounded-lg border text-sm ${
                        selectedOption === idx ? 'border-blue-500 bg-blue-50 font-medium' : 'border-gray-200'
                      }`}
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                    </button>
                  ))}
                  <button
                    disabled={selectedOption === null}
                    onClick={handleSubmit}
                    className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50"
                  >
                    Submit Response
                  </button>
                </div>
              )}

              {selectedTask.type.toLowerCase() === 'assignment' && (() => {
                const assignType = String(selectedTask.assignmentType || 'code').trim().toLowerCase();
                const isReadyToSubmit = assignType === 'code' ? codeSubmission.trim().length > 0 : fileData !== null;

                return (
                  <div className="space-y-3">
                    {assignType === 'code' ? (
                      <div>
                        <textarea
                          rows="8"
                          value={codeSubmission}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          placeholder="<!-- Write or paste your HTML/CSS code snippet here -->"
                          className="w-full p-3 font-mono text-xs bg-gray-900 text-green-400 rounded-lg border focus:outline-none"
                        />
                        {codeWarnings.map((w, i) => (
                          <p key={i} className="text-xs text-amber-600 font-semibold mt-1">⚠️ {w}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center bg-gray-50">
                        <input
                          type="file"
                          accept={assignType === 'pdf' ? '.pdf' : 'image/*'}
                          onChange={handleFileUpload}
                          className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {fileData && (
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-xs font-bold">
                            ✓ Selected: {fileData.fileName}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      disabled={!isReadyToSubmit}
                      onClick={handleSubmit}
                      className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg disabled:opacity
