import { useContext, useMemo } from "react"
import { AdminContext } from "../pages/adminPage"
import { useQuery } from "@tanstack/react-query"
import { fetchAllData } from "../api/baseAxious"
import SmartInputDropdown from "./smart_input_dropdown"
import { EXAMTYPE } from "../constant"
export const ResultPage = () => {
  const {
    resultDetails,
    updateResultDetail,
    allSessions,
    allTerms,
    sessionsLoading,
    termsLoading
  } = useContext(AdminContext);

  // ---- Fetch classes ----
  const {
    data: allClasses = [],
    isLoading: classLoading,
    error: classError,
  } = useQuery({
    queryKey: ["class"],
    queryFn: () => fetchAllData("class"),
  });

  // ---- Fetch subjects ----
  const {
    data: allSubjects = [],
    isLoading: subjectsLoading,
    error: subjectError,
  } = useQuery({
    queryKey: ["subject"],
    queryFn: () => fetchAllData("subjects"),
  });
  // ---- Memoize processed options ----
  const { viewableSubjects, viewableClasses } = useMemo(() => {
    if (subjectError || classError) {
      return { viewableSubjects: [], viewableClasses: [] };
    }
    return {
      viewableSubjects: allSubjects.map((s) => s.Name),
      viewableClasses: allClasses.map((c) => c.Name),
    };
  }, [allSubjects, allClasses, subjectError, classError]);

  // ---- Handle loading globally ----
  const isLoading = classLoading || subjectsLoading;

  if (isLoading || termsLoading || sessionsLoading) {
    return (
      <div className="text-center py-4">
        <h4>Loading selection filters...</h4>
      </div>
    );
  }
  const options_resolve = (key) => {
    switch (key) {
      case "className":
        return viewableClasses
      case "subject":
        return viewableSubjects
      case "term":
        return allTerms
      case "session":
        return allSessions
      default:
        return EXAMTYPE
    }
  }
  return (
    <div className="container-fluid">
      <div className="row">
        {Object.keys(resultDetails).map((key) => {
          const colSize = Math.floor(12 / Object.keys(resultDetails).length) || 1;
          return (
            <div
              className={`col-${colSize}`}
              key={key}
            >
              <SmartInputDropdown
                label={`Select a ${key}`}
                value={resultDetails[key]}
                onChange={(value) => {
                  updateResultDetail(key, value)
                }}
                options={options_resolve(key)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
