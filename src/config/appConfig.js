// App Configuration & Defaults
export const APP_CONFIG = {
  appName: "SkillStudio",
  defaultCourseTitle: "Web Design & Development Studio",
  defaultCourseSubtitle: "Interactive Coding Labs, Exam Engine & Continuous Assessment",
  teacherDefaultPin: "1234",
  studentDefaultPin: "1234", // Default PIN for students in demo mode
  
  // Standard assessment categories and default weightings
  defaultAssessmentWeights: [
    { key: "classworkAvg", label: "ClassWork", weight: 5, color: "blue" },
    { key: "homeworkAvg", label: "HomeWork", weight: 5, color: "indigo" },
    { key: "quizAvg", label: "Quizzes & Tests", weight: 20, color: "sky" },
    { key: "practicalAvg", label: "Practical Coding Labs", weight: 20, color: "emerald" },
    { key: "labIndvExamAvg", label: "Lab Individual Exam", weight: 10, color: "purple" },
    { key: "labGruExamAvg", label: "Lab Group Exam", weight: 10, color: "violet" },
    { key: "project", label: "Term Project", weight: 20, color: "amber" },
    { key: "exBook", label: "Exercise Book", weight: 10, color: "rose" },
  ],

  // Fallback demo dataset for new users or offline testing
  demoRoster: [
    { name: "Alex Morgan", section: "A", id: "STU-001", pin: "1234" },
    { name: "Bethany Chen", section: "A", id: "STU-002", pin: "1234" },
    { name: "Carlos Rivera", section: "B", id: "STU-003", pin: "1234" },
    { name: "Diana Prince", section: "B", id: "STU-004", pin: "1234" },
    { name: "Ethan Hunt", section: "C", id: "STU-005", pin: "1234" },
    { name: "Fiona Gallagher", section: "C", id: "STU-006", pin: "1234" },
  ],

  demoTasks: [
    {
      taskId: "TASK-101",
      topic: "Interactive Button & Card Layout",
      type: "CodingLab",
      isCodingLab: true,
      prompt: "Build an interactive card layout with a button that updates the like counter dynamically when clicked. Style with modern CSS flexbox and gradients.",
      status: "PENDING",
      deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
      starterHtml: `<div class="card">\n  <div class="badge">Web Dev Lab</div>\n  <h2>Product Design Card</h2>\n  <p>Learn CSS Flexbox and JavaScript event listeners with hands-on code.</p>\n  <button id="likeBtn">❤️ Like (<span id="count">0</span>)</button>\n</div>`,
      starterCss: `body {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 90vh;\n  margin: 0;\n}\n.card {\n  background: #1e293b;\n  border: 1px solid #334155;\n  border-radius: 16px;\n  padding: 24px;\n  max-width: 320px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n}\n.badge {\n  display: inline-block;\n  background: #6366f1;\n  color: white;\n  font-size: 11px;\n  font-weight: bold;\n  padding: 4px 10px;\n  border-radius: 20px;\n  margin-bottom: 12px;\n}\nh2 {\n  margin: 0 0 8px;\n  font-size: 18px;\n}\np {\n  font-size: 13px;\n  color: #94a3b8;\n  line-height: 1.5;\n}\nbutton {\n  margin-top: 16px;\n  width: 100%;\n  padding: 10px;\n  background: linear-gradient(135deg, #6366f1, #8b5cf6);\n  color: white;\n  border: none;\n  border-radius: 10px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: transform 0.1s;\n}\nbutton:active {\n  transform: scale(0.97);\n}`,
      starterJs: `let count = 0;\nconst btn = document.getElementById('likeBtn');\nconst countSpan = document.getElementById('count');\n\nbtn.addEventListener('click', () => {\n  count++;\n  countSpan.textContent = count;\n});`,
      challenges: [
        "Card container has proper styling with rounded corners",
        "Button click increments the live counter",
        "Add a reset button or custom background gradient"
      ]
    },
    {
      taskId: "TASK-102",
      topic: "Web Dev Mid-Term Lab Exam",
      type: "Exam",
      prompt: "Standard timed assessment covering HTML5 semantics, CSS box model, and JavaScript fundamentals. Notice: Tab switching is monitored.",
      status: "PENDING",
      timeLimitMinutes: 15,
      deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
      options: [
        {
          q: "Examine the layout diagram below. In the CSS Box Model, which area is highlighted around the content?",
          image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
          imageCaption: "Figure 1: CSS Box Model & Layout Architecture",
          opts: ["Padding Area", "Margin Area", "Border Area", "Content Box"],
          ans: 1,
        },
        {
          q: "Which HTML5 semantic element is best suited to encapsulate content that is self-contained and independently distributable?",
          opts: ["<section>", "<article>", "<aside>", "<div>"],
          ans: 1,
        },
        {
          q: "What is the result of `typeof null` in standard JavaScript?",
          opts: ["'null'", "'undefined'", "'object'", "'boolean'"],
          ans: 2,
        },
        {
          q: "Which CSS Flexbox property controls how flex items wrap onto multiple lines?",
          opts: ["flex-flow", "flex-wrap", "align-content", "justify-items"],
          ans: 1,
        },
        {
          q: "Which method is used to attach an event handler to an element without overwriting existing handlers?",
          opts: ["element.onclick = fn", "element.addEventListener()", "element.attachHandler()", "element.listen()"],
          ans: 1,
        }
      ],
    },
    {
      taskId: "TASK-103",
      topic: "CSS Grid Responsive Portfolio",
      type: "Practical",
      prompt: "Build and deploy a mobile-responsive personal portfolio using modern CSS Grid and Flexbox techniques. Submit your live link (GitHub/Vercel).",
      status: "PENDING",
      deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
    {
      taskId: "TASK-104",
      topic: "API Data Fetching & State Handling",
      type: "Practical",
      prompt: "Connect to a public REST API (e.g. JSONPlaceholder), display items in cards, and handle loading and error states cleanly.",
      status: "MISSING",
      deadline: new Date(Date.now() - 86400000).toISOString(),
    },
  ],

  demoTutorials: [
    {
      id: "TUT-001",
      category: "HTML",
      title: "HTML5 Semantic Architecture",
      readTime: "4 min read",
      summary: "Understand why semantic tags like <main>, <header>, and <article> boost accessibility, SEO, and lab code clarity.",
      keyPoints: [
        "Use <header> and <footer> for site/section navigation and metadata",
        "<main> should only appear once per page for the primary content",
        "<article> is for standalone content; <section> is for thematic groupings",
        "<nav> should wrap primary navigation links"
      ],
      codeSnippet: `<!-- Modern Semantic Page Skeleton -->\n<header>\n  <h1>Studio Portal</h1>\n  <nav>\n    <a href="#about">About</a>\n    <a href="#labs">Labs</a>\n  </nav>\n</header>\n\n<main>\n  <article>\n    <h2>Semantic HTML Guide</h2>\n    <p>Semantic tags make your code accessible and readable.</p>\n  </article>\n</main>\n\n<footer>\n  <p>&copy; 2026 SkillStudio</p>\n</footer>`
    },
    {
      id: "TUT-002",
      category: "CSS",
      title: "Mastering CSS Flexbox Layouts",
      readTime: "5 min read",
      summary: "One-dimensional layout power: align, distribute, and center items vertically and horizontally in seconds.",
      keyPoints: [
        "Set display: flex on the parent container",
        "justify-content controls the main axis (horizontal by default)",
        "align-items controls the cross axis (vertical centering)",
        "flex-wrap: wrap allows items to stack neatly on mobile screens"
      ],
      codeSnippet: `/* Perfect Center & Responsive Wrap */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n  flex-wrap: wrap;\n  padding: 20px;\n}\n\n.item {\n  flex: 1 1 200px; /* grow, shrink, min-width */\n  background: #38bdf8;\n  padding: 24px;\n  border-radius: 12px;\n  text-align: center;\n}`
    },
    {
      id: "TUT-003",
      category: "CSS",
      title: "CSS Grid: 2D Dashboard & Card Systems",
      readTime: "6 min read",
      summary: "Build bulletproof 12-column layouts and auto-fitting responsive card systems with repeat(auto-fit, minmax(...)).",
      keyPoints: [
        "Use grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))",
        "gap: 16px creates clean gutters without messy margin resets",
        "Combine Grid for overall layout with Flexbox for internal card details"
      ],
      codeSnippet: `/* Auto-Responsive Grid (Zero Media Queries Needed!) */\n.grid-gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: 20px;\n}\n\n.card {\n  background: #1e293b;\n  color: #fff;\n  border-radius: 16px;\n  padding: 20px;\n  border: 1px solid #334155;\n}`
    },
    {
      id: "TUT-004",
      category: "JavaScript",
      title: "DOM Manipulation & Event Listeners",
      readTime: "5 min read",
      summary: "Select elements with querySelector, react to clicks, input, and submit events dynamically without page refreshes.",
      keyPoints: [
        "Always prefer addEventListener over inline onclick attributes",
        "Use template literals (backticks `) for dynamic string interpolation",
        "Use event.preventDefault() to intercept form submissions cleanly"
      ],
      codeSnippet: `// Interactive Task Check Toggle\nconst btn = document.querySelector('#toggleBtn');\nconst banner = document.querySelector('#statusBanner');\n\nbtn.addEventListener('click', (e) => {\n  e.preventDefault();\n  banner.classList.toggle('active');\n  banner.textContent = banner.classList.contains('active') \n    ? 'Status: Completed! 🎉' \n    : 'Status: Pending ⏳';\n});`
    },
    {
      id: "TUT-005",
      category: "JavaScript",
      title: "Asynchronous JavaScript & Fetch API",
      readTime: "6 min read",
      summary: "Fetch real-time data from REST APIs using async/await and gracefully handle errors with try/catch blocks.",
      keyPoints: [
        "Always wrap async operations in a try/catch block",
        "Check response.ok before parsing JSON (res.ok is false for 404/500)",
        "Set loading state before fetch and clear it in finally"
      ],
      codeSnippet: `async function loadUserData(userId) {\n  try {\n    const res = await fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`);\n    if (!res.ok) throw new Error(\`HTTP error: \${res.status}\`);\n    const user = await res.json();\n    console.log('User loaded:', user.name);\n  } catch (error) {\n    console.error('Failed to load user:', error.message);\n  }\n}`
    },
  ],

  demoStats: {
    totalScore: 88,
    classworkAvg: 95,
    homeworkAvg: 90,
    quizAvg: 85,
    practicalAvg: 90,
    labIndvExamAvg: 82,
    labGruExamAvg: 88,
    project: 86,
    exBook: 92,
  },
};
