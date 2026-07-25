// ─────────────────────────────────────────────────────────────
// Vortiq Data Vault — Live Spreadsheet-Style Grid Component
// Sortable, filterable, live data grid matching department schemas
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { Card, Input, Badge } from '@/design-system';
import { VaultDepartment, DEPARTMENT_SCHEMAS, GridColumnDef } from './types';
import { Search, ArrowUpDown, Database } from 'lucide-react';

interface SpreadsheetGridProps {
  department: VaultDepartment;
  data: Record<string, any>[];
  activeSearch: string;
  onSearchChange: (val: string) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  department,
  data,
  activeSearch,
  onSearchChange,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

    // Sort by column
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, activeSearch, sortColumn, sortDirection]);

  const formatCellValue = (row: Record<string, any>, col: GridColumnDef) => {
    const raw = row[col.key];
    if (raw == null || raw === '') return <span className="text-slate-600 font-mono">-</span>;

    if (col.type === 'currency') {
      const num = typeof raw === 'number' ? raw : parseFloat(raw) || 0;
      return (
        <span className="font-mono text-emerald-400 font-semibold">
          ₹{num.toLocaleString('en-IN')}
        </span>
      );
    }

    if (col.type === 'badge') {
      const valStr = String(raw).toUpperCase();
      let variant: 'emerald' | 'amber' | 'violet' | 'rose' | 'sky' = 'violet';
      if (['WON', 'ACTIVE', 'PAID', 'QUALIFIED'].includes(valStr)) variant = 'emerald';
      if (['NEW', 'PENDING', 'PARTIALLY_PAID', 'URGENT'].includes(valStr)) variant = 'amber';
      if (['LOST', 'REVOKED', 'REJECTED'].includes(valStr)) variant = 'rose';
      return <Badge variant={variant} size="sm" className="font-mono text-2xs uppercase">{valStr}</Badge>;
    }

    if (col.type === 'date') {
      return <span className="font-mono text-slate-400 text-2xs">{new Date(raw).toLocaleDateString()}</span>;
    }

    if (col.type === 'number') {
      return <span className="font-mono text-slate-200">{raw}</span>;
    }

    return <span className="text-slate-200">{String(raw)}</span>;
  };

  return (
    <Card className="p-4 bg-dark-card border-dark-border space-y-4 shadow-sm">
      {/* Grid Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">
            Live {department.toUpperCase()} Department Dataset ({processedData.length} records)
          </h3>
        </div>

        <div className="flex items-center gap-2 max-w-xs w-full">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/60">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400 text-xs font-sans">
                  No live records found for department "{department}".
                </td>
              </tr>
            ) : (
              processedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-dark-surface/40 transition-colors">
                  <td className="p-3 text-center text-slate-500 font-mono text-2xs">{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className={`p-3 ${col.type === 'currency' ? 'text-right' : ''}`}>
                      {formatCellValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
