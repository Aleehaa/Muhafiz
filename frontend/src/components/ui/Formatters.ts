/**
 * Common formatters for Mohafiz Case Desk
 */

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'PKR ');
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function formatIssueType(type: string): string {
  switch (type) {
    case 'CUSTOMER_ISSUE':
      return 'Customer Issue';
    case 'FAKE_DELIVERY':
      return 'Fake Delivery';
    case 'SNATCHING':
      return 'Armed Snatching';
    case 'THEFT':
      return 'Theft / Shrinkage';
    case 'OTHER':
      return 'Other Incident';
    default:
      return type.replace(/_/g, ' ');
  }
}

export function formatStatusLabel(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'Submitted';
    case 'ACKNOWLEDGED':
      return 'Acknowledged';
    case 'ASSIGNED':
      return 'Assigned';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'PENDING_REVIEW':
      return 'Pending Review';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    case 'ON_HOLD':
      return 'On Hold';
    case 'REJECTED':
      return 'Rejected';
    case 'ARCHIVED':
      return 'Archived';
    case 'ACTIVE':
      return 'Active';
    case 'REASSIGNED':
      return 'Reassigned';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}
