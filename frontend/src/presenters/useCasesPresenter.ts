import { useState, useEffect, useCallback } from 'react';
import {
  CaseFilter,
  PaginatedCases,
  CaseStatus,
  CaseCity,
  CaseIssueType,
} from '../models/case.model';
import { CaseService } from '../services/case.service';

export interface CasesPresenter {
  paginatedCases: PaginatedCases | null;
  filter: CaseFilter;
  isLoading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
  setStatusFilter: (status: CaseStatus | 'ALL') => void;
  setCityFilter: (city: CaseCity | 'ALL') => void;
  setIssueTypeFilter: (issueType: CaseIssueType | 'ALL') => void;
  setSort: (sortBy: CaseFilter['sortBy']) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  reloadCases: () => Promise<void>;
}

const DEFAULT_FILTER: CaseFilter = {
  search: '',
  status: 'ALL',
  city: 'ALL',
  issueType: 'ALL',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

export function useCasesPresenter(): CasesPresenter {
  const [filter, setFilter] = useState<CaseFilter>(DEFAULT_FILTER);
  const [paginatedCases, setPaginatedCases] = useState<PaginatedCases | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async (currentFilter: CaseFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await CaseService.listCases(currentFilter);
      setPaginatedCases(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve cases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCases(filter);
  }, [filter, fetchCases]);

  const setSearch = (search: string) => {
    setFilter((prev) => ({ ...prev, search, page: 1 }));
  };

  const setStatusFilter = (status: CaseStatus | 'ALL') => {
    setFilter((prev) => ({ ...prev, status, page: 1 }));
  };

  const setCityFilter = (city: CaseCity | 'ALL') => {
    setFilter((prev) => ({ ...prev, city, page: 1 }));
  };

  const setIssueTypeFilter = (issueType: CaseIssueType | 'ALL') => {
    setFilter((prev) => ({ ...prev, issueType, page: 1 }));
  };

  const setSort = (sortBy: CaseFilter['sortBy']) => {
    setFilter((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
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

  const reloadCases = async () => {
    await fetchCases(filter);
  };

  return {
    paginatedCases,
    filter,
    isLoading,
    error,
    setSearch,
    setStatusFilter,
    setCityFilter,
    setIssueTypeFilter,
    setSort,
    setPage,
    setPageSize,
    resetFilters,
    reloadCases,
  };
}
