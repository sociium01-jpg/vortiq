import React, { useState, useMemo } from 'react';
import { ExtendedInventoryItem } from './types';
import { PhotoAttachment } from '@/types';
import { StockTable } from './StockTable';
import { MobilePhotoCaptureView } from './MobilePhotoCaptureView';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Modal,
  Drawer,
  EmptyState,
  Toast,
} from '@/design-system';
import {
  Package,
  AlertTriangle,
  Camera,
  IndianRupee,
  Plus,
  Layers,
  Image as ImageIcon,
  Smartphone,
  Maximize2,
  MapPin,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Filter,
} from 'lucide-react';

// Initial Mock Inventory Items
const initialInventoryItems: ExtendedInventoryItem[] = [
  {
    id: 'inv-101',
    tenant_id: 'tenant-demo',
    sku: 'SKU-STEEL-001',
    name: 'Cold Rolled Steel Sheet (2.5mm)',
    category: 'Raw Materials',
    quantity_on_hand: 42,
    reorder_threshold: 100,
    unit_price: 4500,
    warehouse_location: 'Warehouse A, Aisle 12, Bay B',
    stock_status: 'low_stock',
    photo_count: 3,
    last_photo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-07-20T14:30:00Z',
  },
  {
    id: 'inv-102',
    tenant_id: 'tenant-demo',
    sku: 'SKU-MCU-8051',
    name: 'Industrial Microcontroller Unit (32-bit)',
    category: 'Electronics',
    quantity_on_hand: 1250,
    reorder_threshold: 300,
    unit_price: 850,
    warehouse_location: 'Cleanroom B, Drawer 4C',
    stock_status: 'in_stock',
    photo_count: 2,
    last_photo_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-06-05T11:20:00Z',
    updated_at: '2026-07-21T09:15:00Z',
  },
  {
    id: 'inv-103',
    tenant_id: 'tenant-demo',
    sku: 'SKU-BEAR-6205',
    name: 'Deep Groove Ball Bearing 25x52x15mm',
    category: 'Hardware',
    quantity_on_hand: 8,
    reorder_threshold: 50,
    unit_price: 320,
    warehouse_location: 'Warehouse B, Shelf 3',
    stock_status: 'out_of_stock',
    photo_count: 1,
    last_photo_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-06-10T08:45:00Z',
    updated_at: '2026-07-22T16:00:00Z',
  },
  {
    id: 'inv-104',
    tenant_id: 'tenant-demo',
    sku: 'SKU-VALVE-DN50',
    name: 'High Pressure Stainless Steel Gate Valve',
    category: 'Piping & Valves',
    quantity_on_hand: 180,
    reorder_threshold: 40,
    unit_price: 12500,
    warehouse_location: 'Yard C, Pallet Rack 08',
    stock_status: 'in_stock',
    photo_count: 4,
    last_photo_url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-06-12T14:10:00Z',
    updated_at: '2026-07-22T11:20:00Z',
  },
  {
    id: 'inv-105',
    tenant_id: 'tenant-demo',
    sku: 'SKU-LUB-ISO68',
    name: 'Synthetic Industrial Hydraulic Lubricant (20L)',
    category: 'Chemicals & Oils',
    quantity_on_hand: 25,
    reorder_threshold: 30,
    unit_price: 6800,
    warehouse_location: 'HazMat Cell 2, Drum Stand A',
    stock_status: 'low_stock',
    photo_count: 2,
    created_at: '2026-06-15T09:30:00Z',
    updated_at: '2026-07-19T13:45:00Z',
  },
  {
    id: 'inv-106',
    tenant_id: 'tenant-demo',
    sku: 'SKU-BOX-HVY02',
    name: 'Corrugated 5-Ply Master Shipping Box',
    category: 'Packaging',
    quantity_on_hand: 3400,
    reorder_threshold: 500,
    unit_price: 65,
    warehouse_location: 'Warehouse A, Mezzanine Level',
    stock_status: 'in_stock',
    photo_count: 1,
    created_at: '2026-06-18T16:00:00Z',
    updated_at: '2026-07-23T08:30:00Z',
  },
  {
    id: 'inv-107',
    tenant_id: 'tenant-demo',
    sku: 'SKU-HELM-SAFE',
    name: 'ANSI Certified Heavy Duty Safety Helmet (Yellow)',
    category: 'Safety Gear',
    quantity_on_hand: 0,
    reorder_threshold: 20,
    unit_price: 890,
    warehouse_location: 'PPE Store, Locker 12',
    stock_status: 'out_of_stock',
    photo_count: 1,
    created_at: '2026-06-20T12:00:00Z',
    updated_at: '2026-07-23T10:15:00Z',
  },
  {
    id: 'inv-108',
    tenant_id: 'tenant-demo',
    sku: 'SKU-FAST-M10X50',
    name: 'High Tensile Bolt Grade 8.8 M10x50mm',
    category: 'Hardware',
    quantity_on_hand: 8500,
    reorder_threshold: 1000,
    unit_price: 14,
    warehouse_location: 'Hardware Bins, Bin 402',
    stock_status: 'in_stock',
    photo_count: 2,
    created_at: '2026-06-22T10:00:00Z',
    updated_at: '2026-07-22T14:10:00Z',
  },
];

