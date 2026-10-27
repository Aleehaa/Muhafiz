import React from 'react';
import { useDesk } from '../context/DeskContext';
import { ClientPortalView } from './ClientPortalView';
import { CroWorkspaceView } from './CroWorkspaceView';
import { FieldPortalView } from './FieldPortalView';

export const PortalRootView: React.FC = () => {
  const { portalMode } = useDesk();

  if (portalMode === 'CLIENT') {
    return <ClientPortalView />;
  }

  if (portalMode === 'FIELD') {
    return <FieldPortalView />;
  }

  return <CroWorkspaceView />;
};
