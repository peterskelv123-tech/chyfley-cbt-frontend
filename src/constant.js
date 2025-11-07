import { FaClipboardList, FaUserCheck, FaChartBar } from 'react-icons/fa';
const EXAMTYPE = ['Progressive Test', "Mid Term Test", "Term Examination", "General Paper"];
const TERM = ['First Term', 'Second Term', 'Third Term'];
const menuItems = [
        { name: 'exams', key: 'exams', icon: <FaClipboardList /> },
        { name: 'attendance', key: 'attendance', icon: <FaUserCheck /> },
        { name: 'results', key: 'results', icon: <FaChartBar /> },
    ];
// adminExamPageContent constant
const MODALTITLES=['Create an Exam',"sure you wanna delete this exam"]
export{EXAMTYPE,TERM,menuItems,MODALTITLES};