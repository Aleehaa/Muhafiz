import React, { useState, useMemo } from 'react';
import {
  Shield,
  UserCheck,
  CheckCircle,
  Clock,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  FileText,
  Navigation,
  MapPin,
  Camera,
} from 'lucide-react';
import { useDesk } from '../context/DeskContext';
import { City, DeskCase, FieldReport } from '../models/desk.model';

export const FieldPortalView: React.FC = () => {
  const {
    cases,
    officers,
    fieldRole,
    setFieldRole,
    selectedFsoId,
    setSelectedFsoId,
    confirmAssignment,
    sendBackToCro,
    fsoAcceptCase,
    fsoArriveCase,
    fsoSubmitReport,
  } = useDesk();

  // SFSO State
  const [sfsoCity, setSfsoCity] = useState<City>('Lahore');
  const [selectedOfficerForCase, setSelectedOfficerForCase] = useState<Record<string, string>>({});
  const [returnReason, setReturnReason] = useState<Record<string, string>>({});
  const [showReturnInput, setShowReturnInput] = useState<Record<string, boolean>>({});

  // FSO 3-Step Reporting State
  const [awayFromPin, setAwayFromPin] = useState(false);
  const [awayReason, setAwayReason] = useState('Customer asked to meet here');
  const [reportOutcome, setReportOutcome] = useState<FieldReport['outcome']>('Resolved, amount recovered');
  const [reportAmount, setReportAmount] = useState<number>(0);
  const [reportTypedNotes, setReportTypedNotes] = useState('');
  const [hasPhoto, setHasPhoto] = useState(true);

  // Voice Note Recorder Simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVoiceNote, setRecordedVoiceNote] = useState<{ durationSec: number } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Current active officer for FSO view
  const currentFso = useMemo(() => {
    return officers.find((o) => o.id === selectedFsoId) || officers[0];
  }, [officers, selectedFsoId]);

  // SFSO: Officers for current city
  const cityOfficers = useMemo(() => {
    return officers.filter(
      (o) => o.city === sfsoCity || (sfsoCity === 'Islamabad' && o.city === 'Rawalpindi') || (sfsoCity === 'Rawalpindi' && o.city === 'Islamabad')
    );
  }, [officers, sfsoCity]);

  // SFSO: Escalations waiting for confirmation in this city
  const cityEscalations = useMemo(() => {
    return cases.filter((c) => {
      const matchCity = c.city === sfsoCity || (sfsoCity === 'Islamabad' && c.city === 'Rawalpindi');
      return c.stage === 'ESCALATED' && matchCity;
    });
  }, [cases, sfsoCity]);

  // FSO: Cases assigned to the selected FSO
  const myCases = useMemo(() => {
    return cases.filter((c) => c.officer?.id === selectedFsoId && c.stage !== 'NEW' && c.stage !== 'ACKNOWLEDGED');
  }, [cases, selectedFsoId]);

  // SFSO: Handle Confirm assignment
  const handleConfirmAssignment = (caseId: string) => {
    const chosenOfficerId = selectedOfficerForCase[caseId] || cityOfficers[0]?.id;
    confirmAssignment(caseId, chosenOfficerId);
  };

  // SFSO: Handle Send back to CRO
  const handleSendBack = (caseId: string) => {
    const reason = returnReason[caseId];
    if (!reason || reason.trim().length < 5) {
      alert('Please provide a return reason of at least 5 characters.');
      return;
    }
    sendBackToCro(caseId, reason.trim());
    setShowReturnInput((prev) => ({ ...prev, [caseId]: false }));
  };

  // Voice Note Recording Timer Simulation
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 120) {
          clearInterval(interval);
          setIsRecording(false);
          setRecordedVoiceNote({ durationSec: 120 });
          return 120;
        }
        return prev + 1;
      });
    }, 1000);
    // store interval in window
    (window as unknown as { _vnInterval?: number })._vnInterval = interval as unknown as number;
  };

  const handleStopRecording = () => {
    const win = window as unknown as { _vnInterval?: number };
    if (win._vnInterval) clearInterval(win._vnInterval);
    setIsRecording(false);
    setRecordedVoiceNote({ durationSec: recordingSeconds > 0 ? recordingSeconds : 14 });
  };

  const handleDiscardRecording = () => {
    const win = window as unknown as { _vnInterval?: number };
    if (win._vnInterval) clearInterval(win._vnInterval);
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedVoiceNote(null);
  };

  // FSO: Submit Field Report
  const handleSubmitFsoReport = (caseItem: DeskCase) => {
    const hasVoice = !!recordedVoiceNote;
    if (!hasVoice && (!reportTypedNotes.trim() || reportTypedNotes.trim().length < 20)) {
      alert('Please provide at least 20 characters of typed notes, or record a voice note.');
      return;
    }

    const voiceNotesList = recordedVoiceNote
      ? [
          {
            id: `vn-${Date.now()}`,
            durationSec: recordedVoiceNote.durationSec,
            recordedAt: new Date().toISOString(),
          },
        ]
      : [];

    fsoSubmitReport(caseItem.id, {
      outcome: reportOutcome,
      amountRecovered: Number(reportAmount) || 0,
      typedNotes: reportTypedNotes.trim() || undefined,
      voiceNotes: voiceNotesList,
      photos: hasPhoto ? ['photo-proof-1.jpg'] : [],
      proofNotApplicable: !hasPhoto,
      draftText: `Findings
* ${currentFso.name} attended ${caseItem.location}, ${caseItem.city}.
* ${hasVoice ? '[CRO: write up the voice note here, then delete this line]' : reportTypedNotes}

Conclusion
* Outcome: ${reportOutcome}. Amount recovered: PKR ${Number(reportAmount) || 0}.

Recommendation
* ${reportOutcome.includes('Resolved') ? 'Case resolved on site, update published.' : 'Follow up with client.'}`,
    });

    // Reset local report state
    setRecordedVoiceNote(null);
    setReportTypedNotes('');
    setReportAmount(0);
    alert('Field report submitted to CRO successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner: Combined Access Role Selector */}
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
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Shield size={18} color="var(--color-brand-action)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Field Operations Portal
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            (Access-based for SFSO Supervisors & FSO Officers)
          </span>
        </div>

        {/* Role Toggle Switcher */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-bg-subtle)',
            padding: '0.2rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setFieldRole('SFSO')}
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: fieldRole === 'SFSO' ? 600 : 500,
              backgroundColor: fieldRole === 'SFSO' ? 'var(--color-bg-surface)' : 'transparent',
              color: fieldRole === 'SFSO' ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
              border: fieldRole === 'SFSO' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <UserCheck size={14} />
            SFSO Supervisor View
          </button>

          <button
            type="button"
            onClick={() => setFieldRole('FSO')}
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: fieldRole === 'FSO' ? 600 : 500,
              backgroundColor: fieldRole === 'FSO' ? 'var(--color-bg-surface)' : 'transparent',
              color: fieldRole === 'FSO' ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
              border: fieldRole === 'FSO' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Navigation size={14} />
            FSO Field Officer App
          </button>
        </div>
      </div>

      {/* VIEW 1: SFSO SUPERVISOR VIEW */}
      {fieldRole === 'SFSO' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* City Selection Strip */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Supervising City:</span>
              <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                {(['Karachi', 'Lahore', 'Rawalpindi'] as City[]).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSfsoCity(city)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: sfsoCity === city ? 600 : 500,
                      backgroundColor: sfsoCity === city ? 'var(--color-action-secondary-bg)' : 'transparent',
                      color: sfsoCity === city ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
                      border: sfsoCity === city ? '1px solid var(--color-brand-action)' : '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Active FSOs in {sfsoCity}: <strong>{cityOfficers.length} officers</strong>
            </div>
          </div>

          {/* Section: Escalations to Confirm */}
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
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                City Escalations Awaiting SFSO Assignment ({cityEscalations.length})
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                CRO has dispatched these cases. Select officer & click Confirm to start response timer.
              </div>
            </div>

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
                  <th style={{ padding: '0.65rem 0.85rem' }}>Issue & Location</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Amount</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Assign Field Officer (FSO)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cityEscalations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      Nothing to confirm. All escalated cases for {sfsoCity} have been assigned.
                    </td>
                  </tr>
                ) : (
                  cityEscalations.map((c) => {
                    const currentOfficerId = selectedOfficerForCase[c.id] || c.officer?.id || cityOfficers[0]?.id;
                    const isReturning = showReturnInput[c.id];

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-brand-action)' }}>
                          {c.caseId}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>{c.client}</td>
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>{c.issue}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.location}</div>
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>
                          PKR {c.amountAtStake.toLocaleString()}
                        </td>

                        {/* Officer Assignment Dropdown with Workload */}
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <select
                            value={currentOfficerId}
                            onChange={(e) => {
                              setSelectedOfficerForCase((prev) => ({ ...prev, [c.id]: e.target.value }));
                            }}
                            style={{
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border-subtle)',
                              backgroundColor: 'var(--color-bg-page)',
                              color: 'var(--color-text-primary)',
                              width: '100%',
                              maxWidth: '240px',
                            }}
                          >
                            {cityOfficers.map((off) => (
                              <option key={off.id} value={off.id}>
                                {off.name} ({off.activeCasesCount} active cases)
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Action buttons */}
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                          {isReturning ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <input
                                type="text"
                                placeholder="Reason (min 5 chars)..."
                                value={returnReason[c.id] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setReturnReason((prev) => ({ ...prev, [c.id]: val }));
                                }}
                                style={{
                                  padding: '0.25rem 0.4rem',
                                  fontSize: '0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--color-border-subtle)',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSendBack(c.id)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: '#b91c1c',
                                  color: '#ffffff',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Return
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowReturnInput((prev) => ({ ...prev, [c.id]: false }))}
                                style={{
                                  padding: '0.25rem 0.4rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.7rem',
                                  backgroundColor: 'transparent',
                                  border: '1px solid var(--color-border-subtle)',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => setShowReturnInput((prev) => ({ ...prev, [c.id]: true }))}
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
                                Return to CRO
                              </button>

                              <button
                                type="button"
                                onClick={() => handleConfirmAssignment(c.id)}
                                style={{
                                  padding: '0.3rem 0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: 'var(--color-brand-action)',
                                  color: '#ffffff',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Confirm & Assign FSO
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Section: City Team Workload Table */}
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
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                borderBottom: '1px solid var(--color-border-subtle)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              Field Team Officers in {sfsoCity}
            </div>

            <div style={{ padding: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {cityOfficers.map((off) => (
                <div
                  key={off.id}
                  style={{
                    padding: '0.65rem',
                    backgroundColor: 'var(--color-bg-page)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {off.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      Role: {off.role} &bull; {off.city}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: off.activeCasesCount === 0 ? '#f0fdf4' : '#fffbeb',
                      color: off.activeCasesCount === 0 ? '#15803d' : '#b45309',
                      border: `1px solid ${off.activeCasesCount === 0 ? '#bbf7d0' : '#fde68a'}`,
                    }}
                  >
                    {off.activeCasesCount} active cases
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FSO FIELD OFFICER 3-STEP APP */}
      {fieldRole === 'FSO' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          {/* Officer Selector Strip */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Logged in as Officer:</span>
              <select
                value={selectedFsoId}
                onChange={(e) => setSelectedFsoId(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-page)',
                  color: 'var(--color-brand-action)',
                }}
              >
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} ({off.city})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Assigned Cases: <strong>{myCases.length}</strong>
            </div>
          </div>

          {/* Assigned Cases List */}
          {myCases.length === 0 ? (
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
              No active cases assigned to {currentFso.name}.
            </div>
          ) : (
            myCases.map((c) => {
              // Determine active step
              const isAccepted = !!c.acceptedAt;
              const isArrived = !!c.arrivedAt;
              const isReported = c.fsoPhase === 'reported' || c.report?.reviewState === 'review';

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
                    gap: '0.75rem',
                    padding: '1rem',
                  }}
                >
                  {/* Case Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-brand-action)', fontFamily: 'monospace' }}>
                          {c.caseId}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {c.client} &bull; {c.issue}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                        {c.city} &bull; {c.location} {c.address ? `(${c.address})` : ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        PKR {c.amountAtStake.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Amount at Stake</div>
                    </div>
                  </div>

                  {/* 3-Step Guided Execution Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* STEP 1: ACCEPT CASE */}
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: isAccepted ? 'var(--color-bg-subtle)' : 'var(--color-bg-page)',
                        border: isAccepted ? '1px solid var(--color-border-subtle)' : '1px solid var(--color-brand-action)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {isAccepted ? <CheckCircle size={16} color="#15803d" /> : <Clock size={16} color="var(--color-brand-action)" />}
                          Step 1: Accept Case & Start Location Tracking
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                          {isAccepted ? `Accepted at ${new Date(c.acceptedAt!).toLocaleTimeString()}` : 'Stops initial response timer & starts location log'}
                        </div>
                      </div>

                      {!isAccepted && (
                        <button
                          type="button"
                          onClick={() => fsoAcceptCase(c.id)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-brand-action)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Accept Case
                        </button>
                      )}
                    </div>

                    {/* STEP 2: ARRIVE ON SITE */}
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: isArrived ? 'var(--color-bg-subtle)' : isAccepted ? 'var(--color-bg-page)' : 'var(--color-bg-subtle)',
                        border: isArrived ? '1px solid var(--color-border-subtle)' : isAccepted ? '1px solid var(--color-brand-action)' : '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        opacity: isAccepted ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {isArrived ? <CheckCircle size={16} color="#15803d" /> : <MapPin size={16} color="var(--color-brand-action)" />}
                            Step 2: Confirm Arrival on Site
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                            {isArrived ? `Arrived at ${new Date(c.arrivedAt!).toLocaleTimeString()}` : 'Verifies GPS coordinates against incident pin'}
                          </div>
                        </div>

                        {isAccepted && !isArrived && (
                          <button
                            type="button"
                            onClick={() => fsoArriveCase(c.id, awayFromPin ? awayReason : undefined)}
                            style={{
                              padding: '0.4rem 0.85rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-brand-action)',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Confirm Arrival
                          </button>
                        )}
                      </div>

                      {/* Away from pin toggle */}
                      {isAccepted && !isArrived && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          <input
                            type="checkbox"
                            id={`away-${c.id}`}
                            checked={awayFromPin}
                            onChange={(e) => setAwayFromPin(e.target.checked)}
                          />
                          <label htmlFor={`away-${c.id}`} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                            Arrived away from pin?
                          </label>
                          {awayFromPin && (
                            <select
                              value={awayReason}
                              onChange={(e) => setAwayReason(e.target.value)}
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <option value="Customer asked to meet here">Customer asked to meet here</option>
                              <option value="The pin looks wrong">The pin looks wrong</option>
                              <option value="Other site location">Other</option>
                            </select>
                          )}
                        </div>
                      )}
                    </div>

                    {/* STEP 3: SUBMIT REPORT */}
                    <div
                      style={{
                        padding: '0.85rem',
                        backgroundColor: isReported ? 'var(--color-bg-subtle)' : isArrived ? 'var(--color-bg-page)' : 'var(--color-bg-subtle)',
                        border: isReported ? '1px solid var(--color-border-subtle)' : isArrived ? '1px solid var(--color-brand-action)' : '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        opacity: isArrived ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {isReported ? <CheckCircle size={16} color="#15803d" /> : <FileText size={16} color="var(--color-brand-action)" />}
                          Step 3: Field Report (Outcome, Voice Note, Photos)
                        </div>

                        {isReported && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#15803d' }}>
                            Report Submitted to CRO
                          </span>
                        )}
                      </div>

                      {/* If arrived but report not yet submitted, show form */}
                      {isArrived && !isReported && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                          {/* Outcome Selector */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                              How did it end? <span style={{ color: 'var(--color-brand-action)' }}>*</span>
                            </label>
                            <select
                              value={reportOutcome}
                              onChange={(e) => setReportOutcome(e.target.value as FieldReport['outcome'])}
                              style={{
                                width: '100%',
                                padding: '0.4rem 0.5rem',
                                fontSize: '0.8125rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border-subtle)',
                                backgroundColor: 'var(--color-bg-surface)',
                                color: 'var(--color-text-primary)',
                              }}
                            >
                              <option value="Resolved, amount recovered">Resolved, amount recovered</option>
                              <option value="Resolved, no payment collected">Resolved, no payment collected</option>
                              <option value="Needs more information">Needs more information</option>
                              <option value="Police report filed">Police report filed</option>
                            </select>
                          </div>

                          {/* Amount Recovered if applicable */}
                          {reportOutcome === 'Resolved, amount recovered' && (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                                Amount Recovered (PKR)
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={reportAmount === 0 ? '' : reportAmount}
                                onChange={(e) => setReportAmount(Number(e.target.value))}
                                style={{
                                  width: '100%',
                                  padding: '0.4rem 0.5rem',
                                  fontSize: '0.8125rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--color-border-subtle)',
                                  backgroundColor: 'var(--color-bg-surface)',
                                }}
                              />
                            </div>
                          )}

                          {/* Voice Note Recorder (Main accessibility feature for FSO) */}
                          <div
                            style={{
                              padding: '0.75rem',
                              backgroundColor: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                Voice Note Recording (Speak your report)
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                Max 2:00 mins
                              </span>
                            </div>

                            {/* Recording Controls */}
                            {isRecording ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.5rem',
                                  backgroundColor: '#fef2f2',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid #fecaca',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }} />
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#b91c1c' }}>
                                    Recording: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <button
                                    type="button"
                                    onClick={handleStopRecording}
                                    style={{
                                      padding: '0.3rem 0.65rem',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: '#15803d',
                                      color: '#ffffff',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                    }}
                                  >
                                    <Square size={12} />
                                    Stop & Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleDiscardRecording}
                                    style={{
                                      padding: '0.3rem 0.5rem',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: 'transparent',
                                      color: '#b91c1c',
                                      fontSize: '0.7rem',
                                      border: '1px solid #fecaca',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Discard
                                  </button>
                                </div>
                              </div>
                            ) : recordedVoiceNote ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: '#f0fdf4',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid #bbf7d0',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '50%',
                                      backgroundColor: '#15803d',
                                      color: '#ffffff',
                                      border: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {isPlayingAudio ? <Pause size={12} /> : <Play size={12} />}
                                  </button>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>
                                    Voice note saved ({recordedVoiceNote.durationSec}s)
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setRecordedVoiceNote(null)}
                                  title="Delete note"
                                  style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: '0.2rem' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleStartRecording}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.4rem',
                                  padding: '0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--color-brand-action)',
                                  color: '#ffffff',
                                  fontSize: '0.8125rem',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <Mic size={16} />
                                Record a Voice Note
                              </button>
                            )}
                          </div>

                          {/* Typed Notes (Optional if voice note recorded, otherwise min 20 chars) */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                              Typed Notes {recordedVoiceNote ? '(Optional with voice note)' : '(Required min 20 chars if no voice note)'}
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Write notes if voice note is not recorded..."
                              value={reportTypedNotes}
                              onChange={(e) => setReportTypedNotes(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.4rem 0.5rem',
                                fontSize: '0.8125rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border-subtle)',
                                backgroundColor: 'var(--color-bg-surface)',
                                fontFamily: 'inherit',
                              }}
                            />
                          </div>

                          {/* Photos Evidence Toggle */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                            <input
                              type="checkbox"
                              id={`photo-${c.id}`}
                              checked={hasPhoto}
                              onChange={(e) => setHasPhoto(e.target.checked)}
                            />
                            <label htmlFor={`photo-${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                              <Camera size={14} />
                              Attach site photo proof (photo-evidence-1.jpg)
                            </label>
                          </div>

                          {/* Submit Report Button */}
                          <button
                            type="button"
                            onClick={() => handleSubmitFsoReport(c)}
                            style={{
                              marginTop: '0.25rem',
                              padding: '0.5rem 1rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-brand-action)',
                              color: '#ffffff',
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Submit Field Report to CRO
                          </button>
                        </div>
                      )}

                      {/* If already reported */}
                      {isReported && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                          <div><strong>Outcome:</strong> {c.report?.outcome}</div>
                          <div><strong>Recovered:</strong> PKR {(c.report?.amountRecovered ?? 0).toLocaleString()}</div>
                          {c.report?.voiceNotes && c.report.voiceNotes.length > 0 && (
                            <div style={{ color: '#15803d', marginTop: '0.2rem' }}>✓ Voice note attached ({c.report.voiceNotes[0].durationSec}s)</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
