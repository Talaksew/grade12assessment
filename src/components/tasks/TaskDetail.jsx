import React, { useState } from 'react';
import QuizView from './QuizView';
import ExamView from './ExamView';
import ProjectSubmission from './ProjectSubmission';
import CodeSandbox from '../sandbox/CodeSandbox';
import Badge from '../common/Badge';

export default function TaskDetail({
  task,
  studentName,
  rosterList,
  onBack,
  onSwitchStudent,
  onSubmitTask,
  isSubmitting,
  isDark = true,
}) {
  if (!task) return null;

  const isExam = task.type?.toLowerCase().includes('exam');
  const isQuiz = !isExam && task.type?.toLowerCase().includes('quiz');
  const isCodingLab = task.isCodingLab || task.type?.toLowerCase().includes('coding');

  // For practical tasks, allow student to toggle between in-app live code sandbox or external URL
  const [submissionMode, setSubmissionMode] = useState(
    isCodingLab ? 'sandbox' : 'link'
  );

  const currentStudent = rosterList.find((s) => s.name === studentName);
  const sectionLabel = currentStudent?.section ? `Section ${currentStudent.section}` : '';

  return (
    <div className={`min-h-screen p-4 max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto font-sans animate-fade-in pb-12 transition-colors ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={onBack}
          className={`text-xs font-bold flex items-center space-x-1.5 transition-colors ${
            isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
          }`}
        >
          <span>←</span> <span>Back to Dashboard</span>
        </button>

        {/* Identity Safeguard for shared lab computers and family phones */}
        <div className={`text-[10px] px-2.5 py-1 rounded-xl border flex items-center space-x-1.5 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          <span>👤 {studentName}</span>
          {sectionLabel && <span className="opacity-60">({sectionLabel})</span>}
        </div>
      </div>

      {/* Main Detail Container */}
      <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Header Tags */}
        <div className="flex justify-between items-center mb-3">
          <Badge variant={task.type?.toLowerCase() || 'default'} size="sm">
            {task.type}
          </Badge>
          {task.deadline && (
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${
              isDark ? 'bg-slate-800/80 text-slate-400 border-slate-700/60' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              📅 Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <h2 className="text-base font-extrabold mb-2 leading-snug">
          {task.topic}
        </h2>
        <div className={`p-3.5 rounded-2xl mb-5 border ${
          isDark ? 'bg-slate-800/40 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <p className="text-xs leading-relaxed font-normal">
            {task.prompt}
          </p>
        </div>

        {/* Task Completed Banner */}
        {task.status === "COMPLETED" ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl text-center text-xs text-emerald-300 font-bold flex items-center justify-center space-x-2">
            <span>✓</span> <span>Task Completed & Successfully Submitted</span>
          </div>
        ) : isExam ? (
          /* 1. Exam Engine Mode */
          <ExamView
            task={task}
            studentName={studentName}
            onSubmit={onSubmitTask}
            isSubmitting={isSubmitting}
            isDark={isDark}
          />
        ) : isQuiz ? (
          /* 2. Standard Quiz Mode */
          <QuizView
            task={task}
            onSubmit={onSubmitTask}
            isSubmitting={isSubmitting}
            isDark={isDark}
          />
        ) : (
          /* 3. Practical / Coding Lab Mode */
          <div className="space-y-4">
            {/* Practical Mode Toggle */}
            <div className={`flex p-1 rounded-xl border text-xs font-bold ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setSubmissionMode('sandbox')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  submissionMode === 'sandbox'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💻 Live Code Sandbox
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode('link')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  submissionMode === 'link'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔗 Submit URL Link
              </button>
            </div>

            {submissionMode === 'sandbox' ? (
              <CodeSandbox
                task={task}
                studentName={studentName}
                rosterList={rosterList}
                onSubmitCode={(codeData) =>
                  onSubmitTask({
                    codeSubmission: {
                      html: codeData.html,
                      css: codeData.css,
                      js: codeData.js,
                    },
                    submissionText: 'Code Lab Solution Submitted',
                    groupMembers: codeData.groupMembers || [],
                  })
                }
                isSubmitting={isSubmitting}
                isDark={isDark}
              />
            ) : (
              <ProjectSubmission
                studentName={studentName}
                rosterList={rosterList}
                onSubmit={onSubmitTask}
                isSubmitting={isSubmitting}
                isDark={isDark}
              />
            )}
          </div>
        )}

        {/* Pre-Submission Identity Safeguard */}
        {task.status !== "COMPLETED" && (
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[10px] ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <span>
              Submitting as: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{studentName}</strong>
            </span>
            <button
              type="button"
              onClick={onSwitchStudent}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline"
            >
              Not you? Switch student
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
