// ─────────────────────────────────────────────────────────────
// Vortiq Inventory Module Types (Zoho Inventory Parity 2026)
// Multi-tenant scoped by tenant_id
// ─────────────────────────────────────────────────────────────

import { PhotoAttachment as BasePhotoAttachment } from '@/types';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type SectorStandard = 'GS1' | 'UNSPSC';

export interface Warehouse {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  address: string;
  is_primary: boolean;
  item_count?: number;
}

export interface InventoryBatch {
  id: string;
  tenant_id: string;
  item_id: string;
  batch_number: string;
  mfg_date?: string;
  expiry_date?: string;
  quantity_on_hand: number;
}

export interface SerialNumber {
  id: string;
  tenant_id: string;
  item_id: string;
  serial_number: string;
  status: 'available' | 'sold' | 'returned' | 'reserved';
}

export interface CompositeComponent {
  component_item_id: string;
  component_sku: string;
  component_name: string;
  quantity_required: number;
}

export interface Vendor {
  id: string;
  tenant_id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  gstin?: string;
  address?: string;
}

export interface PurchaseOrderItem {
  item_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PurchaseOrder {
  id: string;
  tenant_id: string;
  vendor_id: string;
  vendor_name: string;
  po_number: string;
  status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled';
  total_amount: number;
  items: PurchaseOrderItem[];
  created_at: string;
}

export interface SalesOrderItem {
  item_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_dropshipped?: boolean;
}

export interface SalesOrder {
  id: string;
  tenant_id: string;
  so_number: string;
  customer_name: string;
  customer_email?: string;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'invoiced' | 'cancelled';
  is_dropship: boolean;
  vendor_id?: string;
  vendor_name?: string;
  total_amount: number;
  items: SalesOrderItem[];
  created_at: string;
}

export interface InterWarehouseTransfer {
  id: string;
  tenant_id: string;
  transfer_number: string;
  source_warehouse_name: string;
  dest_warehouse_name: string;
  status: 'draft' | 'in_transit' | 'received' | 'cancelled';
  items_summary: string;
  created_at: string;
}

export interface ExtendedInventoryItem {
  id: string;
  tenant_id: string;
  sku: string;
  name: string;
  category?: string;
  unit?: string;
  quantity?: number;
  quantity_on_hand?: number;
  min_quantity?: number;
  reorder_point?: number;
  reorder_threshold?: number;
  unit_price?: number;
  location?: string;
  warehouse_location?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  status?: StockStatus;
  stock_status?: StockStatus;
  photo_count?: number;
  created_at?: string;
  updated_at?: string;

  // Extended Zoho Parity Attributes
  gs1_gtin?: string; // EAN-13 / GTIN barcode
  batch_tracking_enabled?: boolean;
  serial_tracking_enabled?: boolean;
  is_composite?: boolean;
  composite_components?: CompositeComponent[];
  batches?: InventoryBatch[];
  custom_fields?: Record<string, string>;
  vendor_id?: string;
  vendor_name?: string;
}

export type PhotoAttachment = BasePhotoAttachment & {
  sku?: string;
};

export interface PhotoCapturePayload {
  sku: string;
  location: string;
  imageUrl: string;
  notes?: string;
}

export interface CameraState {
  isActive: boolean;
  facingMode: 'user' | 'environment';
  flash: boolean;
}

// ── Seed Datasets ─────────────────────────────────────────────

export const SEED_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    tenant_id: 'tenant-prod-001',
    name: 'Mumbai Central Fulfillment Hub',
    code: 'WH-BOM-01',
    address: 'Bandra-Kurla Complex, Mumbai, MH 400051',
    is_primary: true,
    item_count: 142,
  },
  {
    id: 'wh-2',
    tenant_id: 'tenant-prod-001',
    name: 'Bengaluru South Distribution Depot',
    code: 'WH-BLR-02',
    address: 'Electronic City Phase 1, Bengaluru, KA 560100',
    is_primary: false,
    item_count: 89,
  },
];

export const SEED_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    tenant_id: 'tenant-prod-001',
    name: 'Apex Industrial Component Suppliers Ltd',
    contact_person: 'Ramesh Patel',
    email: 'orders@apexcomponents.in',
    phone: '+91 98201 44552',
    gstin: '27AAACA12341Z5',
    address: 'Andheri East, Mumbai, MH 400069',
  },
  {
    id: 'ven-2',
    tenant_id: 'tenant-prod-001',
    name: 'PharmaGrade Solutions Pvt Ltd',
    contact_person: 'Dr. Ananya Roy',
    email: 'supplies@pharmagrade.in',
    phone: '+91 98450 11223',
    gstin: '29AABCP98762Z1',
    address: 'Peenya Industrial Estate, Bengaluru, KA 560058',
  },
];

