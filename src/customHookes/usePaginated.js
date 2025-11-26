import { useCallback } from "react";
// usePagination.js
export const usePagination = (isPaginated, allpages, setAllPages) => {
  const setTotalPages = useCallback((tabKey, totalPages) => {
    if (!isPaginated) return;
    setAllPages(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], totalPages } }));
  }, [isPaginated]);

  const changePage = useCallback((tabKey, page) => {
    if (!isPaginated) return;
   // console.log("Changing page for", allpages[tabKey], "to", page);
    const { totalPages } = allpages[tabKey] ?? {};
    if (!totalPages || page < 1 || page > totalPages) {
      alert("Invalid page");
      return;
    }
    setAllPages(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], pageNo: page } }));
  }, [isPaginated, allpages]);

  return { setTotalPages, changePage };
};
