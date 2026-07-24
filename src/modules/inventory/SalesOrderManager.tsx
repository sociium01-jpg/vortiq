// ─────────────────────────────────────────────────────────────
// Vortiq Sales Order Manager & Drop-Shipment Workflow
// SO fulfillment, Drop-shipping, & Finance Invoice Integration
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, Select } from '@/design-system';
import { SalesOrder, Vendor, SEED_SALES_ORDERS, SEED_VENDORS, ExtendedInventoryItem } from './types';
import { FileText, Plus, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export interface SalesOrderManagerProps {
  items: ExtendedInventoryItem[];
}

export const SalesOrderManager: React.FC<SalesOrderManagerProps> = ({ items }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(SEED_SALES_ORDERS);
  const [vendors] = useState<Vendor[]>(SEED_VENDORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceNotification, setInvoiceNotification] = useState<string | null>(null);

  // New SO State
  const [customerName, setCustomerName] = useState('Apollo Hospital Procurement');
  const [customerEmail] = useState('procurement@apollo.com');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [orderQty, setOrderQty] = useState('10');
  const [isDropShip, setIsDropShip] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find((i) => i.id === selectedItemId);
    const vendor = vendors.find((v) => v.id === selectedVendorId);
    const qty = parseInt(orderQty) || 1;
    const price = item?.unit_price || 1000;

    const newSO: SalesOrder = {
      id: `so-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      so_number: `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: customerName,
      customer_email: customerEmail,
      status: 'confirmed',
      is_dropship: isDropShip,
      vendor_id: isDropShip ? selectedVendorId : undefined,
      vendor_name: isDropShip ? vendor?.name : undefined,
      total_amount: qty * price,
      items: [
        {
          item_id: selectedItemId,
          sku: item?.sku || 'SKU-001',
          name: item?.name || 'Item Name',
          quantity: qty,
          unit_price: price,
          total_price: qty * price,
          is_dropshipped: isDropShip,
        },
      ],
      created_at: new Date().toISOString(),
    };

    setSalesOrders([newSO, ...salesOrders]);
    setIsModalOpen(false);
  };

  const handleConvertToInvoice = (so: SalesOrder) => {
    setSalesOrders((prev) =>
      prev.map((s) => (s.id === so.id ? { ...s, status: 'invoiced' } : s))
    );
    setInvoiceNotification(
      `Sales Order ${so.so_number} converted into Finance Invoice draft for customer ${so.customer_name} (₹${so.total_amount.toLocaleString('en-IN')})!`
    );
    setTimeout(() => setInvoiceNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast Banner */}
      {invoiceNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{invoiceNotification}</span>
        </div>
      )}

      {/* Sales Orders Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              Sales Orders & Drop-Shipments ({salesOrders.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Manage customer orders, drop-shipping, and Finance Invoice integration</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Sales Order
          </Button>
        </div>

        <div className="space-y-3">
          {salesOrders.map((so) => (
            <div key={so.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-mono">{so.so_number}</span>
                  <Badge variant={so.status === 'invoiced' ? 'emerald' : so.status === 'confirmed' ? 'violet' : 'slate'} size="sm">
                    {so.status}
                  </Badge>
                  {so.is_dropship && <Badge variant="amber" size="sm" className="font-mono">Drop-Shipped</Badge>}
                </div>
                <p className="text-2xs text-slate-300 font-display font-semibold">Customer: {so.customer_name}</p>
                {so.is_dropship && (
                  <p className="text-2xs text-amber-300 font-mono flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Routed directly to Vendor: {so.vendor_name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black font-mono text-emerald-400">₹{so.total_amount.toLocaleString('en-IN')}</span>

                {so.status !== 'invoiced' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ArrowRight className="w-3.5 h-3.5 text-brand-400" />}
                    onClick={() => handleConvertToInvoice(so)}
                  >
                    Convert to Finance Invoice
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Sales Order Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Customer Sales Order"
          maxWidth="md"
        >
          <form onSubmit={handleCreateSO} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Customer Name</label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
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

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Quantity</label>
              <Input
                type="number"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                required
              />
            </div>

            <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDropShip}
                  onChange={(e) => setIsDropShip(e.target.checked)}
                  className="rounded border-dark-border text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs font-bold text-slate-200 font-display">Mark as Drop-Shipment Order</span>
              </label>
              <p className="text-2xs text-slate-400 font-mono">
                Order will be routed directly to vendor for direct customer delivery without touching local warehouse stock.
              </p>

              {isDropShip && (
                <div className="pt-2">
                  <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Fulfilling Vendor</label>
                  <Select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    options={vendors.map((v) => ({ value: v.id, label: v.name }))}
                  />
                </div>
              )}
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<FileText className="w-4 h-4" />}>
              Generate Sales Order
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
