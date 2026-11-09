/**
 * SkillStudio & Grade 12 Assessment Backend (Google Apps Script)
 * Complete automated backend for Roster, Tasks, Submissions, Gradebook, and PIN Management.
 */

// 1. Spreadsheet Initialization and Schema Definition
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Run this function once from the Apps Script editor to initialize all tabs with headers and starter data!
 */
function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Roster Sheet
  var rosterSheet = getOrCreateSheet(ss, "Roster", ["Name", "Section", "StudentID", "PIN"]);
  if (rosterSheet.getLastRow() === 1) {
    rosterSheet.appendRow(["Alex Morgan", "A", "STU-001", "1234"]);
    rosterSheet.appendRow(["Bethany Chen", "A", "STU-002", "1234"]);
    rosterSheet.appendRow(["Carlos Rivera", "B", "STU-003", "1234"]);
    rosterSheet.appendRow(["Diana Prince", "B", "STU-004", "1234"]);
  }

  // 2. Tasks Sheet
  var tasksSheet = getOrCreateSheet(ss, "Tasks", [
    "TaskID",
    "Topic",
    "Type",
    "Prompt",
    "Deadline",
    "TimeLimitMinutes",
    "StarterHTML",
    "StarterCSS",
    "StarterJS",
    "Challenges",
    "OptionsJSON"
  ]);

  if (tasksSheet.getLastRow() === 1) {
    var in2Days = new Date(Date.now() + 86400000 * 2).toISOString();
    var in4Days = new Date(Date.now() + 86400000 * 4).toISOString();

    tasksSheet.appendRow([
      "TASK-101",
      "Interactive Button & Card Layout",
      "CodingLab",
      "Build an interactive card layout with a button that updates the like counter dynamically when clicked.",
      in2Days,
      0,
      '<div class="card">\\n  <h2>Product Design Card</h2>\\n  <button id="likeBtn">❤️ Like (<span id="count">0</span>)</button>\\n</div>',
      'body { font-family: sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; min-height: 80vh; }\\n.card { background: #1e293b; padding: 20px; border-radius: 12px; }\\nbutton { padding: 10px 16px; border-radius: 8px; background: #6366f1; color: white; border: none; cursor: pointer; }',
      'let count = 0; const btn = document.getElementById("likeBtn"); const span = document.getElementById("count"); btn.addEventListener("click", () => { count++; span.textContent = count; });',
      "Proper card styling,Live counter increment on click,Custom styles or reset button",
      ""
    ]);

    var sampleExamQuestions = [
      {
        q: "In the CSS Box Model, which layer is between the padding and margin?",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        imageCaption: "Figure 1: CSS Box Model Architecture",
        opts: ["Border", "Content", "Outline", "Margin Box"],
        ans: 0
      },
      {
        q: "Which HTML5 semantic element is best suited for standalone article content?",
        opts: ["<section>", "<article>", "<aside>", "<div>"],
        ans: 1
      },
      {
        q: "What is the result of typeof null in JavaScript?",
        opts: ["'null'", "'undefined'", "'object'", "'boolean'"],
        ans: 2
      }
    ];

    tasksSheet.appendRow([
      "TASK-102",
      "Web Dev Mid-Term Lab Exam",
      "Exam",
      "Standard timed assessment covering HTML5 semantics, CSS box model, and JavaScript fundamentals.",
      in4Days,
      15,
      "",
      "",
      "",
      "",
      JSON.stringify(sampleExamQuestions)
    ]);
  }

  // 3. Submissions Sheet
  getOrCreateSheet(ss, "Submissions", [
    "Timestamp",
    "StudentName",
    "TaskID",
    "TaskType",
    "Score",
    "Submission",
    "GroupMembers",
    "TabSwitchCount"
  ]);

  // 4. Gradebook Sheet
  var gradeSheet = getOrCreateSheet(ss, "Gradebook", [
    "StudentName",
    "ClassWork",
    "HomeWork",
    "QuizAvg",
    "PracticalAvg",
    "LabIndvExam",
    "LabGruExam",
    "Project",
    "ExerciseBook",
    "TotalScore"
  ]);

  if (gradeSheet.getLastRow() === 1) {
    gradeSheet.appendRow(["Alex Morgan", 95, 90, 85, 90, 82, 88, 86, 92, 88]);
    gradeSheet.appendRow(["Bethany Chen", 92, 94, 88, 92, 85, 90, 89, 90, 90]);
    gradeSheet.appendRow(["Carlos Rivera", 80, 85, 78, 84, 75, 80, 82, 85, 81]);
    gradeSheet.appendRow(["Diana Prince", 96, 98, 94, 96, 92, 95, 96, 95, 95]);
  }

  // 5. CourseSettings Sheet
  var settingsSheet = getOrCreateSheet(ss, "CourseSettings", ["Key", "Value"]);
  if (settingsSheet.getLastRow() === 1) {
    settingsSheet.appendRow(["courseTitle", "Web Design & Development Studio"]);
    settingsSheet.appendRow(["teacherPin", "1234"]);
  }

  SpreadsheetApp.flush();
  Logger.log("All sheets initialized successfully!");
}

