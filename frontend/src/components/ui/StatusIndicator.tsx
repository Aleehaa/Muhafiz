import React from 'react';
import { ConnectionState } from '../../models/health.model';
import { Badge } from './Badge';

interface StatusIndicatorProps {
  state: ConnectionState;
  latencyMs?: number | null;
  compact?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  state,
  latencyMs,
  compact = false,
}) => {
  switch (state) {
    case 'connected':
      return (
        <Badge variant="success" dot>
          Backend Online {latencyMs !== undefined && latencyMs !== null && !compact ? `(${latencyMs}ms)` : ''}
        </Badge>
      );
    case 'checking':
      return (
        <Badge variant="warning" dot>
          Checking API...
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="error" dot>
          Backend Offline
        </Badge>
      );
    case 'idle':
    default:
      return (
        <Badge variant="default" dot>
          Disconnected
        </Badge>
      );
  }
};
