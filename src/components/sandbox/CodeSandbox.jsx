import React, { useState, useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export default function CodeSandbox({
  task = null,
  initialHtml = '',
  initialCss = '',
  initialJs = '',
  onSubmitCode = null,
  isSubmitting = false,
  isDark = true,
  studentName = '',
  rosterList = [],
}) {
  const defaultHtml = initialHtml || task?.starterHtml || `<div class="banner">\n  <h1>⚡ SkillStudio Live Playground</h1>\n  <p>Write HTML, CSS, and JS. See instant live output!</p>\n  <button id="demoBtn">Click Me</button>\n</div>`;
  const defaultCss = initialCss || task?.starterCss || `body {\n  font-family: system-ui, sans-serif;\n  background: ${isDark ? '#0f172a' : '#f8fafc'};\n  color: ${isDark ? '#f8fafc' : '#0f172a'};\n  padding: 20px;\n  text-align: center;\n}\n.banner {\n  background: ${isDark ? '#1e293b' : '#ffffff'};\n  padding: 24px;\n  border-radius: 16px;\n  border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};\n  max-width: 420px;\n  margin: 40px auto;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n}\nh1 {\n  font-size: 20px;\n  margin-top: 0;\n  color: #6366f1;\n}\nbutton {\n  background: #6366f1;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 10px;\n  font-weight: bold;\n  cursor: pointer;\n}`;
  const defaultJs = initialJs || task?.starterJs || `document.getElementById('demoBtn').addEventListener('click', () => {\n  alert('Great job! JavaScript is working perfectly 🚀');\n});`;

  const [activeTab, setActiveTab] = useState('html'); // 'html', 'css', 'js', 'preview'
  const [htmlCode, setHtmlCode] = useState(defaultHtml);
  const [cssCode, setCssCode] = useState(defaultCss);
  const [jsCode, setJsCode] = useState(defaultJs);
  const [srcDoc, setSrcDoc] = useState('');
  const [checkedChallenges, setCheckedChallenges] = useState({});

  // Group Members & Lab Partners Selection
  const [selectedGroupPeers, setSelectedGroupPeers] = useState([]);
  const [peerSearch, setPeerSearch] = useState('');
  const [showTeammatePicker, setShowTeammatePicker] = useState(false);

  const iframeRef = useRef(null);

  // Sync starter code when task or initial code changes
  useEffect(() => {
    if (task) {
      setHtmlCode(initialHtml || task.starterHtml || '');
      setCssCode(initialCss || task.starterCss || '');
      setJsCode(initialJs || task.starterJs || '');
    }
  }, [task?.taskId, initialHtml, initialCss, initialJs]);

  // Update preview bundle
  const updatePreview = () => {
    const combined = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
        <script>
          window.onerror = function(msg, url, line) {
            console.error('Playground Error: ' + msg + ' (Line ' + line + ')');
            return false;
          };
          try {
            ${jsCode}
          } catch(err) {
            console.error('JS Execution Error: ', err);
          }
        <\/script>
      </body>
      </html>
    `;
    setSrcDoc(combined);
  };

  useEffect(() => {
    updatePreview();
  }, [htmlCode, cssCode, jsCode]);

  const handleDownload = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task?.topic ? task.topic.replace(/\s+/g, '_') : 'web_lab'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm("Reset code back to starter template?")) {
      setHtmlCode(defaultHtml);
      setCssCode(defaultCss);
      setJsCode(defaultJs);
    }
  };

  const handleTogglePeer = (name) => {
    if (selectedGroupPeers.includes(name)) {
      setSelectedGroupPeers(selectedGroupPeers.filter((n) => n !== name));
    } else {
      setSelectedGroupPeers([...selectedGroupPeers, name]);
    }
  };

  const filteredPeers = rosterList.filter(
    (st) =>
      st.name !== studentName &&
      st.name.toLowerCase().includes(peerSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (onSubmitCode) {
      onSubmitCode({
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        groupMembers: selectedGroupPeers,
      });
    }
  };

  return (
    <div className={`rounded-3xl border overflow-hidden font-sans transition-colors ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      {/* Sandbox Header */}
      <div className={`p-4 border-b flex flex-wrap justify-between items-center gap-2 ${
        isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm">
            💻
          </span>
          <div>
            <h3 className="text-xs font-black tracking-tight">Interactive Code Sandbox</h3>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              HTML5, CSS3 & JavaScript live runner (Responsive Split-View)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            ⟳ Reset
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            💾 Download .html
          </button>
        </div>
      </div>

      {/* Responsive Container: Stack on Mobile, Side-by-Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-slate-800">
        
        {/* Left Column: Code Editors */}
        <div className="flex flex-col">
          {/* Editor Tab Switcher */}
          <div className={`flex border-b text-xs font-bold ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`flex-1 py-2.5 border-b-2 text-center transition flex items-center justify-center space-x-1 ${
                activeTab === 'html'
                  ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                  : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🌐</span> <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('css')}
              className={`flex-1 py-2.5 border-b-2 text-center transition flex items-center justify-center space-x-1 ${
                activeTab === 'css'
                  ? 'border-sky-500 text-sky-500 bg-sky-500/10'
                  : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🎨</span> <span>CSS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('js')}
              className={`flex-1 py-2.5 border-b-2 text-center transition flex items-center justify-center space-x-1 ${
                activeTab === 'js'
                  ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                  : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>⚡</span> <span>JS</span>
            </button>
            {/* On mobile only: preview tab option */}
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`lg:hidden flex-1 py-2.5 border-b-2 text-center transition flex items-center justify-center space-x-1 ${
                activeTab === 'preview'
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                  : isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>👁️</span> <span>Preview</span>
            </button>
          </div>

          <div className="p-3 flex-1 flex flex-col">
            {activeTab === 'html' && (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                  <span>Enter HTML elements:</span>
                  <span className="text-orange-400 font-mono">HTML5</span>
                </div>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  rows={14}
                  spellCheck="false"
                  className={`w-full flex-1 p-3 font-mono text-xs rounded-2xl outline-none border transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-500'
                  }`}
                />
              </div>
            )}

            {activeTab === 'css' && (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                  <span>Write CSS rules:</span>
                  <span className="text-sky-400 font-mono">CSS3</span>
                </div>
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  rows={14}
                  spellCheck="false"
                  className={`w-full flex-1 p-3 font-mono text-xs rounded-2xl outline-none border transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-sky-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500'
                  }`}
                />
              </div>
            )}

            {activeTab === 'js' && (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                  <span>Write JavaScript logic:</span>
                  <span className="text-amber-400 font-mono">ES6+</span>
                </div>
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  rows={14}
                  spellCheck="false"
                  className={`w-full flex-1 p-3 font-mono text-xs rounded-2xl outline-none border transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-amber-400' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-400'
                  }`}
                />
              </div>
            )}

            {/* Mobile-only preview view */}
            {activeTab === 'preview' && (
              <div className="lg:hidden space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Rendered Output:</span>
                  <button type="button" onClick={updatePreview} className="text-emerald-500 hover:underline">
                    ⟳ Refresh
                  </button>
                </div>
                <div className="rounded-2xl border overflow-hidden h-72 w-full bg-white">
                  <iframe srcDoc={srcDoc} title="Mobile Preview" sandbox="allow-scripts" className="w-full h-full border-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Always Visible Live Preview on Desktop (>= 1024px) */}
        <div className="hidden lg:flex flex-col p-3 border-t lg:border-t-0">
          <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold text-slate-400">
            <span>👁️ Real-Time Output Preview:</span>
            <button
              type="button"
              onClick={updatePreview}
              className="text-emerald-500 hover:underline font-bold"
            >
              ⟳ Refresh
            </button>
          </div>
          <div className="rounded-2xl border overflow-hidden flex-1 min-h-[360px] bg-white shadow-inner">
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="Desktop Live Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>

      {/* Task Challenges Checklist, Lab Teammate Picker & Submission Footer */}
      <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
        
        {/* Lab Checklist */}
        {task?.challenges && task.challenges.length > 0 && (
          <div className={`p-3 rounded-2xl border mb-3 ${
            isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
          }`}>
            <h4 className="text-[11px] font-bold mb-2 flex items-center space-x-1.5 text-indigo-500">
              <span>🎯</span> <span>Hands-on Lab Checklist:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.challenges.map((challenge, idx) => (
                <label
                  key={idx}
                  className="flex items-center space-x-2 text-[11px] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedChallenges[idx]}
                    onChange={(e) =>
                      setCheckedChallenges({ ...checkedChallenges, [idx]: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                  />
                  <span className={checkedChallenges[idx] ? 'line-through opacity-50' : ''}>
                    {challenge}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Group Teammates & Lab Partners Selection */}
        {onSubmitCode && rosterList && rosterList.length > 0 && (
          <div className={`p-3 rounded-2xl border mb-3 transition-colors ${
            isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-xs font-bold block flex items-center space-x-1.5">
                  <span>👥</span>
                  <span>Lab Partners / Group Members</span>
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tag colleagues working with you on this lab computer
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTeammatePicker(!showTeammatePicker)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition ${
                  selectedGroupPeers.length > 0
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : isDark
                    ? 'bg-slate-800 text-indigo-300 border-slate-700'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {selectedGroupPeers.length > 0
                  ? `✓ ${selectedGroupPeers.length} Partner${selectedGroupPeers.length > 1 ? 's' : ''} Tagged`
                  : '+ Tag Partners'}
              </button>
            </div>

            {/* Expandable Teammates Picker List */}
            {showTeammatePicker && (
              <div className="space-y-2 pt-2 border-t border-slate-700/40 animate-fade-in">
                {rosterList.length > 6 && (
                  <input
                    type="text"
                    placeholder="Search classmates..."
                    value={peerSearch}
                    onChange={(e) => setPeerSearch(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl outline-none border transition ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                    }`}
                  />
                )}

                <div className={`max-h-36 overflow-y-auto rounded-xl p-1.5 space-y-1 border divide-y ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-700/60 divide-slate-800'
                    : 'bg-slate-50 border-slate-200 divide-slate-100'
                }`}>
                  {filteredPeers.map((st, idx) => {
                    const isChecked = selectedGroupPeers.includes(st.name);
                    return (
                      <label
                        key={st.id || `${st.name}-${idx}`}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isChecked
                            ? isDark ? 'bg-indigo-950/60' : 'bg-indigo-50'
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
            )}
          </div>
        )}

        {/* Submit Solution Button */}
        {onSubmitCode ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-900/30 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>
              {isSubmitting
                ? 'Recording Solution...'
                : selectedGroupPeers.length > 0
                ? `Submit Lab Solution for Group (${selectedGroupPeers.length + 1} students) 🚀`
                : 'Submit Code Lab Solution 🚀'}
            </span>
          </button>
        ) : (
          <div className={`p-3 rounded-2xl border text-center text-[11px] font-medium flex items-center justify-center space-x-2 ${
            isDark ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            <span>💡</span>
            <span>Freeform Playground mode. To complete and submit a graded lab assignment with your team, select it from the <strong>Assignments</strong> tab!</span>
          </div>
        )}
      </div>
    </div>
  );
}
