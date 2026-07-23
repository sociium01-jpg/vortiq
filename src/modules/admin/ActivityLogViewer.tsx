import React, { useState } from 'react';
import { DataTable, Badge, Column } from '@/design-system';
import { History } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  entityType: string;
  entityName: string;
  action: 'field_correction' | 'role_change' | 'user_invited' | 'entity_removed';
  fieldName?: string;
  beforeValue?: string;
  afterValue?: string;
  performedBy: string;
}

export const ActivityLogViewer: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: 'log-101',
      timestamp: new Date().toISOString(),
      entityType: 'Lead',
      entityName: 'Fintech Corp (Priya Sharma)',
      action: 'field_correction',
      fieldName: 'phone',
      beforeValue: '+91 98200 00000',
      afterValue: '+91 98200 12345',
      performedBy: 'Alex Vance (Admin)',
    },
    {
      id: 'log-102',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      entityType: 'TeamMember',
      entityName: 'Rajesh Kumar',
      action: 'role_change',
      fieldName: 'role',
      beforeValue: 'MEMBER',
      afterValue: 'MANAGER',
      performedBy: 'Alex Vance (Owner)',
    },
    {
      id: 'log-103',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      entityType: 'InventoryItem',
      entityName: 'Hydraulic Seal SK-1002',
      action: 'entity_removed',
      performedBy: 'Priya Sharma (Admin)',
    },
    {
      id: 'log-104',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      entityType: 'TeamMember',
      entityName: 'Sneha Patel',
      action: 'user_invited',
      performedBy: 'Alex Vance (Admin)',
    },
  ]);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-2xs text-slate-400">
          {new Date(item.timestamp).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action Type',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.action === 'entity_removed'
              ? 'rose'
              : item.action === 'role_change'
              ? 'amber'
              : item.action === 'field_correction'
              ? 'blue'
              : 'emerald'
          }
        >
          {item.action.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'entityName',
      header: 'Target Entity',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-slate-100">{item.entityName}</div>
          <div className="text-2xs text-slate-400 font-mono">{item.entityType}</div>
        </div>
      ),
    },
    {
      key: 'changes',
      header: 'Before / After Change Log',
      render: (item) =>
        item.fieldName ? (
          <div className="font-mono text-2xs">
            <span className="text-[#8D93AC]">{item.fieldName}:</span>{' '}
            <span className="text-rose-400 line-through mr-1">{item.beforeValue}</span>
            <span className="text-emerald-400">→ {item.afterValue}</span>
          </div>
        ) : (
          <span className="text-2xs text-slate-500">-</span>
        ),
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      sortable: true,
      render: (item) => <span className="text-xs text-slate-300">{item.performedBy}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" />
            Audit Traceability & Activity Log
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Filterable audit log recording before/after database field corrections, removals, and role changes.
          </p>
        </div>
        <Badge variant="emerald">DPDP Compliant Audit Trail</Badge>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Filter activity logs by user or entity..."
      />
    </div>
  );
};
