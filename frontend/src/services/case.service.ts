import {
  Case,
  CaseFilter,
  PaginatedCases,
  CaseStatus,
  CaseCity,
  CaseIssueType,
} from '../models/case.model';
import { DashboardMetrics } from '../models/dashboard.model';
import { MOCK_CASES } from './mockData/cases.mock';

/**
 * CaseService (Model-View-Presenter: Service Layer)
 * Centralizes data retrieval for Cases.
 * In Phase 3, this serves the validated mock operational dataset.
 * When backend endpoints are introduced in Phase 4, network requests will replace this layer seamlessly.
 */
export class CaseService {
  /**
   * Fetches paginated, filtered, and sorted cases
   */
  public static async listCases(filter: CaseFilter = {}): Promise<PaginatedCases> {
    // Simulate brief network latency for realistic loading states
    await new Promise((resolve) => setTimeout(resolve, 80));

    let result = [...MOCK_CASES];

    // Search filter: matches publicCaseId, trackingNumber, or clientCompany name
    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          (c.publicCaseId && c.publicCaseId.toLowerCase().includes(q)) ||
          (c.trackingNumber && c.trackingNumber.toLowerCase().includes(q)) ||
          c.clientCompany.name.toLowerCase().includes(q) ||
          c.clientCompany.code.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filter.status && filter.status !== 'ALL') {
      result = result.filter((c) => c.status === filter.status);
    }

    // Issue Type filter
    if (filter.issueType && filter.issueType !== 'ALL') {
      result = result.filter((c) => c.issueType === filter.issueType);
    }

    // City filter
    if (filter.city && filter.city !== 'ALL') {
      result = result.filter((c) => c.city === filter.city);
    }

    // Sorting
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'incidentDate') {
        comparison = new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime();
      } else if (sortBy === 'amountAtStake') {
        comparison = a.amountAtStake - b.amountAtStake;
      } else if (sortBy === 'publicCaseId') {
        comparison = (a.publicCaseId || '').localeCompare(b.publicCaseId || '');
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = result.length;
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const data = result.slice(startIndex, startIndex + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Fetches a single case by internal UUID or publicCaseId
   */
  public static async getCaseById(idOrPublicId: string): Promise<Case | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    const found = MOCK_CASES.find(
      (c) => c.id === idOrPublicId || c.publicCaseId === idOrPublicId
    );

    return found ? { ...found } : null;
  }

  /**
   * Calculates operational metrics for the Dashboard view
   */
  public static async getDashboardMetrics(): Promise<DashboardMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    const allCases = MOCK_CASES;
    const totalCases = allCases.length;

    // Status categories:
    // Open: SUBMITTED, ACKNOWLEDGED, ASSIGNED
    // In-Progress: IN_PROGRESS, PENDING_REVIEW
    // Resolved: RESOLVED, CLOSED
    const openStatuses: CaseStatus[] = ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED'];
    const inProgressStatuses: CaseStatus[] = ['IN_PROGRESS', 'PENDING_REVIEW'];
    const resolvedStatuses: CaseStatus[] = ['RESOLVED', 'CLOSED'];

    const openCases = allCases.filter((c) => openStatuses.includes(c.status)).length;
    const inProgressCases = allCases.filter((c) => inProgressStatuses.includes(c.status)).length;
    const resolvedCases = allCases.filter((c) => resolvedStatuses.includes(c.status)).length;

    // Unassigned: Cases with no active assignment
    const unassignedCases = allCases.filter(
      (c) =>
        !c.assignments ||
        c.assignments.length === 0 ||
        !c.assignments.some((a) => a.status === 'ACTIVE')
    ).length;

    // Status breakdown for all 10 enum values
    const casesByStatus: Record<CaseStatus, number> = {
      SUBMITTED: 0,
      ACKNOWLEDGED: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      PENDING_REVIEW: 0,
      RESOLVED: 0,
      CLOSED: 0,
      ON_HOLD: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    };

    allCases.forEach((c) => {
      casesByStatus[c.status] = (casesByStatus[c.status] || 0) + 1;
    });

    // Breakdown by City
    const casesByCity: Record<CaseCity, number> = {
      KARACHI: 0,
      LAHORE: 0,
      RAWALPINDI: 0,
      ISLAMABAD: 0,
    };

    allCases.forEach((c) => {
      casesByCity[c.city] = (casesByCity[c.city] || 0) + 1;
    });

    // Breakdown by Issue Type
    const casesByIssueType: Record<CaseIssueType, number> = {
      CUSTOMER_ISSUE: 0,
      FAKE_DELIVERY: 0,
      SNATCHING: 0,
      THEFT: 0,
      OTHER: 0,
    };

    allCases.forEach((c) => {
      casesByIssueType[c.issueType] = (casesByIssueType[c.issueType] || 0) + 1;
    });

    // Activity Trends (Recent 7 days)
    const activityTrends = [
      { label: '08 Oct', count: 1 },
      { label: '09 Oct', count: 2 },
      { label: '10 Oct', count: 2 },
      { label: '11 Oct', count: 1 },
      { label: '12 Oct', count: 1 },
      { label: '13 Oct', count: 1 },
      { label: '14 Oct', count: 1 },
    ];

    // Cases needing operational attention:
    // Unassigned, or PENDING_REVIEW, or ON_HOLD
    const casesNeedingAttention = allCases.filter(
      (c) =>
        c.status === 'PENDING_REVIEW' ||
        c.status === 'ON_HOLD' ||
        !c.assignments ||
        !c.assignments.some((a) => a.status === 'ACTIVE')
    );

    // Recent cases: top 5 sorted by creation date descending
    const recentCases = [...allCases]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalCases,
      openCases,
      inProgressCases,
      resolvedCases,
      unassignedCases,
      casesByStatus,
      casesByCity,
      casesByIssueType,
      activityTrends,
      casesNeedingAttention,
      recentCases,
    };
  }
}
