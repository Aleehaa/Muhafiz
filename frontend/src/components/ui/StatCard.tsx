import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'var(--color-brand-action)',
  onClick,
}) => {
  return (
    <Card
      style={{
        padding: 'var(--space-5)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-muted)',
              display: 'block',
              marginBottom: '0.25rem',
            }}
          >
            {title}
          </span>
          <div
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: 'var(--color-text-primary)',
            }}
          >
            {value}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginTop: '0.4rem',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
