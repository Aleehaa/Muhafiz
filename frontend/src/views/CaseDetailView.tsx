import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  UserCheck,
  History,
  Clock,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useCaseDetailPresenter } from '../presenters/useCaseDetailPresenter';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusBadge, IssueTypeBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTime, formatPKR } from '../components/ui/Formatters';

export const CaseDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { caseItem, isLoading, error, reloadCase } = useCaseDetailPresenter(id);

  if (isLoading) {
    return <LoadingSpinner label="Loading case details..." />;
  }

  if (error || !caseItem) {
    return (
      <div style={{ maxWidth: '36rem', margin: '3rem auto' }}>
        <Card>
          <EmptyState
            icon={<AlertCircle size={32} style={{ color: 'var(--color-status-error)' }} />}
            title="Case Record Not Found"
            description={error || `The requested case reference "${id}" does not exist in the system.`}
            actionLabel="Return to Cases List"
            onAction={() => navigate('/cases')}
          />
        </Card>
      </div>
    );
  }

  const activeAssignment = caseItem.assignments?.find((a) => a.status === 'ACTIVE');
  const pastAssignments = caseItem.assignments?.filter((a) => a.status !== 'ACTIVE') || [];
  const auditEvents = caseItem.auditEvents || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Navigation & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/cases"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Cases List</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" onClick={() => void reloadCase()}>
            Refresh Record
          </Button>
        </div>
      </div>

      {/* Case Header Banner */}
      <Card elevated>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <h1
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {caseItem.publicCaseId || 'Pending Intake Acknowledgment'}
              </h1>
              <StatusBadge status={caseItem.status} />
              <IssueTypeBadge issueType={caseItem.issueType} />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              <span>
                Internal ID:{' '}
                <code style={{ fontFamily: 'var(--font-mono)' }}>{caseItem.id}</code>
              </span>
              <span>•</span>
              <span>Logged: {formatDateTime(caseItem.createdAt)}</span>
              <span>•</span>
              <span>Source: {caseItem.source}</span>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Amount at Stake
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {formatPKR(caseItem.amountAtStake)}
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Left Column: Incident Details + Narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Incident Details Card */}
          <Card>
            <h2
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FileText size={18} color="var(--color-brand-action)" />
              Incident Information
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  Incident Date & Time
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {formatDateTime(caseItem.incidentDate)}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  City & Jurisdiction
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {caseItem.city}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  Neighborhood / Area
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {caseItem.area}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  Tracking Number
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {caseItem.trackingNumber || 'Not provided'}
                </span>
              </div>
            </div>

            {caseItem.address && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  Full Street Address
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  {caseItem.address}
                </span>
              </div>
            )}

            <div>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Incident Narrative / Operational Report
              </span>
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.6,
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                {caseItem.description}
              </div>
            </div>
          </Card>

          {/* Activity Timeline Card */}
          <Card>
            <h2
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Clock size={18} color="var(--color-brand-action)" />
              Audit Trail & Operational Timeline
            </h2>

            {auditEvents.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                No audit events recorded for this case yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {auditEvents.map((evt) => (
                  <div
                    key={evt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-brand-action)',
                        flexShrink: 0,
                      }}
                    >
                      <Shield size={12} />
                    </div>

                    <div style={{ flex: '1 1 auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {evt.eventType.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {formatDateTime(evt.createdAt)}
                        </span>
                      </div>

                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                        Actor: {evt.actingUser ? `${evt.actingUser.fullName} (${evt.actingUser.role})` : 'System Agent'}
                      </div>

                      {evt.details && (
                        <div
                          style={{
                            marginTop: '0.35rem',
                            padding: '0.4rem 0.6rem',
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {JSON.stringify(evt.details)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Client Company + Officer Assignment + Assignment History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Client Company Card */}
          <Card>
            <h2
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Building size={18} color="var(--color-brand-action)" />
              Client Company
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  Company Name
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {caseItem.clientCompany.name}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  Company Code
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-brand-action)',
                  }}
                >
                  {caseItem.clientCompany.code}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                  Logged By Client User
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {caseItem.createdBy.fullName} ({caseItem.createdBy.email})
                </span>
              </div>
            </div>
          </Card>

          {/* Current Assignment Card */}
          <Card>
            <h2
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <UserCheck size={18} color="var(--color-brand-action)" />
              Field Officer Assignment
            </h2>

            {activeAssignment ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-status-success-bg)',
                    border: '1px solid var(--color-status-success-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {activeAssignment.assignedFso.fullName}
                    </span>
                    <Badge variant="success" dot>Active FSO</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {activeAssignment.assignedFso.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                    Assigned By
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {activeAssignment.assigningUser.fullName} ({activeAssignment.assigningUser.role})
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                    Dispatch Timestamp
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {formatDateTime(activeAssignment.assignedAt)}
                  </span>
                </div>

                {activeAssignment.notes && (
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                      Dispatch Notes
                    </span>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {activeAssignment.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-status-warning-bg)',
                  border: '1px solid var(--color-status-warning-border)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-status-warning)', marginBottom: '0.25rem' }}>
                  No Officer Currently Assigned
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  This case is pending intake review or dispatch assignment by an authorized CRO.
                </p>
              </div>
            )}
          </Card>

          {/* Assignment History Card */}
          {pastAssignments.length > 0 && (
            <Card>
              <h2
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  marginBottom: 'var(--space-3)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  paddingBottom: 'var(--space-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <History size={16} color="var(--color-text-muted)" />
                Assignment History
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {pastAssignments.map((past) => (
                  <div
                    key={past.id}
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {past.assignedFso.fullName}
                      </span>
                      <StatusBadge status={past.status} />
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                      Dispatched: {formatDateTime(past.assignedAt)}
                    </div>
                    {past.notes && (
                      <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        "{past.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
