import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your criteria.',
  searchPlaceholder = 'Search records...',
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full space-y-3">
      {/* Search Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="text-2xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{sortedData.length}</span> entries
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-dark-border/80 bg-dark-card shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/60 text-2xs uppercase font-semibold text-slate-400 tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="dense-cell py-2.5 cursor-pointer select-none hover:text-slate-200 transition-colors"
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-500">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-brand-400" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/50 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-6">
                  <LoadingSkeleton count={5} />
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-dark-surface/80' : 'hover:bg-dark-surface/40'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="dense-cell py-2.5 text-slate-300">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
