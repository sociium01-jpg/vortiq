import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { auditLogger } from '@/lib/auditLogger';
import { Card, Input, Select, Button, Badge, Toast } from '@/design-system';
import { Building2, Upload, CheckCircle2 } from 'lucide-react';

export const OrgProfileManager: React.FC = () => {
  const { tenant } = useAuth();
  const [orgName, setOrgName] = useState(tenant?.name || 'Acme Operations Ltd');
  const [gstin, setGstin] = useState('27AAAAA0000A1Z5');
  const [address, setAddress] = useState('702 Express Towers, Nariman Point, Mumbai - 400021');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [gstinError, setGstinError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const validateGstinFormat = (val: string): boolean => {
    if (!val) return true;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(val);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (gstin && !validateGstinFormat(gstin)) {
      setGstinError('Invalid GSTIN format. Expected format: 27AAAAA0000A1Z5');
      return;
    }
    setGstinError(null);

    // Audit log before/after changes
    if (orgName !== tenant?.name) {
      auditLogger.logChange(tenant?.id || 't-1', 'Organization', tenant?.id || 't-1', 'name', tenant?.name, orgName, 'user-admin');
    }
    if (gstin !== '27AAAAA0000A1Z5') {
      auditLogger.logChange(tenant?.id || 't-1', 'Organization', tenant?.id || 't-1', 'gstin', '27AAAAA0000A1Z5', gstin, 'user-admin');
    }

    setToastMessage('Organization profile & GSTIN settings saved successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {toastMessage && (
        <Toast
          id="profile-toast"
          type="success"
          title="Profile Saved"
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Org Profile Form */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-400" />
              Organization Identity & GST Profile
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage your legal entity profile, logo, and GST compliance information.</p>
          </div>
          <Badge variant="blue">Owner / Admin Only</Badge>
        </div>

        {/* Logo Upload & Preview */}
        <div className="flex items-center gap-6 p-4 bg-dark-surface/40 rounded-xl border border-dark-border/60">
          <div className="w-20 h-20 rounded-xl bg-dark-surface border border-dashed border-dark-border flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Org Logo Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2">
                <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                <span className="text-2xs text-slate-500 block mt-1">Logo Preview</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200">Organization Logo</h4>
            <p className="text-2xs text-slate-400">PNG, SVG or JPG. Max file size 2MB.</p>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-slate-200 hover:text-white cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-brand-400" />
              <span>Choose New Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Input
            label="GSTIN Number (GST Compliance)"
            value={gstin}
            onChange={(e) => {
              setGstin(e.target.value.toUpperCase());
              setGstinError(null);
            }}
            error={gstinError || undefined}
            helperText="Format: 27AAAAA0000A1Z5 (15-character alphanumeric)"
          />
        </div>

        <Input
          label="Registered Business Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Select
          label="Organization Primary Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={[
            { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST - UTC+05:30)' },
            { value: 'Asia/Dubai', label: 'Asia/Dubai (GST - UTC+04:00)' },
            { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
          ]}
        />

        <div className="pt-4 border-t border-dark-border flex justify-end">
          <Button variant="primary" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={handleSaveProfile}>
            Save Organization Profile
          </Button>
        </div>
      </Card>
    </div>
  );
};
