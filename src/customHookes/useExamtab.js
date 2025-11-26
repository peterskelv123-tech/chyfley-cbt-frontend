// useExamTabs.js
import { useQuery } from "@tanstack/react-query";
export const useExamTabs = (activeTab, allpages, allFetchingFunctions, examDetails) => {
  const isResults = activeTab === "results";
  return useQuery({
    queryKey: isResults
      ? ["results", ...examDetails]
      : [activeTab, allpages[activeTab].pageNo],
    queryFn: () => {
      if (!isResults) {
        return allFetchingFunctions[activeTab](allpages[activeTab].pageNo);
      }
      return allFetchingFunctions.results(
        examDetails[0],
        examDetails[1],
        examDetails[2]
      );
    },
    enabled: isResults
      ? examDetails && !examDetails.includes("")
      : !!allpages[activeTab].pageNo,
  });
};

