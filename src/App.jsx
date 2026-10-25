import React, { useState, useEffect } from 'react';

// Replace with your actual deployed Google Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz04rx-lJ4ZYyEfzSfyrhSehlhEaKAgF84PMDr_qvm9YeClDTKgxEgjxt2hxL3grivBew/exec";

export default function App() {
  const [currentView, setCurrentView] = useState('portal'); // 'portal', 'quizzes', 'submit'
  const [currentUser, setCurrentUser] = useState('');
  const [roster, setRoster] = useState([]);
  const [studentStats, setStudentStats] = useState({
    totalScore: 0,
    classworkAvg: 0,
    homeworkAvg: 0,
    quizAvg: 0,
    practicalAvg: 0,
    labIndvExamAvg: 0,
    labGruExamAvg: 0,
    project: 0,
    exBook: 0
  });
  const [completedTasks, setCompletedTasks] = useState({});
  const [loading, setLoading] = useState(false);

  // Quiz Interaction States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Practical / General Submission States
  const [taskId, setTaskId] = useState('PRAC_01');
  const [taskType, setTaskType] = useState('Practical');
  const [submissionLink, setSubmissionLink] = useState('');
  const [selectedPeers, setSelectedPeers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Sample Roster & User Initialization
  useEffect(() => {
    const sampleRoster = [
      "Abebe Kebede",
      "Chaltu Lemma",
      "Dawit Tadesse",
      "Edom Mekonnen",
      "Fasil Yohannes"
    ];
    setRoster(sampleRoster);
    setCurrentUser(sampleRoster[0]);
  }, []);

  // Fetch live student stats and completed tasks from Google Sheets backend
  const fetchStudentData = () => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`${WEB_APP_URL}?studentName=${encodeURIComponent(currentUser)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setStudentStats(data.studentStats);
          setCompletedTasks(data.completedTasks);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching student data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStudentData();
  }, [currentUser]);

  // Sample Quiz Bank (Supports multi-question JSON quiz structures)
  const availableQuizzes = [
    {
      id: "QUIZ_HTML_01",
      title: "HTML & CSS Fundamentals Quiz",
      questions: [
        { id: 1, q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlinks and Text Markup System"], answer: 0 },
        { id: 2, q: "Which CSS property changes text color?", options: ["font-style", "color", "text-color"], answer: 1 }
      ]
    }
  ];

  // Handle Quiz Option Selection
  const handleOptionSelect = (qId, optionIdx) => {
    setQuizAnswers({ ...quizAnswers, [qId]: optionIdx });
  };

  // Grade & Submit Interactive Quiz
  const handleQuizSubmit = (quiz) => {
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.answer) correctCount++;
    });
    const calculatedPercentage = (correctCount / quiz.questions.length) * 100;
    setQuizScore(calculatedPercentage);
    setQuizSubmitted(true);

    // Send to backend
    const payload = {
      userId: "TG_" + currentUser.replace(/\s+/g, '_'),
      userName: currentUser,
      taskId: quiz.id,
      taskType: "Quiz",
      submission: `Score: ${correctCount}/${quiz.questions.length}`,
      score: calculatedPercentage
    };

    fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => fetchStudentData());
  };

  // Handle Peer Toggle for Group Work
  const handlePeerToggle = (name) => {
    if (selectedPeers.includes(name)) {
      setSelectedPeers(selectedPeers.filter(p => p !== name));
    } else {
      setSelectedPeers([...selectedPeers, name]);
    }
  };

  // Handle Practical / Task Submission Post
  const handleSubmitTask = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');

    const groupMembers = taskType === 'Practical' ? Array.from(new Set([currentUser, ...selectedPeers])) : null;

    const payload = {
      userId: "TG_" + currentUser.replace(/\s+/g, '_'),
      userName: currentUser,
      taskId: taskId,
      taskType: taskType,
      submission: submissionLink,
      score: 0, // Pending teacher review
      groupMembers: groupMembers
    };

    fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.status === 'success') {
          setFeedback('Task submitted successfully!');
          setSubmissionLink('');
          setSelectedPeers([]);
          fetchStudentData();
        } else {
          setFeedback('Submission failed: ' + data.message);
        }
      })
      .catch(() => {
        setSubmitting(false);
        setFeedback('Error submitting assignment. Try again.');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 max-w-md mx-auto font-sans">
      {/* Header & Active Student Selector */}
      <header className="bg-blue-600 text-white p-4 rounded-xl shadow-md mb-4">
        <h1 className="text-xl font-bold">Grade 12 Web Design Portal</h1>
        <div className="mt-2">
          <label className="text-xs uppercase tracking-wider text-blue-200 block mb-1">Active Student:</label>
          <select 
            value={currentUser} 
            onChange={(e) => setCurrentUser(e.target.value)}
            className="w-full p-2 bg-blue-700 text-white rounded border border-blue-500 font-medium"
          >
            {roster.map((student, idx) => (
              <option key={idx} value={student}>{student}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-4">
        <button 
          onClick={() => { setCurrentView('portal'); setActiveQuiz(null); }}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentView === 'portal' ? 'bg-blue-600 text-white shadow' : 'bg-white border text-gray-600'}`}
        >
          📊 Portal
        </button>
        <button 
          onClick={() => setCurrentView('quizzes')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentView === 'quizzes' ? 'bg-blue-600 text-white shadow' : 'bg-white border text-gray-600'}`}
        >
          🧠 Quizzes
        </button>
        <button 
          onClick={() => { setCurrentView('submit'); setActiveQuiz(null); }}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${currentView === 'submit' ? 'bg-blue-600 text-white shadow' : 'bg-white border text-gray-600'}`}
        >
          📝 Submit
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium">Loading live semester data...</div>
      ) : (
        <>
          {/* VIEW 1: PORTAL DASHBOARD */}
          {currentView === 'portal' && (
            <div className="space-y-4">
              {/* Cumulative Total Score */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg text-center">
                <span className="text-xs uppercase tracking-widest text-indigo-200">Cumulative Semester Score</span>
                <div className="text-4xl font-extrabold mt-1">
                  {Number(studentStats.totalScore).toFixed(1)} <span className="text-xl font-normal text-indigo-200">/ 100%</span>
                </div>
              </div>

              {/* Category Breakdown Grid */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Category Averages</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Quiz Avg</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.quizAvg).toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Practical Avg</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.practicalAvg).toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Classwork</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.classworkAvg).toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Homework</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.homeworkAvg).toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Lab Grp Exam</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.labGruExamAvg).toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Lab Indv Exam</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.labIndvExamAvg).toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Project</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.project).toFixed(1)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-xs text-gray-500 block">Exercise Book</span>
                    <span className="font-bold text-lg text-blue-600">{Number(studentStats.exBook).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: INTERACTIVE QUIZZES */}
          {currentView === 'quizzes' && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border space-y-4">
              {!activeQuiz ? (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Available Quizzes</h3>
                  {availableQuizzes.map((quiz) => {
                    const isCompleted = completedTasks[quiz.id];
                    return (
                      <div key={quiz.id} className="p-3 border rounded-xl flex items-center justify-between bg-gray-50 mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">{quiz.title}</h4>
                          <span className={`text-xs ${isCompleted ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                            {isCompleted ? '✓ Completed' : 'Pending'}
                          </span>
                        </div>
                        <button 
                          onClick={() => { setActiveQuiz(quiz); setQuizSubmitted(false); setQuizAnswers({}); }}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          {isCompleted ? 'Retake' : 'Start Quiz'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{activeQuiz.title}</h3>
                    <button onClick={() => setActiveQuiz(null)} className="text-xs text-blue-600 font-semibold">← Back</button>
                  </div>

                  {!quizSubmitted ? (
                    <div className="space-y-4">
                      {activeQuiz.questions.map((q, idx) => (
                        <div key={q.id} className="p-3 bg-gray-50 rounded-xl border">
                          <p className="text-sm font-medium mb-2">{idx + 1}. {q.q}</p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-2 text-sm p-1.5 bg-white rounded border cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`question_${q.id}`} 
                                  checked={quizAnswers[q.id] === oIdx}
                                  onChange={() => handleOptionSelect(q.id, oIdx)}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => handleQuizSubmit(activeQuiz)}
                        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm"
                      >
                        Submit Quiz
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <div className="text-2xl font-bold text-blue-600">Quiz Score: {quizScore.toFixed(1)}%</div>
                      <p className="text-xs text-gray-500">Your score has been successfully recorded to your portal!</p>
                      <button onClick={() => setActiveQuiz(null)} className="bg-gray-100 px-4 py-2 rounded-xl text-sm font-semibold">Return to Quizzes</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: TASK & PRACTICAL SUBMISSION (WITH GROUP SELECTOR) */}
          {currentView === 'submit' && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-1">Submit Assignment or Practical</h3>
              <p className="text-xs text-gray-500 mb-4">Upload your GitHub, Figma, or file link for grading.</p>

              {feedback && (
                <div className={`p-3 rounded-xl text-sm mb-4 font-medium ${feedback.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {feedback}
                </div>
              )}

              <form onSubmit={handleSubmitTask} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Task Type:</label>
                    <select 
                      value={taskType} 
                      onChange={(e) => setTaskType(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 font-medium"
                    >
                      <option value="Practical">Practical</option>
                      <option value="Project">Project</option>
                      <option value="Homework">Homework</option>
                      <option value="ClassWork">Classwork</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Task ID:</label>
                    <input 
                      type="text" 
                      value={taskId} 
                      onChange={(e) => setTaskId(e.target.value)} 
                      required 
                      className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Submission Link / Details:</label>
                  <input 
                    type="url" 
                    value={submissionLink} 
                    onChange={(e) => setSubmissionLink(e.target.value)} 
                    required 
                    placeholder="https://github.com/..." 
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>

                {taskType === 'Practical' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Select Group Members (Partners):</label>
                    <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1 bg-gray-50">
                      {roster.map((student, idx) => (
                        student !== currentUser && (
                          <label key={idx} className="flex items-center gap-2.5 p-2 hover:bg-white rounded-lg cursor-pointer transition">
                            <input 
                              type="checkbox" 
                              checked={selectedPeers.includes(student)}
                              onChange={() => handlePeerToggle(student)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{student}</span>
                          </label>
                        )
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition duration-200 text-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Task'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
