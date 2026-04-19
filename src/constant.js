import { FaClipboardList, FaUserCheck, FaChartBar } from 'react-icons/fa';
const EXAMTYPE = ['Progressive Test', "Mid Term Test", "Term Examination", "General Paper"];
const ALL_EXAM_FILTERS = ["exam-types", "terms", "exam-active-sessions"]
const TERM = ['First Term', 'Second Term', 'Third Term'];
const menuItems = [
  { name: 'exams', key: 'exams', icon: <FaClipboardList /> },
  { name: 'attendance', key: 'attendance', icon: <FaUserCheck /> },
  { name: 'results', key: 'results', icon: <FaChartBar /> },
];
const fieldsWithFindAll = ["subjects", "class"]
const MOST_LIKELY_CHANGING_EXAM_FIELDS = ["subject", "type", "session", "term"];
// adminExamPageContent constant
export function HARD_KILL_CAMERA() {
  console.log("🛑 HARD CAMERA STOP triggered");

  // 1️⃣ Stop stream stored globally (recommended)
  if (window.__mediaStream) {
    window.__mediaStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch { }
    });

    window.__mediaStream = null;
  }

  // 2️⃣ Clear all video elements
  document.querySelectorAll("video").forEach((v) => {
    v.srcObject = null;
  });

  console.log("✅ Camera fully stopped");
}

const MODALTITLES = ['Create an Exam', "sure you wanna delete this exam"]
export { EXAMTYPE, TERM, menuItems, MODALTITLES, fieldsWithFindAll, MOST_LIKELY_CHANGING_EXAM_FIELDS, ALL_EXAM_FILTERS };