'use client';

import React, { useState, useMemo, ReactNode, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DataTableProps } from '@/interface/common.interface'; // <-- adjust import path

export type TableAction<T> =
  | {
      variant: 'icon';
      icon: ReactNode;
      onClick: (row: T) => void;
      className?: string;
      label?: never;
    }
  | {
      variant: 'button';
      label: string;
      onClick: (row: T) => void;
      className?: string;
      icon?: never;
    };

// UniTable component signature
function UniTable<T extends object>({
  data,
  columns,
  title,
  addButton,
  actions = [],
  searchFilter,
  statusFilter,
  pagination = { enabled: true, itemsPerPage: 8 },
  emptyMessage = 'No data found.',
  className = '',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  // statusFilterValue can be string | boolean | null | 'all'
  const [statusFilterValue, setStatusFilterValue] = useState<string | boolean | null | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper: get nested property value from object (support keys like 'user.name')
  const getNestedValue = useCallback(
    (obj: T, key: keyof T | string): unknown => {
      if (typeof key === 'string' && key.includes('.')) {
        return key.split('.').reduce<unknown>((acc, prop) => {
          if (acc && typeof acc === 'object' && prop in acc) {
            return (acc as Record<string, unknown>)[prop];
          }
          return undefined;
        }, obj);
      }

      return obj[key as keyof T];
    },
    [] // no dependencies since logic doesn't rely on external variables
  );

  // Filter data according to search and status filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      if (searchFilter?.enabled && searchTerm) {
        const found = searchFilter.searchKeys.some((key) => {
          const value = getNestedValue(item, key);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (!found) return false;
      }

      // Status filter
      if (statusFilter?.enabled && statusFilterValue !== 'all') {
        const statusValue = getNestedValue(item, statusFilter.accessor);
        if (statusValue !== statusFilterValue) return false;
      }

      return true;
    });
  }, [data, searchTerm, statusFilterValue, searchFilter, statusFilter, getNestedValue]);

  // Pagination calculations
  const itemsPerPage = pagination.itemsPerPage || 8;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = pagination.enabled ? filteredData.slice(startIndex, startIndex + itemsPerPage) : filteredData;

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Reset page on filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilterValue]);

  return (
    <div className={`foreground flex min-h-screen justify-center p-4 ${className}`}>
      <div className="w-full rounded bg-white p-4 shadow-lg">
        {/* Header */}
        {(title || addButton) && (
          <div className="mb-4 w-full">
            <div className="flex items-center justify-between">
              {title && <p className="text-md font-semibold">{title}</p>}
              {addButton &&
                (addButton.href ? (
                  <Link
                    href={addButton.href}
                    className="bg-primary text-background flex items-center rounded p-2 pr-3 pl-3 text-sm"
                  >
                    <Plus className="mr-2 h-5 w-5" /> {addButton.label}
                  </Link>
                ) : (
                  <button
                    onClick={addButton.onClick}
                    className="bg-primary text-background flex items-center rounded p-2 pr-3 pl-3 text-sm"
                  >
                    <Plus className="mr-2 h-5 w-5" /> {addButton.label}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Search & Filter Section */}
        {(searchFilter?.enabled || statusFilter?.enabled) && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            {searchFilter?.enabled && (
              <input
                type="text"
                placeholder={searchFilter.placeholder || 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:border-primary w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/3"
              />
            )}

            {/* Status Filter */}
            {statusFilter?.enabled && (
              <select
                value={statusFilterValue?.toString() || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  setStatusFilterValue(
                    value === 'all' ? 'all' : value === 'true' ? true : value === 'false' ? false : value
                  );
                }}
                className="focus:border-primary w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/7"
              >
                {statusFilter.options.map((option) => (
                  <option key={option.label} value={option.value?.toString() || 'all'}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded border">
          <Table>
            <TableHeader className="bg-primary sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-background pl-4">S. No.</TableHead>
                {columns.map((column) => (
                  <TableHead key={column.key.toString()} className={`text-background ${column.headerClassName || ''}`}>
                    {column.header}
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead className="text-background pr-4 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((row, index) => (
                  <TableRow key={startIndex + index}>
                    <TableCell className="pl-4">{startIndex + index + 1}</TableCell>
                    {columns.map((column) => (
                      <TableCell key={`${index}-${column.key.toString()}`} className={column.className || ''}>
                        {column.accessor ? column.accessor(row) : (getNestedValue(row, column.key) as ReactNode)}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          {actions.map((action, actionIndex) =>
                            action.variant === 'icon' ? (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={`cursor-pointer ${action.className || ''}`}
                              >
                                {action.icon}
                              </button>
                            ) : (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={`flex cursor-pointer rounded p-1 pr-2 pl-2 text-xs ${action.className || ''}`}
                              >
                                {action.icon && <span className="mr-1">{action}</span>}
                                {action.label}
                              </button>
                            )
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 2 : 1)}
                    className="py-2 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {pagination.enabled && filteredData.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p>
              Showing{' '}
              <span className="font-semibold">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredData.length}</span> items
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 rounded border px-3 py-1 ${
                  currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary hover:text-white'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 rounded border px-3 py-1 ${
                  currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary hover:text-white'
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UniTable;
