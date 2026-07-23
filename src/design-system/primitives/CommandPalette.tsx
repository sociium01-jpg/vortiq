import React, { useState, useEffect } from 'react';
import { Search, UserCheck, CheckSquare, Package, Shield, Bell, ArrowRight } from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: 'CRM' | 'Tasks' | 'Inventory' | 'Admin' | 'Notifications';
  icon: React.ReactNode;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  items = [],
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // trigger toggle logic in parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultCommands: CommandItem[] = [
    { id: '1', title: 'Create New Lead', category: 'CRM', icon: <UserCheck className="w-4 h-4 text-emerald-400" />, onSelect: () => alert('Navigate to CRM Lead Creation') },
    { id: '2', title: 'View Active Tasks Board', category: 'Tasks', icon: <CheckSquare className="w-4 h-4 text-blue-400" />, onSelect: () => alert('Navigate to Task Board') },
    { id: '3', title: 'Scan Stock QR / Capture Photo', category: 'Inventory', icon: <Package className="w-4 h-4 text-amber-400" />, onSelect: () => alert('Navigate to Photo Scan') },
    { id: '4', title: 'Manage Tenant Subscriptions', category: 'Admin', icon: <Shield className="w-4 h-4 text-violet-400" />, onSelect: () => alert('Navigate to Admin Settings') },
    { id: '5', title: 'Notification Preferences', category: 'Notifications', icon: <Bell className="w-4 h-4 text-rose-400" />, onSelect: () => alert('Navigate to Notifications') },
  ];

  const allItems = items.length > 0 ? items : defaultCommands;

  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-dark-border bg-dark-surface/50">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search modules... (Ctrl+K)"
            className="w-full py-3.5 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-2xs font-mono text-slate-400 bg-dark-surface border border-dark-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-dark-border/40">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No matching commands found.</div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-dark-surface cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-dark-surface rounded-md border border-dark-border/50 group-hover:border-slate-500">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-white">{item.title}</div>
                    <div className="text-2xs text-slate-500">{item.category} Module</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-brand-400 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
