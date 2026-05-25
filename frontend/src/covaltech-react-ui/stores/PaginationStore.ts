// PaginationStore.ts
import { create } from "zustand";

export interface PaginationState {
  pagination: {
    [tableId: string]: {
      page: number;
      pageSize: number;
    };
  };
  setCurrentPage: (tableId: string, page: number) => void;
  setPageSize: (tableId: string, pageSize: number) => void;
  setPagination: (tableId: string, page: number, pageSize: number) => void;
}

const usePaginationStore = create<PaginationState>((set) => ({
  pagination: {},
  setCurrentPage: (tableId, page) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [tableId]: {
          ...state.pagination[tableId],
          page,
          pageSize: state.pagination[tableId]?.pageSize,
        },
      },
    })),
  setPageSize: (tableId, pageSize) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [tableId]: {
          ...state.pagination[tableId],
          page: state.pagination[tableId]?.page || 1,
          pageSize,
        },
      },
    })),
  setPagination: (tableId, page, pageSize) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [tableId]: {
          page,
          pageSize,
        },
      },
    })),
}));

export default usePaginationStore;
