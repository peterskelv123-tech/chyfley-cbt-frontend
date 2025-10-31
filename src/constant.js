import { FaClipboardList, FaUserCheck, FaChartBar } from 'react-icons/fa';
const EXAMTYPE = ['Progressive Test', "Mid Term Test", "Term Examination", "General Paper"];
const TERM = ['First Term', 'Second Term', 'Third Term'];
const menuItems = [
        { name: 'Exams', key: 'exams', icon: <FaClipboardList /> },
        { name: 'Attendance', key: 'attendance', icon: <FaUserCheck /> },
        { name: 'Results', key: 'results', icon: <FaChartBar /> },
    ];

export{EXAMTYPE,TERM,menuItems};