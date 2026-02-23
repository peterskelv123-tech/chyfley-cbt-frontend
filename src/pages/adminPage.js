import { useMemo, useState, useEffect, createContext, useRef, useCallback } from 'react';
import DashboardHeader from '../components/dashboardWelcome';
import { ALL_EXAM_FILTERS, menuItems } from '../constant';
import { fetchExamDetails, fetchResults, fetchExamDetailFilters, downloadResult } from '../api/baseAxious';
import { usePagination } from '../customHookes/usePaginated';
import { useExamTabs } from '../customHookes/useExamtab';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { AdminExamPageContent } from '../components/adminExamContent';
import { createSocket } from '../api/socket';
import { api } from '../api/baseAxious';
import { AdminAttendancePage } from '../components/adminAttendancePageContent';
import { ResultPage } from '../components/adminResultPage';
import SmartTable from '../components/table';

export const AdminContext = createContext(null);
export const SidebarApp = () => {
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const {
    data: allSessions = [],
    isLoading: sessionsLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["session"],
    queryFn: () => fetchExamDetailFilters(ALL_EXAM_FILTERS[2]),
  });
  const {
    data: allTerms = [],
    isLoading: termsLoading,
    error: termsError,
  } = useQuery({
    queryKey: ["term"],
    queryFn: () => fetchExamDetailFilters(ALL_EXAM_FILTERS[1]),
  });
  const {
    data: allExamTypes = [],
    isLoading: examTypesLoading,
    error: examTypesError,
  } = useQuery({
    queryKey: ["exam-type"],
    queryFn: () => fetchExamDetailFilters(ALL_EXAM_FILTERS[0]),
  });
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon("/exams/cleanup", new Blob([JSON.stringify({})], { type: 'application/json' }));
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
  const deleteExamStatus = useMutation({
    mutationFn: (resultId) => api.delete("/results", { params: { resultId } }),
    onMutate: (variables) => {
      console.log("deleting student result:", variables);
    },
    onSuccess: () => {
      alert("Result deleted successfully");
    },
    onError: (error, variables) => {
      alert("Failed to delete result:", error);
      console.error("Failed to delete result for:", variables, "Error:", error);
    },
  });
  const [activeTab, setActiveTab] = useState("exams");
  const [allpages, setAllPages] = useState({
    exams: { pageNo: 1, totalPages: null, searchKey: "", otherFilters: {} },
    attendance: { pageNo: 1, totalPages: null },
    results: { pageNo: 1, totalPages: null },
  });
  useEffect(() => {
    const otherFilParam = {}
    ALL_EXAM_FILTERS.forEach(filterKey => {
      otherFilParam[filterKey] = ""
    })
    setAllPages(prev => ({ ...prev, exams: { ...prev.exams, otherFilters: otherFilParam } }))
  }, [])
  const [resultDetails, setResultDetails] = useState({ className: "", subject: "", examType: "", term: "", session: "" })
  // Fetching functions
  const allFetchingFunctions = {
    exams: fetchExamDetails,
    attendance: () => queryClient.getQueryData(["attendance"]) || [],
    results: fetchResults
  };
  const updateExamdetailsOtherFilter = (filterKey, value) => {
    console.log("Updating exam details filter:", filterKey, "to", value);
    setAllPages(prev => ({
      ...prev,
      exams: {
        ...prev.exams,
        otherFilters: {
          ...prev.exams.otherFilters,
          [filterKey]: value
        }
      }
    }))
  }
  // Initialize / cleanup socket only when attendance tab is active
  const updateResultDetail = (key, value) => {
    setResultDetails((prev) => { return { ...prev, [key]: value } })
  }
  useEffect(() => {
    if (activeTab !== "attendance") return;
    if (socketRef.current) return;

    const s = createSocket();
    socketRef.current = s;

    s.on("connect", () => {
      console.log("✅ Attendance socket connected:", s.id);
    });

    const handleAttendanceUpdate = (data) => {
      console.log("Attendance update:", data);
      queryClient.setQueryData(["attendance"], data);
    };

    s.on("attendance-update", handleAttendanceUpdate);

    // Optional: fetch initial snapshot
    s.emit("admin-join");

    return () => {
      s.off("attendance-update", handleAttendanceUpdate);
      s.disconnect();
      socketRef.current = null;
    };
  }, [activeTab, queryClient]);
  const { data: activeTabData, isLoading, error } = useExamTabs(
    activeTab,
    allpages,
    allFetchingFunctions,
    activeTab === "results" ? Object.values(resultDetails) : undefined
  );

  const isPaginated = activeTabData?.paginated;
  const { setTotalPages, changePage } = usePagination(
    !!isPaginated,
    allpages,
    setAllPages
  );

  const invalidate = {
    current: () =>
      queryClient.invalidateQueries({
        queryKey: [activeTab, allpages[activeTab].pageNo],
      }),
    all: () =>
      queryClient.invalidateQueries({
        queryKey: [activeTab],
      }),
  };

  useEffect(() => {
    if (activeTabData?.paginated) {
      setTotalPages(activeTab, activeTabData.totalPages);
    }
  }, [activeTab, activeTabData, setTotalPages]);
  const value = useMemo(
    () => ({
      activeTab,
      pageInfo: allpages[activeTab],
      activeTabData,
      isLoading,
      error,
      invalidate,
      otherFilters: allpages.exams.otherFilters,
      updateExamdetailsOtherFilter,
      resultDetails,
      updateResultDetail,
      changeDataPage: (page) => {
        changePage(activeTab, page);
        queryClient.invalidateQueries([activeTab, allpages[activeTab].pageNo]);
      },
      allSessions,
      allExamTypes,
      allTerms,
      termsLoading,
      sessionsLoading,
      examTypesLoading,
      changeSearchKey: (searchKey) => {
        changePage(activeTab, 1, searchKey);
        //console.log("Changing search key for", activeTab, "to", searchKey);
        queryClient.invalidateQueries([activeTab, 1, searchKey]);
      }
      ,
      socket: socketRef.current,
      queryClient,
    }),
    [
      activeTab,
      allpages,
      activeTabData,
      isLoading,
      error,
      resultDetails,
      changePage,
      socketRef.current,
      queryClient,
    ]
  );
  const helpRetakeExam = useCallback((regNo) => {
    if (!regNo && !Object.values(resultDetails).includes("")) return;
    try {
      deleteExamStatus.mutate(regNo);
      queryClient.setQueryData(['results', ...Object.values(resultDetails)], (oldData) => {
        if (!oldData || !oldData.contents) return oldData;
        const updatedContents = oldData.contents.filter(item => item.regNo !== regNo);
        return { ...oldData, contents: updatedContents };
      });
      console.log(queryClient.getQueryData(['results', ...Object.values(resultDetails)]));
    } catch (e) {
      console.error("Error during retake process:", e);
    }
    // Implement retake logic here
  }, [resultDetails, deleteExamStatus, queryClient]);

  const TAB_COMPONENTS = {
    exams: AdminExamPageContent,
    attendance: AdminAttendancePage,
    results: () => {
      // will contain the result of the fetch result tab
      const showResults = !Object.values(resultDetails).includes("");
      return (
        <>{!showResults
          && <div>Results content goes here</div>}
          {showResults
            && <SmartTable
              actions={{ "allow retake": helpRetakeExam }}
              contents={queryClient.getQueryData(["results", ...Object.values(resultDetails)])?.contents ?? activeTabData}
              hide={['id', 'examId']}
              tableActions={{ "Download results": () => downloadResult(resultDetails['className'], resultDetails['subject'], resultDetails['examType'], resultDetails['session'], resultDetails['term']) }}
            />}
        </>);
    },
  };

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="container-fluid">
      <DashboardHeader />
      <div className="row">
        <div className="col-2 bg-light vh-100">
          <ul className="nav flex-column p-3">
            {menuItems.map((item, index) => (
              <li
                key={`${item.name}_${index}`}
                className={`nav-item mb-3 d-flex align-items-center p-2 rounded ${activeTab === item.key ? "bg-primary text-white" : "text-dark"
                  }`}
                onClick={() => setActiveTab(item.key)}
                style={{ cursor: "pointer" }}
              >
                <span className="me-2">{item.icon}</span>
                <span style={{ textTransform: "capitalize" }}>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-10 p-4">
          <AdminContext.Provider value={value}>
            {isLoading && (activeTab !== "results") && (
              <div className="text-center">
                <h4>Loading {activeTab}...</h4>
              </div>
            )}
            {error && (!Object.values(resultDetails).includes("")) && (
              <div className="text-danger">
                <h4>Failed to load {activeTab}</h4>
              </div>
            )}
            {activeTab === "results" && (
              <>
                <ResultPage />
                {!isLoading && !error && <ActiveTabComponent />}
              </>
            )}
            {activeTab !== "results" && (!isLoading || activeTab === "attendance") && !error && (
              <ActiveTabComponent />
            )}
          </AdminContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default SidebarApp;
