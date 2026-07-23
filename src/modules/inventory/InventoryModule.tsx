import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { auditLogger } from '@/lib/auditLogger';
import { StockTable } from './StockTable';
import { MobilePhotoCaptureView } from './MobilePhotoCaptureView';
import { ExtendedInventoryItem } from './types';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Modal,
  Toast,
  DataTable,
  Column,
} from '@/design-system';
import {
  Package,
  Plus,
  Camera,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'table' | 'mobile_capture' | 'movements'>('table');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Item State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [quantity, setQuantity] = useState('50');
  const [reorderThreshold, setReorderThreshold] = useState('15');
  const [location, setLocation] = useState('Warehouse 3B');

  // Inventory dataset
  const [items, setItems] = useState<ExtendedInventoryItem[]>([
    {
      id: 'inv-1',
      tenant_id: 't-1',
      sku: 'SKU-8891',
      name: 'Industrial Valve Coupling',
      category: 'Hardware',
      unit: 'pcs',
      quantity_on_hand: 120,
      reorder_threshold: 25,
      unit_price: 1450,
      location: 'Warehouse 1A',
      warehouse_location: 'Warehouse 1A',
      status: 'in_stock',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'inv-2',
      tenant_id: 't-1',
      sku: 'SK-1002',
      name: 'Hydraulic Seal SK-1002',
      category: 'Seals',
      unit: 'pcs',
      quantity_on_hand: 4,
      reorder_threshold: 15,
      unit_price: 890,
      location: 'Warehouse 3B',
      warehouse_location: 'Warehouse 3B',
      status: 'low_stock',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // Stock Movement History Log
  const [movements] = useState([
    {
      id: 'mov-1',
      sku: 'SKU-8891',
      type: 'in',
      quantity: 120,
      reason: 'Supplier Batch Delivery PO-9912',
      photoUrl: null,
      user: 'Alex Vance',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'mov-2',
      sku: 'SK-1002',
      type: 'out',
      quantity: 10,
      reason: 'Dispatch for Order #8821',
      photoUrl: null,
      user: 'Priya Sharma',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const handleCreateItem = () => {
    if (!sku || !name) return;
    const qtyNum = Number(quantity) || 0;
    const thresholdNum = Number(reorderThreshold) || 10;

    const newItem: ExtendedInventoryItem = {
      id: `inv-${Date.now()}`,
      tenant_id: 't-1',
      sku,
      name,
      category,
      unit: 'pcs',
      quantity_on_hand: qtyNum,
      reorder_threshold: thresholdNum,
      unit_price: 1250,
      location,
      warehouse_location: location,
      status: qtyNum <= thresholdNum ? 'low_stock' : 'in_stock',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setIsNewItemModalOpen(false);
    setSku('');
    setName('');
    setToastMessage(`Inventory item "${name}" (${sku}) added.`);
  };

  // Cross-cutting standing convention: Removal notifies Owner/Admin
  const handleRemoveItem = (itemId: string) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    auditLogger.notifyOwnerOnRemoval(
      tenant?.id || 't-1',
      'Inventory Stock Item',
      `${target.name} (SKU: ${target.sku})`,
      user?.full_name || 'Admin User',
      (notif) => setToastMessage(`${notif.title}: ${notif.message}`)
    );

    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,SKU,Name,Category,Quantity On Hand,Reorder Threshold,Location,Status\n' +
      items.map((i) => `${i.sku},"${i.name}",${i.category},${i.quantity_on_hand},${i.reorder_threshold},${i.location},${i.status}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vortiq_inventory_stock_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const movementColumns: Column<any>[] = [
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
      key: 'type',
      header: 'Movement',
      sortable: true,
      render: (item) => (
        <Badge variant={item.type === 'in' ? 'emerald' : 'rose'}>
          {item.type === 'in' ? `+${item.quantity} Stock In` : `-${item.quantity} Stock Out`}
        </Badge>
      ),
    },
    { key: 'sku', header: 'SKU Code', sortable: true, render: (item) => <span className="font-mono text-slate-200">{item.sku}</span> },
    { key: 'reason', header: 'Reason / PO Note', render: (item) => <span className="text-xs text-slate-300">{item.reason}</span> },
    { key: 'user', header: 'Performed By', render: (item) => <span className="text-xs text-slate-400">{item.user}</span> },
  ];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          id="inv-toast"
          type="info"
          title="Inventory Stock Alert"
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            Inventory & Warehouse Floor Photo Capture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stock register, mobile photo capture verification, low stock alerts, and stock movement logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
            onClick={handleExportCSV}
          >
            Export Stock CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewItemModalOpen(true)}
          >
            Add Stock Item
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {items.some((i) => i.quantity_on_hand <= i.reorder_threshold) && (
        <Card className="bg-amber-950/20 border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-200">Low Stock Warning Triggered</h4>
              <p className="text-2xs text-slate-400">
                1 item has fallen below reorder threshold. In-app reorder notifications queued.
              </p>
            </div>
          </div>
          <Badge variant="amber">Immediate PO Needed</Badge>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-dark-surface/60 p-1 rounded-xl border border-dark-border w-fit">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'table' ? 'bg-amber-500 text-dark-bg' : 'text-slate-300 hover:text-white'
          }`}
        >
          Stock Register
        </button>

        <button
          onClick={() => setActiveTab('mobile_capture')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'mobile_capture' ? 'bg-amber-500 text-dark-bg' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Mobile Floor Photo Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'movements' ? 'bg-amber-500 text-dark-bg' : 'text-slate-300 hover:text-white'
          }`}
        >
          Stock Movement Log
        </button>
      </div>

      {/* Viewport */}
      {activeTab === 'table' && (
        <StockTable
          items={items}
          onRemoveItem={handleRemoveItem}
          onAdjustQuantity={(id: string, delta: number) => {
            setItems((prev) =>
              prev.map((i) => (i.id === id ? { ...i, quantity_on_hand: Math.max(0, i.quantity_on_hand + delta) } : i))
            );
            setToastMessage('Stock quantity adjusted.');
          }}
        />
      )}

      {activeTab === 'mobile_capture' && (
        <MobilePhotoCaptureView
          items={items}
          onPhotoUploaded={(payload: any) => {
            setToastMessage(`Warehouse photo uploaded for SKU "${payload.sku || 'Stock Item'}". Attached as evidence.`);
          }}
        />
      )}

      {activeTab === 'movements' && (
        <DataTable
          columns={movementColumns}
          data={movements}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search stock movement logs by SKU or reason..."
        />
      )}

      {/* New Item Modal */}
      <Modal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        title="Add New Inventory Stock Item"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsNewItemModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateItem}>Save Item</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="SKU Code" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. SKU-8891" />
          <Input label="Item Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Industrial Valve Coupling" />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'Hardware', label: 'Hardware' },
              { value: 'Seals', label: 'Seals & Gaskets' },
              { value: 'Electrical', label: 'Electrical Components' },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Initial Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="50" />
            <Input label="Reorder Threshold" value={reorderThreshold} onChange={(e) => setReorderThreshold(e.target.value)} placeholder="15" />
          </div>
          <Input label="Warehouse Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Warehouse 3B" />
        </div>
      </Modal>
    </div>
  );
};
