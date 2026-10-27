import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Building,
  MapPin,
} from 'lucide-react';
import { useDashboardPresenter } from '../presenters/useDashboardPresenter';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusBadge, IssueTypeBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, formatPKR, formatStatusLabel } from '../components/ui/Formatters';
import { CaseStatus } from '../models/case.model';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, isLoading, error, refreshDashboard } = useDashboardPresenter();

  if (isLoading) {
    return <LoadingSpinner label="Loading operational dashboard..." />;
  }

  if (error || !metrics) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description={error || 'An error occurred while fetching operational metrics.'}
        actionLabel="Retry"
        onAction={() => void refreshDashboard()}
      />
    );
  }

  const maxTrend = Math.max(...metrics.activityTrends.map((t) => t.count), 1);

  // Status breakdown list ordered by workflow progression
  const workflowOrder: CaseStatus[] = [
    'SUBMITTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'PENDING_REVIEW',
    'RESOLVED',
    'CLOSED',
    'ON_HOLD',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Page Title & Operational Header */}
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
              Operational Overview
            </h1>
            <Badge variant="brand">Phase 3</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Real-time incident intake, field response monitoring, and case status dispatch for Pakistan operations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshDashboard()}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases')}
            icon={<ArrowRight size={14} />}
          >
            View All Cases
          </Button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <StatCard
          title="Total Cases"
          value={metrics.totalCases}
          subtitle="All reported incidents"
          icon={<FolderKanban size={20} />}
          accentColor="var(--color-brand-action)"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Open Cases"
          value={metrics.openCases}
          subtitle="Submitted, acknowledged, assigned"
          icon={<Clock size={20} />}
          accentColor="var(--color-status-info)"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgressCases}
          subtitle="Field investigation / review"
          icon={<Activity size={20} />}
          accentColor="var(--color-status-warning)"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Resolved / Closed"
          value={metrics.resolvedCases}
          subtitle="Successfully closed cases"
          icon={<CheckCircle2 size={20} />}
          accentColor="var(--color-status-success)"
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Unassigned Cases"
          value={metrics.unassignedCases}
          subtitle="Awaiting officer dispatch"
          icon={<AlertTriangle size={20} />}
          accentColor="var(--color-status-error)"
          onClick={() => navigate('/assignments')}
        />
      </section>

      {/* 2. Operational Analytics Row: Activity Trends + Status Distribution */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* A. Activity Trends Chart */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Case Ingestion Trends</h2>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Recent 7-day intake volume
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-status-success)',
                fontWeight: 600,
              }}
            >
              <TrendingUp size={14} /> Normal Flow
            </div>
          </div>

          {/* Clean lightweight SVG Bar Graph */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              height: '140px',
              paddingTop: 'var(--space-4)',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            {metrics.activityTrends.map((trend) => {
              const heightPercent = Math.max((trend.count / maxTrend) * 100, 15);
              return (
                <div
                  key={trend.label}
                  style={{
                    flex: '1 1 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {trend.count}
                  </span>
                  <div
                    title={`${trend.label}: ${trend.count} cases`}
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      height: `${heightPercent}%`,
                      backgroundColor: 'var(--color-brand-action)',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height var(--transition-normal)',
                      opacity: 0.85,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                      marginTop: '0.4rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trend.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* B. Cases by Workflow Status Breakdown */}
        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Workflow Status Distribution</h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Active cases across operational lifecycle stages
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {workflowOrder.map((statusKey) => {
              const count = metrics.casesByStatus[statusKey] || 0;
              const percent = metrics.totalCases > 0 ? (count / metrics.totalCases) * 100 : 0;
              return (
                <div key={statusKey} style={{ fontSize: 'var(--text-xs)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.2rem',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {formatStatusLabel(statusKey)}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {count} ({Math.round(percent)}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      width: '100%',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor:
                          statusKey === 'RESOLVED' || statusKey === 'CLOSED'
                            ? 'var(--color-status-success)'
                            : statusKey === 'IN_PROGRESS' || statusKey === 'ASSIGNED'
                            ? 'var(--color-status-info)'
                            : statusKey === 'PENDING_REVIEW' || statusKey === 'ON_HOLD'
                            ? 'var(--color-status-warning)'
                            : 'var(--color-brand-action)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-normal)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* 3. Operational Focus: Cases Needing Attention */}
      {metrics.casesNeedingAttention.length > 0 && (
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: 'var(--space-3)',
            }}
          >
            <ShieldAlert size={18} style={{ color: 'var(--color-brand-action)' }} />
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Cases Needing Action</h2>
            <Badge variant="brand">{metrics.casesNeedingAttention.length} Pending</Badge>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {metrics.casesNeedingAttention.slice(0, 3).map((item) => {
              const isUnassigned =
                !item.assignments ||
                item.assignments.length === 0 ||
                !item.assignments.some((a) => a.status === 'ACTIVE');

              return (
                <Card
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid var(--color-brand-action)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {item.publicCaseId || 'Unacknowledged'}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <Building size={14} color="var(--color-text-muted)" />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {item.clientCompany.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <MapPin size={14} color="var(--color-text-muted)" />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {item.city} — {item.area}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.4,
                        marginBottom: '0.75rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 'var(--space-3)',
                      borderTop: '1px solid var(--color-border-subtle)',
                      marginTop: 'auto',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-status-error)', fontWeight: 600 }}>
                      {isUnassigned ? '⚠ Unassigned FSO' : `Status: ${formatStatusLabel(item.status)}`}
                    </span>
                    <Link
                      to={`/cases/${item.id}`}
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: 'var(--color-brand-action)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        textDecoration: 'none',
                      }}
                    >
                      Inspect <ArrowRight size={12} />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Recent Cases Table */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Recently Logged Incidents</h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Most recent incident submissions across regional hubs
            </span>
          </div>

          <Link
            to="/cases"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-brand-action)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              textDecoration: 'none',
            }}
          >
            All Cases ({metrics.totalCases}) <ArrowRight size={14} />
          </Link>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Issue Type</th>
                  <th>Client Company</th>
                  <th>City</th>
                  <th>Assigned Officer</th>
                  <th>Amount at Stake</th>
                  <th>Status</th>
                  <th>Logged Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentCases.map((c) => {
                  const activeAssignment = c.assignments?.find((a) => a.status === 'ACTIVE');
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {c.publicCaseId || (
                          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                            Pending ACK
                          </span>
                        )}
                      </td>
                      <td>
                        <IssueTypeBadge issueType={c.issueType} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {c.clientCompany.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {c.trackingNumber || 'No tracking #'}
                        </div>
                      </td>
                      <td>{c.city}</td>
                      <td>
                        {activeAssignment ? (
                          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                            {activeAssignment.assignedFso.fullName}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {formatPKR(c.amountAtStake)}
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>{formatDate(c.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/cases/${c.id}`} style={{ textDecoration: 'none' }}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};
