// ─────────────────────────────────────────────────────────────
// Vortiq Inventory Module (Zoho Inventory Parity 2026)
// Multi-warehouse tracking, Purchase Orders, Sales Orders & Drop-ship,
// Barcode scanning, and GS1 Sector Templates
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { StockTable } from './StockTable';
import { WarehouseTransferManager } from './WarehouseTransferManager';
import { PurchaseOrderManager } from './PurchaseOrderManager';
import { SalesOrderManager } from './SalesOrderManager';
import { BarcodeScannerView } from './BarcodeScannerView';
import { GS1SectorTemplateManager } from './GS1SectorTemplateManager';
import { ExtendedInventoryItem, SEED_INVENTORY_ITEMS } from './types';
import { Button, Badge, Modal, Input } from '@/design-system';
import {
  Package,
  Plus,
  Building2,
  ShoppingCart,
  FileText,
  ScanBarcode,
  ShieldCheck,
  AlertTriangle,
  Flag,
  PhoneCall,
} from 'lucide-react';

type TabView = 'stock' | 'transfers' | 'purchase_orders' | 'sales_orders' | 'barcode' | 'gs1_templates';

export const InventoryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('stock');
  const [items, setItems] = useState<ExtendedInventoryItem[]>(SEED_INVENTORY_ITEMS);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  // New Item Form
  const [sku, setSku] = useState('');
  const [gtin, setGtin] = useState('');
  const [name, setName] = useState('');
  const [category] = useState('Pharmaceuticals');
  const [quantity, setQuantity] = useState('50');
  const [minQty, setMinQty] = useState('20');
  const [unitPrice, setUnitPrice] = useState('500');

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity) || 10;

    const newItem: ExtendedInventoryItem = {
      id: `inv-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      sku: sku || `SKU-${Date.now()}`,
      gs1_gtin: gtin || '8901234567890',
      name: name || 'New Inventory Item',
      category: category,
      unit: 'Boxes',
      quantity: qty,
      quantity_on_hand: qty,
      min_quantity: parseInt(minQty) || 20,
      reorder_point: parseInt(minQty) || 20,
      unit_price: parseFloat(unitPrice) || 500,
      status: qty <= 20 ? 'low_stock' : 'in_stock',
      warehouse_id: 'wh-1',
      warehouse_name: 'Mumbai Central Fulfillment Hub',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setIsNewItemModalOpen(false);

    if (qty <= 20) {
      setActiveAlert(`Low-Stock Alert: "${newItem.name}" is below reorder threshold (${qty} <= ${minQty})!`);
    }
  };

  const handleUpdateItemStock = (itemId: string, newQty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty, quantity_on_hand: newQty, status: newQty <= (i.min_quantity || i.reorder_point || 15) ? 'low_stock' : 'in_stock' } : i))
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner with Master Directive Flag & Call triggers */}
      {activeAlert && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{activeAlert}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<Flag className="w-3.5 h-3.5 text-rose-400" />}>
              Flag Item
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<PhoneCall className="w-3.5 h-3.5 text-emerald-400" />}>
              Call Vendor
            </Button>
          </div>
        </div>
      )}

      {/* Top Header & Submodule Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight">Inventory & Floor Operations</h1>
            <Badge variant="emerald" size="sm" className="font-mono font-bold">Zoho Inventory Parity</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Multi-Warehouse • Transfer Orders • POs & GRN • Sales Orders & Drop-ship • GS1 Barcodes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Submodule View Switcher */}
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
            {[
              { id: 'stock', label: 'Stock Directory', icon: Package },
              { id: 'transfers', label: 'Warehouses & Transfers', icon: Building2 },
              { id: 'purchase_orders', label: 'POs & Vendors', icon: ShoppingCart },
              { id: 'sales_orders', label: 'Sales & Drop-Ship', icon: FileText },
              { id: 'barcode', label: 'Barcode Scanner', icon: ScanBarcode },
              { id: 'gs1_templates', label: 'GS1 Sector Templates', icon: ShieldCheck },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabView)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewItemModalOpen(true)}
          >
            Add New Item
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'stock' && <StockTable items={items} />}

      {activeTab === 'transfers' && <WarehouseTransferManager items={items} />}

      {activeTab === 'purchase_orders' && <PurchaseOrderManager items={items} />}

      {activeTab === 'sales_orders' && <SalesOrderManager items={items} />}

      {activeTab === 'barcode' && (
        <BarcodeScannerView items={items} onUpdateStock={handleUpdateItemStock} />
      )}

      {activeTab === 'gs1_templates' && <GS1SectorTemplateManager />}

      {/* Add New Item Modal */}
      {isNewItemModalOpen && (
        <Modal
          isOpen={isNewItemModalOpen}
          onClose={() => setIsNewItemModalOpen(false)}
          title="Create New Inventory SKU Item"
          maxWidth="md"
        >
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">SKU Code</label>
                <Input
                  type="text"
                  placeholder="SKU-8891"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">GS1 GTIN / EAN-13 Barcode</label>
                <Input
                  type="text"
                  placeholder="8901234567890"
                  value={gtin}
                  onChange={(e) => setGtin(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Item Name *</label>
              <Input
                type="text"
                placeholder="Amoxicillin 500mg Capsules"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Stock Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Reorder Point</label>
                <Input
                  type="number"
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
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

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Package className="w-4 h-4" />}>
              Save Inventory SKU
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
