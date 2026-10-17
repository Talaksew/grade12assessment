import React, { useState, useEffect } from 'react';

// REPLACE WITH YOUR GOOGLE APPS SCRIPT WEB APP EXEC URL
const API_URL = "https://script.google.com/macros/s/AKfycbztZ-yAk4q5NF_O7Te8HkHjM2Kscje8luvIrr7Pwaqm0_HvRuDfEM5p0m_A-nGQnwBpYA/exec";

export default function App() {
  const [data, setData] = useState({ activeMode: '', tasks: [] });
  const [studentName, setStudentName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [codeSubmission, setCodeSubmission] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Initialize Telegram WebApp SDK
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Auto-fill student name if available via Telegram
    if (tgUser && tgUser.first_name) {
      const fullName = `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
      setStudentName(fullName);
      setIsNameSet(true);
    }

    fetch(API_URL)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  const currentTask = data.tasks && data.tasks[currentIndex];

  const handleSubmit = (submissionValue, score = null) => {
    setLoading(true);
    
    const payload = {
      userId: tgUser?.id ? String(tgUser.id) : "Web_User",
      userName: studentName || "Anonymous Student",
      taskType: data.activeMode,
      topic: currentTask?.topic || "General",
      submission: submissionValue,
      score: score
    };

    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        setLoading(false);
        setSelectedOption(null);
        setCodeSubmission('');

        // If there are more questions, go to the next question
        if (currentIndex + 1 < data.tasks.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // All questions finished
          setSubmitted(true);
        }
      })
      .catch((err) => {
        console.error("Submission Error:", err);
        setLoading(false);
      });
  };

  // 1. Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Assessment Data...</p>
      </div>
    );
  }

  // 2. Student Name Registration Screen (If opening via Web / Browser)
  if (!isNameSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 max-w-lg mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to Assessment Portal</h2>
          <p className="text-sm text-gray-600 mb-4">Please enter your full name before starting:</p>
          <input
            type="text"
            placeholder="e.g. Abebe Kebede"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            disabled={!studentName.trim()}
            onClick={() => setIsNameSet(true)}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  // 3. Final Submission Complete Screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">All Tasks Completed!</h2>
        <p className="text-gray-600">Great job, {studentName}! Your answers have been recorded in the gradebook.</p>
      </div>
    );
  }

  // 4. Empty Task Guard
  if (!data.tasks || data.tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-700">No Active Tasks</h2>
        <p className="text-gray-500 mt-2">
          There are currently no items assigned for mode: <strong>{data.activeMode}</strong>.
        </p>
      </div>
    );
  }

  const activeModeNormalized = String(data.activeMode).trim().toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
      {/* Header Banner */}
      <header className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
            {data.activeMode} Mode
          </span>
          <span className="text-xs font-medium text-gray-500">
            Task {currentIndex + 1} of {data.tasks.length}
          </span>
        </div>
        <h1 className="text-lg font-bold text-gray-800">{currentTask.topic}</h1>
        <small className="text-xs text-gray-400">Student: {studentName}</small>
      </header>

      {/* Task Card */}
      <main className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-800 font-medium mb-6 text-base leading-relaxed">
          {currentTask.prompt}
        </p>

        {/* QUIZ / HOMEWORK MODE (Multiple Choice) */}
        {(activeModeNormalized === 'quiz' || activeModeNormalized === 'homework') && (
          <div className="space-y-3">
            {currentTask.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-3.5 text-left rounded-lg border text-sm transition-all ${
                  selectedOption === idx
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
              </button>
            ))}

            <button
              disabled={selectedOption === null}
              onClick={() => {
                const isCorrect = selectedOption === currentTask.correctIndex;
                handleSubmit(`Option: ${selectedOption}`, isCorrect ? 100 : 0);
              }}
              className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all"
            >
              {currentIndex + 1 < data.tasks.length ? "Submit & Next Question →" : "Submit & Finish Quiz"}
            </button>
          </div>
        )}

        {/* ASSIGNMENT MODE (HTML/CSS Code Editor) */}
        {activeModeNormalized === 'assignment' && (
          <div className="space-y-4">
            <textarea
              rows="8"
              value={codeSubmission}
              onChange={(e) => setCodeSubmission(e.target.value)}
              placeholder="<!-- Write or paste your HTML/CSS code snippet here -->"
              className="w-full p-3 font-mono text-xs bg-gray-900 text-green-400 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              disabled={!codeSubmission.trim()}
              onClick={() => handleSubmit(codeSubmission)}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all"
            >
              {currentIndex + 1 < data.tasks.length ? "Submit & Next Task →" : "Submit Assignment"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
