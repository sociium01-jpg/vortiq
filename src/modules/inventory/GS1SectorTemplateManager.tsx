// ─────────────────────────────────────────────────────────────
// Vortiq GS1 Sector Customization Template Manager
// Master Directive Sector Customization Rule (GS1 GTIN Standards)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/design-system';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export interface GS1SectorTemplate {
  id: string;
  name: string;
  gs1_category_code: string;
  description: string;
  default_unit: string;
  custom_fields: string[];
}

export const GS1_SECTOR_TEMPLATES: GS1SectorTemplate[] = [
  {
    id: 'sec-pharma',
    name: 'Pharmaceuticals & Healthcare (GS1-Health)',
    gs1_category_code: 'GS1-10005842',
    description: 'Requires Batch tracking, Manufacturing Date, Expiry Date, and Cold-Chain Storage Temp.',
    default_unit: 'Boxes',
    custom_fields: ['expiry_date', 'batch_number', 'storage_temperature', 'mfg_license_no'],
  },
  {
    id: 'sec-fnb',
    name: 'Food & Beverage (GS1-GPC Food)',
    gs1_category_code: 'GS1-50000000',
    description: 'Requires Expiry Date, Nutritional Facts, Net Weight, and FSSAI License Number.',
    default_unit: 'Packs / Kg',
    custom_fields: ['expiry_date', 'net_weight', 'fssai_license_no', 'allergen_info'],
  },
  {
    id: 'sec-electronics',
    name: 'Electronics & Consumer Tech (GS1-IT)',
    gs1_category_code: 'GS1-60000000',
    description: 'Requires Unique Unit Serial Number, Voltage Rating, and Warranty Period.',
    default_unit: 'Units',
    custom_fields: ['serial_number', 'voltage_rating', 'warranty_months'],
  },
  {
    id: 'sec-furniture',
    name: 'Furniture & Hardware (GS1-Home)',
    gs1_category_code: 'GS1-47000000',
    description: 'Requires Dimensions (LxWxH), Material Type, Finish, and Assembly Guide.',
    default_unit: 'Kits',
    custom_fields: ['dimensions', 'material_type', 'weight_capacity_kg'],
  },
];

export const GS1SectorTemplateManager: React.FC = () => {
  const [activeTemplateId, setActiveTemplateId] = useState<string>('sec-pharma');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const handleApplyTemplate = (tpl: GS1SectorTemplate) => {
    setActiveTemplateId(tpl.id);
    setAppliedNotification(`GS1 Standard Template "${tpl.name}" applied to organization workspace!`);
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {appliedNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 animate-pulse font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{appliedNotification}</span>
        </div>
      )}

      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            GS1 Classification Sector Templates (Master Directive Rule)
          </h3>
          <p className="text-2xs text-slate-400 mt-0.5">
            Select a starter industry classification template to automatically provision custom item fields and units.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GS1_SECTOR_TEMPLATES.map((tpl) => {
            const isSelected = activeTemplateId === tpl.id;

            return (
              <div
                key={tpl.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/40 text-brand-300'
                    : 'bg-dark-surface/60 border-dark-border text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 font-display text-sm">{tpl.name}</span>
                  <Badge variant={isSelected ? 'emerald' : 'slate'} size="sm" className="font-mono">
                    {tpl.gs1_category_code}
                  </Badge>
                </div>

                <p className="text-2xs text-slate-400 font-mono">{tpl.description}</p>

                <div className="p-2.5 bg-dark-card/90 rounded-lg border border-dark-border space-y-1">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block font-display">Provisioned Custom Fields</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.custom_fields.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-dark-surface border border-dark-border rounded text-2xs font-mono text-slate-300">
                        +{f}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant={isSelected ? 'secondary' : 'primary'}
                  size="sm"
                  className="w-full"
                  onClick={() => handleApplyTemplate(tpl)}
                >
                  {isSelected ? 'Active Sector Template' : 'Apply GS1 Template'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
