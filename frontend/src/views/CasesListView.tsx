import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  RotateCcw,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { useCasesPresenter } from '../presenters/useCasesPresenter';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterSelect } from '../components/ui/FilterSelect';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, IssueTypeBadge } from '../components/ui/StatusBadge';
import { formatDate, formatPKR } from '../components/ui/Formatters';
import { CaseStatus, CaseCity, CaseIssueType } from '../models/case.model';

export const CasesListView: React.FC = () => {
  const {
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
  } = useCasesPresenter();

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Pending Review', value: 'PENDING_REVIEW' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'On Hold', value: 'ON_HOLD' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  const cityOptions = [
    { label: 'All Cities', value: 'ALL' },
    { label: 'Karachi', value: 'KARACHI' },
    { label: 'Lahore', value: 'LAHORE' },
    { label: 'Rawalpindi', value: 'RAWALPINDI' },
    { label: 'Islamabad', value: 'ISLAMABAD' },
  ];

  const issueTypeOptions = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Armed Snatching', value: 'SNATCHING' },
    { label: 'Theft / Shrinkage', value: 'THEFT' },
    { label: 'Fake Delivery', value: 'FAKE_DELIVERY' },
    { label: 'Customer Issue', value: 'CUSTOMER_ISSUE' },
    { label: 'Other', value: 'OTHER' },
  ];

  const isFiltered =
    filter.search !== '' ||
    filter.status !== 'ALL' ||
    filter.city !== 'ALL' ||
    filter.issueType !== 'ALL';

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
              Cases Management
            </h1>
            {paginatedCases && (
              <Badge variant="default">{paginatedCases.total} Total</Badge>
            )}
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Search, filter, and inspect incidents reported across all regional hubs and courier clients.
          </p>
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={() => void reloadCases()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
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
          {/* Search Box */}
          <SearchInput
            value={filter.search || ''}
            onChange={setSearch}
            placeholder="Search case ID, tracking #, company..."
          />

          {/* Filter Dropdowns */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <FilterSelect
              label="Status"
              value={filter.status || 'ALL'}
              options={statusOptions}
              onChange={(val) => setStatusFilter(val as CaseStatus | 'ALL')}
            />

            <FilterSelect
              label="City"
              value={filter.city || 'ALL'}
              options={cityOptions}
              onChange={(val) => setCityFilter(val as CaseCity | 'ALL')}
            />

            <FilterSelect
              label="Type"
              value={filter.issueType || 'ALL'}
              options={issueTypeOptions}
              onChange={(val) => setIssueTypeFilter(val as CaseIssueType | 'ALL')}
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

      {/* Main Content Area */}
      {isLoading ? (
        <Card>
          <LoadingSpinner label="Loading cases data..." />
        </Card>
      ) : error ? (
        <Card>
          <EmptyState
            title="Failed to load cases"
            description={error}
            actionLabel="Try Again"
            onAction={() => void reloadCases()}
          />
        </Card>
      ) : !paginatedCases || paginatedCases.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase size={28} />}
            title="No matching cases found"
            description={
              isFiltered
                ? 'No incidents matched your current search and filter criteria. Try adjusting your query or resetting filters.'
                : 'No cases are currently registered in the system.'
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
                  <th
                    onClick={() => setSort('publicCaseId')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Case Reference</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Issue Type</th>
                  <th>Client Company</th>
                  <th>City</th>
                  <th>Incident Date</th>
                  <th>Assigned Officer</th>
                  <th
                    onClick={() => setSort('amountAtStake')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Amount (PKR)</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Status</th>
                  <th
                    onClick={() => setSort('createdAt')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Logged</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCases.data.map((item) => {
                  const activeAssignment = item.assignments?.find((a) => a.status === 'ACTIVE');
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {item.publicCaseId ? (
                          <span style={{ color: 'var(--color-text-primary)' }}>
                            {item.publicCaseId}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 'var(--text-xs)' }}>
                            Pending ACK
                          </span>
                        )}
                      </td>
                      <td>
                        <IssueTypeBadge issueType={item.issueType} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {item.clientCompany.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          Code: {item.clientCompany.code} • Tracking: {item.trackingNumber || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {item.city}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {item.area}
                        </div>
                      </td>
                      <td>{formatDate(item.incidentDate)}</td>
                      <td>
                        {activeAssignment ? (
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              {activeAssignment.assignedFso.fullName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                              Officer (FSO)
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-status-error)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            ● Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {formatPKR(item.amountAtStake)}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/cases/${item.id}`} style={{ textDecoration: 'none' }}>
                          <Button variant="outline" size="sm" icon={<Eye size={14} />}>
                            View
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
              page={paginatedCases.page}
              pageSize={paginatedCases.pageSize}
              total={paginatedCases.total}
              totalPages={paginatedCases.totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
