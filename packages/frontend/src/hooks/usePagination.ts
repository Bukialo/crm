// src/hooks/usePagination.ts
import { useState } from "react";

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;
  getPageInfo: (totalItems: number) => {
    totalPages: number;
    startItem: number;
    endItem: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const usePagination = (
  options: PaginationOptions = {}
): UsePaginationReturn => {
  const { initialPage = 1, initialPageSize = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPage = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  const setPageSize = (size: number) => {
    if (size >= 1) {
      setPageSizeState(size);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = (totalPages: number) => {
    setCurrentPage(totalPages);
  };

  const getPageInfo = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      totalPages,
      startItem,
      endItem,
      hasNextPage,
      hasPrevPage,
    };
  };

  return {
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    getPageInfo,
  };
};
