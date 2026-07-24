// ─────────────────────────────────────────────────────────────
// Vortiq Purchase Order & Goods Received Notes (GRN) Lifecycle
// Vendor management, PO issuing, & automated stock updates
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, Select } from '@/design-system';
import { PurchaseOrder, Vendor, SEED_PURCHASE_ORDERS, SEED_VENDORS, ExtendedInventoryItem } from './types';
import { ShoppingCart, Plus, User, PackageCheck } from 'lucide-react';

export interface PurchaseOrderManagerProps {
  items: ExtendedInventoryItem[];
}

export const PurchaseOrderManager: React.FC<PurchaseOrderManagerProps> = ({ items }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(SEED_PURCHASE_ORDERS);
  const [vendors] = useState<Vendor[]>(SEED_VENDORS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New PO State
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [orderQty, setOrderQty] = useState('50');
  const [unitPrice, setUnitPrice] = useState('450');

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v) => v.id === selectedVendorId);
    const item = items.find((i) => i.id === selectedItemId);
    const qty = parseInt(orderQty) || 1;
    const price = parseFloat(unitPrice) || 0;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      vendor_id: selectedVendorId,
      vendor_name: vendor?.name || 'Vendor Supplier',
      po_number: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'sent',
      total_amount: qty * price,
      items: [
        {
          item_id: selectedItemId,
          sku: item?.sku || 'SKU-001',
          name: item?.name || 'Item Name',
          quantity: qty,
          unit_price: price,
          total_price: qty * price,
        },
      ],
      created_at: new Date().toISOString(),
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setIsModalOpen(false);
  };

  const handleReceiveGoodsGRN = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'received' } : po))
    );
  };

  return (
    <div className="space-y-6">
      {/* Vendors Directory Header */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" />
          Approved Supplier Vendors ({vendors.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <Card key={v.id} className="p-4 bg-dark-card border-dark-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 font-display text-xs">{v.name}</span>
                {v.gstin && <Badge variant="emerald" size="sm" className="font-mono">GSTIN: {v.gstin}</Badge>}
              </div>
              <p className="text-2xs text-slate-400 font-mono">Contact: {v.contact_person} • {v.email} • {v.phone}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Purchase Orders Lifecycle Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Purchase Orders & Goods Receipts ({purchaseOrders.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Manage PO issuance and Goods Received Notes (GRN)</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Issue Purchase Order
          </Button>
        </div>

        <div className="space-y-3">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-mono">{po.po_number}</span>
                  <Badge variant={po.status === 'received' ? 'emerald' : po.status === 'sent' ? 'amber' : 'slate'} size="sm">
                    {po.status}
                  </Badge>
                </div>
                <p className="text-2xs text-slate-300 font-mono">Vendor: <span className="text-brand-300">{po.vendor_name}</span></p>
                <p className="text-2xs text-slate-400 font-mono">
                  Items: {po.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black font-mono text-emerald-400">₹{po.total_amount.toLocaleString('en-IN')}</span>

                {po.status !== 'received' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<PackageCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    onClick={() => handleReceiveGoodsGRN(po.id)}
                  >
                    Receive Goods (GRN)
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create PO Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Issue New Vendor Purchase Order (PO)"
          maxWidth="md"
        >
          <form onSubmit={handleCreatePO} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Select Supplier Vendor</label>
              <Select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                options={vendors.map((v) => ({ value: v.id, label: v.name }))}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Item to Order</label>
              <Select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                options={items.map((i) => ({ value: i.id, label: `${i.name} (SKU: ${i.sku})` }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Order Quantity</label>
                <Input
                  type="number"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Unit Price (₹)</label>
                <Input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<ShoppingCart className="w-4 h-4" />}>
              Issue Purchase Order
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
