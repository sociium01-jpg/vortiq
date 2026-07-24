import { useState } from 'react';
import { LandingPage } from '@/pages/LandingPage';
import { MobileTabletPreview } from '@/pages/MobileTabletPreview';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, ErrorBoundary } from '@/design-system';
import { LayoutDashboard, Smartphone } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'mobile_preview' | 'app'>('landing');

  if (viewMode === 'landing') {
    return (
      <div className="relative">
        <ErrorBoundary moduleName="Landing Page">
          <LandingPage onNavigateToApp={() => setViewMode('app')} />
        </ErrorBoundary>
      </div>
    );
  }

  if (viewMode === 'mobile_preview') {
    return (
      <div className="relative">
        <div className="bg-dark-card border-b border-dark-border px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
          <span>Vortiq Mobile & Tablet Layout Preview</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode('landing')}>
              Marketing Landing Page
            </Button>
            <Button variant="primary" size="sm" onClick={() => setViewMode('app')}>
              Launch SaaS App
            </Button>
          </div>
        </div>
        <ErrorBoundary moduleName="Mobile & Tablet Preview">
          <MobileTabletPreview />
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Smartphone className="w-3.5 h-3.5 text-brand-400" />}
            onClick={() => setViewMode('mobile_preview')}
            className="text-xs py-1 px-2.5 bg-landing-bg border-landing-border text-landing-text hover:bg-landing-hover"
          >
            Mobile/Tablet View
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-landing-gold" />}
            onClick={() => setViewMode('landing')}
            className="text-xs py-1 px-2.5 bg-landing-bg border-landing-border text-landing-text hover:bg-landing-hover"
          >
            Landing Page
          </Button>
        </div>
      </div>

      <ErrorBoundary moduleName="Application Workspace">
        <AppLayout />
      </ErrorBoundary>
    </div>
  );
}
