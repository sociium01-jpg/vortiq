import React, { useState } from 'react';
import { RBACGuard } from '@/auth/RBACGuard';
import { OrgProfileManager } from './OrgProfileManager';
import { UserRbacManager } from './UserRbacManager';
import { ActivityLogViewer } from './ActivityLogViewer';
import { Shield, Building2, Users, History } from 'lucide-react';

export const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'activity'>('profile');

  return (
    <RBACGuard requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
              <Shield className="w-6 h-6 text-brand-400" />
              Tenant Settings & Admin Control Panel
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer-facing organization settings, team member role assignments, and security audit logs.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-dark-surface/60 p-1 rounded-xl border border-dark-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-brand-500 text-dark-bg font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Org Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'team'
                  ? 'bg-brand-500 text-dark-bg font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team & Permissions</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-brand-500 text-dark-bg font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Log</span>
            </button>
          </div>
        </div>

        {/* Tab Viewport */}
        <div>
          {activeTab === 'profile' && <OrgProfileManager />}
          {activeTab === 'team' && <UserRbacManager />}
          {activeTab === 'activity' && <ActivityLogViewer />}
        </div>
      </div>
    </RBACGuard>
  );
};
