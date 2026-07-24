// ─────────────────────────────────────────────────────────────
// Vortiq Barcode Scanner & Photo Capture Surface
// GS1 GTIN / EAN-13 Barcode Scanning for fast Stock In/Out & Floor Photo Upload
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '@/design-system';
import { ExtendedInventoryItem } from './types';
import { ScanBarcode, Plus, Minus } from 'lucide-react';

export interface BarcodeScannerViewProps {
  items: ExtendedInventoryItem[];
  onUpdateStock: (itemId: string, newQty: number) => void;
}

export const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({ items, onUpdateStock }) => {
  const [barcodeInput, setBarcodeInput] = useState('8901234567015');
  const [scannedItem, setScannedItem] = useState<ExtendedInventoryItem | null>(items[0] || null);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  const handleScanBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    const found = items.find((i) => i.gs1_gtin === barcodeInput || i.sku.includes(barcodeInput));
    if (found) {
      setScannedItem(found);
      setScanNotification(`GS1 Barcode ${barcodeInput} matched item: "${found.name}"!`);
    } else {
      setScanNotification(`No item found matching GS1 Barcode ${barcodeInput}.`);
    }
    setTimeout(() => setScanNotification(null), 3000);
  };

  const handleAdjustStock = (delta: number) => {
    if (!scannedItem) return;
    const currentQty = scannedItem.quantity ?? scannedItem.quantity_on_hand ?? 0;
    const newQty = Math.max(0, currentQty + delta);
    onUpdateStock(scannedItem.id, newQty);
    setScannedItem({ ...scannedItem, quantity: newQty, quantity_on_hand: newQty });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {scanNotification && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-2xs text-brand-300 flex items-center gap-2 animate-pulse font-mono">
          <ScanBarcode className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{scanNotification}</span>
        </div>
      )}

      {/* Barcode Scanner Control Pane */}
      <Card className="p-6 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
              <ScanBarcode className="w-4 h-4 text-brand-400" />
              GS1 EAN-13 / GTIN Barcode Scanner
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">Use camera or hardware USB barcode scanner for rapid stock in/out</p>
          </div>
          <Badge variant="violet" size="sm" className="font-mono">GS1 Compliant</Badge>
        </div>

        <form onSubmit={handleScanBarcode} className="flex gap-3">
          <Input
            type="text"
            placeholder="Scan GTIN / EAN-13 Barcode (e.g. 8901234567015)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="font-mono text-sm"
          />
          <Button variant="primary" size="md" type="submit" leftIcon={<ScanBarcode className="w-4 h-4" />}>
            Scan Item
          </Button>
        </form>
      </Card>

      {/* Scanned Item Action Card */}
      {scannedItem && (
        <Card className="p-6 bg-dark-card border-dark-border space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-display">{scannedItem.name}</h2>
                <Badge variant="emerald" size="sm" className="font-mono">GTIN: {scannedItem.gs1_gtin || 'N/A'}</Badge>
              </div>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">
                SKU: {scannedItem.sku} • Warehouse: {scannedItem.warehouse_name || 'Mumbai Central'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xs text-slate-400 uppercase font-mono block">Current Stock</span>
              <span className="text-2xl font-black font-mono text-brand-400">
                {scannedItem.quantity ?? scannedItem.quantity_on_hand ?? 0} {scannedItem.unit || 'pcs'}
              </span>
            </div>
          </div>

          {/* Quick Adjustment Controls */}
          <div className="flex items-center justify-between p-4 bg-dark-surface/60 rounded-xl border border-dark-border">
            <span className="text-xs font-bold text-slate-200 font-display">Quick Stock Adjustments</span>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Minus className="w-4 h-4 text-rose-400" />}
                onClick={() => handleAdjustStock(-1)}
              >
                Stock Out (-1)
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4 text-emerald-400" />}
                onClick={() => handleAdjustStock(+1)}
              >
                Stock In (+1)
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