// 2. HTTP GET Handler (Fetches Roster, Tasks, Individual Student Stats)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var studentName = e && e.parameter ? e.parameter.studentName : null;

    // A. Read Course Settings
    var settingsSheet = ss.getSheetByName("CourseSettings");
    var courseTitle = "Web Design & Development Studio";
    if (settingsSheet) {
      var sData = settingsSheet.getDataRange().getValues();
      for (var s = 1; s < sData.length; s++) {
        if (sData[s][0] === "courseTitle" && sData[s][1]) {
          courseTitle = sData[s][1];
        }
      }
    }

    // B. Read Roster
    var rosterSheet = ss.getSheetByName("Roster");
    var rosterList = [];
    if (rosterSheet && rosterSheet.getLastRow() > 1) {
      var rData = rosterSheet.getRange(2, 1, rosterSheet.getLastRow() - 1, 4).getValues();
      for (var i = 0; i < rData.length; i++) {
        var rName = String(rData[i][0] || "").trim();
        if (rName) {
          rosterList.push({
            name: rName,
            section: String(rData[i][1] || "A").trim(),
            id: String(rData[i][2] || ("STU-" + (i + 1))).trim(),
            pin: String(rData[i][3] || "1234").trim()
          });
        }
      }
    }

    // C. Read Submissions for Status Checking
    var submittedTaskMap = {};
    var subSheet = ss.getSheetByName("Submissions");
    if (studentName && subSheet && subSheet.getLastRow() > 1) {
      var subData = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, 3).getValues();
      for (var j = 0; j < subData.length; j++) {
        var subStudent = String(subData[j][1] || "").trim().toLowerCase();
        var subTaskId = String(subData[j][2] || "").trim();
        if (subStudent === studentName.trim().toLowerCase()) {
          submittedTaskMap[subTaskId] = true;
        }
      }
    }

    // D. Read Tasks
    var tasksSheet = ss.getSheetByName("Tasks");
    var tasks = [];
    if (tasksSheet && tasksSheet.getLastRow() > 1) {
      var tData = tasksSheet.getRange(2, 1, tasksSheet.getLastRow() - 1, 11).getValues();
      var now = new Date();

      for (var k = 0; k < tData.length; k++) {
        var tId = String(tData[k][0] || "").trim();
        if (!tId) continue;

        var deadlineStr = tData[k][4];
        var deadlineDate = deadlineStr ? new Date(deadlineStr) : null;
        var isDone = !!submittedTaskMap[tId];
        var isOverdue = deadlineDate && deadlineDate < now;
        var status = isDone ? "COMPLETED" : isOverdue ? "MISSING" : "PENDING";

        var challengesRaw = String(tData[k][9] || "").trim();
        var challengesList = challengesRaw ? challengesRaw.split(",").map(function(c) { return c.trim(); }) : [];

        var optionsJsonRaw = String(tData[k][10] || "").trim();
        var optionsParsed = [];
        if (optionsJsonRaw) {
          try {
            optionsParsed = JSON.parse(optionsJsonRaw);
          } catch (err) {
            optionsParsed = [];
          }
        }

        tasks.push({
          taskId: tId,
          topic: String(tData[k][1] || ""),
          type: String(tData[k][2] || "Practical"),
          prompt: String(tData[k][3] || ""),
          deadline: deadlineDate ? deadlineDate.toISOString() : null,
          timeLimitMinutes: Number(tData[k][5]) || 0,
          starterHtml: String(tData[k][6] || ""),
          starterCss: String(tData[k][7] || ""),
          starterJs: String(tData[k][8] || ""),
          challenges: challengesList,
          options: optionsParsed,
          status: status
        });
      }
    }

    // E. Read Student Stats / Gradebook
    var studentStats = {
      totalScore: 0,
      classworkAvg: 0,
      homeworkAvg: 0,
      quizAvg: 0,
      practicalAvg: 0,
      labIndvExamAvg: 0,
      labGruExamAvg: 0,
      project: 0,
      exBook: 0
    };

    var gradeSheet = ss.getSheetByName("Gradebook");
    if (studentName && gradeSheet && gradeSheet.getLastRow() > 1) {
      var gData = gradeSheet.getRange(2, 1, gradeSheet.getLastRow() - 1, 10).getValues();
      for (var m = 0; m < gData.length; m++) {
        var gName = String(gData[m][0] || "").trim().toLowerCase();
        if (gName === studentName.trim().toLowerCase()) {
          studentStats = {
            classworkAvg: Number(gData[m][1]) || 0,
            homeworkAvg: Number(gData[m][2]) || 0,
            quizAvg: Number(gData[m][3]) || 0,
            practicalAvg: Number(gData[m][4]) || 0,
            labIndvExamAvg: Number(gData[m][5]) || 0,
            labGruExamAvg: Number(gData[m][6]) || 0,
            project: Number(gData[m][7]) || 0,
            exBook: Number(gData[m][8]) || 0,
            totalScore: Number(gData[m][9]) || 0
          };
          break;
        }
      }
    }

    var result = {
      courseTitle: courseTitle,
      rosterList: rosterList,
      tasks: tasks,
      studentStats: studentStats
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. HTTP POST Handler (Task Submissions, Batch Grading, Student PIN Change)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};

    // Action A: Change Student PIN
    if (body.action === "changePin") {
      var rosterSheet = ss.getSheetByName("Roster");
      if (!rosterSheet) throw new Error("Roster sheet not found");

      var rValues = rosterSheet.getDataRange().getValues();
      var foundRow = -1;
      for (var r = 1; r < rValues.length; r++) {
        if (String(rValues[r][0] || "").trim().toLowerCase() === String(body.studentName || "").trim().toLowerCase()) {
          foundRow = r + 1; // 1-indexed for Sheet
          var currentSavedPin = String(rValues[r][3] || "1234").trim();
          if (currentSavedPin !== String(body.currentPin || "").trim() && currentSavedPin !== "") {
            return ContentService.createTextOutput(JSON.stringify({
              status: "error",
              message: "Current PIN does not match."
            })).setMimeType(ContentService.MimeType.JSON);
          }
          break;
        }
      }

      if (foundRow > 0) {
        rosterSheet.getRange(foundRow, 4).setValue(String(body.newPin).trim());
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "PIN updated successfully!"
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Student not found in roster."
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Action B: Teacher Batch Grading
    if (body.isBatch === true) {
      var subSheet = getOrCreateSheet(ss, "Submissions", [
        "Timestamp", "StudentName", "TaskID", "TaskType", "Score", "Submission", "GroupMembers", "TabSwitchCount"
      ]);

      var nowTimestamp = new Date();
      var batchStudents = body.students || [];

      for (var b = 0; b < batchStudents.length; b++) {
        subSheet.appendRow([
          nowTimestamp,
          batchStudents[b],
          body.topic || (body.activityType + " Session"),
          body.activityType,
          body.score,
          "Batch Graded by Teacher (" + (body.section || "All") + ")",
          "",
          0
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Logged marks for " + batchStudents.length + " students."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Action C: Student Individual / Group Task Submission
    var subSheet = getOrCreateSheet(ss, "Submissions", [
      "Timestamp", "StudentName", "TaskID", "TaskType", "Score", "Submission", "GroupMembers", "TabSwitchCount"
    ]);

    var timestamp = new Date();
    var primaryStudent = body.userName || "Anonymous";
    var groupMembers = body.groupMembers || [];
    var groupMembersStr = groupMembers.length > 0 ? groupMembers.join(", ") : "";

    // 1. Record primary student's submission
    subSheet.appendRow([
      timestamp,
      primaryStudent,
      body.taskId,
      body.taskType,
      body.score !== null ? body.score : "",
      body.submission || "",
      groupMembersStr,
      body.tabSwitchCount || 0
    ]);

    // 2. Automatically record submissions for tagged group partners
    if (groupMembers.length > 1) {
      for (var g = 0; g < groupMembers.length; g++) {
        var partnerName = groupMembers[g];
        if (partnerName && partnerName.trim().toLowerCase() !== primaryStudent.trim().toLowerCase()) {
          subSheet.appendRow([
            timestamp,
            partnerName.trim(),
            body.taskId,
            body.taskType,
            body.score !== null ? body.score : "",
            (body.submission || "") + " [Group submission submitted by " + primaryStudent + "]",
            groupMembersStr,
            0
          ]);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Submission recorded successfully!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

