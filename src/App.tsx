import { useState } from 'react';
import { LandingPage } from '@/pages/LandingPage';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, ErrorBoundary } from '@/design-system';
import { LayoutDashboard } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  if (viewMode === 'landing') {
    return (
      <div className="relative">
        <ErrorBoundary moduleName="Landing Page">
          <LandingPage onNavigateToApp={() => setViewMode('app')} />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Landing Page Return Banner */}
      <div className="bg-landing-card border-b border-landing-border px-4 py-1.5 flex items-center justify-between text-xs text-landing-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-landing-teal animate-pulse"></span>
          <span>Vortiq SaaS Operational Workspace Active</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-landing-gold" />}
          onClick={() => setViewMode('landing')}
          className="text-xs py-1 px-2.5 bg-landing-bg border-landing-border text-landing-text hover:bg-landing-hover"
        >
          View Marketing Landing Page
        </Button>
      </div>

      <ErrorBoundary moduleName="Application Workspace">
        <AppLayout />
      </ErrorBoundary>
    </div>
  );
}
