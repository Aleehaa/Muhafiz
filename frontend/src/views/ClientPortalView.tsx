import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Building2,
  X,
} from 'lucide-react';
import { useDesk } from '../context/DeskContext';
import { DeskCase, IssueType, City, ClientCompany, getClientStatusLabel } from '../models/desk.model';

export const ClientPortalView: React.FC = () => {
  const { cases, selectedClient, setSelectedClient, raiseCase, clientReplyHold } = useDesk();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'FIELD' | 'HOLD' | 'CLOSED'>('ALL');

  // Modals & Drawers
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DeskCase | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Client Hold Reply State
  const [holdReplyText, setHoldReplyText] = useState('');
  const [replyError, setReplyError] = useState('');

  // Form State for Raise Case
  const [formClient, setFormClient] = useState<ClientCompany>(selectedClient);
  const [formIssue, setFormIssue] = useState<IssueType>('Customer Issue');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formCity, setFormCity] = useState<City>('Karachi');
  const [formArea, setFormArea] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formTracking, setFormTracking] = useState<string>('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter cases for the selected client
  const clientCases = useMemo(() => {
    return cases.filter((c) => c.client === selectedClient);
  }, [cases, selectedClient]);

  // Summary counts
  const stats = useMemo(() => {
    const open = clientCases.filter((c) => c.stage === 'NEW' || c.stage === 'ACKNOWLEDGED').length;
    const field = clientCases.filter((c) => c.stage === 'ESCALATED' || c.stage === 'IN_PROGRESS').length;
    const hold = clientCases.filter((c) => c.stage === 'HOLD').length;
    const closed = clientCases.filter((c) => c.stage === 'CLOSURE').length;
    return { open, field, hold, closed, total: clientCases.length };
  }, [clientCases]);

  // Filtered cases for the table
  const filteredCases = useMemo(() => {
    return clientCases.filter((c) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = c.caseId ? c.caseId.toLowerCase().includes(query) : false;
        const matchesLocation = c.location.toLowerCase().includes(query) || (c.address && c.address.toLowerCase().includes(query));
        const matchesIssue = c.issue.toLowerCase().includes(query);
        const matchesTracking = c.trackingNumber ? c.trackingNumber.toLowerCase().includes(query) : false;
        if (!matchesId && !matchesLocation && !matchesIssue && !matchesTracking) return false;
      }

      // Status filter
      if (statusFilter === 'OPEN') return c.stage === 'NEW' || c.stage === 'ACKNOWLEDGED';
      if (statusFilter === 'FIELD') return c.stage === 'ESCALATED' || c.stage === 'IN_PROGRESS';
      if (statusFilter === 'HOLD') return c.stage === 'HOLD';
      if (statusFilter === 'CLOSED') return c.stage === 'CLOSURE';

      return true;
    });
  }, [clientCases, searchQuery, statusFilter]);

  // Submit Raise Case form
  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formArea.trim() || formArea.trim().length < 3) {
      errors.area = 'Area/Location must be at least 3 characters.';
    }
    if (!formDescription.trim() || formDescription.trim().length < 20) {
      errors.description = 'Please provide a clear description (at least 20 characters).';
    }
    if (formDate > new Date().toISOString().split('T')[0]) {
      errors.date = 'Date cannot be in the future.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const created = raiseCase({
        client: formClient,
        issue: formIssue,
        incidentDate: formDate,
        city: formCity,
        area: formArea.trim(),
        address: formAddress.trim() || undefined,
        trackingNumber: formTracking.trim() || undefined,
        amountAtStake: Number(formAmount) || 0,
        description: formDescription.trim(),
      });

      setIsSubmitting(false);
      setIsRaiseModalOpen(false);
      // Reset form
      setFormArea('');
      setFormAddress('');
      setFormTracking('');
      setFormAmount(0);
      setFormDescription('');
      setSelectedCase(created);
    } catch {
      setIsSubmitting(false);
      setFormErrors({ general: 'Failed to submit case. Please try again.' });
    }
  };

  // Handle Client reply to Hold
  const handleSendHoldReply = (caseId: string) => {
    if (!holdReplyText.trim() || holdReplyText.trim().length < 10) {
      setReplyError('Reply must be at least 10 characters.');
      return;
    }

    clientReplyHold(caseId, holdReplyText.trim());
    setHoldReplyText('');
    setReplyError('');

    // Update the local selected case view
    const updated = cases.find((c) => c.id === caseId);
    if (updated) setSelectedCase(updated);
  };

  // Copy closure report
  const handleCopyReport = (reportText: string) => {
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Status badge styling
  const renderStatusBadge = (c: DeskCase) => {
    const label = getClientStatusLabel(c);
    let bg = 'var(--color-bg-subtle)';
    let color = 'var(--color-text-secondary)';
    let border = 'var(--color-border-subtle)';

    if (c.stage === 'NEW') {
      bg = '#fffbeb';
      color = '#b45309';
      border = '#fde68a';
    } else if (c.stage === 'ACKNOWLEDGED') {
      bg = '#eff6ff';
      color = '#1d4ed8';
      border = '#bfdbfe';
    } else if (c.stage === 'ESCALATED' || c.stage === 'IN_PROGRESS') {
      bg = '#f0fdf4';
      color = '#15803d';
      border = '#bbf7d0';
    } else if (c.stage === 'HOLD') {
      bg = '#fef2f2';
      color = '#b91c1c';
      border = '#fecaca';
    } else if (c.stage === 'CLOSURE') {
      bg = '#f8fafc';
      color = '#475569';
      border = '#cbd5e1';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.55rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner: Client Selector & Clean Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Left: Client Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            <Building2 size={16} />
            <span>Client Workspace:</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-bg-subtle)',
              padding: '0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            {(['PostEx', 'Daraz'] as ClientCompany[]).map((client) => {
              const active = selectedClient === client;
              return (
                <button
                  key={client}
                  type="button"
                  onClick={() => {
                    setSelectedClient(client);
                    setFormClient(client);
                  }}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? 'var(--color-bg-surface)' : 'transparent',
                    color: active ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
                    border: active ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
                    cursor: 'pointer',
                    boxShadow: active ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {client}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Raise Case Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              setFormClient(selectedClient);
              setIsRaiseModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-brand-action)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <PlusCircle size={15} />
            Raise a Case
          </button>
        </div>
      </div>

      {/* Clean Minimal Metrics Bar (No oversized flashy cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Waiting Acknowledgment</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#b45309' }}>{stats.open}</div>
        </div>

        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Active in Field</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#15803d' }}>{stats.field}</div>
        </div>

        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Action Required (On Hold)</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#b91c1c' }}>{stats.hold}</div>
        </div>

        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Closed Cases</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stats.closed}</div>
        </div>
      </div>

      {/* Clean Filter & Search Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by case ID, location, or tracking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.35rem 0.6rem 0.35rem 1.9rem',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-page)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(
            [
              { id: 'ALL', label: 'All Cases' },
              { id: 'OPEN', label: 'Received' },
              { id: 'FIELD', label: 'In Field' },
              { id: 'HOLD', label: 'On Hold' },
              { id: 'CLOSED', label: 'Closed' },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: active ? 600 : 500,
                  backgroundColor: active ? 'var(--color-action-secondary-bg)' : 'transparent',
                  color: active ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
                  border: active ? '1px solid var(--color-brand-action)' : '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cases Table */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                <th style={{ padding: '0.65rem 0.85rem' }}>Case ID</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Issue Type</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>City & Area</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Incident Date</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Amount (PKR)</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No cases match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Case ID */}
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>
                      {c.caseId ? (
                        <span style={{ color: 'var(--color-brand-action)', fontFamily: 'monospace' }}>
                          {c.caseId}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                          ID on acknowledgement
                        </span>
                      )}
                    </td>

                    {/* Issue Type */}
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-primary)' }}>
                      {c.issue}
                    </td>

                    {/* City & Area */}
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-secondary)' }}>
                      <span>{c.city}</span> &bull; <span>{c.location}</span>
                    </td>

                    {/* Incident Date */}
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {c.incidentDate || c.createdAt.split('T')[0]}
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      PKR {c.amountAtStake.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      {renderStatusBadge(c)}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedCase(c)}
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Raise a Case */}
      {isRaiseModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Raise a Case — {selectedClient}
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Submit an incident directly to the Mohafiz Operations Room
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRaiseModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRaiseSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {formErrors.general && (
                <div
                  style={{
                    padding: '0.6rem 0.85rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-sm)',
                    color: '#b91c1c',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <AlertCircle size={14} />
                  {formErrors.general}
                </div>
              )}

              {/* Issue Type & Incident Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Issue Type <span style={{ color: 'var(--color-brand-action)' }}>*</span>
                  </label>
                  <select
                    value={formIssue}
                    onChange={(e) => setFormIssue(e.target.value as IssueType)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  >
                    <option value="Customer Issue">Customer Issue</option>
                    <option value="Fake Delivery">Fake Delivery</option>
                    <option value="Snatching">Snatching</option>
                    <option value="Theft">Theft</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Incident Date <span style={{ color: 'var(--color-brand-action)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                      border: formErrors.date ? '1px solid #ef4444' : '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  />
                  {formErrors.date && (
                    <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{formErrors.date}</span>
                  )}
                </div>
              </div>

              {/* City & Area */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    City <span style={{ color: 'var(--color-brand-action)' }}>*</span>
                  </label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value as City)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Islamabad">Islamabad</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Area / Town <span style={{ color: 'var(--color-brand-action)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nazimabad, Gulberg, F-10"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                      border: formErrors.area ? '1px solid #ef4444' : '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  />
                  {formErrors.area && (
                    <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{formErrors.area}</span>
                  )}
                </div>
              </div>

              {/* Specific Street Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  Specific Address
                </label>
                <input
                  type="text"
                  placeholder="House/Shop no, street, landmark..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.8125rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-page)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Tracking Number & Amount at Stake */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Tracking / Consignment #
                  </label>
                  <input
                    type="text"
                    placeholder="Optional tracking ID"
                    value={formTracking}
                    onChange={(e) => setFormTracking(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Amount at Stake (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formAmount === 0 ? '' : formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  Incident Description <span style={{ color: 'var(--color-brand-action)' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what occurred, customer details, rider status... (min 20 chars)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.8125rem',
                    borderRadius: 'var(--radius-sm)',
                    border: formErrors.description ? '1px solid #ef4444' : '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-page)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                {formErrors.description && (
                  <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{formErrors.description}</span>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--color-border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--color-brand-action)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: Case Details */}
      {selectedCase && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {selectedCase.caseId || 'Case Reference Pending'}
                  </h3>
                  {renderStatusBadge(selectedCase)}
                </div>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Client: {selectedCase.client} &bull; Incident Date: {selectedCase.incidentDate || selectedCase.createdAt.split('T')[0]}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Alert: Case on Hold at Client's End */}
              {selectedCase.stage === 'HOLD' && selectedCase.hold?.whoseEnd === 'CLIENT' && (
                <div
                  style={{
                    padding: '0.85rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c', fontWeight: 600, fontSize: '0.8125rem' }}>
                    <AlertCircle size={16} />
                    <span>Mohafiz Operations needs information from you:</span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: '#7f1d1d', backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5' }}>
                    {selectedCase.hold.nextAction}
                  </div>

                  {selectedCase.hold.clientReply ? (
                    <div style={{ fontSize: '0.75rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={14} />
                      Your reply was submitted to Mohafiz Operations: &ldquo;{selectedCase.hold.clientReply}&rdquo;
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                      <textarea
                        rows={2}
                        placeholder="Type requested information here (min 10 characters)..."
                        value={holdReplyText}
                        onChange={(e) => setHoldReplyText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.8125rem',
                          borderRadius: 'var(--radius-sm)',
                          border: replyError ? '1px solid #ef4444' : '1px solid #fca5a5',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                      {replyError && <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{replyError}</span>}
                      <button
                        type="button"
                        onClick={() => handleSendHoldReply(selectedCase.id)}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#b91c1c',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Submit Reply to Operations
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Case Summary Details Table */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--color-bg-page)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Issue: </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedCase.issue}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Location: </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedCase.city} ({selectedCase.location})</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Amount at Stake: </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-brand-action)' }}>PKR {selectedCase.amountAtStake.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Tracking #: </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedCase.trackingNumber || 'N/A'}</span>
                </div>
                {selectedCase.address && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Address: </span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{selectedCase.address}</span>
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Description: </span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{selectedCase.description}</span>
                </div>
              </div>

              {/* Published Closure Report (If Closed) */}
              {selectedCase.stage === 'CLOSURE' && selectedCase.report?.publishedText && (
                <div
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>
                      <FileText size={14} />
                      Official Case Closure Report
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyReport(selectedCase.report?.publishedText || '')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: copiedReport ? '#15803d' : 'var(--color-brand-action)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedReport ? <Check size={12} /> : <Copy size={12} />}
                      {copiedReport ? 'Copied' : 'Copy Report'}
                    </button>
                  </div>

                  <div style={{ padding: '0.75rem', whiteSpace: 'pre-wrap', fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-primary)', fontFamily: 'inherit' }}>
                    {selectedCase.report.publishedText}
                  </div>
                </div>
              )}

              {/* Client-Visible Activity Log */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} />
                  Case Activity
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    backgroundColor: 'var(--color-bg-page)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    maxHeight: '140px',
                    overflowY: 'auto',
                  }}
                >
                  {selectedCase.events
                    .filter((ev) => ev.visibility === 'client')
                    .map((ev) => (
                      <div
                        key={ev.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          padding: '0.2rem 0',
                          borderBottom: '1px dashed var(--color-border-subtle)',
                        }}
                      >
                        <span style={{ color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle size={12} color="#15803d" />
                          {ev.text}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                          {new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '0.65rem 1.25rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
