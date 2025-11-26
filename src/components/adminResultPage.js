import { useContext,useMemo } from "react"
import { AdminContext } from "../pages/adminPage"
import { useQuery } from "@tanstack/react-query"
import { fetchAllData } from "../api/baseAxious"
import SmartInputDropdown from "./smart_input_dropdown"
import { EXAMTYPE } from "../constant"

export const ResultPage = () => {
  const { resultDetails, updateResultDetail } = useContext(AdminContext);

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

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <h4>Loading selection filters...</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">

        {Object.keys(resultDetails).map((key) => {
          const options =
            key === "className"
              ? viewableClasses
              : key === "subject"
              ? viewableSubjects
              : EXAMTYPE;

          return (
            <div
              className={`col-${12 / Object.keys(resultDetails).length}`}
              key={key}
            >
              <SmartInputDropdown
                label={`Select a ${key}`}
                value={resultDetails[key]}
                onChange={(value) => {
                  updateResultDetail(key, value)
                }}
                options={options}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
