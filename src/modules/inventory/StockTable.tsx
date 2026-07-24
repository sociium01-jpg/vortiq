// ─────────────────────────────────────────────────────────────
// Vortiq Inventory Stock Directory Table
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { ExtendedInventoryItem, StockStatus } from './types';
import { DataTable, Column, Badge } from '@/design-system';
import { Plus, Minus, Trash2 } from 'lucide-react';

export interface StockTableProps {
  items: ExtendedInventoryItem[];
  onRemoveItem?: (itemId: string) => void;
  onAdjustQuantity?: (itemId: string, delta: number) => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  items,
  onRemoveItem,
  onAdjustQuantity,
}) => {
  const getStatusBadge = (status?: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="emerald">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="amber">Low Stock Alert</Badge>;
      case 'out_of_stock':
        return <Badge variant="rose">Out of Stock</Badge>;
      default:
        return <Badge variant="slate">Unknown</Badge>;
    }
  };

  const columns: Column<ExtendedInventoryItem>[] = [
    {
      key: 'sku',
      header: 'SKU & Item Name',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-100 font-display">{item.name}</div>
          <div className="text-2xs text-slate-400 font-mono">
            SKU: {item.sku} {item.gs1_gtin ? `• GTIN: ${item.gs1_gtin}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-dark-surface border border-dark-border">
          {item.category || 'General'}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity on Hand',
      sortable: true,
      render: (item) => {
        const qty = item.quantity ?? item.quantity_on_hand ?? 0;
        const minQ = item.min_quantity ?? item.reorder_point ?? item.reorder_threshold ?? 15;
        const isLow = qty <= minQ;

        return (
          <div className="flex items-center gap-2 font-mono">
            <span className={`font-bold text-xs ${isLow ? 'text-amber-400 font-black' : 'text-slate-100'}`}>
              {qty} {item.unit || 'pcs'}
            </span>

            {onAdjustQuantity && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAdjustQuantity(item.id, -1)}
                  className="p-1 rounded bg-dark-surface border border-dark-border text-slate-400 hover:text-white"
                  title="Subtract 1 unit"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onAdjustQuantity(item.id, 1)}
                  className="p-1 rounded bg-dark-surface border border-dark-border text-slate-400 hover:text-white"
                  title="Add 1 unit"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Stock Status',
      sortable: true,
      render: (item) => getStatusBadge(item.status || item.stock_status),
    },
    {
      key: 'location',
      header: 'Warehouse Location',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-400 font-mono">
          {item.warehouse_name || item.location || item.warehouse_location || 'Mumbai Central'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          {onRemoveItem && (
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
              title="Remove Item (Triggers Owner/Admin Alert)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(item) => item.id}
      searchPlaceholder="Search inventory by SKU, GTIN barcode, name, or warehouse..."
    />
  );
};
