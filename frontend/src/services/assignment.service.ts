import {
  Assignment,
  AssignmentFilter,
  PaginatedAssignments,
  AssignmentMetrics,
} from '../models/assignment.model';
import { MOCK_CASES } from './mockData/cases.mock';

/**
 * AssignmentService (Model-View-Presenter: Service Layer)
 * Centralizes assignment data operations and history tracking.
 */
export class AssignmentService {
  /**
   * Flattens and extracts all assignment rows from cases with case reference context
   */
  private static extractAllAssignments(): Assignment[] {
    const list: Assignment[] = [];

    for (const c of MOCK_CASES) {
      if (c.assignments && c.assignments.length > 0) {
        for (const a of c.assignments) {
          list.push({
            id: a.id,
            caseId: c.id,
            publicCaseId: c.publicCaseId,
            issueType: c.issueType,
            city: c.city,
            clientCompany: c.clientCompany,
            assignedFso: a.assignedFso,
            assigningUser: a.assigningUser,
            status: a.status,
            notes: a.notes,
            assignedAt: a.assignedAt,
            acknowledgedAt: a.acknowledgedAt,
            completedAt: a.completedAt,
            createdAt: a.assignedAt,
            updatedAt: a.completedAt || a.acknowledgedAt || a.assignedAt,
          });
        }
      }
    }

    // Default order: latest assignment date first
    list.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

    return list;
  }

  /**
   * Lists assignments with search, status filtering, and pagination
   */
  public static async listAssignments(
    filter: AssignmentFilter = {}
  ): Promise<PaginatedAssignments> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    let result = this.extractAllAssignments();

    // Search filter
    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (asg) =>
          (asg.publicCaseId && asg.publicCaseId.toLowerCase().includes(q)) ||
          asg.assignedFso.fullName.toLowerCase().includes(q) ||
          asg.assigningUser.fullName.toLowerCase().includes(q) ||
          asg.clientCompany.name.toLowerCase().includes(q) ||
          asg.clientCompany.code.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filter.status && filter.status !== 'ALL') {
      result = result.filter((asg) => asg.status === filter.status);
    }

    // City filter
    if (filter.city && filter.city !== 'ALL') {
      result = result.filter((asg) => asg.city === filter.city);
    }

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
   * Computes summary metrics for the assignments overview
   */
  public static async getAssignmentMetrics(): Promise<AssignmentMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const allAssignments = this.extractAllAssignments();
    const totalRecords = allAssignments.length;
    const activeAssignments = allAssignments.filter((a) => a.status === 'ACTIVE').length;

    const unassignedCases = MOCK_CASES.filter(
      (c) =>
        !c.assignments ||
        c.assignments.length === 0 ||
        !c.assignments.some((a) => a.status === 'ACTIVE')
    ).length;

    const casesWithHistory = MOCK_CASES.filter(
      (c) => c.assignments && c.assignments.length > 1
    ).length;

    return {
      totalRecords,
      activeAssignments,
      unassignedCases,
      casesWithHistory,
    };
  }
}
