import React, { useState, useEffect, useMemo } from 'react';
import ProgressBar from '../common/ProgressBar';

export default function ExamView({
  task,
  studentName,
  onSubmit,
  isSubmitting,
  isDark = true,
}) {
  const timeLimitMinutes = task.timeLimitMinutes || 20;
  const totalSeconds = timeLimitMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  const rawQuestions = task.options || [];

  // Deterministically preserve questions with image support
  const questionsList = useMemo(() => {
    return rawQuestions.map((item, idx) => ({
      originalIndex: idx,
      q: item.q,
      opts: item.opts,
      ans: item.ans,
      image: item.image || item.img || null,
      imageCaption: item.imageCaption || null,
    }));
  }, [rawQuestions]);

  // Tab switch / blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarningBanner(true);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      setShowWarningBanner(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0) {
      calculateAndSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questionsList.length;

  const handleSelectAnswer = (qIndex, oIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: oIndex,
    }));
  };

  const calculateAndSubmit = () => {
    let correct = 0;
    questionsList.forEach((item, idx) => {
      if (selectedAnswers[idx] === item.ans) {
        correct++;
      }
    });

    const scorePercent = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const answersArray = questionsList.map((item, idx) => ({
      questionIndex: idx,
      selectedOption: selectedAnswers[idx],
    }));

    onSubmit({
      score: scorePercent,
      answers: answersArray,
      tabSwitchCount: tabSwitchCount,
    });
  };

  const currentQ = questionsList[currentQuestionIndex];
  const isTimeCritical = secondsRemaining < 180; // Less than 3 mins

  return (
    <div className="space-y-4 font-sans max-w-2xl mx-auto">
      {/* Floating Exam Integrity Header */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between shadow-lg backdrop-blur-xl ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              Exam in Progress
            </span>
          </div>
          <h3 className="text-xs font-bold leading-tight truncate max-w-[220px]">
            {task.topic}
          </h3>
        </div>

        {/* Live Timer Pill */}
        <div className={`px-3 py-1.5 rounded-2xl border font-mono font-extrabold text-sm flex items-center space-x-1.5 ${
          isTimeCritical
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-bounce'
            : isDark
            ? 'bg-slate-800 text-indigo-300 border-slate-700'
            : 'bg-slate-100 text-indigo-700 border-slate-200'
        }`}>
          <span>⏱️</span>
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      {/* Tab Switch Security Warning Banner */}
      {showWarningBanner && tabSwitchCount > 0 && (
        <div className="bg-rose-950/60 border border-rose-500/50 text-rose-300 p-3 rounded-2xl text-[11px] flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-base">⚠️</span>
            <span>
              <strong>Integrity Notice:</strong> Window lost focus {tabSwitchCount} time{tabSwitchCount > 1 ? 's' : ''}. This event is recorded on your submission.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowWarningBanner(false)}
            className="text-xs font-bold px-2 py-0.5 bg-rose-900/50 hover:bg-rose-800 rounded-lg"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Question Jump Navigation Dots */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between gap-1 overflow-x-auto ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <span className="text-[10px] font-bold text-slate-400 shrink-0 mr-1">Questions:</span>
        <div className="flex space-x-1">
          {questionsList.map((_, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isCurrent = currentQuestionIndex === idx;

            let dotStyle = isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600 border border-slate-200';
            if (isCurrent) {
              dotStyle = 'bg-indigo-600 text-white font-extrabold ring-2 ring-indigo-400';
            } else if (isAnswered) {
              dotStyle = 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-7 h-7 rounded-xl text-xs flex items-center justify-center transition-all ${dotStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className={`text-[11px] font-bold ${
              selectedAnswers[currentQuestionIndex] !== undefined ? 'text-emerald-500' : 'text-slate-400'
            }`}>
              {selectedAnswers[currentQuestionIndex] !== undefined ? '✓ Answered' : 'Not answered'}
            </span>
          </div>

          <p className="text-xs font-bold leading-relaxed">
            {currentQ.q}
          </p>

          {/* Optional Question Image (Google Form Style) */}
          {currentQ.image && (
            <div className="my-2">
              <div
                onClick={() => setEnlargedImage(currentQ.image)}
                className={`rounded-2xl border overflow-hidden max-h-72 flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-[0.99] ${
                  isDark ? 'bg-black/30 border-slate-700/80' : 'bg-white border-slate-200 shadow-sm'
                }`}
                title="Click to view full size"
              >
                <img
                  src={currentQ.image}
                  alt={`Question ${currentQuestionIndex + 1} illustration`}
                  className="max-h-72 w-auto object-contain rounded-xl hover:opacity-95"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] mt-1 px-1 opacity-70">
                <span>🔍 Click image to enlarge</span>
                {currentQ.imageCaption && <span className="italic">{currentQ.imageCaption}</span>}
              </div>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-2">
            {currentQ.opts.map((opt, oIndex) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === oIndex;
              return (
                <button
                  key={oIndex}
                  type="button"
                  onClick={() => handleSelectAnswer(currentQuestionIndex, oIndex)}
                  className={`w-full p-3.5 text-left rounded-2xl border text-xs transition-all flex items-center space-x-3 ${
                    isSelected
                      ? isDark
                        ? 'border-indigo-500 bg-indigo-950/60 font-bold text-white shadow-md'
                        : 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 shadow-sm ring-1 ring-indigo-500'
                      : isDark
                      ? 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700 hover:text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {String.fromCharCode(65 + oIndex)}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Question Navigation Buttons */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition disabled:opacity-30 ${
                isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              ← Previous
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Next Question →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg transition"
              >
                Finish & Review 🏁
              </button>
            )}
          </div>
        </div>
      )}

      {/* Finish & Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-all"
        >
          {isSubmitting ? 'Submitting Exam...' : `Review & Submit Exam (${answeredCount}/${totalQuestions}) 🚀`}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`p-6 rounded-3xl border w-full max-w-sm shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="text-center">
              <span className="text-3xl block mb-2">🏁</span>
              <h3 className="text-base font-extrabold">Ready to Submit Exam?</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Once submitted, you will not be able to change your answers.
              </p>
            </div>

            <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
              isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span>Total Answered:</span>
                <strong className="text-emerald-500">{answeredCount} of {totalQuestions}</strong>
              </div>
              <div className="flex justify-between">
                <span>Unanswered:</span>
                <strong className={totalQuestions - answeredCount > 0 ? 'text-rose-400' : 'text-slate-400'}>
                  {totalQuestions - answeredCount}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Time Remaining:</span>
                <strong>{formatTimer(secondsRemaining)}</strong>
              </div>
              {tabSwitchCount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Tab Switches:</span>
                  <strong>{tabSwitchCount} times</strong>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`py-3 rounded-xl text-xs font-bold border transition ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  calculateAndSubmit();
                }}
                className="py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg transition"
              >
                Submit Now 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={enlargedImage}
              alt="Enlarged question illustration"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 text-white font-bold border border-slate-700 flex items-center justify-center shadow-lg hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
