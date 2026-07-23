// ─────────────────────────────────────────────────────────────
// Vortiq Auth & Workspace Onboarding Context
// Supports login, registration, tenant creation, and empty-state workspace
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Tenant, UserRole } from '@/types';
import { isDemoMode, setDemoMode, clearWorkspaceData } from '@/lib/dataStore';

interface AuthContextType {
  user: UserProfile | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  isOnboardingOpen: boolean;
  isDemoData: boolean;
  login: (email: string, role?: UserRole) => void;
  loginDemo: (role?: UserRole) => void;
  register: (fullName: string, email: string, companyName: string) => void;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  toggleDemoData: (enable: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vortiq_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      id: 'user-demo-99',
      tenant_id: 'tenant-demo-1001',
      email: 'admin@acmeops.com',
      full_name: 'Alex Vance',
      role: 'ADMIN',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const [tenant, setTenant] = useState<Tenant | null>(() => {
    const saved = localStorage.getItem('vortiq_tenant');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      id: 'tenant-demo-1001',
      name: 'Acme Operations Ltd',
      slug: 'acme-ops',
      plan_tier: 'pro',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const [isLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(() => localStorage.getItem('vortiq_is_new_user') === 'true');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDemoData, setIsDemoData] = useState<boolean>(isDemoMode());

  useEffect(() => {
    if (user) localStorage.setItem('vortiq_user', JSON.stringify(user));
    else localStorage.removeItem('vortiq_user');
  }, [user]);

  useEffect(() => {
    if (tenant) localStorage.setItem('vortiq_tenant', JSON.stringify(tenant));
    else localStorage.removeItem('vortiq_tenant');
  }, [tenant]);

  const loginDemo = (role: UserRole = 'ADMIN') => {
    const demoUser: UserProfile = {
      id: `user-demo-${role.toLowerCase()}`,
      tenant_id: 'tenant-demo-1001',
      email: `${role.toLowerCase()}@acmeops.com`,
      full_name: `${role} User`,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(demoUser);
    setIsNewUser(false);
    localStorage.setItem('vortiq_is_new_user', 'false');
  };

  const login = (email: string, role: UserRole = 'ADMIN') => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      tenant_id: tenant?.id || 'tenant-1',
      email,
      full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const register = (fullName: string, email: string, companyName: string) => {
    const tenantId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id: tenantId,
      name: companyName,
      slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan_tier: 'pro',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newUser: UserProfile = {
      id: `user-owner-${Date.now()}`,
      tenant_id: tenantId,
      email,
      full_name: fullName,
      role: 'OWNER',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Clean slate for new user!
    clearWorkspaceData();
    setTenant(newTenant);
    setUser(newUser);
    setIsNewUser(true);
    setIsDemoData(false);
    localStorage.setItem('vortiq_is_new_user', 'true');
    setIsOnboardingOpen(true);
  };

  const toggleDemoData = (enable: boolean) => {
    setDemoMode(enable);
    setIsDemoData(enable);
    if (!enable) {
      clearWorkspaceData();
    } else {
      window.location.reload();
    }
  };

  const completeOnboarding = () => {
    setIsNewUser(false);
    localStorage.setItem('vortiq_is_new_user', 'false');
    setIsOnboardingOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vortiq_user');
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'OWNER' || user.role === 'ADMIN') return true;
    if (user.role === requiredRole) return true;
    const hierarchy: Record<UserRole, number> = {
      MEMBER: 1,
      MANAGER: 2,
      HR_ADMIN: 3,
      FINANCE_ADMIN: 3,
      ADMIN: 4,
      OWNER: 5,
    };
    return (hierarchy[user.role] || 0) >= (hierarchy[requiredRole] || 99);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated: !!user,
        isLoading,
        isNewUser,
        isOnboardingOpen,
        isDemoData,
        login,
        loginDemo,
        register,
        logout,
        hasPermission,
        toggleDemoData,
        setIsOnboardingOpen,
        completeOnboarding,
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
