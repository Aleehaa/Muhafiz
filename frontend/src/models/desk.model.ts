/**
 * Mohafiz Case Desk — Core Domain & PRD Stage Definitions
 * Aligned with Product Requirements Document (Oct 14, 2026)
 */

export type CaseStage =
  | 'NEW'                      // Stage 0: New (Owner: CRO)
  | 'ACKNOWLEDGED'           // Stage 1: Acknowledged & assigned (Owner: CRO)
  | 'ESCALATED'                // Stage 2: Escalated to SFSO (Owner: SFSO)
  | 'IN_PROGRESS'              // Stage 3: In progress (Owner: FSO)
  | 'HOLD'                     // Stage 4: Hold (Owner: named on case)
  | 'CLOSURE';                 // Stage 5: Closure (Owner: CRO)

export type ClientCompany = 'PostEx' | 'Daraz' | 'Buscaro';

export type IssueType =
  | 'Customer Issue'
  | 'Fake Delivery'
  | 'Snatching'
  | 'Theft'
  | 'Other';

export type City = 'Karachi' | 'Lahore' | 'Rawalpindi' | 'Islamabad';

export type ChannelSource =
  | 'Client portal'
  | 'WhatsApp group'
  | 'Phone call'
  | 'Email'
  | 'PostEx IMS portal';

export type FsoPhase = 'assigned' | 'accepted' | 'arrived' | 'reported';

export type HoldParty = 'CLIENT' | 'MOHAFIZ' | 'POLICE';

export interface TimelineEvent {
  id: string;
  time: string; // ISO string
  text: string;
  actor: string;
  visibility: 'client' | 'staff';
}

export interface InternalNote {
  id: string;
  text: string;
  time: string;
  author: string;
}

export interface FieldLogEntry {
  id: string;
  time: string;
  event: string;
  position: string;
  accuracy: string;
  network: string;
}

export interface VoiceNote {
  id: string;
  durationSec: number;
  recordedAt: string;
  audioBlobUrl?: string;
}

export interface FieldReport {
  outcome:
    | 'Resolved, amount recovered'
    | 'Resolved, no payment collected'
    | 'Needs more information'
    | 'Police report filed';
  typedNotes?: string;
  amountRecovered?: number;
  voiceNotes: VoiceNote[];
  photos: string[];
  proofNotApplicable?: boolean;
  draftText: string;
  publishedText?: string;
  sentAt?: string;
  reviewState: 'none' | 'review' | 'returned' | 'published';
  returnedReason?: string;
}

export interface CaseHoldInfo {
  whoseEnd: HoldParty;
  nextAction: string;
  followUpDate: string;
  startedAt: string;
  clientReply?: string;
}

export interface Officer {
  id: string;
  name: string;
  role: 'FSO' | 'SFSO';
  city: City;
  activeCasesCount: number;
}

export interface DeskCase {
  id: string; // Internal database UUID
  caseId: string | null; // Public Case ID (e.g. POS-LAH-OCT-26-01), null until acknowledged
  client: ClientCompany;
  issue: IssueType;
  city: City;
  location: string;
  address?: string;
  incidentDate?: string;
  amountAtStake: number; // PKR
  description: string;
  trackingNumber?: string;
  source: string; // "Client portal" or "Logged by CRO (WhatsApp group)"
  stage: CaseStage;
  officer: Officer | null;
  fsoPhase: FsoPhase;

  // Timestamps
  createdAt: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  confirmedAt?: string;
  acceptedAt?: string;
  arrivedAt?: string;
  closedAt?: string;

  // Operational metrics
  initialResponse?: string; // "2 min 5 s" or "Missing"
  onGroundResponse?: string; // "28 min 0 s" or "Missing"
  distanceKm?: number; // e.g. 7.4
  liveTrackingRecord?: string; // "Stored on case" or "Missing"

  // Holds, reports, notes, logs
  hold?: CaseHoldInfo;
  report?: FieldReport;
  events: TimelineEvent[];
  notes: InternalNote[];
  fieldLogs: FieldLogEntry[];
}

/**
 * Returns the client-facing status label mapped from the internal stage
 */
export function getClientStatusLabel(c: DeskCase): string {
  if (c.stage === 'NEW') {
    return 'Received, waiting to be acknowledged';
  }
  if (c.stage === 'ACKNOWLEDGED') {
    return 'Acknowledged';
  }
  if (c.stage === 'ESCALATED' || c.stage === 'IN_PROGRESS') {
    return 'Being handled by a field officer';
  }
  if (c.stage === 'HOLD') {
    if (c.hold?.whoseEnd === 'CLIENT') {
      return 'On hold, we need information from you';
    }
    return 'On hold, Mohafiz is following up';
  }
  if (c.stage === 'CLOSURE') {
    return 'Closed';
  }
  return 'Active';
}
