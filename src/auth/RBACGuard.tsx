import React from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types';
import { ShieldAlert } from 'lucide-react';
import { Card, Button } from '@/design-system';

export interface RBACGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  requiredRole,
  children,
  fallback,
}) => {
  const { hasPermission, user } = useAuth();

  if (!hasPermission(requiredRole)) {
    if (fallback) return <>{fallback}</>;

    return (
      <Card className="max-w-md mx-auto my-8 p-6 text-center border-rose-500/30 bg-rose-950/10">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-rose-200">Access Restricted</h4>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Your current role (<span className="font-semibold text-slate-200">{user?.role || 'Guest'}</span>) does not have sufficient permissions to view this section. Requires role: <span className="font-semibold text-amber-400">{requiredRole}</span>.
        </p>
        <Button variant="secondary" size="sm" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Card>
    );
  }

  return <>{children}</>;
};
