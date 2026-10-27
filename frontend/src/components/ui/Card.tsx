import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      {...props}
      style={{
        backgroundColor: elevated ? 'var(--color-bg-surface-elevated)' : 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: elevated ? 'var(--shadow-md)' : 'var(--shadow-card)',
        padding: 'var(--space-6)',
        transition: 'var(--transition-theme), box-shadow var(--transition-fast)',
        ...style,
      }}
      className={`card ${className}`}
    >
      {children}
    </div>
  );
};
