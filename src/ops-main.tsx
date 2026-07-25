import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import { OpsAuthGuard } from '@/modules/ops/OpsAuthGuard';
import { OpsPortalModule } from '@/modules/ops/OpsPortalModule';
import { ErrorBoundary } from '@/design-system';

function OpsApp() {
  const [opsUserEmail, setOpsUserEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  if (opsUserEmail) {
    return (
      <div className="min-h-screen bg-[#0B0E17] p-4 sm:p-6 text-[#EDEEF3]">
        <ErrorBoundary moduleName="Internal Ops Portal">
          <OpsPortalModule
            opsUserEmail={opsUserEmail}
            onExitOpsPortal={() => {
              setOpsUserEmail(null);
              setIsAuthModalOpen(true);
            }}
          />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E17] flex items-center justify-center p-4 font-mono text-xs text-slate-300">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 font-extrabold font-display text-2xl flex items-center justify-center mx-auto border border-brand-500/30">
          V
        </div>
        <h1 className="text-xl font-bold font-display text-slate-100">Vortiq Internal Operations Realm</h1>
        <p className="text-2xs text-slate-400">
          Restricted Portal for Vortiq Superadmins & Internal Operations Employees.
        </p>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-4 py-2 bg-brand-500 text-dark-bg rounded-xl font-bold text-xs hover:bg-brand-400 transition-all cursor-pointer"
        >
          Authenticate Superadmin Key
        </button>
      </div>

      <OpsAuthGuard
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(email) => {
          setIsAuthModalOpen(false);
          setOpsUserEmail(email);
        }}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('ops-root')!).render(
  <React.StrictMode>
    <OpsApp />
  </React.StrictMode>
);
