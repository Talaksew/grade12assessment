import React, { useState } from 'react';
import ProgressBar from '../common/ProgressBar';

export default function QuizView({ task, onSubmit, isSubmitting, isDark = true }) {
  const opts = task.options || [];
  const isMultiQuestion = opts.length > 0 && typeof opts[0] === 'object' && opts[0] !== null && 'q' in opts[0];

  const questionsList = isMultiQuestion
    ? opts
    : [{ q: task.prompt, opts: opts, ans: task.correctIndex, image: task.image || task.img }];

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [enlargedImage, setEnlargedImage] = useState(null);

  const handleSelectOption = (qIndex, oIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: oIndex,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questionsList.length;
  const isAllAnswered = answeredCount === totalQuestions;

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questionsList.forEach((item, idx) => {
      if (selectedAnswers[idx] === item.ans) {
        correctCount++;
      }
    });

    const finalScorePercent = Math.round((correctCount / totalQuestions) * 100);
    const answersArray = questionsList.map((item, idx) => ({
      questionIndex: idx,
      selectedOption: selectedAnswers[idx],
    }));

    onSubmit({
      score: finalScorePercent,
      answers: answersArray,
    });
  };

  return (
    <div className={`space-y-4 font-sans ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Progress status */}
      <div className={`p-3 rounded-2xl border ${
        isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            Completion Progress
          </span>
          <span className="text-indigo-500 font-extrabold">
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>
        <ProgressBar
          value={answeredCount}
          max={totalQuestions}
          color={isAllAnswered ? 'emerald' : 'indigo'}
          size="sm"
          showPercent={false}
        />
      </div>

      {/* Questions list */}
      {questionsList.map((item, qIndex) => {
        const imageUrl = item.image || item.img;

        return (
          <div
            key={qIndex}
            className={`p-4 rounded-2xl border space-y-3 transition-colors ${
              isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            {/* Question Text */}
            <div className="flex items-start space-x-2">
              {isMultiQuestion && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  Q{qIndex + 1}
                </span>
              )}
              <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                {item.q}
              </p>
            </div>

            {/* Optional Question Image (Google Form Style) */}
            {imageUrl && (
              <div className="relative group my-2">
                <div
                  onClick={() => setEnlargedImage(imageUrl)}
                  className={`rounded-2xl border overflow-hidden max-h-64 sm:max-h-80 flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-[0.99] ${
                    isDark ? 'bg-black/30 border-slate-700/80' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                  title="Click to view full size"
                >
                  <img
                    src={imageUrl}
                    alt={`Question ${qIndex + 1} reference`}
                    className="max-h-64 sm:max-h-80 w-auto object-contain rounded-xl hover:opacity-95"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1 px-1 opacity-70">
                  <span>🔍 Click image to enlarge</span>
                  {item.imageCaption && <span className="italic">{item.imageCaption}</span>}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2">
              {item.opts.map((opt, oIndex) => {
                const isSelected = selectedAnswers[qIndex] === oIndex;
                return (
                  <button
                    key={oIndex}
                    type="button"
                    onClick={() => handleSelectOption(qIndex, oIndex)}
                    className={`w-full p-3 text-left rounded-xl border text-xs transition-all flex items-center space-x-2.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/15 font-bold text-indigo-600 dark:text-white shadow-sm'
                        : isDark
                        ? 'border-slate-700/80 bg-slate-800/70 text-slate-300 hover:border-slate-600 hover:text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : isDark
                          ? 'bg-slate-700 text-slate-400'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + oIndex)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        disabled={!isAllAnswered || isSubmitting}
        onClick={handleSubmitQuiz}
        className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-2xl disabled:opacity-40 text-xs shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
      >
        {isSubmitting
          ? 'Scoring & Submitting Answers...'
          : isAllAnswered
          ? 'Submit Quiz Responses ✨'
          : `Please answer all questions (${answeredCount}/${totalQuestions})`}
      </button>

      {/* Image Lightbox Modal */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={enlargedImage}
              alt="Enlarged question reference"
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
