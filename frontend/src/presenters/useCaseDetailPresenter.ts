import { useState, useEffect, useCallback } from 'react';
import { Case } from '../models/case.model';
import { CaseService } from '../services/case.service';

export interface CaseDetailPresenter {
  caseItem: Case | null;
  isLoading: boolean;
  error: string | null;
  reloadCase: () => Promise<void>;
}

export function useCaseDetailPresenter(caseIdOrPublicId: string | undefined): CaseDetailPresenter {
  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = useCallback(async () => {
    if (!caseIdOrPublicId) {
      setError('No case identifier provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await CaseService.getCaseById(caseIdOrPublicId);
      if (!result) {
        setError(`Case with reference "${caseIdOrPublicId}" was not found.`);
      } else {
        setCaseItem(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve case details');
    } finally {
      setIsLoading(false);
    }
  }, [caseIdOrPublicId]);

  useEffect(() => {
    void fetchCase();
  }, [fetchCase]);

  return {
    caseItem,
    isLoading,
    error,
    reloadCase: fetchCase,
  };
}