export const SEED_INVENTORY_ITEMS: ExtendedInventoryItem[] = [
  {
    id: 'inv-101',
    tenant_id: 'tenant-prod-001',
    sku: 'GS1-890123456701',
    gs1_gtin: '8901234567015',
    name: 'Amoxicillin 500mg Antibiotic Capsules (Pharma Grade)',
    category: 'Pharmaceuticals',
    unit: 'Boxes',
    quantity: 120,
    min_quantity: 50,
    reorder_point: 40,
    unit_price: 450,
    status: 'in_stock',
    warehouse_id: 'wh-1',
    warehouse_name: 'Mumbai Central Fulfillment Hub',
    batch_tracking_enabled: true,
    serial_tracking_enabled: false,
    is_composite: false,
    vendor_id: 'ven-2',
    vendor_name: 'PharmaGrade Solutions Pvt Ltd',
    custom_fields: {
      expiry_date: '2027-08-31',
      storage_temp: '2°C to 8°C (Refrigerated)',
    },
    batches: [
      { id: 'b-1', tenant_id: 'tenant-prod-001', item_id: 'inv-101', batch_number: 'AMX-2026-B89', mfg_date: '2026-01-10', expiry_date: '2027-08-31', quantity_on_hand: 120 },
    ],
  },
  {
    id: 'inv-102',
    tenant_id: 'tenant-prod-001',
    sku: 'GS1-890123456702',
    gs1_gtin: '8901234567022',
    name: 'Executive Ergonomic Smart Workstation Bundle',
    category: 'Furniture & Fixtures',
    unit: 'Kits',
    quantity: 14,
    min_quantity: 20,
    reorder_point: 15,
    unit_price: 32000,
    status: 'low_stock',
    warehouse_id: 'wh-1',
    warehouse_name: 'Mumbai Central Fulfillment Hub',
    batch_tracking_enabled: false,
    serial_tracking_enabled: false,
    is_composite: true,
    composite_components: [
      { component_item_id: 'sub-1', component_sku: 'SKU-DESK-01', component_name: 'Motorized Standing Desk Frame', quantity_required: 1 },
      { component_item_id: 'sub-2', component_sku: 'SKU-CHAIR-02', component_name: 'Mesh Ergonomic Task Chair', quantity_required: 1 },
    ],
    custom_fields: {
      dimensions: '140cm x 70cm x 75cm',
      warranty: '3 Years Comprehensive',
    },
  },
];

export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    tenant_id: 'tenant-prod-001',
    vendor_id: 'ven-2',
    vendor_name: 'PharmaGrade Solutions Pvt Ltd',
    po_number: 'PO-2026-0881',
    status: 'partially_received',
    total_amount: 45000,
    items: [
      { item_id: 'inv-101', sku: 'GS1-890123456701', name: 'Amoxicillin 500mg Antibiotic Capsules', quantity: 100, unit_price: 450, total_price: 45000 },
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const SEED_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-101',
    tenant_id: 'tenant-prod-001',
    so_number: 'SO-2026-4412',
    customer_name: 'Apollo Hospital Procurement Cell',
    customer_email: 'procurement@apollohospitals.com',
    status: 'confirmed',
    is_dropship: true,
    vendor_id: 'ven-2',
    vendor_name: 'PharmaGrade Solutions Pvt Ltd',
    total_amount: 320000,
    items: [
      { item_id: 'inv-102', sku: 'GS1-890123456702', name: 'Executive Ergonomic Smart Workstation Bundle', quantity: 10, unit_price: 32000, total_price: 320000, is_dropshipped: true },
    ],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const SEED_TRANSFERS: InterWarehouseTransfer[] = [
  {
    id: 'tr-101',
    tenant_id: 'tenant-prod-001',
    transfer_number: 'TR-2026-001',
    source_warehouse_name: 'Mumbai Central Fulfillment Hub',
    dest_warehouse_name: 'Bengaluru South Distribution Depot',
    status: 'in_transit',
    items_summary: '25x Executive Desk Kits (SKU: GS1-890123456702)',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];
