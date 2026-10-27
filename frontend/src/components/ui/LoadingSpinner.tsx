import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading operational data...',
  size = 'md',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return '1.25rem';
      case 'lg':
        return '2.5rem';
      case 'md':
      default:
        return '1.75rem';
    }
  };

  const dim = getDimensions();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-4)',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          width: dim,
          height: dim,
          border: '3px solid var(--color-border-subtle)',
          borderTopColor: 'var(--color-brand-action)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {label && (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
      )}
    </div>
  );
};
