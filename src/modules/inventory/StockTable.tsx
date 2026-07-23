import React, { useState, useMemo } from 'react';
import { ExtendedInventoryItem } from './types';
import {
  DataTable,
  Column,
  Badge,
  Button,
  Select,
  Card,
} from '@/design-system';
import {
  Camera,
  AlertTriangle,
  MapPin,
  SlidersHorizontal,
  Package,
  Layers,
  Edit3,
} from 'lucide-react';

export interface StockTableProps {
  items: ExtendedInventoryItem[];
  isLoading?: boolean;
  onSelectItem?: (item: ExtendedInventoryItem) => void;
  onCapturePhoto?: (item: ExtendedInventoryItem) => void;
  onAdjustStock?: (item: ExtendedInventoryItem) => void;
  onAddNewItem?: () => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  items,
  isLoading = false,
  onSelectItem,
  onCapturePhoto,
  onAdjustStock,
  onAddNewItem,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  // Extract unique categories and warehouses for filter options
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const warehouses = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.warehouse_location) {
        const loc = item.warehouse_location.split(',')[0].trim();
        set.add(loc);
      }
    });
    return Array.from(set);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      if (warehouseFilter !== 'ALL' && !item.warehouse_location?.includes(warehouseFilter)) {
        return false;
      }
      if (lowStockOnly && item.quantity_on_hand > item.reorder_threshold) {
        return false;
      }
      return true;
    });
  }, [items, categoryFilter, warehouseFilter, lowStockOnly]);

  const columns: Column<ExtendedInventoryItem>[] = [
    {
      key: 'sku',
      header: 'SKU & Code',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1.5">
              {item.sku}
              {item.photo_count > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 text-2xs font-sans rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  <Camera className="w-2.5 h-2.5" />
                  {item.photo_count}
                </span>
              )}
            </div>
            <div className="text-2xs text-slate-400 font-mono">Ref #{item.id.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Item Description',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-slate-100 text-xs">{item.name}</div>
          {item.category && (
            <div className="mt-0.5">
              <Badge variant="blue" size="sm">
                {item.category}
              </Badge>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'warehouse_location',
      header: 'Location',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-mono">{item.warehouse_location || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'quantity_on_hand',
      header: 'On Hand / Threshold',
      sortable: true,
      render: (item) => {
        const isLow = item.quantity_on_hand <= item.reorder_threshold;
        return (
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
              <span className={isLow ? 'text-rose-400' : 'text-slate-100'}>
                {item.quantity_on_hand.toLocaleString()} units
              </span>
              {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
            </div>
            <div className="text-2xs text-slate-400 font-mono">
              Reorder threshold: {item.reorder_threshold.toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-200 text-xs font-medium">
          ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'stock_status',
      header: 'Status',
      sortable: true,
      render: (item) => {
        if (item.stock_status === 'out_of_stock') {
          return <Badge variant="rose" dot>Out of Stock</Badge>;
        }
        if (item.stock_status === 'low_stock') {
          return <Badge variant="amber" dot>Low Stock</Badge>;
        }
        return <Badge variant="emerald" dot>In Stock</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-2xs"
            leftIcon={<Camera className="w-3 h-3 text-brand-400" />}
            onClick={() => onCapturePhoto?.(item)}
          >
            Photo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-2xs text-slate-300"
            leftIcon={<Edit3 className="w-3 h-3" />}
            onClick={() => onAdjustStock?.(item)}
          >
            Adjust
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Table Filters & Header Bar */}
      <Card className="bg-dark-surface/60 border-dark-border p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-100 font-display">
              Filter Stock Register
            </h3>
            <span className="text-2xs text-slate-400 font-mono">
              ({filteredItems.length} of {items.length} items)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  ...categories.map((cat) => ({ value: cat, label: cat })),
                ]}
              />
            </div>

            <div className="w-44">
              <Select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Warehouses' },
                  ...warehouses.map((wh) => ({ value: wh, label: wh })),
                ]}
              />
            </div>

            <Button
              variant={lowStockOnly ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setLowStockOnly(!lowStockOnly)}
              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              {lowStockOnly ? 'Showing Low Stock' : 'Low Stock Only'}
            </Button>

            {onAddNewItem && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAddNewItem}
                leftIcon={<Layers className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Add Item
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Stock DataTable */}
      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by SKU, product name, or warehouse location..."
        emptyTitle="No stock items found"
        emptyDescription="No inventory records match your search or filter parameters."
        onRowClick={(item) => onSelectItem?.(item)}
      />
    </div>
  );
};