// Initial Photo Attachments
const initialPhotos: PhotoAttachment[] = [
  {
    id: 'p-1',
    tenant_id: 'tenant-demo',
    inventory_item_id: 'inv-101',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    file_size_bytes: 542000,
    uploaded_by: 'Rajesh Kumar (Floor Lead)',
    caption: 'Sheet batch audit - minor surface oxidation checked OK.',
    created_at: '2026-07-20T14:30:00Z',
  },
  {
    id: 'p-2',
    tenant_id: 'tenant-demo',
    inventory_item_id: 'inv-102',
    image_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
    file_size_bytes: 412000,
    uploaded_by: 'Ananya Sharma (QA Eng)',
    caption: 'Reel verification barcode scanned prior to assembly line dispatch.',
    created_at: '2026-07-21T09:15:00Z',
  },
  {
    id: 'p-3',
    tenant_id: 'tenant-demo',
    inventory_item_id: 'inv-103',
    image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    file_size_bytes: 620000,
    uploaded_by: 'Vikram Singh (Warehouse Mgr)',
    caption: 'Low stock count photo audit - only 8 units left on Shelf 3.',
    created_at: '2026-07-22T16:00:00Z',
  },
  {
    id: 'p-4',
    tenant_id: 'tenant-demo',
    inventory_item_id: 'inv-104',
    image_url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
    file_size_bytes: 780000,
    uploaded_by: 'Rajesh Kumar (Floor Lead)',
    caption: 'Heavy valve shipment unboxed at Pallet Rack 08.',
    created_at: '2026-07-22T11:20:00Z',
  },
];

