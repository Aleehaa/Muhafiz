import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useDesk } from '../../context/DeskContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { portalMode, setPortalMode } = useDesk();

  const navItems = [
    {
      to: '/cro',
      label: 'CRO Operations',
      icon: <LayoutDashboard size={20} />,
      onClick: () => setPortalMode('CRO'),
      isActive: portalMode === 'CRO' && (location.pathname === '/' || location.pathname === '/cro'),
    },
    {
      to: '/client',
      label: 'Client Portal',
      icon: <Building2 size={20} />,
      onClick: () => setPortalMode('CLIENT'),
      isActive: portalMode === 'CLIENT' && (location.pathname === '/' || location.pathname === '/client'),
    },
    {
      to: '/field',
      label: 'Field Portal (SFSO/FSO)',
      icon: <Shield size={20} />,
      onClick: () => setPortalMode('FIELD'),
      isActive: portalMode === 'FIELD' && (location.pathname === '/' || location.pathname === '/field'),
    },
    {
      to: '/cases',
      label: 'Cases Archive',
      icon: <Briefcase size={20} />,
      onClick: undefined,
      isActive: location.pathname.startsWith('/cases'),
    },
    {
      to: '/assignments',
      label: 'Assignments Registry',
      icon: <UserCheck size={20} />,
      onClick: undefined,
      isActive: location.pathname.startsWith('/assignments'),
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 90,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          width: isCollapsed ? '4.75rem' : '16rem',
          backgroundColor: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 95,
          flexShrink: 0,
        }}
        className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0' : '0 var(--space-4)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'inherit',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-action)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-on-crimson)',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(205, 37, 54, 0.25)',
              }}
            >
              <Shield size={20} strokeWidth={2.4} />
            </div>

            {!isCollapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    MOHAFIZ
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 400,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Desk
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Operations
                </div>
              </div>
            )}
          </NavLink>

          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              style={{
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: '1 1 auto',
            padding: 'var(--space-4) var(--space-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          {navItems.map((item) => {
            const active = item.isActive;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: isCollapsed ? '0.65rem 0' : '0.65rem 0.75rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--color-brand-action)' : 'var(--color-text-secondary)',
                  backgroundColor: active ? 'var(--color-action-secondary-bg)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: active ? 'var(--color-brand-action)' : 'currentColor',
                  }}
                >
                  {item.icon}
                </div>
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info / Collapse expand button */}
        <div
          style={{
            padding: isCollapsed ? 'var(--space-3) 0' : 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: isCollapsed ? 'center' : 'stretch',
          }}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  SYSTEM STATUS
                </span>
                <Badge variant="success" dot style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  Live API
                </Badge>
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                Phase 3 Operations View
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  Read-Only Mode
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
