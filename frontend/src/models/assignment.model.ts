import { CaseCity, CaseIssueType, ClientCompanyRef, UserRef } from './case.model';

export type AssignmentStatus = 'ACTIVE' | 'REASSIGNED' | 'COMPLETED' | 'CANCELLED';

export interface Assignment {
  id: string;
  caseId: string;
  publicCaseId?: string | null;
  issueType: CaseIssueType;
  city: CaseCity;
  clientCompany: ClientCompanyRef;
  assignedFso: UserRef;
  assigningUser: UserRef;
  status: AssignmentStatus;
  notes?: string | null;
  assignedAt: string;
  acknowledgedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFilter {
  search?: string;
  status?: AssignmentStatus | 'ALL';
  city?: CaseCity | 'ALL';
  page?: number;
  pageSize?: number;
}

export interface PaginatedAssignments {
  data: Assignment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AssignmentMetrics {
  totalRecords: number;
  activeAssignments: number;
  unassignedCases: number;
  casesWithHistory: number;
}
