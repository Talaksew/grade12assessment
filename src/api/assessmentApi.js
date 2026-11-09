import { APP_CONFIG } from '../config/appConfig';

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbzjIc9kqa_rVf8IVabl3Jt9dnewQsIJq0jBGOlWDD9X_x8_CFnTdr8OcvMjGA5gY5ru3Q/exec";

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

/**
 * Validate whether a string is a valid HTTP/HTTPS URL
 */
export function isValidHttpUrl(string) {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Fetch all tasks, roster list, individual student stats, and tutorials.
 */
export async function fetchAssessmentData(studentName) {
  const url = studentName
    ? `${API_URL}?studentName=${encodeURIComponent(studentName)}`
    : API_URL;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      tasks: data.tasks || APP_CONFIG.demoTasks,
      rosterList: data.rosterList || APP_CONFIG.demoRoster,
      studentStats: data.studentStats || APP_CONFIG.demoStats,
      tutorials: data.tutorials || APP_CONFIG.demoTutorials,
      courseTitle: data.courseTitle || APP_CONFIG.defaultCourseTitle,
      isDemo: false,
    };
  } catch (err) {
    console.warn("Live API connection unreachable, loading offline demo data:", err);
    return {
      tasks: APP_CONFIG.demoTasks,
      rosterList: APP_CONFIG.demoRoster,
      studentStats: APP_CONFIG.demoStats,
      tutorials: APP_CONFIG.demoTutorials,
      courseTitle: APP_CONFIG.defaultCourseTitle,
      isDemo: true,
    };
  }
}

/**
 * Submit an individual task (quiz, exam, coding lab, or practical project submission).
 */
export async function submitTask({
  userId,
  studentName,
  task,
  score = null,
  submissionText = '',
  groupMembers = [],
  answers = null,
  tabSwitchCount = 0,
  codeSubmission = null,
}) {
  const isQuiz = task.type.toLowerCase().includes('quiz') || task.type.toLowerCase().includes('exam');

  let finalSubmission = submissionText;
  let finalGroup = [];

  if (groupMembers && groupMembers.length > 0) {
    finalGroup = Array.from(new Set([studentName, ...groupMembers]));
  }

  if (codeSubmission) {
    finalSubmission = `[Live Code Lab Solution Submitted]\nHTML: ${codeSubmission.html?.length || 0} chars | CSS: ${codeSubmission.css?.length || 0} chars | JS: ${codeSubmission.js?.length || 0} chars`;
    if (finalGroup.length > 0) {
      finalSubmission += `\n[Group Members: ${finalGroup.join(', ')}]`;
    }
  } else if (isQuiz) {
    finalSubmission = score !== null ? `Score Achieved: ${score}%` : 'Assessment Submitted';
    if (tabSwitchCount > 0) {
      finalSubmission += ` (Notice: Focus switched away ${tabSwitchCount} times)`;
    }
  } else {
    finalSubmission = submissionText;
    if (finalGroup.length > 0) {
      finalSubmission += ` [Group Members: ${finalGroup.join(', ')}]`;
    }
  }

  const payload = {
    userId: userId || "Web_User",
    userName: studentName,
    taskId: task.taskId,
    taskType: task.type,
    submission: finalSubmission,
    score: score,
    answers: answers,
    tabSwitchCount: tabSwitchCount,
    codeSubmission: codeSubmission,
    groupMembers: finalGroup.length > 0 ? finalGroup : null,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return response;
  } catch (err) {
    console.warn("Retrying with no-cors fallback:", err);
    return await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

/**
 * Submit batch grading marks for teacher mode.
 */
export async function submitBatchGrades({
  students,
  section,
  activityType,
  topic,
  score,
  teacherPin,
}) {
  const payload = {
    isBatch: true,
    teacherPin: teacherPin || "",
    students,
    section,
    activityType,
    topic: topic || `${activityType} Session`,
    score: Number(score),
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return response;
  } catch (err) {
    console.warn("Retrying with no-cors fallback:", err);
    return await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

/**
 * Update student 4-digit security PIN.
 */
export async function updateStudentPin({ studentName, currentPin, newPin }) {
  const payload = {
    action: "changePin",
    studentName,
    currentPin,
    newPin,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return response;
  } catch (err) {
    console.warn("Retrying with no-cors fallback:", err);
    return await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}
