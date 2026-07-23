// ─────────────────────────────────────────────────────────────
// Vortiq Finance — Form 26Q TDS Ledger Component
// Track & Audit TDS Deductions, Sections 194C, 194J, 192, and Challan Deposits
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Input, Select, Modal, Badge, DataTable, Column } from '@/design-system';
import { TdsRecord, formatINR } from './types';
import { ShieldCheck, Plus, CheckCircle, Clock } from 'lucide-react';

export interface TdsLedgerProps {
  tdsRecords: TdsRecord[];
  onUpdateTdsRecord: (updatedRecord: TdsRecord) => void;
}

export const TdsLedger: React.FC<TdsLedgerProps> = ({
  tdsRecords,
  onUpdateTdsRecord,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');
  const [selectedFY, setSelectedFY] = useState<string>('2026-27');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<TdsRecord | null>(null);
  const [challanNumber, setChallanNumber] = useState<string>('');
  const [depositDate, setDepositDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filter records
  const filteredRecords = tdsRecords.filter((rec) => {
    if (selectedFY !== 'ALL' && rec.financial_year !== selectedFY) return false;
    if (selectedSection !== 'ALL' && rec.section_code !== selectedSection) return false;
    if (selectedQuarter !== 'ALL' && rec.quarter !== selectedQuarter) return false;
    return true;
  });

  // Calculate Summary metrics
  const totalBasePaise = filteredRecords.reduce((sum, r) => sum + r.base_amount_paise, 0);
  const totalTdsPaise = filteredRecords.reduce((sum, r) => sum + r.tds_amount_paise, 0);
  const depositedTdsPaise = filteredRecords
    .filter((r) => r.challan_number)
    .reduce((sum, r) => sum + r.tds_amount_paise, 0);
  const pendingTdsPaise = totalTdsPaise - depositedTdsPaise;

  const handleOpenDepositModal = (record: TdsRecord) => {
    setActiveRecord(record);
    setChallanNumber(record.challan_number || `CHL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setDepositDate(record.deposit_date || new Date().toISOString().split('T')[0]);
    setDepositModalOpen(true);
  };

  const handleSaveChallan = () => {
    if (!activeRecord) return;
    const updated: TdsRecord = {
      ...activeRecord,
      challan_number: challanNumber.trim(),
      deposit_date: depositDate,
    };
    onUpdateTdsRecord(updated);
    setDepositModalOpen(false);
  };

  const columns: Column<TdsRecord>[] = [
    {
      key: 'section_code',
      header: 'TDS Section',
      sortable: true,
      render: (r) => (
        <Badge variant={r.section_code === '194J' ? 'violet' : r.section_code === '194C' ? 'blue' : 'amber'} size="sm">
          Sec {r.section_code} ({r.tds_rate_percent}%)
        </Badge>
      ),
    },
    {
      key: 'deductee_pan',
      header: 'Deductee PAN',
      sortable: true,
      render: (r) => <span className="font-mono text-slate-100 font-semibold">{r.deductee_pan}</span>,
    },
    {
      key: 'quarter',
      header: 'Quarter / FY',
      sortable: true,
      render: (r) => <span className="font-mono text-slate-300">{r.quarter || 'Q2'} • FY {r.financial_year}</span>,
    },
    {
      key: 'base_amount_paise',
      header: 'Base Taxable (₹)',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-slate-200 text-right block">
          {formatINR(r.base_amount_paise)}
        </span>
      ),
    },
    {
      key: 'tds_amount_paise',
      header: 'TDS Deducted (₹)',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-rose-400 font-bold text-right block">
          {formatINR(r.tds_amount_paise)}
        </span>
      ),
    },
    {
      key: 'challan_number',
      header: 'Challan Status',
      sortable: true,
      render: (r) =>
        r.challan_number ? (
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{r.challan_number}</span>
            </div>
            <div className="text-2xs text-slate-400 font-mono">Paid {r.deposit_date}</div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDepositModal(r)}
            leftIcon={<Plus className="w-3 h-3 text-amber-400" />}
            className="text-2xs py-1"
          >
            Log Challan
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
            Form 26Q / TDS Ledger (India Tax Compliance)
          </h2>
          <p className="text-xs text-slate-400">
            Track tax deducted at source under 194C, 194J, and 192 for quarterly e-TDS filing returns.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-dark-surface/60 border-dark-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Financial Year (FY)"
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            options={[
              { value: '2026-27', label: 'FY 2026-27' },
              { value: '2025-26', label: 'FY 2025-26' },
              { value: 'ALL', label: 'All Financial Years' },
            ]}
          />

          <Select
            label="TDS Section Category"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Sections (194C, 194J, 192)' },
              { value: '194J', label: 'Sec 194J - Professional / Tech Fees (10%)' },
              { value: '194C', label: 'Sec 194C - Contractor Payments (2%)' },
              { value: '192', label: 'Sec 192 - Salaries (10%)' },
            ]}
          />

          <Select
            label="Quarter Filter"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Quarters (Q1 - Q4)' },
              { value: 'Q1', label: 'Q1 (Apr - Jun)' },
              { value: 'Q2', label: 'Q2 (Jul - Sep)' },
              { value: 'Q3', label: 'Q3 (Oct - Dec)' },
              { value: 'Q4', label: 'Q4 (Jan - Mar)' },
            ]}
          />
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Total Taxable Base</div>
          <div className="text-xl font-bold font-mono text-slate-100">{formatINR(totalBasePaise)}</div>
          <div className="text-2xs text-slate-400">{filteredRecords.length} TDS entries</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Total TDS Deducted</div>
          <div className="text-xl font-bold font-mono text-rose-400">{formatINR(totalTdsPaise)}</div>
          <div className="text-2xs text-slate-400">Form 26Q liability</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Deposited (Challan ITNS 281)</div>
          <div className="text-xl font-bold font-mono text-emerald-400">{formatINR(depositedTdsPaise)}</div>
          <div className="text-2xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Deposited to Govt
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Pending Deposit</div>
          <div className="text-xl font-bold font-mono text-amber-400">{formatINR(pendingTdsPaise)}</div>
          <div className="text-2xs text-amber-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Awaiting Challan
          </div>
        </Card>
      </div>

      {/* TDS Records Table */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search deductee PAN, section..."
        emptyTitle="No TDS Records Found"
        emptyDescription="No TDS deductions match the active section or quarter filter."
      />

      {/* Log Challan Modal */}
      <Modal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title="Log Govt TDS Challan Deposit (ITNS 281)"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveChallan}>
              Confirm Challan Record
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {activeRecord && (
            <div className="p-3 bg-dark-surface/60 rounded-lg border border-dark-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Deductee PAN:</span>
                <span className="font-mono text-slate-100 font-semibold">{activeRecord.deductee_pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Section:</span>
                <span className="text-slate-200">Sec {activeRecord.section_code}</span>
              </div>
              <div className="flex justify-between font-mono font-bold pt-1 border-t border-dark-border">
                <span className="text-slate-300">TDS Amount to Deposit:</span>
                <span className="text-rose-400">{formatINR(activeRecord.tds_amount_paise)}</span>
              </div>
            </div>
          )}

          <Input
            label="Challan Identification Number (CIN / BSR)"
            value={challanNumber}
            onChange={(e) => setChallanNumber(e.target.value)}
            placeholder="e.g. CHL-2026-0711"
            className="font-mono"
          />

          <Input
            label="Deposit Date"
            type="date"
            value={depositDate}
            onChange={(e) => setDepositDate(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
