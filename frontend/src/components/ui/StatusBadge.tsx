import React from 'react';
import { Badge, BadgeVariant } from './Badge';
import { formatStatusLabel, formatIssueType } from './Formatters';

interface StatusBadgeProps {
  status: string;
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, dot = true, className = '' }) => {
  const getVariant = (s: string): BadgeVariant => {
    switch (s) {
      case 'RESOLVED':
      case 'COMPLETED':
      case 'ACTIVE':
        return 'success';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 'info';
      case 'PENDING_REVIEW':
      case 'ON_HOLD':
      case 'REASSIGNED':
        return 'warning';
      case 'SNATCHING':
      case 'REJECTED':
      case 'CANCELLED':
        return 'error';
      case 'SUBMITTED':
      case 'THEFT':
        return 'brand';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)} dot={dot} className={className}>
      {formatStatusLabel(status)}
    </Badge>
  );
};

export const IssueTypeBadge: React.FC<{ issueType: string; className?: string }> = ({
  issueType,
  className = '',
}) => {
  const getVariant = (type: string): BadgeVariant => {
    switch (type) {
      case 'SNATCHING':
        return 'error';
      case 'THEFT':
        return 'brand';
      case 'FAKE_DELIVERY':
        return 'warning';
      case 'CUSTOMER_ISSUE':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(issueType)} className={className}>
      {formatIssueType(issueType)}
    </Badge>
  );
};
