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
  // 1. Stop tracks from our camera component
  if (window.__stopCamera) {
    try { window.__stopCamera(); } catch { }
  }

  // 2. Stop all active media streams in the browser
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        console.log("✅ HARD CAMERA STOP: All tracks force-closed");
      })
      .catch(() => { });
  }

  // 3. Remove all srcObject references
  document.querySelectorAll("video").forEach(v => (v.srcObject = null));
}

const MODALTITLES = ['Create an Exam', "sure you wanna delete this exam"]
export { EXAMTYPE, TERM, menuItems, MODALTITLES, fieldsWithFindAll, MOST_LIKELY_CHANGING_EXAM_FIELDS, ALL_EXAM_FILTERS };