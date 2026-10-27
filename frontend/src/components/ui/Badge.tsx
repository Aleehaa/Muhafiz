import React, { HTMLAttributes } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  dot = false,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): { bg: string; text: string; border: string; dotColor: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: 'var(--color-status-success-bg)',
          text: 'var(--color-status-success)',
          border: 'var(--color-status-success-border)',
          dotColor: 'var(--color-status-success)',
        };
      case 'warning':
        return {
          bg: 'var(--color-status-warning-bg)',
          text: 'var(--color-status-warning)',
          border: 'var(--color-status-warning-border)',
          dotColor: 'var(--color-status-warning)',
        };
      case 'error':
        return {
          bg: 'var(--color-status-error-bg)',
          text: 'var(--color-status-error)',
          border: 'var(--color-status-error-border)',
          dotColor: 'var(--color-status-error)',
        };
      case 'info':
        return {
          bg: 'var(--color-status-info-bg)',
          text: 'var(--color-status-info)',
          border: 'var(--color-status-info-border)',
          dotColor: 'var(--color-status-info)',
        };
      case 'brand':
        return {
          bg: 'var(--color-status-error-bg)',
          text: 'var(--color-brand-action)',
          border: 'var(--color-status-error-border)',
          dotColor: 'var(--color-brand-action)',
        };
      case 'default':
      default:
        return {
          bg: 'var(--color-bg-muted)',
          text: 'var(--color-text-secondary)',
          border: 'var(--color-border-subtle)',
          dotColor: 'var(--color-text-muted)',
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <span
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.2rem 0.6rem',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: currentStyles.bg,
        color: currentStyles.text,
        border: `1px solid ${currentStyles.border}`,
        lineHeight: 1.2,
        ...style,
      }}
      className={`badge badge-${variant} ${className}`}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: currentStyles.dotColor,
          }}
        />
      )}
      {children}
    </span>
  );
};
