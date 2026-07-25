import { useState } from 'react';
import { LandingPage } from '@/pages/LandingPage';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthModal } from '@/auth/AuthModal';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ErrorBoundary } from '@/design-system';

function MainApp() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'contact_sales'>('login');

  const handleOpenSignIn = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthMode('contact_sales');
    setIsAuthModalOpen(true);
  };

  // If user is authenticated in the main app
  if (user) {
    return (
      <ErrorBoundary moduleName="Application Workspace">
        <AppLayout />
      </ErrorBoundary>
    );
  }

  // Otherwise, render the production Landing Page with AuthModal
  return (
    <div className="relative">
      <ErrorBoundary moduleName="Landing Page">
        <LandingPage
          onOpenSignIn={handleOpenSignIn}
          onOpenSignUp={handleOpenSignUp}
        />
      </ErrorBoundary>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
