import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  DeskCase,
  ClientCompany,
  Officer,
  FieldReport,
  CaseHoldInfo,
  IssueType,
  City,
  ChannelSource,
} from '../models/desk.model';

export type PortalMode = 'CLIENT' | 'CRO' | 'FIELD';

interface DeskContextType {
  // Current view state
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  selectedClient: ClientCompany;
  setSelectedClient: (client: ClientCompany) => void;
  fieldRole: 'SFSO' | 'FSO';
  setFieldRole: (role: 'SFSO' | 'FSO') => void;
  selectedFsoId: string;
  setSelectedFsoId: (id: string) => void;

  // Data
  cases: DeskCase[];
  officers: Officer[];

  // Actions
  raiseCase: (input: {
    client: ClientCompany;
    issue: IssueType;
    incidentDate: string;
    city: City;
    area: string;
    address?: string;
    trackingNumber?: string;
    amountAtStake?: number;
    description: string;
  }) => DeskCase;

  acknowledgeAndEscalate: (caseId: string, officerId?: string) => void;
  acknowledgeOnly: (caseId: string) => void;
  confirmAssignment: (caseId: string, newOfficerId?: string) => void;
  sendBackToCro: (caseId: string, reason: string) => void;

  fsoAcceptCase: (caseId: string) => void;
  fsoArriveCase: (caseId: string, reasonIfAway?: string) => void;
  fsoSubmitReport: (caseId: string, report: Partial<FieldReport>) => void;

  croPublishReport: (caseId: string, finalPublishedText: string) => void;
  croReturnReport: (caseId: string, reason: string) => void;

  croPutOnHold: (caseId: string, hold: CaseHoldInfo) => void;
  croResumeCase: (caseId: string) => void;
  clientReplyHold: (caseId: string, replyText: string) => void;

  croLogCase: (input: {
    client: ClientCompany;
    channel: ChannelSource;
    issue: IssueType;
    incidentDate: string;
    city: City;
    area: string;
    address?: string;
    trackingNumber?: string;
    amountAtStake?: number;
    description: string;
  }) => DeskCase;

  addInternalNote: (caseId: string, text: string, author: string) => void;
}

const DeskContext = createContext<DeskContextType | undefined>(undefined);

// Initial officers list with active case counts
const INITIAL_OFFICERS: Officer[] = [
  // Karachi officers
  { id: 'fso-ghukan', name: 'FSO Ghukan A.', role: 'FSO', city: 'Karachi', activeCasesCount: 0 },
  { id: 'fso-muhammad', name: 'FSO Muhammad I.', role: 'FSO', city: 'Karachi', activeCasesCount: 1 },
  { id: 'fso-bilal', name: 'FSO Bilal K.', role: 'FSO', city: 'Karachi', activeCasesCount: 2 },
  // Lahore officers
  { id: 'fso-saif', name: 'FSO Saif M.', role: 'FSO', city: 'Lahore', activeCasesCount: 0 },
  { id: 'fso-nasir', name: 'FSO Nasir K.', role: 'FSO', city: 'Lahore', activeCasesCount: 1 },
  { id: 'fso-usman', name: 'FSO Usman A.', role: 'FSO', city: 'Lahore', activeCasesCount: 2 },
  // Rawalpindi / Islamabad officers (shared)
  { id: 'fso-waqar', name: 'FSO Waqar A.', role: 'FSO', city: 'Rawalpindi', activeCasesCount: 1 },
  { id: 'fso-rizwan', name: 'FSO Rizwan H.', role: 'FSO', city: 'Islamabad', activeCasesCount: 0 },
  { id: 'fso-tariq', name: 'FSO Tariq J.', role: 'FSO', city: 'Rawalpindi', activeCasesCount: 2 },
];

