// useExamTabs.js
import { useQuery } from "@tanstack/react-query";

export const useExamTabs = (activeTab, allpages, allFetchingFunctions) => {
  return useQuery({
    queryKey: [activeTab, allpages[activeTab].pageNo],
    queryFn: () => allFetchingFunctions[activeTab](allpages[activeTab].pageNo),
    enabled: !!activeTab && allpages[activeTab].pageNo !== null,
  });
};
