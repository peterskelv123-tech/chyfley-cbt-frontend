import React, { useMemo, useState, useEffect, createContext } from 'react';
import DashboardHeader from '../components/dashboardWelcome';
import { menuItems } from '../constant';
import { fetchExamDetails } from '../api/baseAxious';
import { usePagination } from '../customHookes/usePaginated';
import { useExamTabs } from '../customHookes/useExamtab';
import { useQueryClient } from '@tanstack/react-query';
import { AdminExamPageContent } from '../components/adminExamContent';
export const AdminContext = createContext(null);
const SidebarApp = () => {
    const queryClient = useQueryClient();

    const allFetchingFunctions = { 
        exams: fetchExamDetails,
        // attendance: fetchAttendance,
        // results: fetchResults
    };

    const [activeTab, setActiveTab] = useState('exams');

    const [allpages, setAllPages] = useState({
        exams: { pageNo: 1, totalPages: null },
        attendances: { pageNo: 1, totalPages: null },
        results: { pageNo: 1, totalPages: null },
    });

    // ✅ Fetch active tab data
    const { data: activeTabData, isLoading, error } = useExamTabs(
        activeTab,
        allpages,
        allFetchingFunctions
    );

    // ✅ Pagination utils
    const isPaginated = !!activeTabData?.paginated;
    const { setTotalPages, changePage } = usePagination(isPaginated, allpages, setAllPages);

    // ✅ Invalidate query for active tab
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: [activeTab],
        });
    };

    // ✅ Update total pages when active tab changes
    useEffect(() => {
        if (activeTabData?.paginated) {
            setTotalPages(activeTab, activeTabData.totalPages);
        }
    }, [activeTab, activeTabData]);

    // ✅ Context value
    const value = useMemo(() => ({
        activeTab,
        allpages,
        activeTabData,
        isLoading,
        error,
        invalidate,
        changePage,
    }), [activeTab, allpages, activeTabData, isLoading, error, changePage]);

    // ✅ Component mapping instead of switch
    const TAB_COMPONENTS = {
        exams: AdminExamPageContent,
        attendance: () => <div>Attendance content goes here</div>,
        results: () => <div>Results content goes here</div>,
    };

    const ActiveTabComponent = TAB_COMPONENTS[activeTab];

    return (
        <div className="container-fluid">
            <DashboardHeader />

            <div className="row">
                {/* Sidebar */}
                <div className="col-2 bg-light vh-100">
                    <ul className="nav flex-column p-3">
                        {menuItems.map((item, index) => (
                            <li
                                key={`${item.name}_${index}`}
                                className={`nav-item mb-3 d-flex align-items-center p-2 rounded ${
                                    activeTab === item.key ? "bg-primary text-white" : "text-dark"
                                }`}
                                onClick={() => setActiveTab(item.key)}
                                style={{ cursor: "pointer" }}
                            >
                                <span className="me-2">{item.icon}</span>
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Content */}
                <div className="col-10 p-4">
                    <AdminContext.Provider value={value}>
                        <ActiveTabComponent />
                    </AdminContext.Provider>
                </div>
            </div>
        </div>
    );
};

export default SidebarApp;
