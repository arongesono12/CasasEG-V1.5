import { useState, useEffect, useMemo } from 'react';
import { APP_CONFIG } from '../constants/config';

interface UsePaginationProps<T> {
  items: T[];
  dependencies?: any[];
}

export const usePagination = <T,>({ items = [], dependencies = [] }: UsePaginationProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when dependencies change
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const totalPages = Math.ceil(items.length / APP_CONFIG.ITEMS_PER_PAGE);
  
  const paginatedProperties = useMemo(() => {
    return items.slice(
      (currentPage - 1) * APP_CONFIG.ITEMS_PER_PAGE, 
      currentPage * APP_CONFIG.ITEMS_PER_PAGE
    );
  }, [items, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedProperties,
    handlePageChange
  };
};