// Helper to generate a new case reference
let caseSequence = 10;
function generatePublicCaseId(client: ClientCompany, city: City): string {
  caseSequence += 1;
  const prefix = client === 'PostEx' ? 'POS' : client === 'Daraz' ? 'DAR' : 'BUS';
  const cityCode = city.slice(0, 3).toUpperCase();
  return `${prefix}-${cityCode}-OCT-26-${caseSequence}`;
}

// Initial realistic dataset
const INITIAL_CASES: DeskCase[] = [
  {
    id: 'c-101',
    caseId: null, // "ID on acknowledgement"
    client: 'Daraz',
    issue: 'Customer Issue',
    city: 'Karachi',
    location: 'Nazimabad',
    address: 'Near 7-D Chowrangi, Block 3, Nazimabad',
    amountAtStake: 2500,
    description: 'Customer claims the parcel was not what was ordered and refuses to pay COD without inspection.',
    source: 'Client portal',
    stage: 'NEW',
    officer: null,
    fsoPhase: 'assigned',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    events: [
      {
        id: 'ev-1',
        time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        text: 'Case received from client portal',
        actor: 'Client user (Daraz)',
        visibility: 'client',
      },
    ],
    notes: [],
    fieldLogs: [],
  },
  {
    id: 'c-102',
    caseId: null,
    client: 'PostEx',
    issue: 'Snatching',
    city: 'Karachi',
    location: 'Nazimabad',
    address: 'Near Inquiry Office, Nazimabad No. 2',
    amountAtStake: 37800,
    description: 'Rider reports a delivery parcel bag snatched on a bike near the local market.',
    source: 'Logged by CRO (WhatsApp group)',
    stage: 'NEW',
    officer: null,
    fsoPhase: 'assigned',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    events: [
      {
        id: 'ev-2',
        time: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        text: 'Case logged from WhatsApp escalation',
        actor: 'CRO Ahmad',
        visibility: 'client',
      },
    ],
    notes: [
      {
        id: 'nt-1',
        time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        text: 'Rider unharmed. Need immediate officer dispatch to secure street camera footage.',
        author: 'CRO Ahmad',
      },
    ],
    fieldLogs: [],
  },
  {
    id: 'c-103',
    caseId: null,
    client: 'PostEx',
    issue: 'Customer Issue',
    city: 'Lahore',
    location: 'DHA',
    address: 'DHA Phase 4, Sector CC, Commercial',
    amountAtStake: 2750,
    description: 'Customer refused delivery at the door and held parcel without signature.',
    source: 'Client portal',
    stage: 'NEW',
    officer: null,
    fsoPhase: 'assigned',
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    events: [
      {
        id: 'ev-3',
        time: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        text: 'Case received from client portal',
        actor: 'Client user (PostEx)',
        visibility: 'client',
      },
    ],
    notes: [],
    fieldLogs: [],
  },
  {
    id: 'c-104',
    caseId: 'POS-RAW-SEP-26-3',
    client: 'PostEx',
    issue: 'Theft',
    city: 'Rawalpindi',
    location: 'F-10 Markaz',
    address: 'F-10 Markaz commercial hub feeder drop',
    amountAtStake: 27950,
    description: 'Theft of a consignment package from delivery van, FIR requested by client.',
    source: 'Client portal',
    stage: 'ESCALATED',
    officer: INITIAL_OFFICERS.find((o) => o.id === 'fso-waqar') || null,
    fsoPhase: 'assigned',
    createdAt: '2026-10-14T09:02:00Z',
    acknowledgedAt: '2026-10-14T09:10:00Z',
    escalatedAt: '2026-10-14T09:12:00Z',
    events: [
      { id: 'ev-4', time: '2026-10-14T09:02:00Z', text: 'Case received', actor: 'Client user (PostEx)', visibility: 'client' },
      { id: 'ev-5', time: '2026-10-14T09:10:00Z', text: 'Case acknowledged. Reference issued.', actor: 'CRO Fatima', visibility: 'client' },
      { id: 'ev-6', time: '2026-10-14T09:12:00Z', text: 'Escalated to SFSO for confirmation', actor: 'CRO Fatima', visibility: 'staff' },
    ],
    notes: [],
    fieldLogs: [],
  },
  {
    id: 'c-105',
    caseId: 'POS-LAH-SEP-26-1',
    client: 'PostEx',
    issue: 'Customer Issue',
    city: 'Lahore',
    location: 'DHA',
    address: 'Sector Y, Commercial Phase 3, DHA Lahore',
    amountAtStake: 3999,
    description: 'Consignee disputed product contents and claimed rider forged signature.',
    source: 'Client portal',
    stage: 'IN_PROGRESS',
    officer: INITIAL_OFFICERS.find((o) => o.id === 'fso-nasir') || null,
    fsoPhase: 'reported',
    createdAt: '2026-10-14T08:15:00Z',
    acknowledgedAt: '2026-10-14T08:20:00Z',
    escalatedAt: '2026-10-14T08:22:00Z',
    confirmedAt: '2026-10-14T08:25:00Z',
    acceptedAt: '2026-10-14T08:27:05Z',
    arrivedAt: '2026-10-14T08:27:10Z',
    initialResponse: '2 min 5 s',
    onGroundResponse: '2 min 10 s',
    distanceKm: 10.9,
    liveTrackingRecord: 'Stored on case',
    report: {
      outcome: 'Needs more information',
      amountRecovered: 0,
      photos: [],
      voiceNotes: [
        {
          id: 'vn-1',
          durationSec: 18,
          recordedAt: '2026-10-14T09:43:04Z',
        },
      ],
      proofNotApplicable: false,
      draftText: `Findings
* FSO Nasir attended DHA, Lahore.
* [CRO: write up the voice note here, then delete this line]

Conclusion
* The case needs more information before it can close.

Recommendation
* Ask the client for the missing details, then resume.`,
      reviewState: 'review',
      sentAt: '2026-10-14T09:43:06Z',
    },
    events: [
      { id: 'ev-10', time: '2026-10-14T08:15:00Z', text: 'Case received', actor: 'Client (PostEx)', visibility: 'client' },
      { id: 'ev-11', time: '2026-10-14T08:20:00Z', text: 'Case acknowledged', actor: 'CRO Ahmad', visibility: 'client' },
      { id: 'ev-12', time: '2026-10-14T08:25:00Z', text: 'SFSO confirmed FSO Nasir', actor: 'SFSO Zahid', visibility: 'client' },
      { id: 'ev-13', time: '2026-10-14T08:27:05Z', text: 'FSO accepted case', actor: 'FSO Nasir', visibility: 'staff' },
      { id: 'ev-14', time: '2026-10-14T08:27:10Z', text: 'FSO arrived at location', actor: 'FSO Nasir', visibility: 'staff' },
      { id: 'ev-15', time: '2026-10-14T09:43:06Z', text: 'Field report submitted with voice note', actor: 'FSO Nasir', visibility: 'staff' },
    ],
    notes: [],
    fieldLogs: [
      { id: 'fl-1', time: '09:43:03', event: 'Case accepted', position: '31.48440, 74.39650', accuracy: '7 m', network: '4G' },
      { id: 'fl-2', time: '09:43:03', event: 'Tracking started', position: '31.48444, 74.39653', accuracy: '7 m', network: '4G' },
      { id: 'fl-3', time: '09:43:03', event: 'Arrival check passed', position: '31.48452, 74.39659', accuracy: '7 m', network: '4G' },
      { id: 'fl-4', time: '09:43:04', event: 'Voice note recorded', position: '31.48456, 74.39662', accuracy: '7 m', network: '4G' },
      { id: 'fl-5', time: '09:43:06', event: 'Update submitted', position: '31.48460, 74.39665', accuracy: '7 m', network: '4G' },
    ],
  },
  {
    id: 'c-106',
    caseId: 'POS-KAR-SEP-26-71',
    client: 'PostEx',
    issue: 'Customer Issue',
    city: 'Karachi',
    location: 'Federal B Area',
    address: 'Block 14, Federal B Area, Main Water Pump Market',
    amountAtStake: 7180,
    description: 'Consignee phone switched off at delivery time. Multiple delivery attempts failed.',
    source: 'Client portal',
    stage: 'HOLD',
    officer: INITIAL_OFFICERS.find((o) => o.id === 'fso-bilal') || null,
    fsoPhase: 'arrived',
    createdAt: '2026-10-12T10:00:00Z',
    hold: {
      whoseEnd: 'CLIENT',
      nextAction: 'Client to provide alternate recipient contact number or alternate address',
      followUpDate: '2026-10-14',
      startedAt: '2026-10-12T14:30:00Z',
    },
    initialResponse: 'Missing',
    onGroundResponse: 'Missing',
    distanceKm: undefined,
    liveTrackingRecord: 'Missing',
    events: [
      { id: 'ev-20', time: '2026-10-12T10:00:00Z', text: 'Case received', actor: 'Client (PostEx)', visibility: 'client' },
      { id: 'ev-21', time: '2026-10-12T10:15:00Z', text: 'Case acknowledged', actor: 'CRO Ahmad', visibility: 'client' },
      { id: 'ev-22', time: '2026-10-12T14:30:00Z', text: 'Case placed on hold. Awaiting client information.', actor: 'CRO Ahmad', visibility: 'client' },
    ],
    notes: [],
    fieldLogs: [],
  },
  {
    id: 'c-107',
    caseId: 'DAR-KAR-SEP-26-2',
    client: 'Daraz',
    issue: 'Customer Issue',
    city: 'Karachi',
    location: 'Azam Town',
    address: 'Street 4, Sector 1, Azam Town',
    amountAtStake: 2800,
    description: 'Customer refused COD delivery due to delayed transit.',
    source: 'Client portal',
    stage: 'CLOSURE',
    officer: INITIAL_OFFICERS.find((o) => o.id === 'fso-ghukan') || null,
    fsoPhase: 'reported',
    createdAt: '2026-10-11T06:41:00Z',
    acknowledgedAt: '2026-10-11T06:50:00Z',
    confirmedAt: '2026-10-11T07:00:00Z',
    acceptedAt: '2026-10-11T07:05:00Z',
    arrivedAt: '2026-10-11T07:30:00Z',
    closedAt: '2026-10-11T09:11:00Z',
    initialResponse: '5 min 0 s',
    onGroundResponse: '30 min 0 s',
    distanceKm: 6.8,
    liveTrackingRecord: 'Stored on case',
    report: {
      outcome: 'Resolved, no payment collected',
      amountRecovered: 0,
      photos: [],
      voiceNotes: [],
      draftText: '',
      publishedText: `Findings
* The parcel was returned to the seller in original sealed condition.

Conclusion
* The case is resolved and no payment was collected.

Recommendation
* No further action needed.`,
      reviewState: 'published',
    },
    events: [
      { id: 'ev-30', time: '2026-10-11T06:41:00Z', text: 'Case received', actor: 'Client (Daraz)', visibility: 'client' },
      { id: 'ev-31', time: '2026-10-11T09:11:00Z', text: 'Update published and case closed', actor: 'CRO Ahmad', visibility: 'client' },
    ],
    notes: [],
    fieldLogs: [],
  },
];

