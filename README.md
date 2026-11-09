# SkillStudio: Continuous Assessment & EdTech Studio

A modern, customizable educational technology platform built with **React 19**, **Vite**, and **Tailwind CSS**. Optimized for school computer labs, family-shared phones, and **Telegram WebApp Mini Apps**.

Designed for **Web Design & Development** courses and fully customizable for any other subject, school, or teacher.

---

## 🌟 Key Features

### 1. 💻 In-App Hands-On Code Sandbox (HTML/CSS/JS)
- **Zero-Install Coding**: Students write HTML5, CSS3, and JavaScript directly inside the browser.
- **Instant Live Preview**: Isolated sandbox `<iframe>` reflects code changes in real-time.
- **Built-in Lab Challenges**: Step-by-step checklist to guide students through hands-on exercises.
- **One-Click Submission & Export**: Direct submission of code solutions to the gradebook or download as `.html`.

### 2. 📖 Interactive Tutorials & Cheatsheet ("Learn" Tab)
- **Bite-Sized Lessons**: Semantic HTML5, CSS Flexbox, CSS Grid, DOM Manipulation, and Async Fetch API.
- **"🚀 Try in Playground"**: One-click transfer of tutorial code snippets directly into the live code runner.
- **Syntax Cheatsheets**: Quick copy buttons for fast reference during lab sessions.

### 3. 🛡️ Secure Exam Engine (Academic Integrity)
- **Countdown Timer**: Real-time timer with automatic submission upon time expiration.
- **Anti-Cheating Tab Monitor**: Detects and logs whenever a student switches away from the exam tab.
- **Question Shuffling**: Shuffles questions and answer options so adjacent lab screens don't match.
- **Review & Jump Matrix**: Quick-jump buttons indicating answered and unanswered questions.

### 4. 🌗 Light and Dark Mode
- **Instant Theme Toggle**: Switch between **Dark Mode** (deep slate & indigo for comfort) and **Light Mode** (high-contrast for daytime lab monitors and projectors).
- **Persistent Preference**: Remembers the selected theme in `localStorage`.

### 5. 🔒 Shared Lab & Family Phone Safety
- **Stealth Teacher Portal**: Hidden from students. Accessible only via:
  - 🎓 5 taps on the logo.
  - <kbd>Alt</kbd> + <kbd>T</kbd> on any computer keyboard.
  - URL query `?mode=teacher`.
- **Student 4-Digit PIN**: Prevents classmates or siblings on shared devices from accessing another student's account.
- **Student PIN Change**: Accessible via `[🔑 Change PIN]` on the dashboard profile card.
- **"Keep me logged in" Toggle**: Uses `sessionStorage` when unchecked (ideal for school lab computers).

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📊 Complete Google Sheet Backend Setup

Your backend runs on Google Sheets + Google Apps Script, which is free, requires zero server maintenance, and allows you to view and edit student grades directly in Google Drive.

### Sheet Architecture (5 Tabs)

Create a new Google Sheet named **"SkillStudio Gradebook"** with these 5 tabs:

#### 1. `Roster` Tab
Holds the student list, assigned class sections, and student PINs.
| Column A | Column B | Column C | Column D |
|---|---|---|---|
| **Name** | **Section** | **StudentID** | **PIN** |
| Alex Morgan | A | STU-001 | 1234 |
| Bethany Chen | A | STU-002 | 1234 |
| Carlos Rivera | B | STU-003 | 1234 |

#### 2. `Tasks` Tab
Defines the assignments, coding labs, and exams.
| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I | Column J | Column K |
|---|---|---|---|---|---|---|---|---|---|---|
| **TaskID** | **Topic** | **Type** | **Prompt** | **Deadline** | **TimeLimitMinutes** | **StarterHTML** | **StarterCSS** | **StarterJS** | **Challenges** | **OptionsJSON** |
| TASK-101 | Interactive Button | CodingLab | Build an interactive card layout... | 2026-11-20T00:00:00Z | 0 | `<div>...</div>` | `body { ... }` | `let count = 0;...` | Checklist item 1,Checklist item 2 | |
| TASK-102 | Mid-Term Exam | Exam | Standard timed assessment... | 2026-11-25T00:00:00Z | 15 | | | | | `[{"q":"...","opts":["A","B"],"ans":0}]` |

> 💡 **Question with Image Format (Google Form style):**  
> In `OptionsJSON`, questions can include `image` and `imageCaption` fields:  
> `[{"q":"Identify the layout:","image":"https://example.com/diagram.png","imageCaption":"Fig 1: Grid Layout","opts":["Flexbox","Grid","Float"],"ans":1}]`

#### 3. `Submissions` Tab
Automatically records every student or group submission.
| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H |
|---|---|---|---|---|---|---|---|
| **Timestamp** | **StudentName** | **TaskID** | **TaskType** | **Score** | **Submission** | **GroupMembers** | **TabSwitchCount** |

#### 4. `Gradebook` Tab
Displays cumulative category averages and overall final scores.
| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I | Column J |
|---|---|---|---|---|---|---|---|---|---|
| **StudentName** | **ClassWork** | **HomeWork** | **QuizAvg** | **PracticalAvg** | **LabIndvExam** | **LabGruExam** | **Project** | **ExerciseBook** | **TotalScore** |

#### 5. `CourseSettings` Tab
| Column A | Column B |
|---|---|
| **Key** | **Value** |
| courseTitle | Web Design & Development Studio |
| teacherPin | 1234 |

---

## ⚡ Google Apps Script Code & Deployment

1. Inside your Google Sheet, click **Extensions** > **Apps Script**.
2. Replace everything in `Code.gs` with the code in [`backend/Code.gs`](./backend/Code.gs).
3. In the toolbar, select the function **`initialSetup`** and click **Run**. Grant permissions when prompted. (This auto-creates all 5 sheets with pre-formatted headers).
4. Click **Deploy** > **New deployment**.
5. Select **Web app** (gear icon).
6. Configure:
   - **Description**: `SkillStudio Production v2`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial so students can access from school/home without Google sign-in)*
7. Click **Deploy** and copy your **Web app URL** (`https://script.google.com/macros/s/.../exec`).

---

## 🌐 Deploy Frontend to GitHub & Vercel

```bash
# 1. Stage and commit all changes
git add .
git commit -m "Complete edtech app: group labs, responsive layout, dark mode, and Apps Script backend"

# 2. Push to your GitHub repository
git push origin main
```

### Free 1-Click Hosting on Vercel:
1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **"Add New Project"** and import `Talaksew/grade12assessment`.
3. Under **Environment Variables**, add:
   - Name: `VITE_API_URL`
   - Value: `https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec`
4. Click **Deploy**. Vercel will give you a live production URL (e.g. `https://grade12assessment.vercel.app`) in 30 seconds!
