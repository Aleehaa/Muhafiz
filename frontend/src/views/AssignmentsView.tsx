import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { useAssignmentsPresenter } from '../presenters/useAssignmentsPresenter';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterSelect } from '../components/ui/FilterSelect';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, IssueTypeBadge } from '../components/ui/StatusBadge';
import { formatDateTime } from '../components/ui/Formatters';
import { AssignmentStatus } from '../models/assignment.model';
import { CaseCity } from '../models/case.model';

export const AssignmentsView: React.FC = () => {
  const {
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
  } = useAssignmentsPresenter();

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Reassigned', value: 'REASSIGNED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const cityOptions = [
    { label: 'All Cities', value: 'ALL' },
    { label: 'Karachi', value: 'KARACHI' },
    { label: 'Lahore', value: 'LAHORE' },
    { label: 'Rawalpindi', value: 'RAWALPINDI' },
    { label: 'Islamabad', value: 'ISLAMABAD' },
  ];

  const isFiltered =
    filter.search !== '' || filter.status !== 'ALL' || filter.city !== 'ALL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Officer Assignments
            </h1>
            <Badge variant="brand">Operations</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Monitor active field officer dispatches, shift rotations, and comprehensive reassignment history.
          </p>
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={() => void reloadAssignments()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      {metrics && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <StatCard
            title="Total Assignments"
            value={metrics.totalRecords}
            subtitle="All historical records"
            icon={<UserCheck size={20} />}
            accentColor="var(--color-brand-action)"
          />
          <StatCard
            title="Active Dispatches"
            value={metrics.activeAssignments}
            subtitle="Officers currently in field"
            icon={<CheckCircle2 size={20} />}
            accentColor="var(--color-status-success)"
          />
          <StatCard
            title="Unassigned Cases"
            value={metrics.unassignedCases}
            subtitle="Awaiting FSO assignment"
            icon={<AlertTriangle size={20} />}
            accentColor="var(--color-status-error)"
          />
          <StatCard
            title="Reassigned Cases"
            value={metrics.casesWithHistory}
            subtitle="Cases with assignment history"
            icon={<History size={20} />}
            accentColor="var(--color-status-warning)"
          />
        </section>
      )}

      {/* 2. Search & Filter Bar */}
      <Card style={{ padding: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <SearchInput
            value={filter.search || ''}
            onChange={setSearch}
            placeholder="Search officer, case ID, company..."
          />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <FilterSelect
              label="Assignment Status"
              value={filter.status || 'ALL'}
              options={statusOptions}
              onChange={(val) => setStatusFilter(val as AssignmentStatus | 'ALL')}
            />

            <FilterSelect
              label="City"
              value={filter.city || 'ALL'}
              options={cityOptions}
              onChange={(val) => setCityFilter(val as CaseCity | 'ALL')}
            />

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                icon={<RotateCcw size={14} />}
                style={{ color: 'var(--color-brand-action)' }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Main Content: Assignments Table */}
      {isLoading ? (
        <Card>
          <LoadingSpinner label="Loading assignment records..." />
        </Card>
      ) : error ? (
        <Card>
          <EmptyState
            title="Failed to load assignments"
            description={error}
            actionLabel="Try Again"
            onAction={() => void reloadAssignments()}
          />
        </Card>
      ) : !paginatedAssignments || paginatedAssignments.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UserCheck size={28} />}
            title="No assignment records found"
            description={
              isFiltered
                ? 'No assignments match the selected filter parameters. Try clearing the search query or changing filters.'
                : 'No officer assignment records currently exist.'
            }
            actionLabel={isFiltered ? 'Reset Filters' : undefined}
            onAction={isFiltered ? resetFilters : undefined}
          />
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case Reference</th>
                  <th>Issue Type</th>
                  <th>Client Company</th>
                  <th>City</th>
                  <th>Assigned Officer (FSO)</th>
                  <th>Assigned By</th>
                  <th>Dispatch Time</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Inspect Case</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssignments.data.map((asg) => {
                  return (
                    <tr key={asg.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        <Link
                          to={`/cases/${asg.caseId}`}
                          style={{
                            color: 'var(--color-brand-action)',
                            textDecoration: 'none',
                          }}
                        >
                          {asg.publicCaseId || 'Pending ACK'}
                        </Link>
                      </td>
                      <td>
                        <IssueTypeBadge issueType={asg.issueType} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {asg.clientCompany.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {asg.clientCompany.code}
                        </div>
                      </td>
                      <td>{asg.city}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {asg.assignedFso.fullName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {asg.assignedFso.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                          {asg.assigningUser.fullName}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                          {asg.assigningUser.role}
                        </div>
                      </td>
                      <td>{formatDateTime(asg.assignedAt)}</td>
                      <td>
                        <StatusBadge status={asg.status} />
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {asg.notes || '—'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/cases/${asg.caseId}`} style={{ textDecoration: 'none' }}>
                          <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                            View Case
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
            <Pagination
              page={paginatedAssignments.page}
              pageSize={paginatedAssignments.pageSize}
              total={paginatedAssignments.total}
              totalPages={paginatedAssignments.totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
