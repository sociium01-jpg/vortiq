import React, { createContext, useContext, useState } from 'react';
import { UserProfile, Tenant, UserRole } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginDemo: (role?: UserRole) => void;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant] = useState<Tenant | null>({
    id: 'tenant-demo-1001',
    name: 'Acme Operations Ltd',
    slug: 'acme-ops',
    plan_tier: 'pro',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [user, setUser] = useState<UserProfile | null>({
    id: 'user-demo-99',
    tenant_id: 'tenant-demo-1001',
    email: 'admin@acmeops.com',
    full_name: 'Alex Vance',
    role: 'ADMIN',
    avatar_url: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [isLoading] = useState(false);

  const loginDemo = (role: UserRole = 'ADMIN') => {
    setUser({
      id: 'user-demo-99',
      tenant_id: 'tenant-demo-1001',
      email: `${role.toLowerCase()}@acmeops.com`,
      full_name: `${role} User`,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    const hierarchy: Record<UserRole, number> = {
      MEMBER: 1,
      MANAGER: 2,
      ADMIN: 3,
      OWNER: 4,
    };
    return hierarchy[user.role] >= hierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated: !!user,
        isLoading,
        loginDemo,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
