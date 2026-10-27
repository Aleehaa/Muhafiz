import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Search,
  PlusCircle,
  ArrowRight,
  Volume2,
  Play,
  Pause,
  X,
} from 'lucide-react';
import { useDesk } from '../context/DeskContext';
import {
  DeskCase,
  ClientCompany,
  IssueType,
  City,
  ChannelSource,
  CaseHoldInfo,
} from '../models/desk.model';

export const CroWorkspaceView: React.FC = () => {
  const {
    cases,
    acknowledgeAndEscalate,
    acknowledgeOnly,
    croPublishReport,
    croReturnReport,
    croPutOnHold,
    croResumeCase,
    croLogCase,
    addInternalNote,
  } = useDesk();

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'today' | 'new' | 'board' | 'all' | 'publish' | 'logsheet'>('today');

  // Drawer / Inspection
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'summary' | 'timeline' | 'notes' | 'fieldlog' | 'hold'>('summary');

  // Filters for 'all' and 'board'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClient, setFilterClient] = useState<string>('ALL');
  const [filterCity, setFilterCity] = useState<string>('ALL');

  // Modal: Log a case for a client
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logClient, setLogClient] = useState<ClientCompany>('PostEx');
  const [logChannel, setLogChannel] = useState<ChannelSource>('WhatsApp group');
  const [logIssue, setLogIssue] = useState<IssueType>('Snatching');
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logCity, setLogCity] = useState<City>('Karachi');
  const [logArea, setLogArea] = useState<string>('');
  const [logAddress, setLogAddress] = useState<string>('');
  const [logTracking, setLogTracking] = useState<string>('');
  const [logAmount, setLogAmount] = useState<number>(0);
  const [logDescription, setLogDescription] = useState<string>('');
  const [logErrors, setLogErrors] = useState<Record<string, string>>({});

  // Internal Note form inside Drawer
  const [newNoteText, setNewNoteText] = useState('');

  // Hold Form inside Drawer
  const [holdWhoseEnd, setHoldWhoseEnd] = useState<'CLIENT' | 'MOHAFIZ' | 'POLICE'>('CLIENT');
  const [holdNextAction, setHoldNextAction] = useState('');
  const [holdFollowUpDate, setHoldFollowUpDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [holdError, setHoldError] = useState('');

  // Updates to Publish: Review state
  const [returnReason, setReturnReason] = useState<Record<string, string>>({});
  const [editingDraft, setEditingDraft] = useState<Record<string, string>>({});
  const [proofWaived, setProofWaived] = useState<Record<string, boolean>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Log Sheet: Copy as CSV feedback
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Selected case reference for drawer
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  // Operational Counts
  const counts = useMemo(() => {
    const toAcknowledge = cases.filter((c) => c.stage === 'NEW').length;
    const inField = cases.filter((c) => c.stage === 'ESCALATED' || c.stage === 'IN_PROGRESS').length;
    const onHold = cases.filter((c) => c.stage === 'HOLD').length;
    const toPublish = cases.filter(
      (c) => c.stage === 'IN_PROGRESS' && c.report?.reviewState === 'review'
    ).length;
    const closed = cases.filter((c) => c.stage === 'CLOSURE').length;
    return { toAcknowledge, inField, onHold, toPublish, closed, total: cases.length };
  }, [cases]);

  // Next up task calculation
  const nextUp = useMemo(() => {
    const newCase = cases.find((c) => c.stage === 'NEW');
    if (newCase) {
      return {
        type: 'NEW_CASE' as const,
        case: newCase,
        title: `Acknowledge and dispatch ${newCase.client} case`,
        detail: `${newCase.issue} in ${newCase.city} (${newCase.location}) waiting for dispatch to SFSO`,
      };
    }
    const reportCase = cases.find(
      (c) => c.stage === 'IN_PROGRESS' && c.report?.reviewState === 'review'
    );
    if (reportCase) {
      return {
        type: 'REVIEW_REPORT' as const,
        case: reportCase,
        title: `Review field report for ${reportCase.caseId}`,
        detail: `${reportCase.officer?.name || 'Officer'} submitted field report with outcome: ${reportCase.report?.outcome}`,
      };
    }
    const holdCase = cases.find((c) => c.stage === 'HOLD' && c.hold?.clientReply);
    if (holdCase) {
      return {
        type: 'HOLD_REPLY' as const,
        case: holdCase,
        title: `Client replied on held case ${holdCase.caseId}`,
        detail: `Client provided requested details: "${holdCase.hold?.clientReply}"`,
      };
    }
    return null;
  }, [cases]);

  // Recent 8 audit events across all cases
  const recentEvents = useMemo(() => {
    const allEvents: { caseId: string; casePublicId: string | null; time: string; text: string; actor: string }[] = [];
    cases.forEach((c) => {
      c.events.forEach((ev) => {
        allEvents.push({
          caseId: c.id,
          casePublicId: c.caseId,
          time: ev.time,
          text: ev.text,
          actor: ev.actor,
        });
      });
    });
    return allEvents
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [cases]);

  // Filtered cases for 'all' tab
  const filteredAllCases = useMemo(() => {
    return cases.filter((c) => {
      if (filterClient !== 'ALL' && c.client !== filterClient) return false;
      if (filterCity !== 'ALL' && c.city !== filterCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = c.caseId ? c.caseId.toLowerCase().includes(q) : false;
        const matchesLocation = c.location.toLowerCase().includes(q) || (c.address && c.address.toLowerCase().includes(q));
        const matchesClient = c.client.toLowerCase().includes(q);
        const matchesIssue = c.issue.toLowerCase().includes(q);
        if (!matchesId && !matchesLocation && !matchesClient && !matchesIssue) return false;
      }
      return true;
    });
  }, [cases, filterClient, filterCity, searchQuery]);

  // Cases needing publication
  const reportsToPublish = useMemo(() => {
    return cases.filter((c) => c.stage === 'IN_PROGRESS' && c.report?.reviewState === 'review');
  }, [cases]);

  // Log Sheet cases (cases that reached the field: stages ESCALATED, IN_PROGRESS, HOLD, CLOSURE)
  const logSheetCases = useMemo(() => {
    return cases.filter((c) => c.stage !== 'NEW');
  }, [cases]);

  // Missing fields count on log sheet
  const missingCount = useMemo(() => {
    let count = 0;
    logSheetCases.forEach((c) => {
      if (
        c.initialResponse === 'Missing' ||
        !c.initialResponse ||
        c.onGroundResponse === 'Missing' ||
        !c.onGroundResponse ||
        c.distanceKm === undefined ||
        c.liveTrackingRecord === 'Missing' ||
        !c.liveTrackingRecord
      ) {
        count += 1;
      }
    });
    return count;
  }, [logSheetCases]);

  // Handle Copy as CSV
  const handleCopyCsv = () => {
    const headers = [
      'Case ID',
      'Client',
      'Issue',
      'City',
      'Location',
      'Amount (PKR)',
      'Stage',
      'Initial Response',
      'On-Ground Response',
      'Distance (km)',
      'Live Tracking Record',
    ];
    const rows = logSheetCases.map((c) => [
      c.caseId || 'Pending',
      c.client,
      c.issue,
      c.city,
      `"${c.location}"`,
      c.amountAtStake,
      c.stage,
      c.initialResponse || 'Missing',
      c.onGroundResponse || 'Missing',
      c.distanceKm !== undefined ? c.distanceKm : 'Missing',
      c.liveTrackingRecord || 'Missing',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    navigator.clipboard.writeText(csvContent);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  // Submit Log Case modal
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!logArea.trim() || logArea.trim().length < 3) {
      errors.area = 'Area must be at least 3 characters.';
    }
    if (!logDescription.trim() || logDescription.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters.';
    }
    if (Object.keys(errors).length > 0) {
      setLogErrors(errors);
      return;
    }
    croLogCase({
      client: logClient,
      channel: logChannel,
      issue: logIssue,
      incidentDate: logDate,
      city: logCity,
      area: logArea.trim(),
      address: logAddress.trim() || undefined,
      trackingNumber: logTracking.trim() || undefined,
      amountAtStake: Number(logAmount) || 0,
      description: logDescription.trim(),
    });
    setIsLogModalOpen(false);
    setLogArea('');
    setLogAddress('');
    setLogTracking('');
    setLogAmount(0);
    setLogDescription('');
    setActiveTab('new');
  };

  // Handle adding internal note in drawer
  const handleAddNote = () => {
    if (!selectedCase || !newNoteText.trim()) return;
    addInternalNote(selectedCase.id, newNoteText.trim(), 'CRO Desk');
    setNewNoteText('');
  };

  // Handle putting case on hold in drawer
  const handleApplyHold = () => {
    if (!selectedCase) return;
    if (!holdNextAction.trim() || holdNextAction.trim().length < 5) {
      setHoldError('Next action must be at least 5 characters.');
      return;
    }
    const holdInfo: CaseHoldInfo = {
      whoseEnd: holdWhoseEnd,
      nextAction: holdNextAction.trim(),
      followUpDate: holdFollowUpDate,
      startedAt: new Date().toISOString(),
    };
    croPutOnHold(selectedCase.id, holdInfo);
    setHoldNextAction('');
    setHoldError('');
  };

  // Publish report handler
  const handlePublishReport = (c: DeskCase) => {
    const draft = editingDraft[c.id] ?? c.report?.draftText ?? '';
    // Validation check: layout check and outcome
    if (!draft.includes('Findings') || !draft.includes('Conclusion') || !draft.includes('Recommendation')) {
      alert('The report draft must contain Findings, Conclusion, and Recommendation sections.');
      return;
    }
    if (draft.includes('[CRO:')) {
      alert('Please remove the [CRO: ...] placeholder from the draft before publishing.');
      return;
    }
    croPublishReport(c.id, draft);
  };

  // Audio Playback simulation
  const togglePlayAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Bar: CRO Workspace Navigation Tabs & "+ Log Case" */}
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
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'new', label: `New Cases (${counts.toAcknowledge})` },
              { id: 'board', label: 'Board' },
              { id: 'all', label: `All Cases (${counts.total})` },
              { id: 'publish', label: `Updates to Publish (${counts.toPublish})` },
              { id: 'logsheet', label: 'Log Sheet' },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: active ? 600 : 500,
                  backgroundColor: active ? 'var(--color-action-secondary-bg)' : 'transparent',
                  color: active ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
                  border: active ? '1px solid var(--color-brand-action)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action: Log Case for Client */}
        <button
          type="button"
          onClick={() => setIsLogModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-brand-action)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <PlusCircle size={14} />
          Log Case (WhatsApp / Call)
        </button>
      </div>

      {/* TAB 1: TODAY */}
      {activeTab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 4 Clean Metric Counters */}
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
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>To Acknowledge</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#b45309' }}>{counts.toAcknowledge}</div>
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
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>In Field (Escalated/Working)</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#15803d' }}>{counts.inField}</div>
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
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>On Hold</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#b91c1c' }}>{counts.onHold}</div>
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
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Updates to Publish</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-brand-action)' }}>{counts.toPublish}</div>
            </div>
          </div>

          {/* Priority Next Up Action Banner */}
          {nextUp ? (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-brand-action)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand-action)' }}>
                  <AlertCircle size={14} />
                  NEXT UP ACTION REQUIRED
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '0.15rem' }}>
                  {nextUp.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
                  {nextUp.detail}
                </div>
              </div>

              <div>
                {nextUp.type === 'NEW_CASE' && (
                  <button
                    type="button"
                    onClick={() => {
                      acknowledgeAndEscalate(nextUp.case.id);
                    }}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-brand-action)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Acknowledge & Send to SFSO {nextUp.case.city}
                  </button>
                )}
                {nextUp.type === 'REVIEW_REPORT' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('publish')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-brand-action)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Open Review Center
                  </button>
                )}
                {nextUp.type === 'HOLD_REPLY' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCaseId(nextUp.case.id);
                      setDrawerTab('hold');
                    }}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Review Reply & Resume
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle size={16} color="#15803d" />
              All operational tasks are up to date. No pending acknowledgements or reports.
            </div>
          )}

          {/* Recent Operations Activity Log */}
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
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                borderBottom: '1px solid var(--color-border-subtle)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Clock size={13} />
              Recent Operations Activity Log (Latest 8 events)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentEvents.map((ev, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.75rem',
                    borderBottom: idx < recentEvents.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-brand-action)', fontFamily: 'monospace' }}>
                      {ev.casePublicId || 'Pending'}
                    </span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{ev.text}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                      by {ev.actor}
                    </span>
                  </div>

                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                    {new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEW CASES (1-STEP DISPATCH TO SFSO) */}
      {activeTab === 'new' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Incoming cases awaiting CRO acknowledgement and SFSO city dispatch.
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
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
                  <th style={{ padding: '0.65rem 0.85rem' }}>Client</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Issue & Details</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>City & Area</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Amount</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Destination</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.filter((c) => c.stage === 'NEW').length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No new cases waiting for acknowledgement.
                    </td>
                  </tr>
                ) : (
                  cases
                    .filter((c) => c.stage === 'NEW')
                    .map((c) => (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {c.client}
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                            {c.source}
                          </div>
                        </td>

                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.issue}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.description}
                          </div>
                        </td>

                        <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-secondary)' }}>
                          <strong>{c.city}</strong> &bull; {c.location}
                        </td>

                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>
                          PKR {c.amountAtStake.toLocaleString()}
                        </td>

                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-bg-subtle)',
                              border: '1px solid var(--color-border-subtle)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            SFSO {c.city}
                          </span>
                        </td>

                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => acknowledgeOnly(c.id)}
                              style={{
                                padding: '0.3rem 0.55rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                backgroundColor: 'transparent',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border-subtle)',
                                cursor: 'pointer',
                              }}
                            >
                              Acknowledge Only
                            </button>

                            <button
                              type="button"
                              onClick={() => acknowledgeAndEscalate(c.id)}
                              style={{
                                padding: '0.3rem 0.7rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: 'var(--color-brand-action)',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <span>Send to SFSO</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 6-STAGE BOARD */}
      {activeTab === 'board' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Operational lifecycle board. Six stages with assigned owners.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(210px, 1fr))',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {(
              [
                { stage: 'NEW', title: 'New', owner: 'CRO' },
                { stage: 'ACKNOWLEDGED', title: 'Acknowledged', owner: 'CRO' },
                { stage: 'ESCALATED', title: 'Escalated to SFSO', owner: 'SFSO' },
                { stage: 'IN_PROGRESS', title: 'In Progress', owner: 'FSO' },
                { stage: 'HOLD', title: 'Hold', owner: 'Named Owner' },
                { stage: 'CLOSURE', title: 'Closure', owner: 'CRO' },
              ] as const
            ).map((col) => {
              const colCases = cases.filter((c) => c.stage === col.stage);
              return (
                <div
                  key={col.stage}
                  style={{
                    backgroundColor: 'var(--color-bg-page)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '380px',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: '0.5rem 0.65rem',
                      backgroundColor: 'var(--color-bg-surface)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {col.title}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                        Owner: {col.owner}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-bg-subtle)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {colCases.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {colCases.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: '0.6rem',
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{c.client}</span>
                          <span style={{ color: 'var(--color-brand-action)', fontFamily: 'monospace', fontWeight: 600 }}>
                            {c.caseId || 'Pending'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {c.issue}
                        </div>

                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                          {c.city} &bull; {c.location}
                        </div>

                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          PKR {c.amountAtStake.toLocaleString()}
                        </div>

                        {c.officer && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                            Officer: {c.officer.name}
                          </div>
                        )}

                        {/* Quick Action Button */}
                        <div style={{ marginTop: '0.2rem', paddingTop: '0.3rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCaseId(c.id);
                              setDrawerTab('summary');
                            }}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              backgroundColor: 'var(--color-bg-subtle)',
                              color: 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border-subtle)',
                              cursor: 'pointer',
                            }}
                          >
                            Inspect Record
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ALL CASES (TABLE + FILTER + INSPECTOR) */}
      {activeTab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Filter Strip */}
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
            <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px' }}>
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
                placeholder="Search case ID, client, location..."
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

            {/* Client & City Selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                style={{
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-page)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="ALL">All Clients</option>
                <option value="PostEx">PostEx</option>
                <option value="Daraz">Daraz</option>
                <option value="Buscaro">Buscaro</option>
              </select>

              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                style={{
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-page)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="ALL">All Cities</option>
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
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
                  <th style={{ padding: '0.65rem 0.85rem' }}>Client</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Issue</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>City & Area</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Amount (PKR)</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Stage</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Officer</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllCases.map((c) => (
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
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--color-brand-action)', fontFamily: 'monospace' }}>
                        {c.caseId || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>{c.client}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>{c.issue}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-secondary)' }}>
                      {c.city} &bull; {c.location}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>
                      PKR {c.amountAtStake.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span
                        style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-bg-subtle)',
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {c.stage}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      {c.officer?.name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          setDrawerTab('summary');
                        }}
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: UPDATES TO PUBLISH (FIELD REPORT VERIFICATION CENTER) */}
      {activeTab === 'publish' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Field reports submitted by FSOs awaiting CRO review, FCR draft editing, quality checks, and client publication.
          </div>

          {reportsToPublish.length === 0 ? (
            <div
              style={{
                padding: '2.5rem',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              No field reports currently waiting for review and publication.
            </div>
          ) : (
            reportsToPublish.map((c) => {
              const currentDraft = editingDraft[c.id] ?? c.report?.draftText ?? '';
              const isProofWaived = proofWaived[c.id] || c.report?.proofNotApplicable || false;
              const hasVoiceNote = (c.report?.voiceNotes?.length ?? 0) > 0;
              const hasPlaceholder = currentDraft.includes('[CRO:');

              // Check if ready to publish
              const passesOutcome = !!c.report?.outcome;
              const passesLayout = currentDraft.includes('Findings') && currentDraft.includes('Conclusion') && currentDraft.includes('Recommendation');
              const passesVoiceCheck = !hasVoiceNote || !hasPlaceholder;
              const passesProof = (c.report?.photos?.length ?? 0) > 0 || isProofWaived;
              const canPublish = passesOutcome && passesLayout && passesVoiceCheck && passesProof;

              return (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Report Card Header */}
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-brand-action)', fontFamily: 'monospace' }}>
                          {c.caseId}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {c.client} &bull; {c.issue}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Officer: {c.officer?.name} ({c.city}) &bull; Sent: {c.report?.sentAt ? new Date(c.report.sentAt).toLocaleTimeString() : 'Recently'}
                      </div>
                    </div>

                    {/* Operational metrics chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem' }}>
                      <span style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        Initial: {c.initialResponse}
                      </span>
                      <span style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        On-ground: {c.onGroundResponse}
                      </span>
                      <span style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        Distance: {c.distanceKm} km
                      </span>
                    </div>
                  </div>

                  {/* Body: Left = FSO Submission, Right = CRO FCR Editor */}
                  <div
                    style={{
                      padding: '0.85rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {/* Left: FSO Submission Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        FSO Field Submission
                      </div>

                      <div style={{ fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Outcome: </span>
                        <strong>{c.report?.outcome}</strong>
                      </div>

                      <div style={{ fontSize: '0.8125rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Amount Recovered: </span>
                        <strong>PKR {(c.report?.amountRecovered ?? 0).toLocaleString()}</strong>
                      </div>

                      {/* Voice Note Player */}
                      {c.report?.voiceNotes && c.report.voiceNotes.length > 0 && (
                        <div
                          style={{
                            padding: '0.6rem',
                            backgroundColor: 'var(--color-bg-page)',
                            border: '1px solid var(--color-border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Volume2 size={14} color="var(--color-brand-action)" />
                            Voice Note Audio ({c.report.voiceNotes[0].durationSec}s)
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => togglePlayAudio(c.id)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-brand-action)',
                                color: '#ffffff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              {playingAudioId === c.id ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--color-border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: playingAudioId === c.id ? '60%' : '0%',
                                  backgroundColor: 'var(--color-brand-action)',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                              {playingAudioId === c.id ? 'Playing...' : `0:${c.report.voiceNotes[0].durationSec}`}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Typed Notes if any */}
                      {c.report?.typedNotes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-page)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <strong>FSO Notes:</strong> {c.report.typedNotes}
                        </div>
                      )}

                      {/* Proof checkbox */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                        <input
                          type="checkbox"
                          id={`proof-${c.id}`}
                          checked={isProofWaived}
                          onChange={(e) => {
                            setProofWaived((prev) => ({ ...prev, [c.id]: e.target.checked }));
                          }}
                        />
                        <label htmlFor={`proof-${c.id}`} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                          Proof does not apply to this case
                        </label>
                      </div>
                    </div>

                    {/* Right: Editable FCR Draft */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          Client Report Draft (FCR Layout)
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          Editable before publishing
                        </span>
                      </div>

                      <textarea
                        rows={7}
                        value={currentDraft}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingDraft((prev) => ({ ...prev, [c.id]: val }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          lineHeight: 1.4,
                          borderRadius: 'var(--radius-sm)',
                          border: hasPlaceholder ? '1px solid #ef4444' : '1px solid var(--color-border-subtle)',
                          backgroundColor: 'var(--color-bg-page)',
                          color: 'var(--color-text-primary)',
                          outline: 'none',
                        }}
                      />

                      {/* System Checks Status */}
                      <div
                        style={{
                          padding: '0.4rem 0.6rem',
                          backgroundColor: canPublish ? '#f0fdf4' : '#fef2f2',
                          border: `1px solid ${canPublish ? '#bbf7d0' : '#fecaca'}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: canPublish ? '#15803d' : '#b91c1c' }}>
                          {canPublish ? '✓ All verification checks passed' : 'Publishing blocked by checks:'}
                        </div>
                        {!passesLayout && <div style={{ color: '#b91c1c' }}>• Draft must contain Findings, Conclusion, Recommendation headers</div>}
                        {hasVoiceNote && hasPlaceholder && (
                          <div style={{ color: '#b91c1c' }}>• Replace the voice note placeholder line [CRO: ...] with findings</div>
                        )}
                        {!passesProof && <div style={{ color: '#b91c1c' }}>• Attach photo proof or tick &ldquo;Proof does not apply&rdquo;</div>}
                      </div>

                      {/* Publish / Return Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {/* Return to FSO */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
                          <input
                            type="text"
                            placeholder="Reason to return (min 5 chars)..."
                            value={returnReason[c.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReturnReason((prev) => ({ ...prev, [c.id]: val }));
                            }}
                            style={{
                              flex: 1,
                              padding: '0.3rem 0.5rem',
                              fontSize: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border-subtle)',
                              backgroundColor: 'var(--color-bg-page)',
                              color: 'var(--color-text-primary)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const reason = returnReason[c.id];
                              if (!reason || reason.trim().length < 5) {
                                alert('Please provide a reason of at least 5 characters to return the report.');
                                return;
                              }
                              croReturnReport(c.id, reason.trim());
                            }}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: 'var(--color-bg-subtle)',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              cursor: 'pointer',
                            }}
                          >
                            Return
                          </button>
                        </div>

                        {/* Approve and Publish */}
                        <button
                          type="button"
                          disabled={!canPublish}
                          onClick={() => handlePublishReport(c)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: canPublish ? 'var(--color-brand-action)' : 'var(--color-bg-subtle)',
                            color: canPublish ? '#ffffff' : 'var(--color-text-muted)',
                            border: 'none',
                            cursor: canPublish ? 'pointer' : 'not-allowed',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Approve & Publish to Client
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 6: MOHAFIZ LOG SHEET (SPREADSHEET & CSV EXPORT) */}
      {activeTab === 'logsheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Top Banner: Missing Fields & Copy as CSV Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Mohafiz Case Management Operational Log Sheet
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Official operational log capturing response measures, distance, and tracking status.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {missingCount > 0 && (
                <span
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  ⚠️ {missingCount} case{missingCount > 1 ? 's have' : ' has'} missing operational fields
                </span>
              )}

              <button
                type="button"
                onClick={handleCopyCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: copiedCsv ? '#15803d' : 'var(--color-brand-action)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {copiedCsv ? <Check size={14} /> : <Copy size={14} />}
                {copiedCsv ? 'Copied CSV to Clipboard' : 'Copy as CSV'}
              </button>
            </div>
          </div>

          {/* Spreadsheet Table */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <th style={{ padding: '0.55rem 0.75rem' }}>Case ID</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Client</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Issue</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>City</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Location</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Amount (PKR)</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Stage</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Initial Response</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>On-Ground Response</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Distance</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Live Tracking</th>
                </tr>
              </thead>
              <tbody>
                {logSheetCases.map((c) => {
                  const hasMissingInitial = c.initialResponse === 'Missing' || !c.initialResponse;
                  const hasMissingOnground = c.onGroundResponse === 'Missing' || !c.onGroundResponse;
                  const hasMissingDist = c.distanceKm === undefined;
                  const hasMissingTrack = c.liveTrackingRecord === 'Missing' || !c.liveTrackingRecord;

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-brand-action)' }}>
                        {c.caseId || 'Pending'}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{c.client}</td>
                      <td style={{ padding: '0.55rem 0.75rem' }}>{c.issue}</td>
                      <td style={{ padding: '0.55rem 0.75rem' }}>{c.city}</td>
                      <td style={{ padding: '0.55rem 0.75rem' }}>{c.location}</td>
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>
                        {c.amountAtStake.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }}>{c.stage}</td>

                      {/* Initial Response */}
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        {hasMissingInitial ? (
                          <span style={{ padding: '0.1rem 0.35rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.6875rem', fontWeight: 600 }}>
                            Missing
                          </span>
                        ) : (
                          c.initialResponse
                        )}
                      </td>

                      {/* On-ground response */}
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        {hasMissingOnground ? (
                          <span style={{ padding: '0.1rem 0.35rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.6875rem', fontWeight: 600 }}>
                            Missing
                          </span>
                        ) : (
                          c.onGroundResponse
                        )}
                      </td>

                      {/* Distance */}
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        {hasMissingDist ? (
                          <span style={{ padding: '0.1rem 0.35rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.6875rem', fontWeight: 600 }}>
                            Missing
                          </span>
                        ) : (
                          `${c.distanceKm} km`
                        )}
                      </td>

                      {/* Live Tracking */}
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        {hasMissingTrack ? (
                          <span style={{ padding: '0.1rem 0.35rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.6875rem', fontWeight: 600 }}>
                            Missing
                          </span>
                        ) : (
                          <span style={{ color: '#15803d', fontWeight: 600 }}>
                            {c.liveTrackingRecord}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Log a Case for Client */}
      {isLogModalOpen && (
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
                  Log Case for Client (CRO Entry)
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Log incidents received via WhatsApp, Phone Call, Email, or PostEx IMS
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Client
                  </label>
                  <select
                    value={logClient}
                    onChange={(e) => setLogClient(e.target.value as ClientCompany)}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
                  >
                    <option value="PostEx">PostEx</option>
                    <option value="Daraz">Daraz</option>
                    <option value="Buscaro">Buscaro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Channel Source
                  </label>
                  <select
                    value={logChannel}
                    onChange={(e) => setLogChannel(e.target.value as ChannelSource)}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
                  >
                    <option value="WhatsApp group">WhatsApp group</option>
                    <option value="Phone call">Phone call</option>
                    <option value="Email">Email</option>
                    <option value="PostEx IMS portal">PostEx IMS portal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Issue Type
                  </label>
                  <select
                    value={logIssue}
                    onChange={(e) => setLogIssue(e.target.value as IssueType)}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
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
                    Date
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    City
                  </label>
                  <select
                    value={logCity}
                    onChange={(e) => setLogCity(e.target.value as City)}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Islamabad">Islamabad</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Area / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nazimabad, Gulberg"
                    value={logArea}
                    onChange={(e) => setLogArea(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: logErrors.area ? '1px solid #ef4444' : '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
                  />
                  {logErrors.area && <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{logErrors.area}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Tracking #
                  </label>
                  <input
                    type="text"
                    value={logTracking}
                    onChange={(e) => setLogTracking(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={logAmount === 0 ? '' : logAmount}
                    onChange={(e) => setLogAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  Incident Description (min 20 chars)
                </label>
                <textarea
                  rows={3}
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', border: logErrors.description ? '1px solid #ef4444' : '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }}
                />
                {logErrors.description && <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{logErrors.description}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-subtle)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--color-brand-action)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                >
                  Save to New Cases
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: Comprehensive Case Record Inspection Panel */}
      {selectedCase && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              borderLeft: '1px solid var(--color-border-subtle)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {selectedCase.caseId || 'Unacknowledged Case'}
                  </span>
                  <span
                    style={{
                      padding: '0.15rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-brand-action)',
                    }}
                  >
                    {selectedCase.stage}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                  Client: {selectedCase.client} &bull; City: {selectedCase.city} &bull; Officer: {selectedCase.officer?.name || 'None'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCaseId(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Sub-Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-subtle)',
                padding: '0 0.5rem',
              }}
            >
              {(
                [
                  { id: 'summary', label: 'Summary' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'fieldlog', label: 'Field Log' },
                  { id: 'notes', label: `Notes (${selectedCase.notes.length})` },
                  { id: 'hold', label: 'Hold Control' },
                ] as const
              ).map((tab) => {
                const active = drawerTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDrawerTab(tab.id)}
                    style={{
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: active ? 600 : 500,
                      backgroundColor: 'transparent',
                      color: active ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
                      border: 'none',
                      borderBottom: active ? '2px solid var(--color-brand-action)' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* 1. SUMMARY TAB */}
              {drawerTab === 'summary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div style={{ backgroundColor: 'var(--color-bg-page)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Issue: </span>
                        <strong>{selectedCase.issue}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Location: </span>
                        <strong>{selectedCase.city} ({selectedCase.location})</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Amount at Stake: </span>
                        <strong>PKR {selectedCase.amountAtStake.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Tracking #: </span>
                        <strong>{selectedCase.trackingNumber || 'N/A'}</strong>
                      </div>
                      {selectedCase.address && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Address: </span>
                          <span>{selectedCase.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--color-bg-page)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Description:</div>
                    <div style={{ lineHeight: 1.4 }}>{selectedCase.description}</div>
                  </div>

                  {/* Operational Metrics if reached field */}
                  <div style={{ backgroundColor: 'var(--color-bg-page)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>Field Response Telemetry</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem' }}>
                      <div>Initial Response: <strong>{selectedCase.initialResponse || 'Pending'}</strong></div>
                      <div>On-Ground Response: <strong>{selectedCase.onGroundResponse || 'Pending'}</strong></div>
                      <div>Distance: <strong>{selectedCase.distanceKm !== undefined ? `${selectedCase.distanceKm} km` : 'Pending'}</strong></div>
                      <div>Tracking Record: <strong>{selectedCase.liveTrackingRecord || 'Pending'}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TIMELINE TAB */}
              {drawerTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedCase.events.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-bg-page)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{ev.actor}</span>
                        <span>{new Date(ev.time).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>{ev.text}</div>
                      <div style={{ fontSize: '0.65rem', color: ev.visibility === 'client' ? '#15803d' : '#475569' }}>
                        Visibility: {ev.visibility === 'client' ? 'Client & Staff' : 'Internal Staff Only'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. FIELD LOG TAB (DEVICE & GPS AUDIT TRAIL) */}
              {drawerTab === 'fieldlog' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Tamper-resistant audit log capturing device GPS coordinates, accuracy, network state, and server time.
                  </div>
                  {selectedCase.fieldLogs.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      No field log events recorded for this case yet.
                    </div>
                  ) : (
                    <div style={{ backgroundColor: 'var(--color-bg-page)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border-subtle)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Time</th>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Event</th>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Position</th>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Accuracy</th>
                            <th style={{ padding: '0.4rem 0.5rem' }}>Network</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCase.fieldLogs.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                              <td style={{ padding: '0.4rem 0.5rem', fontFamily: 'monospace' }}>{log.time}</td>
                              <td style={{ padding: '0.4rem 0.5rem', fontWeight: 600 }}>{log.event}</td>
                              <td style={{ padding: '0.4rem 0.5rem', fontFamily: 'monospace' }}>{log.position}</td>
                              <td style={{ padding: '0.4rem 0.5rem' }}>{log.accuracy}</td>
                              <td style={{ padding: '0.4rem 0.5rem' }}>{log.network}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. NOTES TAB */}
              {drawerTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <textarea
                      rows={2}
                      placeholder="Add an internal operational note (never visible to client)..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        fontSize: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-bg-page)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      style={{
                        alignSelf: 'flex-end',
                        padding: '0.3rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-brand-action)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Add Note
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {selectedCase.notes.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-bg-page)',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.65rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600 }}>{n.author}</span>
                          <span>{new Date(n.time).toLocaleString()}</span>
                        </div>
                        <div style={{ color: 'var(--color-text-primary)' }}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. HOLD CONTROL TAB */}
              {drawerTab === 'hold' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedCase.stage === 'HOLD' ? (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.8125rem' }}>
                        Case is Currently On Hold ({selectedCase.hold?.whoseEnd}&apos;s End)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                        <strong>Next Action:</strong> {selectedCase.hold?.nextAction}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                        <strong>Follow-up Date:</strong> {selectedCase.hold?.followUpDate}
                      </div>
                      {selectedCase.hold?.clientReply && (
                        <div style={{ padding: '0.4rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          <strong>Client Reply Received:</strong> &ldquo;{selectedCase.hold.clientReply}&rdquo;
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => croResumeCase(selectedCase.id)}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#15803d',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Resume Case (Move to In Progress)
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Place Case on Hold</div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Whose End:</label>
                        <select
                          value={holdWhoseEnd}
                          onChange={(e) => setHoldWhoseEnd(e.target.value as 'CLIENT' | 'MOHAFIZ' | 'POLICE')}
                          style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)' }}
                        >
                          <option value="CLIENT">Client&apos;s end (Awaiting client info)</option>
                          <option value="MOHAFIZ">Mohafiz&apos;s end (Operations follow-up)</option>
                          <option value="POLICE">Police&apos;s end (FIR / Station inquiry)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Next Action Required (min 5 chars):</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Awaiting client to provide alternate phone number"
                          value={holdNextAction}
                          onChange={(e) => setHoldNextAction(e.target.value)}
                          style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)' }}
                        />
                        {holdError && <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>{holdError}</span>}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Follow-up Date:</label>
                        <input
                          type="date"
                          value={holdFollowUpDate}
                          onChange={(e) => setHoldFollowUpDate(e.target.value)}
                          style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-page)' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyHold}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.4rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#b91c1c',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Confirm Hold
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
