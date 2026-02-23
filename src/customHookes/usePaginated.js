import { useCallback } from "react";
// usePagination.js
export const usePagination = (isPaginated, allpages, setAllPages) => {
  const setTotalPages = useCallback((tabKey, totalPages) => {
    if (!isPaginated) return;
    setAllPages(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], totalPages } }));
  }, [isPaginated, setAllPages]);

  const changePage = useCallback(
    (tabKey, page, searchKey) => {
      if (!isPaginated) return;

      const { totalPages } = allpages[tabKey] ?? {};

      if (totalPages && (page < 1 || page > totalPages)) return;

      setAllPages(prev => ({
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          pageNo: page,
          searchKey: searchKey ?? prev[tabKey].searchKey, // 👈 always controlled
        },
      }));
    },
    [isPaginated, allpages]
  );

  return { setTotalPages, changePage };
};
