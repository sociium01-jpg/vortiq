import { InventoryItem, PhotoAttachment as BasePhotoAttachment } from '@/types';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ExtendedInventoryItem extends InventoryItem {
  unit?: string;
  location?: string;
  status: StockStatus;
  stock_status?: StockStatus;
  photo_count?: number;
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
