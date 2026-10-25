import React, { useState, useEffect } from 'react';

// Replace with your actual deployed Google Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz04rx-lJ4ZYyEfzSfyrhSehlhEaKAgF84PMDr_qvm9YeClDTKgxEgjxt2hxL3grivBew/exec";

export default function App() {
  const [currentView, setCurrentView] = useState('portal'); // 'portal' or 'submit'
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

  // Practical Submission States
  const [taskId, setTaskId] = useState('PRAC_01');
  const [practicalLink, setPracticalLink] = useState('');
  const [selectedPeers, setSelectedPeers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Simulated Roster & User Initialization (Can link to Telegram WebApp user context)
  useEffect(() => {
    // Example student roster list (In production, you can fetch this from a 'Student_Roster' sheet endpoint)
    const sampleRoster = [
      "Abebe Kebede",
      "Chaltu Lemma",
      "Dawit Tadesse",
      "Edom Mekonnen",
      "Fasil Yohannes"
    ];
    setRoster(sampleRoster);
    setCurrentUser(sampleRoster[0]); // Default selected student for testing
  }, []);

  // Fetch live student stats and completed tasks when user changes
  useEffect(() => {
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
  }, [currentUser]);

  // Handle Checkbox Toggle for Group Members
  const handlePeerToggle = (name) => {
    if (selectedPeers.includes(name)) {
      setSelectedPeers(selectedPeers.filter(p => p !== name));
    } else {
      setSelectedPeers([...selectedPeers, name]);
    }
  };

  // Handle Practical Submission Post
  const handleSubmitPractical = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');

    // Ensure the submitting student + selected peers are included cleanly
    const groupMembers = Array.from(new Set([currentUser, ...selectedPeers]));

    const payload = {
      userId: "TG_" + currentUser.replace(/\s+/g, '_'),
      userName: currentUser,
      taskId: taskId,
      taskType: "Practical",
      submission: practicalLink,
      score: 0, // Pending grading
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
          setFeedback('Practical submitted successfully for all group members!');
          setPracticalLink('');
          setSelectedPeers([]);
        } else {
          setFeedback('Submission failed: ' + data.message);
        }
      })
      .catch(err => {
        setSubmitting(false);
        setFeedback('Error submitting assignment. Try again.');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 max-w-md mx-auto font-sans">
      {/* Header & Student Selector */}
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
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setCurrentView('portal')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${currentView === 'portal' ? 'bg-blue-600 text-white shadow' : 'bg-white border text-gray-600'}`}
        >
          📊 Progress Portal
        </button>
        <button 
          onClick={() => setCurrentView('submit')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${currentView === 'submit' ? 'bg-blue-600 text-white shadow' : 'bg-white border text-gray-600'}`}
        >
          📝 Submit Practical
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium">Loading live semester data...</div>
      ) : (
        <>
          {/* VIEW 1: PORTAL DASHBOARD */}
          {currentView === 'portal' && (
            <div className="space-y-4">
              {/* Total Score Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg text-center">
                <span className="text-xs uppercase tracking-widest text-indigo-200">Cumulative Total Score</span>
                <div className="text-4xl font-extrabold mt-1">
                  {Number(studentStats.totalScore).toFixed(1)} <span className="text-xl font-normal text-indigo-200">/ 100%</span>
                </div>
              </div>

              {/* Category Breakdown Grid */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Category Breakdown</h3>
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

          {/* VIEW 2: SUBMIT PRACTICAL (WITH TYPO-FREE GROUP SELECTION) */}
          {currentView === 'submit' && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-1">Group Practical Submission</h3>
              <p className="text-xs text-gray-500 mb-4">Select your group members from the official roster to record grades accurately.</p>

              {feedback && (
                <div className={`p-3 rounded-xl text-sm mb-4 font-medium ${feedback.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {feedback}
                </div>
              )}

              <form onSubmit={handleSubmitPractical} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Task ID:</label>
                  <input 
                    type="text" 
                    value={taskId} 
                    onChange={(e) => setTaskId(e.target.value)} 
                    required 
                    className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 font-medium"
                    placeholder="e.g. PRAC_HTML_01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">GitHub / Figma / Live Link:</label>
                  <input 
                    type="url" 
                    value={practicalLink} 
                    onChange={(e) => setPracticalLink(e.target.value)} 
                    required 
                    placeholder="https://github.com/..." 
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Select Group Members (Partners):</label>
                  <div className="max-h-48 overflow-y-auto border rounded-xl p-2 space-y-1 bg-gray-50">
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

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition duration-200 text-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting to Roster...' : 'Submit Assignment'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
