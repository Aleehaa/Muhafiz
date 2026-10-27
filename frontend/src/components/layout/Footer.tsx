import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface)',
        padding: 'var(--space-6) 0',
        transition: 'var(--transition-theme)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Mohafiz Case Desk</span>
          {' '}— Professional Case Management Platform. Phase 1 Architecture Setup.
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>React 18 + Vite</span>
          <span>•</span>
          <span>Express + TypeScript</span>
          <span>•</span>
          <span>Prisma ORM (Configured)</span>
          <span>•</span>
          <span>Model–View–Presenter</span>
        </div>
      </div>
    </footer>
  );
};
