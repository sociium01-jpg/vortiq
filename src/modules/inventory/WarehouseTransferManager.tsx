// ─────────────────────────────────────────────────────────────
// Vortiq Multi-Warehouse & Inter-Warehouse Stock Transfers
// Zoho Inventory Parity
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, Select } from '@/design-system';
import { Warehouse, InterWarehouseTransfer, SEED_WAREHOUSES, SEED_TRANSFERS, ExtendedInventoryItem } from './types';
import { Building2, ArrowRightLeft, Plus, Truck } from 'lucide-react';

export interface WarehouseTransferManagerProps {
  items: ExtendedInventoryItem[];
}

export const WarehouseTransferManager: React.FC<WarehouseTransferManagerProps> = ({ items }) => {
  const [warehouses] = useState<Warehouse[]>(SEED_WAREHOUSES);
  const [transfers, setTransfers] = useState<InterWarehouseTransfer[]>(SEED_TRANSFERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transfer Form State
  const [sourceWh, setSourceWh] = useState(warehouses[0]?.name || '');
  const [destWh, setDestWh] = useState(warehouses[1]?.name || '');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [transferQty, setTransferQty] = useState('10');

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const selItem = items.find((i) => i.id === selectedItemId);

    const newTransfer: InterWarehouseTransfer = {
      id: `tr-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      transfer_number: `TR-2026-${Math.floor(100 + Math.random() * 900)}`,
      source_warehouse_name: sourceWh,
      dest_warehouse_name: destWh,
      status: 'in_transit',
      items_summary: `${transferQty}x ${selItem?.name || 'Stock Item'} (SKU: ${selItem?.sku})`,
      created_at: new Date().toISOString(),
    };

    setTransfers([newTransfer, ...transfers]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Warehouses Directory Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-400" />
          Active Warehouse Locations ({warehouses.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((wh) => (
            <Card key={wh.id} className="p-4 bg-dark-card border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-display text-sm">{wh.name}</span>
                  {wh.is_primary && <Badge variant="violet" size="sm">Primary Hub</Badge>}
                </div>
                <Badge variant="slate" size="sm" className="font-mono">{wh.code}</Badge>
              </div>
              <p className="text-2xs text-slate-400 font-mono">{wh.address}</p>
              <div className="pt-2 border-t border-dark-border flex items-center justify-between text-2xs text-slate-300 font-mono">
                <span>Stored SKUs: {wh.item_count} items</span>
                <span className="text-emerald-400 font-bold">Operational 100%</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Transfer Orders Section */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              Inter-Warehouse Transfer Orders ({transfers.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Track stock movements between fulfillment centers</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Transfer Order
          </Button>
        </div>

        <div className="space-y-2">
          {transfers.map((tr) => (
            <div key={tr.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 font-mono">{tr.transfer_number}</span>
                  <Badge variant={tr.status === 'received' ? 'emerald' : tr.status === 'in_transit' ? 'amber' : 'slate'} size="sm">
                    {tr.status}
                  </Badge>
                </div>
                <p className="text-2xs text-slate-300 font-display font-semibold">{tr.items_summary}</p>
                <p className="text-2xs text-slate-400 font-mono">
                  From: <span className="text-brand-300">{tr.source_warehouse_name}</span> $\rightarrow$ To: <span className="text-emerald-300">{tr.dest_warehouse_name}</span>
                </p>
              </div>

              <div className="text-right text-2xs text-slate-400 font-mono">
                {new Date(tr.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Transfer Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Inter-Warehouse Stock Transfer Order"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTransfer} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Source Warehouse</label>
              <Select
                value={sourceWh}
                onChange={(e) => setSourceWh(e.target.value)}
                options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Destination Warehouse</label>
              <Select
                value={destWh}
                onChange={(e) => setDestWh(e.target.value)}
                options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Item to Transfer</label>
              <Select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                options={items.map((i) => ({ value: i.id, label: `${i.name} (Qty: ${i.quantity ?? i.quantity_on_hand ?? 0})` }))}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Transfer Quantity</label>
              <Input
                type="number"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                required
              />
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Truck className="w-4 h-4" />}>
              Dispatch Stock Transfer
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
