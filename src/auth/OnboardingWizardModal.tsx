// ─────────────────────────────────────────────────────────────
// Vortiq Quick Initial Setup Wizard Modal
// 3-step setup wizard for newly registered organizations
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@/design-system';
import { useAuth } from './AuthContext';
import { CheckCircle2, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({ isOpen, onClose }) => {
  const { tenant, completeOnboarding, toggleDemoData } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Setup form states
  const [companyName, setCompanyName] = useState(tenant?.name || '');
  const [gstin, setGstin] = useState('');
  const [stateCode, setStateCode] = useState('27'); // Default Maharashtra
  const [industry, setIndustry] = useState('manufacturing');
  const [dataPreference, setDataPreference] = useState<'empty' | 'sample'>('empty');

  const handleFinish = () => {
    if (dataPreference === 'sample') {
      toggleDemoData(true);
    }
    completeOnboarding();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Initial Setup — Vortiq Setup Wizard"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2">
          {[
            { num: 1, title: 'Company Details' },
            { num: 2, title: 'Tax & Compliance' },
            { num: 3, title: 'Workspace Preferences' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  step === s.num
                    ? 'bg-brand-500 text-dark-bg ring-4 ring-brand-500/20'
                    : step > s.num
                    ? 'bg-emerald-500 text-dark-bg'
                    : 'bg-dark-surface text-slate-400 border border-dark-border'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Company Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-100 font-display">Company Profile</h4>
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                Organization / Business Name
              </label>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Operations Pvt Ltd"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                Industry Category
              </label>
              <Select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                options={[
                  { value: 'manufacturing', label: 'Manufacturing & Distribution' },
                  { value: 'textiles', label: 'Textiles & Garments' },
                  { value: 'logistics', label: 'Logistics & Supply Chain' },
                  { value: 'services', label: 'Professional & Tech Services' },
                  { value: 'retail', label: 'Retail & Wholesale SME' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 2: Tax & GST */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-100 font-display">GST & Tax Compliance (India)</h4>
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                GSTIN Number (Optional)
              </label>
              <Input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="27AABCU9603R1ZM"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                State / Place of Supply
              </label>
              <Select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                options={[
                  { value: '27', label: '27 - Maharashtra' },
                  { value: '07', label: '07 - Delhi' },
                  { value: '29', label: '29 - Karnataka' },
                  { value: '33', label: '33 - Tamil Nadu' },
                  { value: '09', label: '09 - Uttar Pradesh' },
                  { value: '19', label: '19 - West Bengal' },
                  { value: '24', label: '24 - Gujarat' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 3: Workspace Data Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-100 font-display">Initial Workspace Data Setup</h4>
            <p className="text-xs text-slate-400">Choose how your new organization starts:</p>

            <div className="space-y-3">
              <label
                onClick={() => setDataPreference('empty')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  dataPreference === 'empty'
                    ? 'border-brand-500 bg-brand-500/10 text-slate-100'
                    : 'border-dark-border bg-dark-card text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="data_pref"
                  checked={dataPreference === 'empty'}
                  onChange={() => setDataPreference('empty')}
                  className="mt-1"
                />
                <div>
                  <p className="text-xs font-bold text-slate-100">Clean Slate (Empty Workspace) — Recommended</p>
                  <p className="text-2xs text-slate-400 mt-0.5">
                    Start completely empty with zero sample data. All CRM leads, invoices, employees, and tasks will be created by your team.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDataPreference('sample')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  dataPreference === 'sample'
                    ? 'border-brand-500 bg-brand-500/10 text-slate-100'
                    : 'border-dark-border bg-dark-card text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="data_pref"
                  checked={dataPreference === 'sample'}
                  onChange={() => setDataPreference('sample')}
                  className="mt-1"
                />
                <div>
                  <p className="text-xs font-bold text-slate-100">Prefill Sample Demo Data</p>
                  <p className="text-2xs text-slate-400 mt-0.5">
                    Includes sample leads, invoices, employee payrolls, and tasks to explore and test features immediately.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => (s - 1) as any)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button variant="primary" size="sm" onClick={() => setStep((s) => (s + 1) as any)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next Step
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleFinish} rightIcon={<Rocket className="w-4 h-4" />}>
              Complete Setup & Open Workspace
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
