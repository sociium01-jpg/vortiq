import { InventoryItem } from '@/types';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ExtendedInventoryItem extends InventoryItem {
  stock_status: StockStatus;
  photo_count: number;
  last_photo_url?: string;
  notes?: string;
}

export interface InventoryFilterState {
  searchTerm: string;
  category: string;
  warehouseLocation: string;
  lowStockOnly: boolean;
}

export interface PhotoCapturePayload {
  inventory_item_id: string;
  sku: string;
  image_url: string;
  caption: string;
  warehouse_location: string;
  file_size_bytes?: number;
  uploaded_by: string;
}

export interface CameraState {
  isActive: boolean;
  facingMode: 'user' | 'environment';
  flash: boolean;
  isScanningSKU: boolean;
  capturedPreview: string | null;
}
