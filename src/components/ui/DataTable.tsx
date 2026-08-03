import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Database } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilterKey?: (item: T) => string;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function StandardDataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Buscar en la tabla...',
  searchFilterKey,
  title,
  subtitle,
  headerActions,
  emptyMessage = 'No existen registros para mostrar.',
  emptyIcon,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const safeData = Array.isArray(data) ? data : [];

  // Filter
  const filteredData = safeData.filter((item) => {
    if (!item) return false;
    if (!search.trim()) return true;
    try {
      if (searchFilterKey) {
        const filterStr = searchFilterKey(item) || '';
        return filterStr.toLowerCase().includes(search.toLowerCase());
      }
      return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    } catch (e) {
      return false;
    }
  });

  // Sort
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (!sortKey || !a || !b) return 0;
    const valA = a[sortKey] ?? '';
    const valB = b[sortKey] ?? '';
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Table Header Controls */}
      {(title || searchFilterKey || headerActions) && (
        <div className="p-3 sm:p-4 md:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            {title && <h3 className="font-bold text-slate-900 text-base md:text-lg">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {searchFilterKey && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
            {headerActions}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto w-full max-w-full touch-pan-x">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3 px-4 ${col.sortable ? 'cursor-pointer hover:bg-slate-200/60 select-none' : ''} ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: col.width }}
                >
                  <div className={`inline-flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span>{sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {sortedData.length > 0 ? (
              sortedData.map((item, idx) => (
                <tr
                  key={keyExtractor ? (keyExtractor(item) || String(idx)) : ((item as any)?.id || String(idx))}
                  onClick={() => onRowClick && item && onRowClick(item)}
                  className={`hover:bg-slate-100/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(item) : (item as any)?.[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {emptyIcon || <Database className="w-8 h-8 text-slate-300" />}
                    <p className="font-semibold text-slate-600 text-xs">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Mostrando <strong>{sortedData.length}</strong> de <strong>{data.length}</strong> registros</span>
      </div>
    </div>
  );
}
