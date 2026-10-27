import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronRight, User, Search } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';
import { useHealthPresenter } from '../../presenters/useHealthPresenter';
import { useDesk } from '../../context/DeskContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { viewModel } = useHealthPresenter(true);
  const { portalMode, setPortalMode } = useDesk();

  // Compute breadcrumbs and title from pathname
  const getBreadcrumbInfo = () => {
    const path = location.pathname;
    if (path === '/') {
      return { title: 'Operational Dashboard', crumbs: [{ label: 'Dashboard', to: '/' }] };
    }
    if (path === '/cases') {
      return {
        title: 'Cases Management',
        crumbs: [
          { label: 'Dashboard', to: '/' },
          { label: 'Cases', to: '/cases' },
        ],
      };
    }
    if (path.startsWith('/cases/')) {
      const caseId = path.split('/cases/')[1];
      return {
        title: `Case Details — ${caseId}`,
        crumbs: [
          { label: 'Dashboard', to: '/' },
          { label: 'Cases', to: '/cases' },
          { label: caseId, to: path },
        ],
      };
    }
    if (path === '/assignments') {
      return {
        title: 'Officer Assignments',
        crumbs: [
          { label: 'Dashboard', to: '/' },
          { label: 'Assignments', to: '/assignments' },
        ],
      };
    }
    return { title: 'Mohafiz Case Desk', crumbs: [{ label: 'Home', to: '/' }] };
  };

  const { crumbs } = getBreadcrumbInfo();

  return (
    <header
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        transition: 'var(--transition-theme)',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '0 var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
            className="mobile-menu-btn"
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
              display: 'none', // Shown via CSS media query
            }}
          >
            <Menu size={20} />
          </button>

          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {crumbs.map((crumb, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <React.Fragment key={crumb.to}>
                  {idx > 0 && <ChevronRight size={12} />}
                  {isLast ? (
                    <span
                      style={{
                        color: 'var(--color-text-primary)',
                        fontWeight: 600,
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.to}
                      style={{
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                      }}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Center: 3 Portal Switcher */}
        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--color-bg-subtle)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', gap: '0.2rem' }}>
          <button
            type="button"
            onClick={() => {
              setPortalMode('CLIENT');
              navigate('/client');
            }}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: portalMode === 'CLIENT' ? 700 : 500,
              backgroundColor: portalMode === 'CLIENT' ? 'var(--color-bg-surface)' : 'transparent',
              color: portalMode === 'CLIENT' ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
              border: portalMode === 'CLIENT' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              cursor: 'pointer',
              boxShadow: portalMode === 'CLIENT' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            🏢 Client Portal
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode('CRO');
              navigate('/cro');
            }}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: portalMode === 'CRO' ? 700 : 500,
              backgroundColor: portalMode === 'CRO' ? 'var(--color-bg-surface)' : 'transparent',
              color: portalMode === 'CRO' ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
              border: portalMode === 'CRO' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              cursor: 'pointer',
              boxShadow: portalMode === 'CRO' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            🎯 CRO Operations
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode('FIELD');
              navigate('/field');
            }}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: portalMode === 'FIELD' ? 700 : 500,
              backgroundColor: portalMode === 'FIELD' ? 'var(--color-bg-surface)' : 'transparent',
              color: portalMode === 'FIELD' ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
              border: portalMode === 'FIELD' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              cursor: 'pointer',
              boxShadow: portalMode === 'FIELD' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            🛡️ Field Team (SFSO & FSO)
          </button>
        </div>

        {/* Right: Quick Search + DB Health + ThemeToggle + Staff Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Quick jump to case search button */}
          <button
            type="button"
            onClick={() => navigate('/cases')}
            title="Search cases"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Search size={14} />
            <span className="search-hint-text">Quick Search...</span>
          </button>

          {/* Database status pill */}
          <div className="status-pill-header">
            {viewModel.readiness?.database.status === 'ready' ? (
              <Badge variant="success" dot>
                PostgreSQL Ready
              </Badge>
            ) : (
              <Badge variant="info" dot>
                Backend Online
              </Badge>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Area (Read-Only Staff Identity Placeholder) */}
          <div
            title="Role: Operational Staff (Phase 3 Read-Only View)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-action-secondary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-brand-action)',
              }}
            >
              <User size={14} />
            </div>
            <div className="staff-profile-text" style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Operations Staff
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                CRO Desk • Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
