import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { isValidHttpUrl } from '../../api/assessmentApi';

export default function ProjectSubmission({
  studentName,
  rosterList = [],
  onSubmit,
  isSubmitting,
  isDark = true,
}) {
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [selectedGroupPeers, setSelectedGroupPeers] = useState([]);
  const [peerSearch, setPeerSearch] = useState('');

  const isUrlValid = isValidHttpUrl(submissionUrl);
  const isReadyToSubmit = submissionUrl.trim().length > 0 && isUrlValid;

  // Platform detection for attractive visual feedback
  const detectPlatform = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('github.com')) return { name: 'GitHub', icon: '🐙', color: 'bg-slate-700 text-white' };
    if (lower.includes('vercel.app')) return { name: 'Vercel', icon: '▲', color: 'bg-slate-800 text-white' };
    if (lower.includes('netlify.app')) return { name: 'Netlify', icon: '🌐', color: 'bg-teal-900 text-teal-300' };
    if (lower.includes('figma.com')) return { name: 'Figma', icon: '🎨', color: 'bg-purple-900 text-purple-300' };
    if (lower.includes('codepen.io')) return { name: 'CodePen', icon: '🖊️', color: 'bg-slate-700 text-white' };
    return { name: 'Live Web URL', icon: '🔗', color: 'bg-indigo-950 text-indigo-300' };
  };

  const detectedPlatform = isUrlValid ? detectPlatform(submissionUrl) : null;

  const filteredPeers = rosterList.filter(
    (st) =>
      st.name !== studentName &&
      st.name.toLowerCase().includes(peerSearch.toLowerCase())
  );

  const handleTogglePeer = (name) => {
    if (selectedGroupPeers.includes(name)) {
      setSelectedGroupPeers(selectedGroupPeers.filter((n) => n !== name));
    } else {
      setSelectedGroupPeers([...selectedGroupPeers, name]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isReadyToSubmit) return;
    onSubmit({
      submissionText: submissionUrl.trim(),
      groupMembers: selectedGroupPeers,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 font-sans ${isDark ? 'text-white' : 'text-slate-800'}`}>
      <div className="space-y-3">
        {/* Project Link Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Project / Artifact URL:
            </label>
            {detectedPlatform && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-white/10 ${detectedPlatform.color}`}>
                {detectedPlatform.icon} {detectedPlatform.name} Detected
              </span>
            )}
          </div>

          <input
            type="url"
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            placeholder="https://github.com/... or https://vercel.app/..."
            className={`w-full p-3.5 text-xs border rounded-2xl outline-none font-medium transition-all ${
              submissionUrl.length === 0
                ? isDark ? 'bg-slate-800/80 border-slate-700 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800'
                : isUrlValid
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:text-emerald-300'
                : 'border-rose-500 bg-rose-500/10 text-rose-500 dark:text-rose-300'
            }`}
          />
          {submissionUrl.length > 0 && !isUrlValid && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1">
              ⚠️ Please include http:// or https:// (e.g. https://my-project.vercel.app)
            </p>
          )}
        </div>

        {/* Group Teammates Picker */}
        <div className={`p-3 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                👥 Teammates / Lab Partners
              </span>
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Optional: tag peers you collaborated with
              </span>
            </div>
            {selectedGroupPeers.length > 0 && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                ✓ {selectedGroupPeers.length} tagged
              </span>
            )}
          </div>

          {rosterList.length > 5 && (
            <input
              type="text"
              placeholder="Search classmates..."
              value={peerSearch}
              onChange={(e) => setPeerSearch(e.target.value)}
              className={`w-full px-3 py-2 mb-2 text-xs rounded-xl outline-none border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          )}

          <div className={`max-h-36 overflow-y-auto rounded-xl p-1.5 space-y-1 border divide-y ${
            isDark
              ? 'bg-slate-900/60 border-slate-700/50 divide-slate-800'
              : 'bg-slate-50 border-slate-200 divide-slate-100'
          }`}>
            {filteredPeers.map((st, idx) => {
              const isChecked = selectedGroupPeers.includes(st.name);
              return (
                <label
                  key={st.id || `${st.name}-${idx}`}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                    isChecked
                      ? isDark ? 'bg-indigo-950/40' : 'bg-indigo-50'
                      : isDark ? 'hover:bg-slate-800/40' : 'hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar name={st.name} size="sm" />
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {st.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {st.section && <Badge variant="section" size="xs">Sec {st.section}</Badge>}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePeer(st.name)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 focus:ring-indigo-500"
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isReadyToSubmit || isSubmitting}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl disabled:opacity-40 text-xs shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-all"
      >
        {isSubmitting
          ? 'Recording Project Submission...'
          : selectedGroupPeers.length > 0
          ? `Submit Project for Group (${selectedGroupPeers.length + 1} students) 🚀`
          : 'Submit Project Work 🚀'}
      </button>
    </form>
  );
}
