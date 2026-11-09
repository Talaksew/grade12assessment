import React, { useState } from 'react';

export default function ChangePinModal({
  studentName,
  isOpen,
  onClose,
  onSubmitPinChange,
  isSubmitting,
  isDark = true,
}) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!currentPin.trim()) {
      setError('Please enter your current PIN.');
      return;
    }

    if (newPin.trim().length !== 4 || !/^\d+$/.test(newPin.trim())) {
      setError('New PIN must be exactly 4 digits.');
      return;
    }

    if (newPin.trim() === currentPin.trim()) {
      setError('New PIN must be different from your current PIN.');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setError('New PIN and confirmation do not match.');
      return;
    }

    onSubmitPinChange({
      studentName,
      currentPin: currentPin.trim(),
      newPin: newPin.trim(),
      onSuccess: () => {
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
      },
      onError: (errMsg) => {
        setError(errMsg || 'Failed to update PIN. Please verify your current PIN.');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className={`rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
            🔑
          </div>
          <h3 className="text-base font-extrabold">Change Student PIN</h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Update your personal 4-digit security code for {studentName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Current PIN:
            </label>
            <input
              type="password"
              placeholder="Enter current PIN"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              maxLength={6}
              className={`w-full text-center tracking-widest text-base p-2.5 rounded-xl outline-none font-bold border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                New PIN (4 digits):
              </label>
              <input
                type="password"
                placeholder="4 digits"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={4}
                className={`w-full text-center tracking-widest text-base p-2.5 rounded-xl outline-none font-bold border transition ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Confirm New PIN:
              </label>
              <input
                type="password"
                placeholder="Confirm"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                maxLength={4}
                className={`w-full text-center tracking-widest text-base p-2.5 rounded-xl outline-none font-bold border transition ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-rose-500 font-semibold text-center bg-rose-500/10 p-2 rounded-xl border border-rose-500/30">
              {error}
            </p>
          )}

          <div className={`p-2.5 rounded-xl text-[10px] leading-snug border ${
            isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            💡 Keep your PIN memorable. You will use it to access your portal on shared lab computers and family phones.
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all"
            >
              {isSubmitting ? 'Updating...' : 'Save New PIN 💾'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

