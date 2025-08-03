/**
 * The Pantry Design System - Table Component
 * Data tables with sorting, pagination, and responsive design
 */

import React, { useState, useMemo } from 'react';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: string | ((record: T) => string);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
}

type SortOrder = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  order: SortOrder;
}

const getSortedData = <T,>(data: T[], sortState: SortState, columns: TableColumn<T>[]): T[] => {
  if (!sortState.column || !sortState.order) return data;
  
  const column = columns.find(col => col.key === sortState.column);
  if (!column) return data;
  
  return [...data].sort((a, b) => {
    const aValue = a[column.dataIndex];
    const bValue = b[column.dataIndex];
    
    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const result = aValue < bValue ? -1 : 1;
    return sortState.order === 'asc' ? result : -result;
  });
};

const getTableClasses = (size: string, bordered: boolean) => {
  const baseClasses = 'w-full table-auto';
  
  const sizeClasses = {
    sm: '',
    md: '',
    lg: '',
  };
  
  const borderClass = bordered ? 'border border-neutral-200' : '';
  
  return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses]} ${borderClass}`.trim();
};

const getCellPadding = (size: string) => {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };
  
  return paddingClasses[size as keyof typeof paddingClasses];
};

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = 'id',
  onRow,
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  className = '',
}: TableProps<T>) => {
  const [sortState, setSortState] = useState<SortState>({ column: null, order: null });
  
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;
    
    setSortState(prev => {
      if (prev.column !== columnKey) {
        return { column: columnKey, order: 'asc' };
      }
      
      switch (prev.order) {
        case null:
          return { column: columnKey, order: 'asc' };
        case 'asc':
          return { column: columnKey, order: 'desc' };
        case 'desc':
          return { column: null, order: null };
        default:
          return { column: null, order: null };
      }
    });
  };
  
  const sortedData = useMemo(() => {
    return getSortedData(data, sortState, columns);
  }, [data, sortState, columns]);
  
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };
  
  const tableClasses = getTableClasses(size, bordered);
  const cellPadding = getCellPadding(size);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-neutral-600">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }
  
  return (
    <div className={`overflow-x-auto ${className}`.trim()}>
      <table className={tableClasses}>
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${cellPadding} text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-neutral-100' : ''
                } ${column.className || ''}`.trim()}
                style={column.width ? { width: column.width } : undefined}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className={`flex items-center gap-2 ${
                  column.align === 'center' ? 'justify-center' : 
                  column.align === 'right' ? 'justify-end' : 'justify-start'
                }`}>
                  {column.title}
                  {column.sortable && (
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${
                          sortState.column === column.key && sortState.order === 'asc'
                            ? 'text-orange-500'
                            : 'text-neutral-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      <svg
                        className={`w-3 h-3 -mt-1 ${
                          sortState.column === column.key && sortState.order === 'desc'
                            ? 'text-orange-500'
                            : 'text-neutral-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-neutral-200">
          {sortedData.map((record, index) => {
            const rowProps = onRow?.(record, index) || {};
            const key = getRowKey(record, index);
            
            return (
              <tr
                key={key}
                className={`${
                  striped && index % 2 === 1 ? 'bg-neutral-50' : ''
                } ${
                  hoverable ? 'hover:bg-neutral-50' : ''
                } transition-colors duration-150`.trim()}
                {...rowProps}
              >
                {columns.map((column) => {
                  const value = record[column.dataIndex];
                  const content = column.render ? column.render(value, record, index) : value;
                  
                  return (
                    <td
                      key={column.key}
                      className={`${cellPadding} text-sm text-neutral-900 ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      } ${column.className || ''}`.trim()}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {sortedData.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          No data available
        </div>
      )}
    </div>
  );
};

// Simple pagination component for tables
export interface TablePaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal,
  className = '',
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);
  
  const handlePageSizeChange = (newPageSize: number) => {
    const newPage = Math.min(current, Math.ceil(total / newPageSize));
    onChange(newPage, newPageSize);
  };
  
  return (
    <div className={`flex items-center justify-between mt-4 ${className}`.trim()}>
      <div className="flex items-center gap-4 text-sm text-neutral-600">
        {showTotal ? (
          showTotal(total, [startItem, endItem])
        ) : (
          <span>
            Showing {startItem} to {endItem} of {total} results
          </span>
        )}
        
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showQuickJumper && (
          <div className="flex items-center gap-2 text-sm">
            <span>Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="border border-neutral-300 rounded px-2 py-1 w-16 text-center text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = Number((e.target as HTMLInputElement).value);
                  if (page >= 1 && page <= totalPages) {
                    onChange(page, pageSize);
                  }
                }
              }}
            />
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onChange(current - 1, pageSize)}
            disabled={current <= 1}
          >
            Previous
          </button>
          
          <span className="px-3 py-1 text-sm">
            Page {current} of {totalPages}
          </span>
          
          <button
            type="button"
            className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onChange(current + 1, pageSize)}
            disabled={current >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;