export const DeskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portalMode, setPortalMode] = useState<PortalMode>('CRO');
  const [selectedClient, setSelectedClient] = useState<ClientCompany>('PostEx');
  const [fieldRole, setFieldRole] = useState<'SFSO' | 'FSO'>('SFSO');
  const [selectedFsoId, setSelectedFsoId] = useState<string>('fso-nasir');

  const [cases, setCases] = useState<DeskCase[]>(INITIAL_CASES);
  const [officers] = useState<Officer[]>(INITIAL_OFFICERS);

  // 1. Client raises a case
  const raiseCase = (input: {
    client: ClientCompany;
    issue: IssueType;
    incidentDate: string;
    city: City;
    area: string;
    address?: string;
    trackingNumber?: string;
    amountAtStake?: number;
    description: string;
  }): DeskCase => {
    const newCase: DeskCase = {
      id: `c-${Date.now()}`,
      caseId: null, // "ID on acknowledgement"
      client: input.client,
      issue: input.issue,
      incidentDate: input.incidentDate,
      city: input.city,
      location: input.area,
      address: input.address,
      trackingNumber: input.trackingNumber,
      amountAtStake: input.amountAtStake || 0,
      description: input.description,
      source: 'Client portal',
      stage: 'NEW',
      officer: null,
      fsoPhase: 'assigned',
      createdAt: new Date().toISOString(),
      events: [
        {
          id: `ev-${Date.now()}`,
          time: new Date().toISOString(),
          text: 'Case received from client portal',
          actor: `Client user (${input.client})`,
          visibility: 'client',
        },
      ],
      notes: [],
      fieldLogs: [],
    } as DeskCase;

    setCases((prev) => [newCase, ...prev]);
    return newCase;
  };

  // 2. CRO: Acknowledge & send to SFSO in one step
  const acknowledgeAndEscalate = (caseId: string, officerId?: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const cityOfficers = officers.filter(
          (o) => o.city === c.city || (c.city === 'Islamabad' && o.city === 'Rawalpindi')
        );
        const officer = officerId
          ? officers.find((o) => o.id === officerId) || null
          : cityOfficers.length > 0
          ? [...cityOfficers].sort((a, b) => a.activeCasesCount - b.activeCasesCount)[0]
          : null;
        const publicId = c.caseId || generatePublicCaseId(c.client, c.city);
        const now = new Date().toISOString();

        return {
          ...c,
          caseId: publicId,
          officer,
          stage: 'ESCALATED',
          acknowledgedAt: now,
          escalatedAt: now,
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}-1`,
              time: now,
              text: `Case acknowledged. ID ${publicId} issued.`,
              actor: 'CRO',
              visibility: 'client',
            },
            {
              id: `ev-${Date.now()}-2`,
              time: now,
              text: `Officer selected: ${officer?.name || 'Unassigned'}`,
              actor: 'CRO',
              visibility: 'staff',
            },
            {
              id: `ev-${Date.now()}-3`,
              time: now,
              text: 'Escalated to SFSO for city assignment confirmation',
              actor: 'CRO',
              visibility: 'staff',
            },
          ],
        };
      })
    );
  };

  // 3. CRO: Acknowledge only
  const acknowledgeOnly = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const publicId = c.caseId || generatePublicCaseId(c.client, c.city);
        const now = new Date().toISOString();

        return {
          ...c,
          caseId: publicId,
          stage: 'ACKNOWLEDGED',
          acknowledgedAt: now,
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: `Case acknowledged. ID ${publicId} issued.`,
              actor: 'CRO',
              visibility: 'client',
            },
          ],
        };
      })
    );
  };

  // 4. SFSO: Confirm assignment & start work
  const confirmAssignment = (caseId: string, newOfficerId?: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const chosenOfficer = newOfficerId
          ? officers.find((o) => o.id === newOfficerId) || c.officer
          : c.officer;
        const officerChanged = newOfficerId && c.officer && newOfficerId !== c.officer.id;
        const now = new Date().toISOString();

        const newEvents = [...c.events];
        if (officerChanged) {
          newEvents.push({
            id: `ev-${Date.now()}-c`,
            time: now,
            text: `SFSO changed officer from ${c.officer?.name} to ${chosenOfficer?.name}`,
            actor: 'SFSO',
            visibility: 'staff',
          });
        }
        newEvents.push({
          id: `ev-${Date.now()}-conf`,
          time: now,
          text: `Field officer assigned (${chosenOfficer?.name})`,
          actor: 'SFSO',
          visibility: 'client',
        });

        return {
          ...c,
          officer: chosenOfficer,
          stage: 'IN_PROGRESS',
          confirmedAt: now,
          fsoPhase: 'assigned',
          events: newEvents,
        };
      })
    );
  };

  // 5. SFSO: Send back to CRO
  const sendBackToCro = (caseId: string, reason: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          stage: 'ACKNOWLEDGED',
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: `SFSO returned case to CRO: "${reason}"`,
              actor: 'SFSO',
              visibility: 'staff',
            },
          ],
        };
      })
    );
  };

  // 6. FSO: Accept case
  const fsoAcceptCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          acceptedAt: now,
          initialResponse: '1 min 30 s',
          fsoPhase: 'accepted',
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: `FSO ${c.officer?.name || 'Officer'} accepted case`,
              actor: 'FSO',
              visibility: 'staff',
            },
          ],
          fieldLogs: [
            ...c.fieldLogs,
            {
              id: `fl-${Date.now()}`,
              time: new Date().toLocaleTimeString('en-GB'),
              event: 'Case accepted',
              position: '31.48440, 74.39650',
              accuracy: '8 m',
              network: '4G',
            },
          ],
        };
      })
    );
  };

  // 7. FSO: Arrive at location
  const fsoArriveCase = (caseId: string, reasonIfAway?: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          arrivedAt: now,
          onGroundResponse: '22 min 10 s',
          fsoPhase: 'arrived',
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: `FSO arrived at location${reasonIfAway ? ` (${reasonIfAway})` : ''}`,
              actor: 'FSO',
              visibility: 'staff',
            },
          ],
          fieldLogs: [
            ...c.fieldLogs,
            {
              id: `fl-${Date.now()}`,
              time: new Date().toLocaleTimeString('en-GB'),
              event: 'Arrival verified',
              position: '31.48452, 74.39659',
              accuracy: '7 m',
              network: '4G',
            },
          ],
        };
      })
    );
  };

  // 8. FSO: Submit field report
  const fsoSubmitReport = (caseId: string, reportData: Partial<FieldReport>) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        const initialDraft = `Findings
* FSO ${c.officer?.name || 'Officer'} attended ${c.location}, ${c.city}.
* ${reportData.typedNotes || 'Field inspection conducted.'}

Conclusion
* Incident handled under standard operating procedure.

Recommendation
* Case ready for closure review.`;

        const newReport: FieldReport = {
          outcome: reportData.outcome || 'Needs more information',
          typedNotes: reportData.typedNotes,
          amountRecovered: reportData.amountRecovered || 0,
          voiceNotes: reportData.voiceNotes || [],
          photos: reportData.photos || [],
          proofNotApplicable: reportData.proofNotApplicable || false,
          draftText: initialDraft,
          reviewState: 'review',
          sentAt: now,
        };

        return {
          ...c,
          fsoPhase: 'reported',
          distanceKm: 8.4,
          liveTrackingRecord: 'Stored on case',
          report: newReport,
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: 'Field report submitted for CRO review',
              actor: 'FSO',
              visibility: 'staff',
            },
          ],
        };
      })
    );
  };

  // 9. CRO: Publish field report (Closure)
  const croPublishReport = (caseId: string, finalPublishedText: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          stage: 'CLOSURE',
          closedAt: now,
          report: c.report
            ? {
                ...c.report,
                publishedText: finalPublishedText,
                reviewState: 'published',
              }
            : undefined,
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: 'Update published and case closed',
              actor: 'CRO',
              visibility: 'client',
            },
          ],
        };
      })
    );
  };

  // 10. CRO: Return report to field officer
  const croReturnReport = (caseId: string, reason: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          fsoPhase: 'arrived',
          report: c.report
            ? {
                ...c.report,
                reviewState: 'returned',
                returnedReason: reason,
              }
            : undefined,
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: new Date().toISOString(),
              text: `Report returned to officer: "${reason}"`,
              actor: 'CRO',
              visibility: 'staff',
            },
          ],
        };
      })
    );
  };

  // 11. CRO: Put on hold
  const croPutOnHold = (caseId: string, holdData: CaseHoldInfo) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          stage: 'HOLD',
          hold: holdData,
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: `Case placed on hold (${holdData.whoseEnd === 'CLIENT' ? "Client's end" : 'Mohafiz end'})`,
              actor: 'CRO',
              visibility: 'client',
            },
          ],
        };
      })
    );
  };

  // 12. CRO: Resume from hold
  const croResumeCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          stage: 'IN_PROGRESS',
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: 'Work resumed on case',
              actor: 'CRO',
              visibility: 'client',
            },
          ],
        };
      })
    );
  };

  // 13. Client: Reply on hold
  const clientReplyHold = (caseId: string, replyText: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          hold: c.hold ? { ...c.hold, clientReply: replyText } : undefined,
          events: [
            ...c.events,
            {
              id: `ev-${Date.now()}`,
              time: now,
              text: `Client reply received: "${replyText}"`,
              actor: `Client (${c.client})`,
              visibility: 'client',
            },
          ],
        };
      })
    );
  };

  // 14. CRO: Log case on behalf of client
  const croLogCase = (input: {
    client: ClientCompany;
    channel: ChannelSource;
    issue: IssueType;
    incidentDate: string;
    city: City;
    area: string;
    address?: string;
    trackingNumber?: string;
    amountAtStake?: number;
    description: string;
  }): DeskCase => {
    const newCase: DeskCase = {
      id: `c-${Date.now()}`,
      caseId: null,
      client: input.client,
      issue: input.issue,
      incidentDate: input.incidentDate,
      city: input.city,
      location: input.area,
      address: input.address,
      trackingNumber: input.trackingNumber,
      amountAtStake: input.amountAtStake || 0,
      description: input.description,
      source: `Logged by CRO (${input.channel})`,
      stage: 'NEW',
      officer: null,
      fsoPhase: 'assigned',
      createdAt: new Date().toISOString(),
      events: [
        {
          id: `ev-${Date.now()}`,
          time: new Date().toISOString(),
          text: `Case logged by CRO via ${input.channel}`,
          actor: 'CRO',
          visibility: 'client',
        },
      ],
      notes: [],
      fieldLogs: [],
    } as DeskCase;

    setCases((prev) => [newCase, ...prev]);
    return newCase;
  };

  // 15. Add internal note
  const addInternalNote = (caseId: string, text: string, author: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          notes: [
            ...c.notes,
            {
              id: `nt-${Date.now()}`,
              time: new Date().toISOString(),
              text,
              author,
            },
          ],
        };
      })
    );
  };

  const contextValue = useMemo(
    () => ({
      portalMode,
      setPortalMode,
      selectedClient,
      setSelectedClient,
      fieldRole,
      setFieldRole,
      selectedFsoId,
      setSelectedFsoId,
      cases,
      officers,
      raiseCase,
      acknowledgeAndEscalate,
      acknowledgeOnly,
      confirmAssignment,
      sendBackToCro,
      fsoAcceptCase,
      fsoArriveCase,
      fsoSubmitReport,
      croPublishReport,
      croReturnReport,
      croPutOnHold,
      croResumeCase,
      clientReplyHold,
      croLogCase,
      addInternalNote,
    }),
    [portalMode, selectedClient, fieldRole, selectedFsoId, cases, officers]
  );

  return <DeskContext.Provider value={contextValue}>{children}</DeskContext.Provider>;
};

export const useDesk = (): DeskContextType => {
  const context = useContext(DeskContext);
  if (!context) {
    throw new Error('useDesk must be used within a DeskProvider');
  }
  return context;
};
