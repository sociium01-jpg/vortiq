import React, { useState, useRef } from 'react';
import { ExtendedInventoryItem } from './types';
import { PhotoAttachment } from '@/types';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Toast,
} from '@/design-system';
import {
  Camera,
  RotateCw,
  Zap,
  ZapOff,
  UploadCloud,
  CheckCircle2,
  ScanLine,
  FileImage,
  Tag,
  Clock,
  RefreshCw,
} from 'lucide-react';

export interface MobilePhotoCaptureViewProps {
  items: ExtendedInventoryItem[];
  onPhotoUploaded?: (photo: PhotoAttachment, itemSku?: string) => void;
  preselectedItemId?: string;
  onClose?: () => void;
}

export const MobilePhotoCaptureView: React.FC<MobilePhotoCaptureViewProps> = ({
  items,
  onPhotoUploaded,
  preselectedItemId,
  onClose,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || (items.length > 0 ? items[0].id : '')
  );
  const [caption, setCaption] = useState<string>('');
  const [locationOverride, setLocationOverride] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [flashTrigger, setFlashTrigger] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Local upload log session state
  const [sessionLog, setSessionLog] = useState<PhotoAttachment[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Simulated photo backgrounds (industrial warehouse / stock item themes)
  const samplePhotoUrls = [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
  ];

  // Handle Shutter Press
  const handleShutterCapture = () => {
    setIsCapturing(true);

    if (flashEnabled) {
      setFlashTrigger(true);
      setTimeout(() => setFlashTrigger(false), 250);
    }

    setTimeout(() => {
      // Pick a random sample image or create canvas snapshot
      const randomUrl = samplePhotoUrls[Math.floor(Math.random() * samplePhotoUrls.length)];
      setCapturedPhotoUrl(randomUrl);
      setIsCapturing(false);
      if (!caption && selectedItem) {
        setCaption(`Floor audit photo for ${selectedItem.sku} (${selectedItem.name})`);
      }
    }, 600);
  };

  // Simulate SKU Barcode Scanner
  const handleSimulateSKUScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Pick random item from items list
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        const item = items[randomIndex];
        setSelectedItemId(item.id);
        if (item.warehouse_location) {
          setLocationOverride(item.warehouse_location);
        }
      }
      setIsScanning(false);
    }, 1200);
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhotoUrl(reader.result as string);
        if (!caption && selectedItem) {
          setCaption(`Attached ${file.name} for ${selectedItem.sku}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Photo Save / Upload
  const handleSavePhoto = () => {
    if (!capturedPhotoUrl || !selectedItem) return;

    setIsUploading(true);

    setTimeout(() => {
      const newPhoto: PhotoAttachment = {
        id: `photo-${Date.now()}`,
        tenant_id: selectedItem.tenant_id,
        inventory_item_id: selectedItem.id,
        image_url: capturedPhotoUrl,
        file_size_bytes: Math.floor(Math.random() * 800000) + 400000,
        uploaded_by: 'Floor Manager (Mobile)',
        caption: caption || `Stock condition photo - ${selectedItem.sku}`,
        created_at: new Date().toISOString(),
      };

      setSessionLog((prev) => [newPhoto, ...prev]);
      onPhotoUploaded?.(newPhoto, selectedItem.sku);

      setIsUploading(false);
      setCapturedPhotoUrl(null);
      setCaption('');
      setUploadToast(`Photo attached to ${selectedItem.sku} successfully!`);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Toast Notification */}
      {uploadToast && (
        <Toast
          id="photo-toast"
          type="success"
          title="Photo Uploaded"
          message={uploadToast}
          onDismiss={() => setUploadToast(null)}
        />
      )}

      {/* Top Mobile Header Banner */}
      <Card className="bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border-brand-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-100 font-display tracking-tight">
                  Mobile Floor Scanner
                </h2>
                <Badge variant="emerald" size="sm" dot>Live Camera</Badge>
              </div>
              <p className="text-2xs text-slate-400 font-mono">
                Warehouse Floor Audit Mode • {facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}
              </p>
            </div>
          </div>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-2xs">
              Done
            </Button>
          )}
        </div>
      </Card>

      {/* Interactive Camera Viewport Simulator */}
      <Card className="p-3 bg-black border-dark-border relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Flash Effect Screen Overlay */}
        {flashTrigger && (
          <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90" />
        )}

        {/* Viewport Frame Box */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-dark-border/80 flex items-center justify-center">
          {capturedPhotoUrl ? (
            /* Display Captured Image Preview */
            <div className="relative w-full h-full">
              <img
                src={capturedPhotoUrl}
                alt="Captured stock item"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge variant="emerald" size="sm" className="bg-black/60 backdrop-blur-md border-emerald-500/50">
                  Ready to Attach
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setCapturedPhotoUrl(null)}
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black text-slate-200 text-xs font-medium flex items-center gap-1 backdrop-blur-md border border-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>
            </div>
          ) : (
            /* Live Camera Simulator Viewport */
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              {/* Animated Scan Line if Scanning */}
              {isScanning && (
                <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce z-20 top-1/3" />
              )}

              {/* Viewport Target Reticle Corners */}
              <div className="absolute inset-6 pointer-events-none border-2 border-brand-500/30 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-400 -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-400 -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-400 -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-400 -mb-0.5 -mr-0.5" />
              </div>

              {/* Simulated Industrial Product Background Graphic */}
              <div className="text-center space-y-2 p-4 select-none">
                <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/30 mx-auto flex items-center justify-center animate-pulse">
                  <ScanLine className="w-8 h-8 text-brand-400" />
                </div>
                <div className="text-xs font-mono text-slate-300">
                  {isScanning ? (
                    <span className="text-brand-400 font-bold">Scanning SKU Barcode...</span>
                  ) : (
                    <span>Align SKU Barcode or Product in Frame</span>
                  )}
                </div>
                {selectedItem && (
                  <Badge variant="blue" size="sm" className="bg-black/50 font-mono">
                    Target: {selectedItem.sku}
                  </Badge>
                )}
              </div>

              {/* Camera Status Indicators Top Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <button
                  type="button"
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
                    flashEnabled
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                  title="Toggle Flash"
                >
                  {flashEnabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleSimulateSKUScan}
                  className="px-2.5 py-1.5 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-400 text-2xs font-mono font-semibold flex items-center gap-1.5 backdrop-blur-md hover:bg-brand-500/30 transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  {isScanning ? 'Scanning...' : 'Scan Barcode'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                  }
                  className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 backdrop-blur-md hover:bg-black/60 transition-colors"
                  title="Flip Camera"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shutter Button & Upload Options Footer */}
        <div className="mt-3 flex items-center justify-around py-1">
          {/* File Attachment Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-dark-surface border border-dark-border text-slate-300 hover:text-slate-100 hover:bg-dark-border/40 transition-colors"
              title="Upload file from gallery"
            >
              <UploadCloud className="w-5 h-5" />
            </button>
            <span className="block text-2xs text-slate-400 mt-1 font-mono">Gallery</span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Main Camera Shutter Button */}
          <div className="text-center">
            <button
              type="button"
              disabled={isCapturing || !!capturedPhotoUrl}
              onClick={handleShutterCapture}
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                capturedPhotoUrl
                  ? 'border-slate-700 bg-slate-800 cursor-not-allowed opacity-50'
                  : 'border-brand-400 bg-gradient-to-tr from-brand-600 to-brand-400 hover:shadow-brand-500/30'
              }`}
            >
              <div className="w-12 h-12 rounded-full border-2 border-dark-bg/60 bg-white/20 flex items-center justify-center">
                <Camera className="w-6 h-6 text-dark-bg" />
              </div>
            </button>
            <span className="block text-2xs font-semibold text-slate-300 mt-1 font-mono">
              {isCapturing ? 'Snapping...' : 'Snap Photo'}
            </span>
          </div>

          {/* Quick Demo Sample Preset */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                const sample = samplePhotoUrls[Math.floor(Math.random() * samplePhotoUrls.length)];
                setCapturedPhotoUrl(sample);
              }}
              className="p-3 rounded-2xl bg-dark-surface border border-dark-border text-slate-300 hover:text-slate-100 hover:bg-dark-border/40 transition-colors"
              title="Use sample warehouse image"
            >
              <FileImage className="w-5 h-5" />
            </button>
            <span className="block text-2xs text-slate-400 mt-1 font-mono">Sample</span>
          </div>
        </div>
      </Card>

      {/* Photo Attachment Metadata Form */}
      <Card className="p-4 space-y-3 bg-dark-card border-dark-border">
        <div className="flex items-center justify-between border-b border-dark-border pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-400" />
            Photo Metadata & Tagging
          </h3>
          {selectedItem && (
            <Badge variant="emerald" size="sm">
              Stock: {selectedItem.quantity_on_hand}
            </Badge>
          )}
        </div>

        {/* SKU Selector */}
        <Select
          label="Target Stock Item (SKU)"
          value={selectedItemId}
          onChange={(e) => {
            setSelectedItemId(e.target.value);
            const found = items.find((i) => i.id === e.target.value);
            if (found?.warehouse_location) {
              setLocationOverride(found.warehouse_location);
            }
          }}
          options={items.map((item) => ({
            value: item.id,
            label: `${item.sku} — ${item.name} (${item.warehouse_location || 'No Loc'})`,
          }))}
        />

        {/* Location tag */}
        <Input
          label="Warehouse Location Tag"
          placeholder="e.g. Aisle 4, Bay 12, Shelf B"
          value={locationOverride || selectedItem?.warehouse_location || ''}
          onChange={(e) => setLocationOverride(e.target.value)}
        />

        {/* Caption / Batch note */}
        <Input
          label="Photo Caption & Condition Notes"
          placeholder="e.g. Box sealed, minor packaging wear inspected."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Save Button */}
        <Button
          variant="primary"
          size="md"
          className="w-full"
          disabled={!capturedPhotoUrl || isUploading}
          isLoading={isUploading}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          onClick={handleSavePhoto}
        >
          {isUploading ? 'Attaching Photo...' : 'Upload & Log Photo Attachment'}
        </Button>
      </Card>

      {/* Session Upload Log */}
      {sessionLog.length > 0 && (
        <Card className="p-4 space-y-3 bg-dark-surface/80 border-dark-border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 font-display flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              Recent Mobile Session Uploads ({sessionLog.length})
            </h4>
            <Badge variant="blue" size="sm">Session Active</Badge>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {sessionLog.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border flex items-center gap-3"
              >
                <img
                  src={log.image_url}
                  alt="Log thumbnail"
                  className="w-12 h-12 rounded-lg object-cover border border-dark-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="emerald" size="sm" className="font-mono text-2xs">
                      SKU Attached
                    </Badge>
                    <span className="text-2xs text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 truncate mt-1">{log.caption}</p>
                  <div className="text-2xs text-slate-400 font-mono mt-0.5">
                    By: {log.uploaded_by} • {((log.file_size_bytes || 0) / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
