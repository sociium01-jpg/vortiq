// Vortiq Shared Design System Tokens
// Locked token definitions for parallel module agents

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: '#10b981', // Emerald-500
      hover: '#059669',   // Emerald-600
      light: '#d1fae5',   // Emerald-100
      dark: '#064e3b',    // Emerald-900
    },
    dark: {
      bg: '#090d16',
      card: '#0f172a',
      surface: '#1e293b',
      border: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      neutral: '#64748b',
    },
    priority: {
      low: '#64748b',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444',
    }
  },
  typography: {
    fontSans: 'Inter, sans-serif',
    fontDisplay: 'Outfit, sans-serif',
    fontMono: 'JetBrains Mono, monospace',
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    full: '9999px',
  }
} as const;

export type DesignTokenColor = keyof typeof DESIGN_TOKENS.colors.status;
