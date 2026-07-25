// ─────────────────────────────────────────────────────────────
// Vortiq Data Vault — Department-Scoped Data Access & Portability
// Live bindings to CRM, HR, Finance, and Inventory datasets
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { ExportFormatPicker } from './ExportFormatPicker';
import { UniversalBulkImporterModal } from './UniversalBulkImporterModal';
import { VaultGrantManager } from './VaultGrantManager';
import { VaultAuditLogModal } from './VaultAuditLogModal';
import {
  VaultDepartment,
  ExportFormat,
  VaultGrant,
  VaultExportLog,
  VaultImportLog,
  VaultCorrectionLog,
  SEED_EXPORT_LOGS,
  SEED_IMPORT_LOGS,
} from './types';
import { Button, Badge } from '@/design-system';
import { SEED_LEADS } from '@/modules/crm/types';
import { SEED_EMPLOYEES } from '@/modules/hr/types';
import {
  Shield,
  Download,
  Upload,
  UserCheck,
  History,
  Building2,
  Lock,
} from 'lucide-react';

const SEED_FINANCE_RECORDS = [
  {
    id: 'inv-001',
    invoice_number: 'INV-2026-0041',
    customer_name: 'Reliance Retail Logistics',
    issue_date: '2026-07-01',
    due_date: '2026-07-31',
    total_amount: 850000,
    gst_amount: 153000,
    tds_deducted: 17000,
    status: 'PAID',
  },
  {
    id: 'inv-002',
    invoice_number: 'INV-2026-0042',
    customer_name: 'Kavita Traders Mumbai',
    issue_date: '2026-07-10',
    due_date: '2026-08-10',
    total_amount: 420000,
    gst_amount: 75600,
    tds_deducted: 8400,
    status: 'PENDING',
  },
  {
    id: 'inv-003',
    invoice_number: 'INV-2026-0043',
    customer_name: 'Verma Constructions Pune',
    issue_date: '2026-07-15',
    due_date: '2026-08-15',
    total_amount: 1180000,
    gst_amount: 212400,
    tds_deducted: 23600,
    status: 'PARTIALLY_PAID',
  },
];

const SEED_INVENTORY_RECORDS = [
  {
    id: 'sku-001',
    sku: 'GTIN-8901002345001',
    item_name: 'Hydraulic Valve SK-1002',
    category: 'HYDRAULICS',
    warehouse_location: 'Warehouse 2 - Bin A-14',
    quantity_on_hand: 120,
    reorder_threshold: 30,
    unit_price: 4500,
    serial_tracking: 'ENABLED',
  },
  {
    id: 'sku-002',
    sku: 'GTIN-8901002345002',
    item_name: 'Industrial Pneumatic Cylinder',
    category: 'PNEUMATICS',
    warehouse_location: 'Warehouse 1 - Bin C-08',
    quantity_on_hand: 45,
    reorder_threshold: 15,
    unit_price: 12500,
    serial_tracking: 'ENABLED',
  },
  {
    id: 'sku-003',
    sku: 'GTIN-8901002345003',
    item_name: 'Stainless Steel Bearing 6204',
    category: 'BEARINGS',
    warehouse_location: 'Warehouse 3 - Bin B-02',
    quantity_on_hand: 340,
    reorder_threshold: 50,
    unit_price: 850,
    serial_tracking: 'DISABLED',
  },
];

