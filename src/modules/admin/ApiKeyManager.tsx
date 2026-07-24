// ─────────────────────────────────────────────────────────────
// Vortiq Security-Audited API Key Lifecycle Management
// Prefixed tokens (vtq_live_...), 100 req/min rate limits, & IP Whitelisting
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '@/design-system';
import { ApiKeyProfile, SEED_API_KEYS } from './types';
import { Key, Plus, CheckCircle2, Copy } from 'lucide-react';

export interface ApiKeyManagerProps {
  onApiKeyGenerated?: (keyProfile: ApiKeyProfile) => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyGenerated }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeyProfile[]>(SEED_API_KEYS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null);

  // New Key Form
  const [keyName, setKeyName] = useState('Zapier Production Integration Token');
  const [rateLimit, setRateLimit] = useState('100');
  const [allowedIp, setAllowedIp] = useState('103.21.244.0/24');

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const rawSecret = `vtq_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    const newKeyProfile: ApiKeyProfile = {
      id: `apk-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      name: keyName,
      key_prefix: rawSecret.substring(0, 16),
      scopes: ['crm:read', 'finance:read', 'inventory:write'],
      rate_limit_per_min: parseInt(rateLimit) || 100,
      allowed_ips: [allowedIp],
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setApiKeys([newKeyProfile, ...apiKeys]);
    setNewlyCreatedSecret(rawSecret);
    onApiKeyGenerated?.(newKeyProfile);
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k))
    );
  };

  return (
    <div className="space-y-6">
      {/* API Keys Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-400" />
              API Key Lifecycle & Security Management ({apiKeys.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Generate prefixed access keys with rate limiting & IP whitelisting</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Generate API Key
          </Button>
        </div>

        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div key={key.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-display">{key.name}</span>
                  <Badge variant={key.status === 'active' ? 'emerald' : 'rose'} size="sm">
                    {key.status}
                  </Badge>
                  <span className="text-2xs text-brand-300 font-mono font-bold">{key.key_prefix}••••••••</span>
                </div>
                <p className="text-2xs text-slate-400">Scopes: {key.scopes.join(', ')} • Limit: {key.rate_limit_per_min} req/min</p>
                <p className="text-2xs text-slate-400">Allowed IPs: {key.allowed_ips.join(', ')}</p>
              </div>

              {key.status === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRevokeKey(key.id)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  Revoke Secret Key
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Generate API Key Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setNewlyCreatedSecret(null);
          }}
          title="Generate Security-Audited API Token"
          maxWidth="md"
        >
          {newlyCreatedSecret ? (
            <div className="space-y-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-display">
                <CheckCircle2 className="w-4 h-4" /> API Key Generated Successfully!
              </div>
              <p className="text-2xs text-slate-300 font-mono">
                Copy this secret key immediately. For security reasons, it will never be displayed again.
              </p>
              <div className="p-3 bg-dark-bg border border-dark-border rounded-lg font-mono text-2xs text-brand-300 flex items-center justify-between">
                <span>{newlyCreatedSecret}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(newlyCreatedSecret)}
                  className="p-1 text-slate-400 hover:text-slate-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <Button variant="primary" size="sm" className="w-full" onClick={() => setIsModalOpen(false)}>
                I Have Saved This Key
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Key Name / Integration Label</label>
                <Input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Rate Limit (req/min)</label>
                  <Input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Allowed IP CIDR Whitelist</label>
                  <Input
                    type="text"
                    value={allowedIp}
                    onChange={(e) => setAllowedIp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Key className="w-4 h-4" />}>
                Generate & Reveal API Secret
              </Button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
