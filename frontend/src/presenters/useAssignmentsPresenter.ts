import { useState, useEffect, useCallback } from 'react';
import {
  AssignmentFilter,
  PaginatedAssignments,
  AssignmentMetrics,
  AssignmentStatus,
} from '../models/assignment.model';
import { CaseCity } from '../models/case.model';
import { AssignmentService } from '../services/assignment.service';

export interface AssignmentsPresenter {
  paginatedAssignments: PaginatedAssignments | null;
  metrics: AssignmentMetrics | null;
  filter: AssignmentFilter;
  isLoading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
  setStatusFilter: (status: AssignmentStatus | 'ALL') => void;
  setCityFilter: (city: CaseCity | 'ALL') => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  reloadAssignments: () => Promise<void>;
}

const DEFAULT_FILTER: AssignmentFilter = {
  search: '',
  status: 'ALL',
  city: 'ALL',
  page: 1,
  pageSize: 10,
};

export function useAssignmentsPresenter(): AssignmentsPresenter {
  const [filter, setFilter] = useState<AssignmentFilter>(DEFAULT_FILTER);
  const [paginatedAssignments, setPaginatedAssignments] =
    useState<PaginatedAssignments | null>(null);
  const [metrics, setMetrics] = useState<AssignmentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async (currentFilter: AssignmentFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const [listResult, metricsResult] = await Promise.all([
        AssignmentService.listAssignments(currentFilter),
        AssignmentService.getAssignmentMetrics(),
      ]);
      setPaginatedAssignments(listResult);
      setMetrics(metricsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve assignments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssignments(filter);
  }, [filter, fetchAssignments]);

  const setSearch = (search: string) => {
    setFilter((prev) => ({ ...prev, search, page: 1 }));
  };

  const setStatusFilter = (status: AssignmentStatus | 'ALL') => {
    setFilter((prev) => ({ ...prev, status, page: 1 }));
  };

  const setCityFilter = (city: CaseCity | 'ALL') => {
    setFilter((prev) => ({ ...prev, city, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  const setPageSize = (pageSize: number) => {
    setFilter((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  const resetFilters = () => {
    setFilter(DEFAULT_FILTER);
  };

  const reloadAssignments = async () => {
    await fetchAssignments(filter);
  };

  return {
    paginatedAssignments,
    metrics,
    filter,
    isLoading,
    error,
    setSearch,
    setStatusFilter,
    setCityFilter,
    setPage,
    setPageSize,
    resetFilters,
    reloadAssignments,
  };
}