export const InventoryModule: React.FC = () => {
  // Main State
  const [items, setItems] = useState<ExtendedInventoryItem[]>(initialInventoryItems);
  const [photos, setPhotos] = useState<PhotoAttachment[]>(initialPhotos);
  const [activeTab, setActiveTab] = useState<'stock' | 'mobile_capture' | 'gallery'>('stock');

  // Drawer & Modal States
  const [selectedItem, setSelectedItem] = useState<ExtendedInventoryItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<ExtendedInventoryItem | null>(null);
  const [adjustQuantityChange, setAdjustQuantityChange] = useState<number>(0);
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Mobile capture target preselection state
  const [captureTargetItemId, setCaptureTargetItemId] = useState<string | undefined>();

  // Lightbox modal state
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('ALL');

  // Toast alert state
  const [toastInfo, setToastInfo] = useState<{ title: string; message: string } | null>(null);

  // New Item Form State
  const [newItemData, setNewItemData] = useState({
    sku: '',
    name: '',
    category: 'Hardware',
    quantity_on_hand: 100,
    reorder_threshold: 25,
    unit_price: 500,
    warehouse_location: 'Warehouse A, Shelf 1',
  });

  // KPI Calculations
  const totalStockItems = items.length;

  const lowStockItems = useMemo(
    () => items.filter((i) => i.quantity_on_hand <= i.reorder_threshold),
    [items]
  );

  const totalInventoryValue = useMemo(
    () => items.reduce((acc, curr) => acc + curr.quantity_on_hand * curr.unit_price, 0),
    [items]
  );

  const totalPhotosCount = photos.length;

  // Handle Photo Upload Callback from Mobile View
  const handlePhotoUploaded = (newPhoto: PhotoAttachment, itemSku?: string) => {
    setPhotos((prev) => [newPhoto, ...prev]);

    // Update photo count for corresponding item
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === newPhoto.inventory_item_id) {
          return {
            ...item,
            photo_count: item.photo_count + 1,
            last_photo_url: newPhoto.image_url,
          };
        }
        return item;
      })
    );

    setToastInfo({
      title: 'Photo Uploaded & Linked',
      message: `Audit photo linked to SKU ${itemSku || 'inventory item'}.`,
    });
  };

  // Handle Adding New Stock Item
  const handleCreateNewItem = () => {
    if (!newItemData.sku || !newItemData.name) return;

    const qty = Number(newItemData.quantity_on_hand) || 0;
    const threshold = Number(newItemData.reorder_threshold) || 0;

    let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (qty === 0) status = 'out_of_stock';
    else if (qty <= threshold) status = 'low_stock';

    const created: ExtendedInventoryItem = {
      id: `inv-${Date.now()}`,
      tenant_id: 'tenant-demo',
      sku: newItemData.sku.toUpperCase(),
      name: newItemData.name,
      category: newItemData.category,
      quantity_on_hand: qty,
      reorder_threshold: threshold,
      unit_price: Number(newItemData.unit_price) || 0,
      warehouse_location: newItemData.warehouse_location,
      stock_status: status,
      photo_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setItems((prev) => [created, ...prev]);
    setIsAddItemModalOpen(false);
    setNewItemData({
      sku: '',
      name: '',
      category: 'Hardware',
      quantity_on_hand: 100,
      reorder_threshold: 25,
      unit_price: 500,
      warehouse_location: 'Warehouse A, Shelf 1',
    });

    setToastInfo({
      title: 'Stock Item Created',
      message: `${created.name} (${created.sku}) added to inventory registry.`,
    });
  };

  // Handle Stock Quantity Adjustment
  const handleConfirmStockAdjustment = () => {
    if (!adjustItem) return;

    const newQty = Math.max(0, adjustItem.quantity_on_hand + adjustQuantityChange);
    let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (newQty === 0) status = 'out_of_stock';
    else if (newQty <= adjustItem.reorder_threshold) status = 'low_stock';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === adjustItem.id) {
          return {
            ...item,
            quantity_on_hand: newQty,
            stock_status: status,
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    setIsAdjustStockModalOpen(false);
    setAdjustItem(null);
    setAdjustQuantityChange(0);
    setAdjustNotes('');

    setToastInfo({
      title: 'Stock Level Updated',
      message: `Adjusted ${adjustItem.sku} on hand quantity to ${newQty} units.`,
    });
  };

  // Open Mobile Capture with Preselected Item
  const handleTriggerMobileCapture = (item?: ExtendedInventoryItem) => {
    if (item) {
      setCaptureTargetItemId(item.id);
    }
    setActiveTab('mobile_capture');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastInfo && (
        <Toast
          id="inv-toast"
          type="success"
          title={toastInfo.title}
          message={toastInfo.message}
          onDismiss={() => setToastInfo(null)}
        />
      )}

      {/* Main Module Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-dark-card via-dark-surface to-dark-card border border-dark-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-dark-bg shadow-lg shadow-brand-500/20 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 font-display tracking-tight">
                Inventory & Mobile Photo Capture
              </h1>
              <Badge variant="emerald" size="sm">Module C</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time multi-location warehouse stock tracking, threshold alert engine, and mobile floor photo audits.
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Smartphone className="w-4 h-4 text-brand-400" />}
            onClick={() => handleTriggerMobileCapture()}
          >
            Mobile Capture View
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddItemModalOpen(true)}
          >
            Add Stock Item
          </Button>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-500 bg-dark-card p-4 flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Stock SKUs
            </div>
            <div className="text-xl font-extrabold text-slate-100 mt-1 font-mono">
              {totalStockItems}
            </div>
            <div className="text-2xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <Layers className="w-3 h-3 text-brand-400" /> Across 4 Warehouses
            </div>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
            <Package className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500 bg-dark-card p-4 flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Alerts
            </div>
            <div className="text-xl font-extrabold text-rose-400 mt-1 font-mono flex items-center gap-2">
              {lowStockItems.length}
              {lowStockItems.length > 0 && (
                <Badge variant="rose" size="sm" dot>Requires Action</Badge>
              )}
            </div>
            <div className="text-2xs text-rose-400/80 mt-1 font-mono flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Reorder thresholds reached
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-dark-card p-4 flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory Valuation
            </div>
            <div className="text-xl font-extrabold text-slate-100 mt-1 font-mono">
              ₹{totalInventoryValue.toLocaleString('en-IN')}
            </div>
            <div className="text-2xs text-blue-400 mt-1 font-mono flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Total Asset Value
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-violet-500 bg-dark-card p-4 flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              Audit Photos Uploaded
            </div>
            <div className="text-xl font-extrabold text-slate-100 mt-1 font-mono">
              {totalPhotosCount}
            </div>
            <div className="text-2xs text-violet-400 mt-1 font-mono flex items-center gap-1">
              <Camera className="w-3 h-3" /> Floor mobile uploads
            </div>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Critical Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <Card className="bg-rose-500/10 border-rose-500/30 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
                  Stock Level Warning: {lowStockItems.length} SKUs Below Reorder Threshold
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Items requiring immediate reorder: {' '}
                  <span className="font-mono text-rose-300 font-semibold">
                    {lowStockItems.map((i) => i.sku).join(', ')}
                  </span>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/40 text-rose-300 hover:bg-rose-500/20 shrink-0 text-xs"
              onClick={() => setActiveTab('stock')}
            >
              Review Low Stock Register
            </Button>
          </div>
        </Card>
      )}

      {/* Tab Switcher Navigation */}
      <div className="flex items-center gap-2 border-b border-dark-border pb-3">
        <Button
          variant={activeTab === 'stock' ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Package className="w-4 h-4" />}
          onClick={() => setActiveTab('stock')}
        >
          Stock Register ({items.length})
        </Button>

        <Button
          variant={activeTab === 'mobile_capture' ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<Smartphone className="w-4 h-4" />}
          onClick={() => setActiveTab('mobile_capture')}
        >
          Mobile Floor Photo Mode
        </Button>

        <Button
          variant={activeTab === 'gallery' ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={<ImageIcon className="w-4 h-4" />}
          onClick={() => setActiveTab('gallery')}
        >
          Photo Attachment Gallery ({photos.length})
        </Button>
      </div>

      {/* TAB 1: STOCK MANAGEMENT TABLE */}
      {activeTab === 'stock' && (
        <StockTable
          items={items}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setIsDetailDrawerOpen(true);
          }}
          onCapturePhoto={(item) => handleTriggerMobileCapture(item)}
          onAdjustStock={(item) => {
            setAdjustItem(item);
            setAdjustQuantityChange(0);
            setIsAdjustStockModalOpen(true);
          }}
          onAddNewItem={() => setIsAddItemModalOpen(true)}
        />
      )}

      {/* TAB 2: MOBILE PHOTO CAPTURE VIEW */}
      {activeTab === 'mobile_capture' && (
        <MobilePhotoCaptureView
          items={items}
          preselectedItemId={captureTargetItemId}
          onPhotoUploaded={handlePhotoUploaded}
          onClose={() => setActiveTab('stock')}
        />
      )}

      {/* TAB 3: PHOTO ATTACHMENT GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <Card className="p-4 bg-dark-surface/60 border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-100 font-display">
                Photo Gallery Filter
              </h3>
            </div>
            <div className="w-48">
              <Select
                value={galleryCategoryFilter}
                onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Photos' },
                  ...Array.from(new Set(items.map((i) => i.category || 'Uncategorized'))).map(
                    (cat) => ({ value: cat, label: cat })
                  ),
                ]}
              />
            </div>
          </Card>

          {photos.length === 0 ? (
            <EmptyState
              title="No Photo Attachments Yet"
              description="Switch to Mobile Photo Mode to snap floor audit pictures of inventory stock."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos
                .filter((p) => {
                  if (galleryCategoryFilter === 'ALL') return true;
                  const item = items.find((i) => i.id === p.inventory_item_id);
                  return item?.category === galleryCategoryFilter;
                })
                .map((photo) => {
                  const linkedItem = items.find((i) => i.id === photo.inventory_item_id);
                  return (
                    <Card
                      key={photo.id}
                      className="group cursor-pointer overflow-hidden p-0 bg-dark-card border-dark-border hover:border-brand-500/50 transition-all hover:shadow-xl"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                        <img
                          src={photo.image_url}
                          alt={photo.caption || 'Stock photo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="blue" size="sm" className="bg-black/60 backdrop-blur-md">
                            {linkedItem?.sku || 'SKU'}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/20">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                          {photo.caption || 'Inventory floor audit photo'}
                        </p>
                        <div className="flex items-center justify-between text-2xs text-slate-400 font-mono">
                          <span>{photo.uploaded_by || 'Floor Operator'}</span>
                          <span>
                            {new Date(photo.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* DRAWER: ITEM INSPECTOR & PHOTO AUDIT LOG */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedItem(null);
        }}
        title={`Item Details: ${selectedItem?.sku || ''}`}
      >
        {selectedItem && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-4 bg-dark-surface rounded-xl border border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="blue">{selectedItem.category || 'General'}</Badge>
                {selectedItem.stock_status === 'out_of_stock' ? (
                  <Badge variant="rose" dot>Out of Stock</Badge>
                ) : selectedItem.stock_status === 'low_stock' ? (
                  <Badge variant="amber" dot>Low Stock Warning</Badge>
                ) : (
                  <Badge variant="emerald" dot>In Stock</Badge>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-100">{selectedItem.name}</h3>
              <div className="text-xs font-mono text-slate-400">SKU Code: {selectedItem.sku}</div>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-dark-card rounded-xl border border-dark-border">
                <span className="text-2xs text-slate-400 uppercase font-mono">On Hand Qty</span>
                <div className="text-base font-mono font-bold text-slate-100 mt-1">
                  {selectedItem.quantity_on_hand.toLocaleString()} units
                </div>
              </div>

              <div className="p-3 bg-dark-card rounded-xl border border-dark-border">
                <span className="text-2xs text-slate-400 uppercase font-mono">Reorder Threshold</span>
                <div className="text-base font-mono font-bold text-amber-400 mt-1">
                  {selectedItem.reorder_threshold.toLocaleString()} units
                </div>
              </div>

              <div className="p-3 bg-dark-card rounded-xl border border-dark-border">
                <span className="text-2xs text-slate-400 uppercase font-mono">Unit Price</span>
                <div className="text-base font-mono font-bold text-slate-100 mt-1">
                  ₹{selectedItem.unit_price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 bg-dark-card rounded-xl border border-dark-border">
                <span className="text-2xs text-slate-400 uppercase font-mono">Total Value</span>
                <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                  ₹{(selectedItem.quantity_on_hand * selectedItem.unit_price).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Warehouse Location */}
            <div className="p-3 bg-dark-card rounded-xl border border-dark-border flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <span className="text-2xs font-semibold text-slate-400 uppercase font-mono">
                  Warehouse Location Tag
                </span>
                <p className="text-xs text-slate-200 font-mono mt-0.5">
                  {selectedItem.warehouse_location || 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<Camera className="w-3.5 h-3.5 text-brand-400" />}
                onClick={() => {
                  if (selectedItem) {
                    setIsDetailDrawerOpen(false);
                    handleTriggerMobileCapture(selectedItem);
                  }
                }}
              >
                Snap Photo
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (selectedItem) {
                    setAdjustItem(selectedItem);
                    setAdjustQuantityChange(0);
                    setIsDetailDrawerOpen(false);
                    setIsAdjustStockModalOpen(true);
                  }
                }}
              >
                Adjust Quantity
              </Button>
            </div>

            {/* Attached Photo Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 font-display flex items-center justify-between">
                <span>Attached Photos ({photos.filter((p) => p.inventory_item_id === selectedItem.id).length})</span>
                <Camera className="w-4 h-4 text-brand-400" />
              </h4>

              {photos.filter((p) => p.inventory_item_id === selectedItem.id).length === 0 ? (
                <EmptyState
                  title="No Audit Photos"
                  description="Use mobile mode to snap floor verification photos."
                />
              ) : (
                <div className="space-y-2">
                  {photos
                    .filter((p) => p.inventory_item_id === selectedItem.id)
                    .map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="p-2.5 bg-dark-card border border-dark-border rounded-xl flex items-center gap-3 cursor-pointer hover:border-brand-500/50 transition-colors"
                      >
                        <img
                          src={photo.image_url}
                          alt="Thumbnail"
                          className="w-12 h-12 rounded-lg object-cover border border-dark-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">
                            {photo.caption}
                          </p>
                          <div className="text-2xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(photo.created_at).toLocaleDateString()}
                            </span>
                            <span>• {photo.uploaded_by}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* MODAL: ADD NEW STOCK ITEM */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add New Inventory Item"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddItemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateNewItem}>
              Create Stock Item
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="SKU Code"
            placeholder="e.g. SKU-STEEL-99"
            value={newItemData.sku}
            onChange={(e) => setNewItemData({ ...newItemData, sku: e.target.value })}
          />

          <Input
            label="Product / Item Name"
            placeholder="e.g. Industrial Steel Plate"
            value={newItemData.name}
            onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
          />

          <Select
            label="Category"
            value={newItemData.category}
            onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
            options={[
              { value: 'Raw Materials', label: 'Raw Materials' },
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Hardware', label: 'Hardware' },
              { value: 'Piping & Valves', label: 'Piping & Valves' },
              { value: 'Chemicals & Oils', label: 'Chemicals & Oils' },
              { value: 'Packaging', label: 'Packaging' },
              { value: 'Safety Gear', label: 'Safety Gear' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity On Hand"
              type="number"
              value={newItemData.quantity_on_hand}
              onChange={(e) =>
                setNewItemData({ ...newItemData, quantity_on_hand: parseInt(e.target.value) || 0 })
              }
            />
            <Input
              label="Reorder Threshold"
              type="number"
              value={newItemData.reorder_threshold}
              onChange={(e) =>
                setNewItemData({ ...newItemData, reorder_threshold: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit Price (₹)"
              type="number"
              value={newItemData.unit_price}
              onChange={(e) =>
                setNewItemData({ ...newItemData, unit_price: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Warehouse Location"
              placeholder="e.g. Warehouse B, Bay 4"
              value={newItemData.warehouse_location}
              onChange={(e) =>
                setNewItemData({ ...newItemData, warehouse_location: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: ADJUST STOCK QUANTITY */}
      <Modal
        isOpen={isAdjustStockModalOpen}
        onClose={() => setIsAdjustStockModalOpen(false)}
        title={`Adjust Stock Quantity: ${adjustItem?.sku || ''}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAdjustStockModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmStockAdjustment}>
              Update Stock Level
            </Button>
          </>
        }
      >
        {adjustItem && (
          <div className="space-y-4">
            <div className="p-3 bg-dark-surface rounded-xl border border-dark-border flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-200">{adjustItem.name}</span>
                <div className="text-2xs text-slate-400 font-mono">Current: {adjustItem.quantity_on_hand} units</div>
              </div>
              <Badge variant="blue">Threshold: {adjustItem.reorder_threshold}</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-2xs uppercase font-mono font-semibold text-slate-400">
                Quantity Adjustment (+ or -)
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustQuantityChange((prev) => prev - 10)}
                >
                  -10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustQuantityChange((prev) => prev - 1)}
                >
                  -1
                </Button>
                <input
                  type="number"
                  value={adjustQuantityChange}
                  onChange={(e) => setAdjustQuantityChange(parseInt(e.target.value) || 0)}
                  className="w-24 text-center py-1.5 bg-dark-surface border border-dark-border rounded-lg font-mono text-sm font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustQuantityChange((prev) => prev + 1)}
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustQuantityChange((prev) => prev + 10)}
                >
                  +10
                </Button>
              </div>

              <div className="text-2xs text-slate-400 font-mono mt-1 text-center">
                New Calculated Total:{' '}
                <strong className="text-brand-400">
                  {Math.max(0, adjustItem.quantity_on_hand + adjustQuantityChange)} units
                </strong>
              </div>
            </div>

            <Input
              label="Adjustment Reason / Note"
              placeholder="e.g. Received new shipment batch / Physical inventory count correction"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
            />
          </div>
        )}
      </Modal>

      {/* LIGHTBOX MODAL: FULL PHOTO PREVIEW */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title="Photo Audit Attachment Preview"
        footer={
          <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>
            Close Lightbox
          </Button>
        }
      >
        {selectedPhoto && (
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black border border-dark-border">
              <img
                src={selectedPhoto.image_url}
                alt="Full photo preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-1 text-xs">
              <div className="font-semibold text-slate-200">{selectedPhoto.caption}</div>
              <div className="flex justify-between text-2xs text-slate-400 font-mono pt-1">
                <span>Uploaded by: {selectedPhoto.uploaded_by}</span>
                <span>Date: {new Date(selectedPhoto.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryModule;