export const VaultModule: React.FC = () => {
  const { user } = useAuth();
  const [activeDept, setActiveDept] = useState<VaultDepartment>('crm');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Module Datasets
  const [crmData, setCrmData] = useState<Record<string, any>[]>(SEED_LEADS);
  const [hrData, setHrData] = useState<Record<string, any>[]>(SEED_EMPLOYEES);
  const [financeData, setFinanceData] = useState<Record<string, any>[]>(SEED_FINANCE_RECORDS);
  const [inventoryData, setInventoryData] = useState<Record<string, any>[]>(SEED_INVENTORY_RECORDS);

  // Grants & Logs
  const [vaultGrants, setVaultGrants] = useState<VaultGrant[]>([
    {
      id: 'vg-001',
      tenant_id: 'tenant-prod-001',
      user_id: 'u-3',
      user_email: 'ops.lead@vortiq.biz',
      department: 'inventory',
      granted_by_id: 'u-1',
      granted_by_name: 'Alex Vance',
      created_at: new Date().toISOString(),
    },
  ]);
  const [exportLogs, setExportLogs] = useState<VaultExportLog[]>(SEED_EXPORT_LOGS);
  const [importLogs, setImportLogs] = useState<VaultImportLog[]>(SEED_IMPORT_LOGS);
  const [correctionLogs, setCorrectionLogs] = useState<VaultCorrectionLog[]>([]);

  // Modal Control
  const [isExportPickerOpen, setIsExportPickerOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isGrantManagerOpen, setIsGrantManagerOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<VaultDepartment | 'all'>('crm');

  const isAdminOrOwner = user?.role === 'OWNER' || user?.role === 'ADMIN';

  // Determine allowed departments for current user
  const allowedDepartments = useMemo(() => {
    if (isAdminOrOwner) return ['crm', 'hr', 'finance', 'inventory'] as VaultDepartment[];

    const baseDept: VaultDepartment[] = [];
    if (user?.role === 'MANAGER' || user?.role === 'MEMBER') {
      baseDept.push('crm');
    }

    const explicitDepts = vaultGrants
      .filter((g) => g.user_email === user?.email)
      .map((g) => g.department);

    return Array.from(new Set([...baseDept, ...explicitDepts]));
  }, [user, isAdminOrOwner, vaultGrants]);

  // Current active dataset
  const currentDataset = useMemo(() => {
    switch (activeDept) {
      case 'crm': return crmData;
      case 'hr': return hrData;
      case 'finance': return financeData;
      case 'inventory': return inventoryData;
      default: return [];
    }
  }, [activeDept, crmData, hrData, financeData, inventoryData]);

  const handleConfirmExport = (format: ExportFormat) => {
    const newLog: VaultExportLog = {
      id: `vel-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      user_id: user?.id || 'u-1',
      user_name: user?.full_name || 'Alex Vance',
      user_email: user?.email || 'admin@vortiq.biz',
      department: exportScope,
      format,
      rows_count: exportScope === 'all' ? crmData.length + hrData.length + financeData.length + inventoryData.length : currentDataset.length,
      created_at: new Date().toISOString(),
    };

    setExportLogs([newLog, ...exportLogs]);
  };

  const handleImportComplete = (dept: VaultDepartment, rows: Record<string, any>[], overwriteLogs: any[]) => {
    if (dept === 'crm') setCrmData((prev) => [...rows, ...prev]);
    if (dept === 'hr') setHrData((prev) => [...rows, ...prev]);
    if (dept === 'finance') setFinanceData((prev) => [...rows, ...prev]);
    if (dept === 'inventory') setInventoryData((prev) => [...rows, ...prev]);

    const newLog: VaultImportLog = {
      id: `vil-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      user_id: user?.id || 'u-1',
      user_name: user?.full_name || 'Alex Vance',
      user_email: user?.email || 'admin@vortiq.biz',
      department: dept,
      rows_imported: rows.length,
      rows_skipped: 0,
      rows_warned: 0,
      created_at: new Date().toISOString(),
    };

    setImportLogs([newLog, ...importLogs]);

    if (overwriteLogs.length > 0) {
      const newCorrections: VaultCorrectionLog[] = overwriteLogs.map((l, i) => ({
        id: `vcl-${Date.now()}-${i}`,
        tenant_id: 'tenant-prod-001',
        user_id: user?.id || 'u-1',
        user_name: user?.full_name || 'Alex Vance',
        department: dept,
        entity_type: dept.toUpperCase(),
        entity_id: l.entity_id,
        field_name: l.field_name,
        old_value: l.old_value,
        new_value: l.new_value,
        created_at: new Date().toISOString(),
      }));
      setCorrectionLogs([...newCorrections, ...correctionLogs]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Submodule Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" />
              Data Vault & Portability Layer
            </h1>
            <Badge variant="emerald" size="sm" className="font-mono font-bold">Department-Scoped RLS</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Permissioned Live View • Multi-Format Exports • 4-Step Bulk Importers • Overwrite Audit Logs
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Switcher */}
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
            {[
              { id: 'crm', label: 'CRM Leads' },
              { id: 'hr', label: 'HR Vault' },
              { id: 'finance', label: 'Finance' },
              { id: 'inventory', label: 'Inventory' },
            ].map(({ id, label }) => {
              const isAllowed = allowedDepartments.includes(id as VaultDepartment);
              return (
                <button
                  key={id}
                  disabled={!isAllowed}
                  onClick={() => {
                    if (isAllowed) {
                      setActiveDept(id as VaultDepartment);
                      setSearchQuery('');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeDept === id
                      ? 'bg-brand-500 text-dark-bg font-bold shadow-md'
                      : isAllowed
                      ? 'text-slate-400 hover:text-slate-200 cursor-pointer'
                      : 'text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  {!isAllowed && <Lock className="w-3 h-3 text-slate-600" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Import Button */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={() => setIsImporterOpen(true)}
          >
            Bulk Import
          </Button>

          {/* Export Department Data */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => {
              setExportScope(activeDept);
              setIsExportPickerOpen(true);
            }}
          >
            Export {activeDept.toUpperCase()}
          </Button>

          {/* Owner/Admin Controls */}
          {isAdminOrOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Building2 className="w-3.5 h-3.5 text-amber-400" />}
                onClick={() => {
                  setExportScope('all');
                  setIsExportPickerOpen(true);
                }}
              >
                Export All Departments
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserCheck className="w-3.5 h-3.5 text-violet-400" />}
                onClick={() => setIsGrantManagerOpen(true)}
              >
                Grants ({vaultGrants.length})
              </Button>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<History className="w-3.5 h-3.5 text-sky-400" />}
                onClick={() => setIsAuditModalOpen(true)}
              >
                Audit Logs ({exportLogs.length + importLogs.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Spreadsheet Grid */}
      <SpreadsheetGrid
        department={activeDept}
        data={currentDataset}
        activeSearch={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Modals */}
      {isExportPickerOpen && (
        <ExportFormatPicker
          isOpen={isExportPickerOpen}
          onClose={() => setIsExportPickerOpen(false)}
          department={exportScope}
          recordsCount={exportScope === 'all' ? crmData.length + hrData.length + financeData.length + inventoryData.length : currentDataset.length}
          onConfirmExport={handleConfirmExport}
        />
      )}

      {isImporterOpen && (
        <UniversalBulkImporterModal
          isOpen={isImporterOpen}
          onClose={() => setIsImporterOpen(false)}
          department={activeDept}
          onImportComplete={handleImportComplete}
        />
      )}

      {isGrantManagerOpen && (
        <VaultGrantManager
          isOpen={isGrantManagerOpen}
          onClose={() => setIsGrantManagerOpen(false)}
          grants={vaultGrants}
          onAddGrant={(g) => setVaultGrants([g, ...vaultGrants])}
        />
      )}

      {isAuditModalOpen && (
        <VaultAuditLogModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          exportLogs={exportLogs}
          importLogs={importLogs}
          correctionLogs={correctionLogs}
        />
      )}
    </div>
  );
};
