import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PortalRootView } from '../views/PortalRootView';
import { ClientPortalView } from '../views/ClientPortalView';
import { CroWorkspaceView } from '../views/CroWorkspaceView';
import { FieldPortalView } from '../views/FieldPortalView';
import { CasesListView } from '../views/CasesListView';
import { CaseDetailView } from '../views/CaseDetailView';
import { AssignmentsView } from '../views/AssignmentsView';
import { NotFoundView } from '../views/NotFoundView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <PortalRootView />,
      },
      {
        path: 'client',
        element: <ClientPortalView />,
      },
      {
        path: 'cro',
        element: <CroWorkspaceView />,
      },
      {
        path: 'field',
        element: <FieldPortalView />,
      },
      {
        path: 'cases',
        element: <CasesListView />,
      },
      {
        path: 'cases/:id',
        element: <CaseDetailView />,
      },
      {
        path: 'assignments',
        element: <AssignmentsView />,
      },
      {
        path: '*',
        element: <NotFoundView />,
      },
    ],
  },
]);
