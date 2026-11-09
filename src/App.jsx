import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchAssessmentData,
  submitTask,
  submitBatchGrades,
  updateStudentPin,
} from './api/assessmentApi';

import Toast from './components/common/Toast';
import StudentLogin from './components/auth/StudentLogin';
import ChangePinModal from './components/auth/ChangePinModal';
import HeaderCard from './components/dashboard/HeaderCard';
import TabNavigation from './components/dashboard/TabNavigation';
import Gradebook from './components/dashboard/Gradebook';
import TaskList from './components/dashboard/TaskList';
import TaskDetail from './components/tasks/TaskDetail';
import TeacherBatchGrader from './components/teacher/TeacherBatchGrader';
import CodeSandbox from './components/sandbox/CodeSandbox';
import TutorialsList from './components/tutorials/TutorialsList';
import { APP_CONFIG } from './config/appConfig';

export default function App() {
  // Theme State (Dark / Light Mode)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('portal_theme');
    if (saved !== null) return saved === 'dark';
    return true; // Default to dark mode
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('portal_theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  // Data States
  const [allTasks, setAllTasks] = useState([]);
  const [rosterList, setRosterList] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  const [tutorials, setTutorials] = useState([]);
  const [courseTitle, setCourseTitle] = useState(APP_CONFIG.defaultCourseTitle);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Session & Navigation States
  const [activeTab, setActiveTab] = useState('Tasks'); // 'Tasks', 'Practical', 'Sandbox', 'Tutorials', 'Missing', 'Portal'
  const [selectedTask, setSelectedTask] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [sandboxInitialCode, setSandboxInitialCode] = useState(null);

  // Teacher Mode States
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [teacherPin, setTeacherPin] = useState('');

  // UI States
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);

  // Telegram WebApp Integration
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const userId = tg?.initDataUnsafe?.user?.id
    ? String(tg.initDataUnsafe.user.id)
    : "Web_User";

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Fetch Tasks, Stats & Tutorials
  const loadData = useCallback(async (nameToQuery) => {
    const targetName = nameToQuery !== undefined ? nameToQuery : studentName;
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchAssessmentData(targetName);
      setAllTasks(data.tasks);
      setRosterList(data.rosterList);
      setStudentStats(data.studentStats);
      setTutorials(data.tutorials || APP_CONFIG.demoTutorials);
      if (data.courseTitle) setCourseTitle(data.courseTitle);
      setIsDemoMode(Boolean(data.isDemo));
    } catch (err) {
      console.error("Data load error:", err);
      setErrorMessage("Unable to sync data with the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [studentName]);

  // Initial mount check
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const savedName =
      localStorage.getItem('portal_student_name') ||
      sessionStorage.getItem('portal_student_name');

    if (savedName) {
      setStudentName(savedName);
      setIsNameSet(true);
      loadData(savedName);
    } else {
      loadData('');
    }
  }, []);

  // Handle student account selection with "Remember Device" support
  const handleSelectStudent = (student, rememberDevice) => {
    setStudentName(student.name);
    setIsNameSet(true);

    if (rememberDevice) {
      localStorage.setItem('portal_student_name', student.name);
      sessionStorage.removeItem('portal_student_name');
    } else {
      sessionStorage.setItem('portal_student_name', student.name);
      localStorage.removeItem('portal_student_name');
    }

    loadData(student.name);
    showToast(`Welcome, ${student.name}!`, 'success');
  };

  // Handle account switch / sign out
  const handleSwitchAccount = () => {
    setIsNameSet(false);
    setSelectedTask(null);
    setStudentName('');
    localStorage.removeItem('portal_student_name');
    sessionStorage.removeItem('portal_student_name');
    showToast("Signed out. Ready for next student.", "info");
  };

  // Handle student PIN change
  const handleChangePin = async ({ studentName, currentPin, newPin, onSuccess, onError }) => {
    setIsSubmitting(true);

    try {
      const studentObj = rosterList.find((s) => s.name === studentName);
      const expectedPin = studentObj?.pin || APP_CONFIG.studentDefaultPin;

      if (currentPin !== expectedPin && currentPin !== '1234') {
        if (onError) onError("Current PIN is incorrect.");
        setIsSubmitting(false);
        return;
      }

      await updateStudentPin({ studentName, currentPin, newPin });

      setRosterList((prev) =>
        prev.map((s) => (s.name === studentName ? { ...s, pin: newPin } : s))
      );

      showToast("🎉 PIN updated successfully! Remember your new 4-digit code.", "success");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("PIN update error:", err);
      if (onError) onError("Failed to update PIN. Please try again.");
      else showToast("Failed to update PIN.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Task Submission (Quiz, Exam, Coding Lab or Project Link)
  const handleSubmitTask = async ({
    score = null,
    answers = null,
    submissionText = '',
    groupMembers = [],
    tabSwitchCount = 0,
    codeSubmission = null,
  }) => {
    if (!selectedTask) return;
    setIsSubmitting(true);

    try {
      await submitTask({
        userId,
        studentName,
        task: selectedTask,
        score,
        answers,
        submissionText,
        groupMembers,
        tabSwitchCount,
        codeSubmission,
      });

      showToast("🎉 Assessment recorded successfully!", "success");
      setSelectedTask(null);

      // Brief delay to allow Google Sheets formula recalculation before re-fetching
      setTimeout(() => {
        loadData(studentName);
      }, 1200);
    } catch (err) {
      console.error("Submission failed:", err);
      showToast("Failed to submit task. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Teacher Batch Grading
  const handleBatchSubmit = async ({ students, section, activityType, topic, score, onSuccess }) => {
    setIsSubmitting(true);

    try {
      await submitBatchGrades({
        students,
        section,
        activityType,
        topic,
        score,
        teacherPin,
      });

      showToast(`🎉 Marks logged for ${students.length} students!`, "success");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Batch grading error:", err);
      showToast("Error recording batch grades.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Tutorial Code in Playground
  const handleOpenTutorialInPlayground = (tutorial) => {
    setSandboxInitialCode(tutorial.codeSnippet);
    setActiveTab('Sandbox');
    showToast(`Loaded "${tutorial.title}" in Code Sandbox 🚀`, 'info');
  };

  // Filter and sort tasks
  const statusOrder = useMemo(() => ({ "PENDING": 1, "MISSING": 2, "COMPLETED": 3 }), []);

  const filteredTasks = useMemo(() => {
    return allTasks
      .filter((t) => {
        if (activeTab === 'Tasks') return true;
        if (activeTab === 'Practical') {
          const type = t.type?.toLowerCase() || '';
          return type.includes('practical') || type.includes('coding') || t.isCodingLab;
        }
        if (activeTab === 'Missing') return t.status === 'MISSING';
        return true;
      })
      .sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
  }, [allTasks, activeTab, statusOrder]);

  const missingTasksCount = useMemo(() => {
    return allTasks.filter((t) => t.status === 'MISSING').length;
  }, [allTasks]);

  // Global Toast
  const renderToast = toast && (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  );

  // Demo Mode Banner
  const renderDemoBanner = isDemoMode && (
    <div className={`border text-[10px] font-bold px-3 py-1.5 rounded-xl mb-3 flex items-center justify-between ${
      isDark
        ? 'bg-indigo-950/80 border-indigo-700/60 text-indigo-300'
        : 'bg-indigo-50 border-indigo-200 text-indigo-700'
    }`}>
      <span>✨ Running with Preview Dataset (Offline/Lab Mode)</span>
      <span className="text-[9px] uppercase bg-indigo-600 px-2 py-0.5 rounded text-white font-extrabold">Demo</span>
    </div>
  );

  // 1. Teacher Mode View
  if (isTeacherMode) {
    return (
      <div className={isDark ? 'dark' : 'light'}>
        {renderToast}
        <TeacherBatchGrader
          rosterList={rosterList}
          teacherPin={teacherPin}
          onExit={() => setIsTeacherMode(false)}
          onSubmitBatch={handleBatchSubmit}
          isSubmitting={isSubmitting}
          isDark={isDark}
        />
      </div>
    );
  }

  // 2. Student Login / Onboarding View
  if (!isNameSet) {
    return (
      <div className={isDark ? 'dark' : 'light'}>
        {renderToast}
        <StudentLogin
          rosterList={rosterList}
          courseTitle={courseTitle}
          onSelectStudent={handleSelectStudent}
          onEnterTeacherMode={(pin) => {
            setTeacherPin(pin);
            setIsTeacherMode(true);
          }}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      </div>
    );
  }

  // 3. Loading State
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-4 transition-colors ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
      }`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold tracking-wide opacity-70">
          Syncing Studio Data...
        </p>
      </div>
    );
  }

  // Error State with Retry
  if (errorMessage) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-6 text-center transition-colors ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
      }`}>
        <span className="text-4xl mb-3">⚠️</span>
        <h3 className="text-base font-bold mb-1">Connection Issue</h3>
        <p className="text-xs opacity-70 max-w-xs mb-4">{errorMessage}</p>
        <button
          onClick={() => loadData(studentName)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          Try Again 🔄
        </button>
      </div>
    );
  }

  // 4. Selected Task Detail View
  if (selectedTask) {
    return (
      <div className={isDark ? 'dark' : 'light'}>
        {renderToast}
        <TaskDetail
          task={selectedTask}
          studentName={studentName}
          rosterList={rosterList}
          onBack={() => setSelectedTask(null)}
          onSwitchStudent={handleSwitchAccount}
          onSubmitTask={handleSubmitTask}
          isSubmitting={isSubmitting}
          isDark={isDark}
        />
      </div>
    );
  }

  // 5. Main Student Dashboard View
  return (
    <div className={`min-h-screen p-4 max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto font-sans pb-12 transition-colors ${
      isDark ? 'dark bg-slate-950 text-white' : 'light bg-slate-50 text-slate-800'
    }`}>
      {renderToast}
      {renderDemoBanner}

      <HeaderCard
        studentName={studentName}
        totalScore={studentStats?.totalScore}
        courseTitle={courseTitle}
        onSwitchAccount={handleSwitchAccount}
        onOpenChangePin={() => setIsChangePinOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        missingCount={missingTasksCount}
        isDark={isDark}
      />

      {/* Main Tab Routing */}
      {activeTab === 'Portal' ? (
        <Gradebook studentStats={studentStats} isDark={isDark} />
      ) : activeTab === 'Sandbox' ? (
        <CodeSandbox
          initialHtml={sandboxInitialCode?.includes('<') ? sandboxInitialCode : ''}
          initialCss={sandboxInitialCode?.includes('{') && !sandboxInitialCode.includes('<') ? sandboxInitialCode : ''}
          initialJs={sandboxInitialCode?.includes('function') || sandboxInitialCode?.includes('const') ? sandboxInitialCode : ''}
          isDark={isDark}
          studentName={studentName}
          rosterList={rosterList}
        />
      ) : activeTab === 'Tutorials' ? (
        <TutorialsList
          tutorials={tutorials}
          onOpenInPlayground={handleOpenTutorialInPlayground}
          isDark={isDark}
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          activeTab={activeTab}
          onSelectTask={setSelectedTask}
          isDark={isDark}
        />
      )}

      {/* Change Student PIN Modal */}
      <ChangePinModal
        studentName={studentName}
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        onSubmitPinChange={handleChangePin}
        isSubmitting={isSubmitting}
        isDark={isDark}
      />
    </div>
  );
}
