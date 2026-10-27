import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../app/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode (currently ${theme} mode)`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.45rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-action-secondary-bg)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-subtle)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      {isDark ? (
        <Sun size={18} strokeWidth={2.2} style={{ color: 'var(--brand-beige)' }} />
      ) : (
        <Moon size={18} strokeWidth={2.2} style={{ color: 'var(--brand-charcoal)' }} />
      )}
    </button>
  );
};
