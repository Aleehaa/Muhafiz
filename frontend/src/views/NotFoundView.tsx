import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const NotFoundView: React.FC = () => {
  return (
    <div style={{ maxWidth: '32rem', margin: '4rem auto 0', textAlign: 'center' }}>
      <Card elevated>
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--color-status-error-bg)',
            color: 'var(--color-brand-action)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <AlertCircle size={32} />
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          The requested page could not be found. Please check the URL or navigate back to the main case desk overview.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<ArrowLeft size={16} />}>
            Return to Case Desk
          </Button>
        </Link>
      </Card>
    </div>
  );
};
