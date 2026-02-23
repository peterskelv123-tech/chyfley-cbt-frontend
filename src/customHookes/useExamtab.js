// useExamTabs.js
import { useQuery } from "@tanstack/react-query";
import { ALL_EXAM_FILTERS } from "../constant";
export const useExamTabs = (activeTab, allpages, allFetchingFunctions, examDetails) => {
  const isResults = activeTab === "results";
  const currentPage = allpages[activeTab];
  const filters = ALL_EXAM_FILTERS.map(key => currentPage?.otherFilters?.[key]);
  const areAllFiltersSet = filters.every(Boolean);

  return useQuery({
    queryKey: isResults
      ? ["results", ...examDetails]
      : [
          activeTab,
          currentPage?.pageNo,
          currentPage?.searchKey,
          ...filters
        ],
    queryFn: () => {
      if (!isResults) {
        if (activeTab !== "exams") {
          return currentPage?.searchKey
            ? allFetchingFunctions[activeTab](currentPage.pageNo, currentPage.searchKey)
            : allFetchingFunctions[activeTab](currentPage.pageNo);
        } else {
          return allFetchingFunctions[activeTab](
            currentPage.pageNo,
            currentPage.searchKey,
            ...filters
          );
        }
      }

      return allFetchingFunctions.results(
        examDetails[0],
        examDetails[1],
        examDetails[2],
        examDetails[3],
        examDetails[4]
      );
    },
    enabled: isResults
      ? examDetails && !examDetails.includes("")
      : !!currentPage?.pageNo || (activeTab === "exams" && currentPage?.searchKey && areAllFiltersSet),
  });
};


