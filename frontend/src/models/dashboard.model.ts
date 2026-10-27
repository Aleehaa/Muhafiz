import { Case, CaseCity, CaseIssueType, CaseStatus } from './case.model';

export interface DashboardMetrics {
  totalCases: number;
  openCases: number;
  inProgressCases: number;
  resolvedCases: number;
  unassignedCases: number;
  casesByStatus: Record<CaseStatus, number>;
  casesByCity: Record<CaseCity, number>;
  casesByIssueType: Record<CaseIssueType, number>;
  activityTrends: Array<{ label: string; count: number }>;
  casesNeedingAttention: Case[];
  recentCases: Case[];
}
