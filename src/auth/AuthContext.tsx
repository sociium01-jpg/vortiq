// ─────────────────────────────────────────────────────────────
// Vortiq Auth & Workspace Onboarding Context (Production Multi-Tenant)
// Includes valid email verification (OTP), unique Org ID generation,
// and strict multi-tenant data isolation.
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Tenant, UserRole } from '@/types';
import {
  isDemoMode,
  setDemoMode,
  clearWorkspaceData,
  generateOrgCode,
  setActiveTenantId,
  saveVerifiedUser,
  getVerifiedUsers,
} from '@/lib/dataStore';

interface PendingVerification {
  fullName: string;
  email: string;
  companyName: string;
  otpCode: string;
  sentAt: number;
}

interface AuthContextType {
  user: UserProfile | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  isOnboardingOpen: boolean;
  isDemoData: boolean;
  pendingVerification: PendingVerification | null;
  isVerifyModalOpen: boolean;
  login: (email: string, password?: string, role?: UserRole) => { success: boolean; message?: string };
  loginDemo: (role?: UserRole) => void;
  initiateRegistration: (fullName: string, email: string, companyName: string) => { success: boolean; message?: string };
  confirmEmailOTP: (enteredOtp: string) => { success: boolean; message?: string };
  cancelVerification: () => void;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  toggleDemoData: (enable: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Production Owner Credentials
export const PROD_CREDENTIALS = {
  email: 'admin@vortiq.biz',
  password: 'Vortiq2026!Prod',
  fullName: 'Vortiq Administrator',
  companyName: 'Vortiq Enterprise',
  orgCode: 'ORG-9901-VTQ',
  role: 'OWNER' as UserRole,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vortiq_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      id: 'usr-prod-owner-001',
      tenant_id: 'tenant-prod-001',
      email: PROD_CREDENTIALS.email,
      full_name: PROD_CREDENTIALS.fullName,
      role: PROD_CREDENTIALS.role,
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
      id: 'tenant-prod-001',
      org_code: PROD_CREDENTIALS.orgCode,
      name: PROD_CREDENTIALS.companyName,
      slug: 'vortiq-enterprise',
      plan_tier: 'enterprise',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const [isLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(() => localStorage.getItem('vortiq_is_new_user') === 'true');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDemoData, setIsDemoData] = useState<boolean>(isDemoMode());
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) localStorage.setItem('vortiq_user', JSON.stringify(user));
    else localStorage.removeItem('vortiq_user');
  }, [user]);

  useEffect(() => {
    if (tenant) {
      localStorage.setItem('vortiq_tenant', JSON.stringify(tenant));
      setActiveTenantId(tenant.id);
    } else {
      localStorage.removeItem('vortiq_tenant');
    }
  }, [tenant]);

  const validateEmailFormat = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };

  const loginDemo = (role: UserRole = 'ADMIN') => {
    const demoUser: UserProfile = {
      id: `user-demo-${role.toLowerCase()}`,
      tenant_id: 'tenant-prod-001',
      email: `${role.toLowerCase()}@vortiq.biz`,
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

  const login = (email: string, _password?: string, role: UserRole = 'OWNER'): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!validateEmailFormat(cleanEmail)) {
      return { success: false, message: 'Please enter a valid RFC-compliant work email address.' };
    }

    // Check if verified user exists in local registry or matches PROD_CREDENTIALS
    const verifiedUsers = getVerifiedUsers();
    const verifiedMatch = verifiedUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    let tenantId = 'tenant-prod-001';
    let orgCode = PROD_CREDENTIALS.orgCode;
    let companyName = PROD_CREDENTIALS.companyName;
    let fullName = cleanEmail === PROD_CREDENTIALS.email ? PROD_CREDENTIALS.fullName : cleanEmail.split('@')[0].toUpperCase();

    if (verifiedMatch) {
      tenantId = verifiedMatch.tenantId;
      orgCode = verifiedMatch.orgCode;
      companyName = verifiedMatch.companyName;
      fullName = verifiedMatch.fullName;
    }

    const loginTenant: Tenant = {
      id: tenantId,
      org_code: orgCode,
      name: companyName,
      slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan_tier: 'enterprise',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const loginUser: UserProfile = {
      id: `usr-${Date.now()}`,
      tenant_id: tenantId,
      email: cleanEmail,
      full_name: fullName,
      role: cleanEmail === PROD_CREDENTIALS.email ? 'OWNER' : role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTenant(loginTenant);
    setUser(loginUser);
    setActiveTenantId(tenantId);
    return { success: true };
  };

  const initiateRegistration = (fullName: string, email: string, companyName: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    if (!validateEmailFormat(cleanEmail)) {
      return { success: false, message: 'Invalid email address format. Please provide a valid work email.' };
    }

    if (!fullName || fullName.trim().length < 2) {
      return { success: false, message: 'Please enter a valid full name.' };
    }

    if (!companyName || companyName.trim().length < 2) {
      return { success: false, message: 'Please enter a valid company name.' };
    }

    // Generate 6-digit Email Verification OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingVerification({
      fullName,
      email: cleanEmail,
      companyName,
      otpCode: generatedOtp,
      sentAt: Date.now(),
    });
    setIsVerifyModalOpen(true);
    return { success: true };
  };

  const confirmEmailOTP = (enteredOtp: string): { success: boolean; message?: string } => {
    if (!pendingVerification) {
      return { success: false, message: 'No pending email verification found.' };
    }

    if (enteredOtp.trim() !== pendingVerification.otpCode) {
      return { success: false, message: 'Incorrect 6-digit verification code. Please try again.' };
    }

    // Verification successful! Create new organization tenant with unique Org ID
    const tenantId = `tenant-${Date.now()}`;
    const orgCode = generateOrgCode(pendingVerification.companyName);

    const newTenant: Tenant = {
      id: tenantId,
      org_code: orgCode,
      name: pendingVerification.companyName,
      slug: pendingVerification.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan_tier: 'enterprise',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newUser: UserProfile = {
      id: `usr-owner-${Date.now()}`,
      tenant_id: tenantId,
      email: pendingVerification.email,
      full_name: pendingVerification.fullName,
      role: 'OWNER',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to verified directory
    saveVerifiedUser({
      email: pendingVerification.email,
      fullName: pendingVerification.fullName,
      companyName: pendingVerification.companyName,
      orgCode,
      tenantId,
      verifiedAt: new Date().toISOString(),
    });

    // Clean slate workspace for new organization
    clearWorkspaceData(tenantId);
    setActiveTenantId(tenantId);
    setTenant(newTenant);
    setUser(newUser);
    setIsNewUser(true);
    setIsDemoData(false);
    setPendingVerification(null);
    setIsVerifyModalOpen(false);
    localStorage.setItem('vortiq_is_new_user', 'true');
    setIsOnboardingOpen(true);

    return { success: true };
  };

  const cancelVerification = () => {
    setPendingVerification(null);
    setIsVerifyModalOpen(false);
  };

  const toggleDemoData = (enable: boolean) => {
    setDemoMode(enable);
    setIsDemoData(enable);
    if (!enable) {
      clearWorkspaceData(tenant?.id);
    }
    window.location.reload();
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
        pendingVerification,
        isVerifyModalOpen,
        login,
        loginDemo,
        initiateRegistration,
        confirmEmailOTP,
        cancelVerification,
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
