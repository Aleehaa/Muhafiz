/**
 * Case Domain Model & Enums
 * Matches PostgreSQL Prisma Schema exactly
 */

export type CaseStatus =
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ON_HOLD'
  | 'REJECTED'
  | 'ARCHIVED';

export type CaseIssueType =
  | 'CUSTOMER_ISSUE'
  | 'FAKE_DELIVERY'
  | 'SNATCHING'
  | 'THEFT'
  | 'OTHER';

export type CaseCity = 'KARACHI' | 'LAHORE' | 'RAWALPINDI' | 'ISLAMABAD';

export type CaseSource = 'CLIENT_PORTAL' | 'CRO_LOGGED';

export interface ClientCompanyRef {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface UserRef {
  id: string;
  fullName: string;
  email: string;
  role: 'CLIENT_USER' | 'CRO' | 'SFSO' | 'FSO';
}

export interface CaseAssignmentRef {
  id: string;
  caseId: string;
  assignedFso: UserRef;
  assigningUser: UserRef;
  status: 'ACTIVE' | 'REASSIGNED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  assignedAt: string;
  acknowledgedAt?: string | null;
  completedAt?: string | null;
}

export interface CaseAuditEventRef {
  id: string;
  caseId?: string | null;
  actingUser?: UserRef | null;
  eventType:
    | 'CASE_CREATED'
    | 'CASE_ACKNOWLEDGED'
    | 'CASE_ASSIGNED'
    | 'CASE_REASSIGNED'
    | 'CASE_STATUS_UPDATED'
    | 'FIELD_REPORT_SUBMITTED'
    | 'EVIDENCE_UPLOADED'
    | 'NOTE_ADDED'
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'SYSTEM_EVENT';
  details?: Record<string, unknown> | null;
  createdAt: string;
}

export interface Case {
  id: string;
  publicCaseId?: string | null;
  clientCompanyId: string;
  clientCompany: ClientCompanyRef;
  createdById: string;
  createdBy: UserRef;
  issueType: CaseIssueType;
  incidentDate: string;
  city: CaseCity;
  area: string;
  address?: string | null;
  trackingNumber?: string | null;
  amountAtStake: number; // in PKR
  description: string;
  source: CaseSource;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;

  // Joined relations for presentation
  assignments?: CaseAssignmentRef[];
  auditEvents?: CaseAuditEventRef[];
}

export interface CaseFilter {
  search?: string;
  status?: CaseStatus | 'ALL';
  issueType?: CaseIssueType | 'ALL';
  city?: CaseCity | 'ALL';
  sortBy?: 'createdAt' | 'incidentDate' | 'amountAtStake' | 'publicCaseId';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedCases {
  data: Case[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
