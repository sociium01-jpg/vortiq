import React from 'react';
import { useAuth } from './AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg text-slate-400 text-xs">
        Authenticating Vortiq session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg p-4 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2 font-display">Authentication Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-4">Please log in to access the Vortiq workspace.</p>
      </div>
    );
  }

  return <>{children}</>;
};
