// ─────────────────────────────────────────────────────────────
// Vortiq Data Vault — Live Spreadsheet-Style Grid Component
// Sortable, filterable, live data grid with click-to-expand row detail inspector
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { Card, Input, Badge, Drawer } from '@/design-system';
import { VaultDepartment, DEPARTMENT_SCHEMAS, GridColumnDef } from './types';
import { Search, ArrowUpDown, Database, Eye, ShieldCheck } from 'lucide-react';

interface SpreadsheetGridProps {
  department: VaultDepartment;
  data: Record<string, any>[];
  activeSearch: string;
  onSearchChange: (val: string) => void;
  onNavigateToModule?: (moduleKey: string, recordId?: string) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  department,
  data,
  activeSearch,
  onSearchChange,
  onNavigateToModule,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRecord, setSelectedRecord] = useState<Record<string, any> | null>(null);

  const columns: GridColumnDef[] = DEPARTMENT_SCHEMAS[department] || [];

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search query across all string fields
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some(
          (val) => val != null && String(val).toLowerCase().includes(q)
        )
      );
    }

    // Sort if column selected
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [data, activeSearch, sortColumn, sortDirection]);

  const formatCellValue = (row: Record<string, any>, col: GridColumnDef) => {
    const val = row[col.key];

    if (val == null || val === '') {
      return <span className="text-slate-600 font-mono text-3xs">—</span>;
    }

    if (col.type === 'currency') {
      const num = typeof val === 'number' ? val : parseFloat(val);
      return (
        <span className="font-mono text-emerald-400 font-bold">
          ₹{isNaN(num) ? val : num.toLocaleString('en-IN')}
        </span>
      );
    }

    if (col.type === 'badge') {
      const strVal = String(val).toLowerCase();
      const variant =
        strVal === 'won' || strVal === 'active' || strVal === 'paid'
          ? 'emerald'
          : strVal === 'qualified' || strVal === 'pending'
          ? 'amber'
          : strVal === 'lost' || strVal === 'overdue'
          ? 'rose'
          : 'violet';

      return (
        <Badge variant={variant} size="sm" className="uppercase font-bold">
          {String(val)}
        </Badge>
      );
    }

    return <span className="text-slate-200">{String(val)}</span>;
  };

  const handleRowClick = (row: Record<string, any>) => {
    // If record is a Sales Lead, navigate directly to original CRM module view
    if (department === 'crm' && onNavigateToModule) {
      onNavigateToModule('crm', row.id);
      return;
    }

    // For HR, Finance, Inventory: open un-truncated row inspector drawer
    setSelectedRecord(row);
  };

  return (
    <Card className="p-5 bg-dark-card border-dark-border space-y-4 shadow-sm">
      {/* Grid Toolbar & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-display">
              {department.toUpperCase()} Department Master Vault
            </h3>
            <p className="text-3xs text-slate-400 font-mono mt-0.5">
              Showing {processedData.length} records • Click any row for un-truncated full detail
            </p>
          </div>
        </div>

        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder={`Filter ${department.toUpperCase()} records...`}
            value={activeSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
          />
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto border border-dark-border rounded-xl">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-dark-surface border-b border-dark-border text-2xs text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3 w-10 text-center text-slate-600">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="p-3 cursor-pointer hover:text-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              ))}
              <th className="p-3 w-16 text-center text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/60">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-8 text-center text-slate-400 text-xs font-sans">
                  No live records found for department "{department}".
                </td>
              </tr>
            ) : (
              processedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-brand-500/10 cursor-pointer transition-colors group"
                >
                  <td className="p-3 text-center text-slate-500 font-mono text-2xs">{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className={`p-3 ${col.type === 'currency' ? 'text-right' : ''}`}>
                      {formatCellValue(row, col)}
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      className="p-1 rounded-md text-slate-400 group-hover:text-brand-300 group-hover:bg-brand-500/20 transition-all"
                      title="Inspect Record Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Row Detail Drawer */}
      <Drawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={`${department.toUpperCase()} Record Detail Inspector`}
      >
        {selectedRecord && (
          <div className="space-y-6 font-mono text-xs text-slate-100 p-1">
            <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center justify-between">
              <span className="text-2xs font-bold text-brand-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                DEPARTMENT SCOPED VAULT ENTRY
              </span>
              <Badge variant="emerald" size="sm" className="uppercase font-bold">
                {department}
              </Badge>
            </div>

            {/* Un-truncated Key/Value Field Inspection */}
            <div className="space-y-3">
              <h4 className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Un-truncated Field Attributes</h4>
              <div className="space-y-2 border border-dark-border rounded-xl p-3 bg-dark-surface/60">
                {Object.entries(selectedRecord).map(([key, val]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-dark-border/40 pb-1.5 last:border-b-0">
                    <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-bold text-slate-100 break-all font-mono">
                      {val == null ? '—' : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </Card>
  );
};
